/* Escuela del Ajedrez Mágico: lecciones, problemas, entrenador, escalera de niveles y revisión de partidas.
   Usa Stockfish 10 (sf/stockfish.js, GPL) en un Web Worker; si el móvil no puede, tira del motor propio. */
(() => {
"use strict";
const A = window.AJ; if (!A) return;
const { S, C, esc, ls, toast, openSheet, closeSheet, pieceSVG, SFX, buzz, wait, animateMove, disp, NAME, sanES, LADDER, LVL } = A;
const LES = window.LECCIONES || [], PZ = window.PROBLEMAS || [];
const $ = s => document.querySelector(s);
const other = c => (c === "w" ? "b" : "w");
const PV = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/* ================= Stockfish ================= */
const SCORE = l => l.mate != null ? (l.mate > 0 ? 10000 - l.mate : -10000 - l.mate) : l.cp;
const wp = cp => cp >= 9000 ? 100 : cp <= -9000 ? 0 : 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * Math.max(-1000, Math.min(1000, cp)))) - 1);
const uciList = t => { const o = []; for (const w of t.trim().split(/\s+/)) { if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(w)) break; o.push(w); } return o; };
const fenOf = moves => C.toFEN(C.replay(moves).pos);
const AJSF = (() => {
  let w = null, cb = null, q = Promise.resolve(), mpv = 1, sk = 20;
  function boot() {
    if (w !== null) return w;
    try {
      if (typeof WebAssembly !== "object") throw 0;
      w = new Worker("sf/stockfish.js");
      w.onmessage = e => { if (cb) cb(String(e.data)); };
      w.onerror = () => kill();
      w.postMessage("uci"); w.postMessage("setoption name Hash value 16"); w.postMessage("isready");
    } catch { w = false; }
    return w;
  }
  function kill() { try { if (w) w.terminate(); } catch {} w = false; if (cb) cb("bestmove (none)"); }
  function run(fen, o) {
    return new Promise(res => {
      if (!boot()) return res(null);
      const m = o.multipv || 1, s = o.skill ?? 20;
      if (m !== mpv) { w.postMessage("setoption name MultiPV value " + m); mpv = m; }
      if (s !== sk) { w.postMessage("setoption name Skill Level value " + s); sk = s; }
      const lines = []; let done = false, t1 = 0, t2 = 0;
      const fin = r => { if (done) return; done = true; clearTimeout(t1); clearTimeout(t2); cb = null; res(r); };
      cb = l => {
        if (l.startsWith("info") && l.includes(" pv ") && l.includes(" score ")) {
          const k = (l.match(/ multipv (\d+)/) || [0, 1])[1] - 1, sc = l.match(/ score (cp|mate) (-?\d+)/);
          if (!sc || / (lowerbound|upperbound)/.test(l)) return;
          lines[k] = { cp: sc[1] === "cp" ? +sc[2] : null, mate: sc[1] === "mate" ? +sc[2] : null, pv: uciList(l.split(" pv ")[1]) };
        } else if (l.startsWith("bestmove")) {
          const b = l.split(" ")[1];
          fin(b && b !== "(none)" ? { best: b, lines: lines.filter(Boolean) } : null);
        }
      };
      w.postMessage("position fen " + fen);
      w.postMessage(o.depth ? "go depth " + o.depth : "go movetime " + (o.ms || 300));
      const lim = o.depth ? 5000 + o.depth * 1500 : (o.ms || 300) + 5000;
      t1 = setTimeout(() => { if (w) w.postMessage("stop"); }, lim);
      t2 = setTimeout(() => { kill(); fin(null); }, lim + 3000);
    });
  }
  const go = (fen, o = {}) => { const p = q.then(() => run(fen, o)); q = p.catch(() => {}); return p; };
  async function coach(before, mv) {
    const p0 = C.replay(before).pos, m = C.findMove(p0, mv); if (!m) return null;
    const a = await go(C.toFEN(p0), { depth: 11, multipv: 2 }); if (!a || !a.lines.length) return null;
    if (a.lines[0].pv[0] === mv) return null;
    const p1 = C.make(p0, m);
    if (!C.legalMoves(p1).length) return null;
    const b = await go(C.toFEN(p1), { depth: 11 }); if (!b || !b.lines.length) return null;
    const s0 = SCORE(a.lines[0]), s1 = -SCORE(b.lines[0]), loss = wp(s0) - wp(s1);
    if (loss < 14 || wp(s1) > 88) return null;
    return { warn: true, loss, html: explain(p0, m, a.lines[0], b.lines[0], false) };
  }
  return {
    go, coach, get ok() { return w !== false; },
    async play(moves, cfg) { const r = await go(fenOf(moves), { skill: cfg.skill ?? 20, depth: cfg.depth, ms: cfg.ms }); return r && { uci: r.best }; },
    async best(moves) { const r = await go(fenOf(moves), { ms: 700 }); return r && { uci: r.best }; }
  };
})();
window.AJSF = AJSF;

/* Mejor jugada desde cualquier posición (Stockfish o, si no, el motor propio) */
async function engineBest(pos, ms = 400) {
  const r = await AJSF.go(C.toFEN(pos), { ms });
  if (r && r.best) return r.best;
  await wait(30);
  const o = C.searchPos(pos, 3); return o && o.uci;
}

/* ================= explicar un error ================= */
const sanOf = (pos, uci) => { const m = C.findMove(pos, uci); return m ? sanES(C.san(pos, m)) : uci; };
const matFor = (b, c) => b.reduce((s, p) => p ? s + (C.colorOf(p) === c ? 1 : -1) * PV[C.type(p)] : s, 0);
const art = p => (A.FEM(C.type(p)) ? "la " : "el ") + NAME[C.type(p)];
function explain(p0, m, bl, rl, reveal) {
  const me = p0.turn, them = other(me), p1 = C.make(p0, m), out = [];
  const s0 = sanES(C.san(p0, m)), rep = rl && rl.pv[0] ? sanOf(p1, rl.pv[0]) : null;
  const moved = p1.b[m.t];
  if (rl && rl.mate != null && rl.mate > 0) out.push(`Después de <b>${s0}</b> el rival tiene <b>mate en ${rl.mate}</b>${rep ? `, empezando por <b>${rep}</b>` : ""}.`);
  else {
    if (C.type(moved) !== "p" && C.attackersOf(p1.b, m.t, them).length && !C.attackersOf(p1.b, m.t, me).length) out.push(`${art(moved)[0].toUpperCase() + art(moved).slice(1)} se queda en ${C.sqName(m.t)} atacad${A.FEM(C.type(moved)) ? "a" : "o"} y sin defensa.`);
    let p = p1, n = 0;
    for (const u of (rl ? rl.pv : []).slice(0, 4)) { const mm = C.findMove(p, u); if (!mm) break; p = C.make(p, mm); n++; }
    const lose = matFor(p0.b, me) - matFor(p.b, me);
    const r0 = rl && rl.pv[0] ? C.findMove(p1, rl.pv[0]) : null;
    if (r0 && r0.c) out.push(`El rival responde <b>${rep}</b> y te come ${art(r0.c)}${lose >= 2 ? `: pierdes unos ${lose} puntos de material` : ""}.`);
    else {
      let hit = "";
      if (r0) {
        const p2 = C.make(p1, r0), tp = PV[C.type(r0.pr || r0.p)];
        const t = [...new Set(C.legalMoves({ ...p2, turn: them, ep: -1 }).filter(x => x.f === r0.t && x.c && C.type(x.c) !== "p" && (PV[C.type(x.c)] > tp || !C.attackersOf(p2.b, x.t, me).length)).map(x => x.t))];
        if (t.length) hit = ` atacando ${A.listY(t.map(q => "tu " + NAME[C.type(p2.b[q])]))}`;
      }
      if (rep && lose >= 2) out.push(`El rival responde <b>${rep}</b>${hit} y acabas perdiendo unos ${lose} puntos de material.`);
      else if (rep) out.push(`El rival responde <b>${rep}</b>${hit}${hit ? "" : " y tu posición empeora mucho"}.`);
    }
  }
  if (bl && bl.pv[0]) {
    if (reveal) {
      const bm = C.findMove(p0, bl.pv[0]);
      out.push(`Mejor era <b>${sanOf(p0, bl.pv[0])}</b>${bl.mate > 0 ? ` (mate en ${bl.mate})` : bm && bm.c ? ` (come ${art(bm.c)})` : ""}.`);
    } else if (bl.mate > 0) out.push(`¡Ojo! Tenías un <b>mate en ${bl.mate}</b>. Busca jaques.`);
    else out.push("Había una jugada mucho mejor. Revisa qué ataca el rival y busca jaques, capturas y amenazas.");
  }
  return out.join(" ");
}

/* ================= progreso ================= */
const KEY = "ajedrez.escuela";
const P = Object.assign({ v: 1, les: {}, pr: 800, pn: 0, ph: [], seen: [], lad: {}, games: [], days: {} }, ls.get(KEY) || {});
const save = () => ls.set(KEY, P);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => iso(new Date());
function bump(k, n = 1) {
  const t = today(), d = P.days[t] || (P.days[t] = {}); d[k] = (d[k] || 0) + n;
  const ks = Object.keys(P.days).sort(); while (ks.length > 90) delete P.days[ks.shift()];
  save();
}
function streak() {
  const d = new Date(); let n = 0;
  if (!P.days[iso(d)]) d.setDate(d.getDate() - 1);
  while (P.days[iso(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const allLessons = () => LES.flatMap((u, ui) => u.lessons.map((l, li) => ({ u, ui, l, li })));
const doneCount = () => allLessons().filter(x => P.les[x.l.id]).length;
const nextLesson = () => allLessons().find(x => !P.les[x.l.id]) || null;
const recLevel = () => { for (let i = 1; i <= 10; i++) if (((P.lad[i] || {}).w || 0) < 2) return i; return 10; };
const stars = n => `<span class="stars" aria-label="${n} de 3 estrellas">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}">★</i>`).join("")}</span>`;
const TH = { mate: "Mate", mate1: "Mate en 1", mate2: "Mate en 2", mate3: "Mate en 3", mate4: "Mate en 4", pasillo: "Mate del pasillo", ahogado: "Mate ahogado", horquilla: "Horquilla", clavada: "Clavada", enfilada: "Enfilada", descubierta: "Ataque descubierto", sacrificio: "Sacrificio", colgada: "Pieza colgada", coronacion: "Coronación", tranquila: "Jugada tranquila", apertura: "Apertura", final: "Final" };

/* ================= tablero de la escuela ================= */
let B = null, gen = 0;
const boardHTML = () => `<div class="board-wrap sch-bd"><div class="frame"><div class="board" id="bd"><div class="sqs" id="sqs"></div><div class="veins"></div><div class="grain"></div><div class="pcs" id="pcs"></div><svg class="arw" id="arw" viewBox="0 0 800 800" aria-hidden="true"></svg><div class="fx" id="fx"></div></div></div></div>`;
function newBoard(pos, o = {}) {
  B = { pos, bottom: o.bottom || pos.turn, user: o.user || null, sel: null, last: null, marks: o.marks || {}, arrows: o.arrows || [], busy: false, onMove: o.onMove || null, keys: [C.toFEN(pos, true)] };
  const sq = $("#sqs");
  if (sq) sq.addEventListener("click", e => { const b = e.target.closest(".sq"); if (b) tap(+b.dataset.sq); });
  draw();
}
const ACOL = { g: "#6BD49A", r: "#FF6B5E", y: "#E3B04B", b: "#7FB2FF" };
function draw() {
  const sqs = $("#sqs"), pcs = $("#pcs"); if (!sqs || !B) return;
  const { pos, bottom } = B;
  const legal = B.sel != null ? C.legalMoves(pos).filter(m => m.f === B.sel) : [];
  const chk = C.inCheck(pos) ? pos.b.indexOf(pos.turn === "w" ? "K" : "k") : -1;
  let h = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const sq = bottom === "w" ? (7 - y) * 8 + x : y * 8 + (7 - x), p = pos.b[sq], nm = C.sqName(sq);
    const cls = ["sq", ((sq & 7) + (sq >> 3)) % 2 ? "l" : "d"];
    if (B.last && (sq === B.last.f || sq === B.last.t)) cls.push("last");
    if (sq === B.sel) cls.push("sel");
    const lm = legal.find(l => l.t === sq); if (lm) cls.push(lm.c ? "cap" : "hint");
    if (sq === chk) cls.push("chk");
    const mk = B.marks[nm]; if (mk) cls.push(mk === "x" ? "why-x" : mk === "r" ? "why-a" : "tip");
    const co = (y === 7 ? `<span class="co f">${C.FILES[sq & 7]}</span>` : "") + (x === 0 ? `<span class="co r">${(sq >> 3) + 1}</span>` : "");
    h += `<button class="${cls.join(" ")}" data-sq="${sq}" aria-label="${nm}${p ? ", " + NAME[C.type(p)] + (C.isW(p) ? " blanco" : " negro") : ""}">${co}</button>`;
  }
  sqs.innerHTML = h;
  let ph = "";
  for (let sq = 0; sq < 64; sq++) {
    const p = pos.b[sq]; if (!p) continue;
    const d = disp(sq, bottom);
    ph += `<div class="pc" data-sq="${sq}" data-c="${C.colorOf(p)}" style="left:${d.x * 12.5}%;top:${d.y * 12.5}%;z-index:${6 + d.y}">${pieceSVG(p)}</div>`;
  }
  pcs.innerHTML = ph;
  const arw = $("#arw");
  if (arw) arw.innerHTML = `<defs>${Object.entries(ACOL).map(([k, c]) => `<marker id="ah-${k}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join("")}</defs>` +
    B.arrows.map(([f, t, c]) => {
      const a = disp(C.sqIdx(f), bottom), b = disp(C.sqIdx(t), bottom);
      const x1 = a.x * 100 + 50, y1 = a.y * 100 + 50, x2 = b.x * 100 + 50, y2 = b.y * 100 + 50, L = Math.hypot(x2 - x1, y2 - y1) || 1, k = (L - 30) / L;
      return `<line x1="${x1}" y1="${y1}" x2="${x1 + (x2 - x1) * k}" y2="${y1 + (y2 - y1) * k}" stroke="${ACOL[c] || ACOL.g}" stroke-width="16" stroke-linecap="round" opacity=".85" marker-end="url(#ah-${c || "g"})"/>`;
    }).join("");
}
function tap(sq) {
  SFX.init();
  if (!B || B.busy || !B.user || B.pos.turn !== B.user || !B.onMove) return;
  const pos = B.pos, legal = C.legalMoves(pos);
  if (B.sel != null) {
    const opts = legal.filter(m => m.f === B.sel && m.t === sq);
    if (opts.length) {
      B.sel = null;
      if (opts.length > 1) return promo(opts[0], pos.turn);
      SFX.tick(); return B.onMove(C.uciOf(opts[0]));
    }
  }
  if (pos.b[sq] && C.colorOf(pos.b[sq]) === pos.turn && B.sel !== sq) { B.sel = sq; SFX.lift(); }
  else B.sel = null;
  draw();
}
function promo(mv, c) {
  openSheet(`<h2>¿En qué se convierte el peón?</h2><div class="promo">${["q", "r", "b", "n"].map(t => `<button data-p="${t}" aria-label="${NAME[t]}">${pieceSVG(c === "w" ? t.toUpperCase() : t)}</button>`).join("")}</div><button class="btn ghost" data-x>Cancelar</button>`);
  A.sheet.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => { closeSheet(); B.onMove(C.sqName(mv.f) + C.sqName(mv.t) + b.dataset.p); }));
  A.sheet.querySelector("[data-x]").addEventListener("click", () => { closeSheet(); draw(); });
}
async function play(uci, anim = true) {
  const pos = B.pos, legal = C.legalMoves(pos), m = C.findMove(pos, uci, legal); if (!m) return null;
  const h = { uci, san: C.san(pos, m, legal), f: m.f, t: m.t, p: m.p, c: m.c, cs: m.cs, pr: m.pr, k: m.k || null, ep: !!m.ep, by: pos.turn };
  B.sel = null; B.arrows = []; B.marks = {};
  const me = B;
  if (anim) { B.busy = true; draw(); try { await animateMove(h, B.bottom); } catch {} if (B !== me) return null; B.busy = false; }
  B.pos = C.make(pos, m); B.last = { f: m.f, t: m.t }; B.keys.push(C.toFEN(B.pos, true));
  draw();
  if (C.inCheck(B.pos)) SFX.check();
  return h;
}
const isMate = pos => C.inCheck(pos) && !C.legalMoves(pos).length;
const mates = (pos, uci) => { const m = C.findMove(pos, uci); return !!m && isMate(C.make(pos, m)); };
function wrong() {
  buzz([40, 40, 40]); if (SFX.ok()) SFX.thump(70, .25, .6);
  A.shake($("#bd"), 5, 260); B.sel = null; draw();
}
function fb(html, cls) { const el = $("#fb"); if (el) { el.className = "fb " + (cls || ""); el.innerHTML = html; } }

/* ================= vistas ================= */
let V = { v: "home" };
function show(html) { gen++; B = null; closeSheet(); A.view(`<div id="sch">${html}</div>`, "school|" + gen); window.scrollTo(0, 0); return gen; }
function exit() {
  gen++; B = null;
  if (V.back) { const b = V.back; V = { v: "home" }; S.mode = b; S.lastKey = ""; A.render(); return; }
  V = { v: "home" }; S.mode = null; S.lastKey = ""; A.render();
}
const topBar = (label, chip) => `<div class="top"><button class="btn ghost sm" id="bk">${label}</button><span class="sp"></span><span class="chip">${chip}</span></div>`;
function goHome() { V = { v: "home" }; renderHome(); }

function render(force) {
  if (!force && $("#sch")) return;
  if (V.v === "lesson") return renderStep();
  if (V.v === "tactics") return renderTactics();
  if (V.v === "review") return renderReview();
  renderHome();
}

/* ---------- inicio de la escuela ---------- */
function renderHome() {
  const done = doneCount(), total = allLessons().length, nx = nextLesson(), rec = recLevel(), d = P.days[today()] || {};
  const last = P.games.find(g => g.moves && g.moves.length > 1);
  const plan = [
    [(d.pz || 0) >= 10, `10 problemas de táctica (${Math.min(d.pz || 0, 10)}/10)`],
    [(d.les || 0) >= 1, "Una lección o repasar una"],
    [(d.g || 0) >= 1, `Una partida contra la máquina (nivel ${rec})`],
    [(d.rev || 0) >= 1, "Revisar una partida con el motor"]];
  const spark = P.ph.length > 2 ? (() => {
    const v = P.ph.slice(-40), lo = Math.min(...v) - 20, hi = Math.max(...v) + 20;
    const pts = v.map((r, i) => `${(i / (v.length - 1)) * 300},${60 - ((r - lo) / (hi - lo)) * 56 - 2}`).join(" ");
    return `<svg class="spark" viewBox="0 0 300 60" preserveAspectRatio="none" aria-label="Evolución de tu nivel de táctica"><polyline points="${pts}" fill="none" stroke="var(--gold)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`;
  })() : "";
  const units = LES.map((u, ui) => {
    const dn = u.lessons.filter(l => P.les[l.id]).length, cur = nx && nx.ui === ui;
    return `<details class="card unit"${cur ? " open" : ""}><summary><span class="un">${ui + 1}</span><span class="ut"><b>${esc(u.t)}</b><span class="muted small">${esc(u.d)}</span></span><span class="uc">${dn}/${u.lessons.length}</span></summary>
      <div class="ll">${u.lessons.map((l, li) => `<button class="lsn${nx && nx.l.id === l.id ? " nx" : ""}" data-u="${ui}" data-l="${li}"><span>${esc(l.t)}</span>${P.les[l.id] ? stars(P.les[l.id]) : nx && nx.l.id === l.id ? `<span class="tag">Siguiente</span>` : ""}</button>`).join("")}</div></details>`;
  }).join("");
  show(`${topBar("Salir", "ESCUELA")}
  <div class="hero" style="padding-block:4px 0"><div class="logo" style="font-size:34px"><small>ESCUELA DE</small>Ajedrez</div>
    <p class="muted">De saber mover las piezas a ganar a jugadores de club. Un poco cada día.</p></div>
  <div class="stats"><div><b>${done}/${total}</b><span>lecciones</span></div><div><b>${P.pr}</b><span>táctica</span></div><div><b>${rec}</b><span>escalera</span></div><div><b>${streak()}</b><span>días seguidos</span></div></div>
  ${nx ? `<button class="btn gold wide nextb" id="next"><span>Siguiente paso<small>${esc(nx.u.t)} · ${esc(nx.l.t)}</small></span></button>` : `<div class="card"><h2>🎓 ¡Escuela completada!</h2><p class="muted">Ahora toca entrenar: táctica cada día, subir la escalera y revisar tus partidas.</p></div>`}
  <div class="card"><h2>Plan de hoy</h2><ul class="plan">${plan.map(([ok, t]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${esc(t)}</li>`).join("")}</ul></div>
  <div class="card"><h2>Entrenar</h2>
    <button class="btn wide" id="tac">🧩 Táctica · tu nivel ${P.pr}</button>
    <button class="btn wide" id="lad">⚔️ Escalera: jugar contra el nivel ${rec} (${esc(LVL(rec))})</button>
    ${last ? `<button class="btn wide" id="rv">🔍 Revisar tu última partida</button>` : ""}
    <p class="muted small">Escalera: gana 2 partidas a un nivel para pasar al siguiente. ${ladderLine()}</p>
    ${spark ? `<div><p class="muted small">Tu nivel de táctica</p>${spark}</div>` : ""}</div>
  <h2 class="sec">Temario</h2>
  ${units}`);
  A.on("#bk", "click", exit);
  A.on("#next", "click", () => nx && startLesson(nx.ui, nx.li));
  A.on(".lsn", "click", e => startLesson(+e.currentTarget.dataset.u, +e.currentTarget.dataset.l));
  A.on("#tac", "click", () => { V = { v: "tactics" }; renderTactics(); });
  A.on("#lad", "click", () => playLadder(rec));
  A.on("#rv", "click", () => last && review({ moves: last.moves, my: last.c, names: null, lvl: last.lvl, t: last.t }));
}
function ladderLine() {
  const parts = [];
  for (let i = 1; i <= 10; i++) { const r = P.lad[i]; if (r && (r.w || r.l || r.d)) parts.push(`${i}: ${r.w}G ${r.d}T ${r.l}P`); }
  return parts.length ? `<br>Resultados: ${parts.join(" · ")}` : "";
}
function playLadder(lvl) {
  S.aiLevel = lvl; S.coach = true; S.aiColor = "r"; ls.set("ajedrez.coach", true);
  gen++; B = null; V = { v: "home" }; S.mode = null; S.lastKey = "";
  if (!S.name) { S.homeTab = "ai"; S.homeMsg = "Escribe tu nombre y pulsa Empezar."; S.homeErr = true; A.render(); return; }
  A.startLocal("ai");
}

/* ---------- lecciones ---------- */
function startLesson(ui, li) { V = { v: "lesson", ui, li, i: 0, err: 0, fail: false, pool: null }; renderStep(); }
function renderStep() {
  const u = LES[V.ui], l = u.lessons[V.li], st = l.steps[V.i];
  if (!st) return finishLesson();
  const pct = Math.round((V.i / l.steps.length) * 100);
  const needBoard = st.fen || ["pz", "line", "rep", "play", "pool"].includes(st.k);
  const tok = show(`${topBar("← Escuela", esc(u.t.toUpperCase()))}
    <div class="ltitle"><h2>${esc(l.t)}</h2><div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div></div>
    <div class="ltxt" id="lt"></div>
    ${needBoard ? boardHTML() : ""}
    <div id="lx"></div>
    <p class="fb" id="fb" role="status" aria-live="polite"></p>
    <div class="acts" id="la"></div>`);
  A.on("#bk", "click", () => goHome());
  const K = { txt: stepTxt, quiz: stepQuiz, pz: stepPz, line: stepLine, rep: stepRep, play: stepPlay, pool: stepPool }[st.k];
  if (K) K(st, tok); else nextStep();
}
function nextBtn(label = "Siguiente") {
  const la = $("#la"); if (!la) return;
  la.innerHTML = `<button class="btn gold wide" id="nx">${label}</button>`;
  A.on("#nx", "click", nextStep);
}
function setActs(html, binds) { const la = $("#la"); if (!la) return; la.innerHTML = html; for (const [s, f] of Object.entries(binds || {})) A.on(s, "click", f); }
function nextStep() { V.i++; V.pool = null; renderStep(); }
const txtEl = html => { const el = $("#lt"); if (el) el.innerHTML = html; };

function stepTxt(st) {
  txtEl(`<p>${st.txt}</p>`);
  if (st.fen) newBoard(C.fromFEN(st.fen), { bottom: "w", arrows: st.arrows, marks: st.marks });
  nextBtn();
}
function stepQuiz(st) {
  txtEl(`<p><b>${st.q}</b></p>`);
  if (st.fen) newBoard(C.fromFEN(st.fen), { bottom: "w", arrows: st.arrows, marks: st.marks });
  const lx = $("#lx"); let missed = false;
  lx.innerHTML = `<div class="opts">${st.opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join("")}</div>`;
  A.on(".opt", "click", e => {
    const b = e.currentTarget, i = +b.dataset.i;
    if (i === st.a) {
      lx.querySelectorAll(".opt").forEach(x => { x.disabled = true; });
      b.classList.add("ok"); SFX.magic(); fb(`✓ ${st.exp || "¡Correcto!"}`, "ok"); nextBtn();
    } else {
      b.classList.add("bad"); b.disabled = true; buzz(40);
      if (!missed) { missed = true; V.err++; }
      fb("No es esa. Piénsalo otra vez.", "bad");
    }
  });
}
function stepPz(st, tok) {
  const pos = C.fromFEN(st.fen), side = pos.turn;
  txtEl(`<p><span class="side ${side}"></span><b>Juegan ${side === "w" ? "blancas" : "negras"}.</b> ${st.txt || ""}</p>`);
  let j = 0, miss = 0, over = false;
  const finish = ok => {
    over = true; B.user = null;
    fb((ok ? "✓ " : "") + (st.ok || "¡Bien!"), ok ? "ok" : ""); if (ok) SFX.magic();
    nextBtn();
  };
  const onMove = async u => {
    if (over) return;
    const exp = st.sol[j], alts = (st.alts && st.alts[j]) || [];
    if (u === exp || alts.includes(u) || (st.mate && mates(B.pos, u))) {
      await play(u); if (tok !== gen) return;
      if (u !== exp || j + 1 >= st.sol.length) return finish(true);
      await wait(350); await play(st.sol[j + 1]); if (tok !== gen) return;
      j += 2; if (j >= st.sol.length) finish(true); else fb("¡Bien! Sigue.", "ok");
    } else {
      miss++; if (miss === 1) V.err++;
      wrong(); fb(miss >= 2 ? "Tampoco. Usa la pista si te atascas." : "No es esa. Prueba otra vez.", "bad");
    }
  };
  newBoard(pos, { bottom: side, user: side, onMove });
  setActs(`<button class="btn sm" id="ph">Pista</button><button class="btn sm ghost" id="ps">Ver solución</button>`, {
    "#ph": () => { if (over) return; V.err++; const f = st.sol[j].slice(0, 2); B.marks = { [f]: "g" }; draw(); fb(`Mueve la pieza de ${f}.`); },
    "#ps": async () => {
      if (over) return; over = true; V.err += 2; B.user = null;
      while (j < st.sol.length) { await play(st.sol[j]); if (tok !== gen) return; j++; await wait(300); }
      finish(false);
    }
  });
}
function stepLine(st, tok) {
  const base = st.fen ? C.fromFEN(st.fen) : C.fromFEN(C.START);
  let j = 0;
  newBoard(base, { bottom: "w" });
  const note = () => {
    if (!j) return txtEl(`<p>${st.txt || "Pulsa <b>Adelante</b> para ver cada jugada con su explicación."}</p>`);
    const h = B.hist[j - 1], n = Math.floor((j - 1) / 2) + 1;
    txtEl(`<p><b>${n}.${h.by === "b" ? ".." : ""} ${esc(sanES(h.san))}</b> ${(st.notes || [])[j - 1] || ""}</p>`);
  };
  B.hist = [];
  const upd = () => {
    note();
    setActs(`<button class="btn sm" id="lb"${j ? "" : " disabled"}>◀ Atrás</button><button class="btn sm gold" id="lf"${j < st.moves.length ? "" : " disabled"}>Adelante ▶</button>`, {
      "#lb": () => {
        if (B.busy || !j) return; j--;
        let p = base; const hist = B.hist.slice(0, j);
        for (const u of st.moves.slice(0, j)) p = C.make(p, C.findMove(p, u));
        B.pos = p; B.hist = hist; B.last = j ? { f: hist[j - 1].f, t: hist[j - 1].t } : null; B.arrows = []; draw(); upd();
      },
      "#lf": async () => {
        if (B.busy || j >= st.moves.length) return;
        const h = await play(st.moves[j]); if (tok !== gen || !h) return;
        B.hist.push(h); j++; upd();
        if (j >= st.moves.length) { const la = $("#la"); la.insertAdjacentHTML("beforeend", `<button class="btn gold wide" id="nx">Siguiente</button>`); A.on("#nx", "click", nextStep); }
      }
    });
  };
  upd();
}
function stepRep(st, tok) {
  const side = st.side;
  txtEl(`<p>${st.txt || ""} Juegas con <b>${side === "w" ? "blancas" : "negras"}</b>: haz tus jugadas de la línea; el rival responde solo.</p>`);
  let j = 0, miss = 0, done = false;
  const auto = async () => {
    while (j < st.moves.length && B.pos.turn !== side) { await wait(380); if (tok !== gen) return; await play(st.moves[j]); if (tok !== gen) return; j++; }
    if (j >= st.moves.length) { done = true; B.user = null; SFX.magic(); fb("✓ ¡Línea completa! Ya la tienes en la cabeza.", "ok"); nextBtn(); }
    else fb(`Tu jugada (${Math.ceil((j + 1) / 2)}).`);
  };
  const onMove = async u => {
    if (done) return;
    if (u === st.moves[j]) { miss = 0; await play(u); if (tok !== gen) return; j++; auto(); }
    else {
      miss++; V.err += miss === 1 ? 1 : 0; wrong();
      if (miss >= 2) { B.marks = { [st.moves[j].slice(0, 2)]: "g" }; draw(); fb("Esa no es la de la línea. Pista: mueve la pieza marcada.", "bad"); }
      else fb("Esa no es la de la línea. Prueba otra vez.", "bad");
    }
  };
  newBoard(C.fromFEN(C.START), { bottom: side, user: side, onMove });
  auto();
}
function stepPlay(st, tok) {
  const pos0 = C.fromFEN(st.fen), side = pos0.turn;
  txtEl(`<p><span class="side ${side}"></span>${st.txt}</p>`);
  let n = 0, over = false;
  const fail = msg => {
    over = true; B.user = null; V.err++; fb(msg, "bad");
    setActs(`<button class="btn gold wide" id="rt">Reintentar</button>`, { "#rt": () => { V.pool = null; renderStep(); } });
  };
  const win = msg => { over = true; B.user = null; SFX.magic(); fb("✓ " + msg, "ok"); nextBtn(); };
  const check = h => {
    const o = C.outcome({ pos: B.pos, keys: B.keys });
    if (st.goal === "promote" && h && h.pr && h.by === side) { win("¡Peón coronado!"); return true; }
    if (o.over) {
      if (o.reason === "mate" && o.winner === side) win(`¡Mate en ${n} jugadas!`);
      else fail(o.reason === "ahogado" ? "Ahogado: son tablas. Deja siempre una casilla libre al rey rival." : "La partida ha acabado en tablas. Prueba otra vez.");
      return true;
    }
    if (st.goal === "promote" && !B.pos.b.some(p => p === (side === "w" ? "P" : "p"))) { fail("Te han comido el peón. Prueba otra vez."); return true; }
    return false;
  };
  const onMove = async u => {
    if (over || B.busy) return;
    B.user = null;
    const h = await play(u); if (tok !== gen || !h) return; n++;
    if (check(h)) return;
    if (n >= st.max) return fail(`Se acabaron las ${st.max} jugadas. Prueba otra vez con un plan.`);
    fb(`Jugada ${n} de ${st.max}. La máquina piensa…`);
    const r = await engineBest(B.pos, 350); if (tok !== gen || !r) return;
    await wait(200);
    const h2 = await play(r); if (tok !== gen) return;
    if (check(h2)) return;
    B.user = side; fb(`Jugada ${n} de ${st.max}. Te toca.`);
  };
  newBoard(pos0, { bottom: side, user: side, onMove });
  fb(`Tienes ${st.max} jugadas.`);
  setActs(`<button class="btn sm" id="ph">Pista</button><button class="btn sm ghost" id="pr">Empezar de nuevo</button>`, {
    "#ph": async () => { if (over || !B.user) return; fb("Pensando una pista…"); const r = await engineBest(B.pos, 600); if (tok !== gen || !r) return; B.arrows = [[r.slice(0, 2), r.slice(2, 4), "g"]]; draw(); fb("La flecha verde es una buena jugada."); },
    "#pr": () => renderStep()
  });
}

/* ---------- problemas de la colección ---------- */
const pzTh = p => (p[3] || "").split(",");
function pickPuzzles(n, o = {}) {
  const seen = new Set(P.seen), idx = PZ.map((_, i) => i);
  const sh = a => { for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; } return a; };
  const fit = (i, th, lo, hi) => (!th || pzTh(PZ[i]).includes(th)) && PZ[i][2] >= lo && PZ[i][2] <= hi;
  const out = [];
  const add = list => { for (const i of sh(list)) { if (out.length >= n) break; if (!out.includes(i)) out.push(i); } };
  const lo = o.lo || 0, hi = o.hi || 9999;
  add(idx.filter(i => fit(i, o.th, lo, hi) && !seen.has(i)));
  add(idx.filter(i => fit(i, o.th, lo, hi)));
  add(idx.filter(i => fit(i, o.th, 0, 9999)));
  if (out.length < n) { const mid = (lo + Math.min(hi, 2400)) / 2 || P.pr; add(idx.filter(i => Math.abs(PZ[i][2] - mid) < 250)); add(idx); }
  return out;
}
/* Problema: el primer movimiento es el error del rival; luego tú encuentras la mejor */
function runPuzzle(k, tok, done) {
  const [fen, mv] = PZ[k], moves = mv.split(" "), pos = C.fromFEN(fen), side = other(pos.turn);
  let j = 1, failed = false, over = false;
  const end = () => { over = true; B.user = null; done(!failed); };
  const onMove = async u => {
    if (over || B.busy) return;
    const exp = moves[j], last = j === moves.length - 1;
    if (u === exp || ((last || mates(B.pos, exp)) && mates(B.pos, u))) {
      B.user = null;
      await play(u); if (tok !== gen) return;
      if (j + 1 >= moves.length || isMate(B.pos)) return end();
      fb("¡Bien! Sigue…", "ok");
      await wait(400); await play(moves[j + 1]); if (tok !== gen) return;
      j += 2; B.user = side;
      if (j >= moves.length) end();
    } else { failed = true; wrong(); fb("No es la mejor. Prueba otra vez.", "bad"); }
  };
  newBoard(pos, { bottom: side, user: null, onMove });
  txtEl(`<p><span class="side ${side}"></span><b>Juegan ${side === "w" ? "blancas" : "negras"}.</b> El rival acaba de mover. Encuentra la mejor jugada.</p>`);
  fb("");
  const ready = wait(600).then(async () => { if (tok !== gen) return; await play(moves[0]); if (tok !== gen) return; B.user = side; });
  return {
    async hint() { await ready; if (tok !== gen || over || B.busy || !B.user) return; failed = true; B.marks = { [moves[j].slice(0, 2)]: "g" }; draw(); fb(`Mueve la pieza de ${moves[j].slice(0, 2)}.`); },
    async solve() {
      await ready; while (B && B.busy && tok === gen) await wait(100);
      if (tok !== gen || over || !B.user) return; failed = true; over = true; B.user = null;
      while (j < moves.length) { await play(moves[j]); if (tok !== gen) return; j++; await wait(350); }
      done(false);
    }
  };
}
function stepPool(st, tok) {
  if (!V.pool) V.pool = { list: pickPuzzles(st.n, st), k: 0, good: 0 };
  const pl = V.pool;
  if (!pl.list.length) { txtEl(`<p>${st.txt}</p>`); fb("No hay problemas de este tipo todavía."); return nextBtn(); }
  const k = pl.list[pl.k];
  const head = () => `<p class="small muted">${esc(st.txt)} · Problema ${pl.k + 1} de ${pl.list.length}${st.exam ? ` · aciertos: ${pl.good}` : ""}</p>`;
  const ctl = runPuzzle(k, tok, ok => {
    if (ok) { pl.good++; fb(`✓ ¡Resuelto! ${themeLine(k)}`, "ok"); SFX.magic(); } else { V.err++; fb(`Fallado. ${themeLine(k)}`, "bad"); }
    markSeen(k, ok, true);
    pl.k++;
    if (pl.k < pl.list.length) setActs(`<button class="btn gold wide" id="pn">Siguiente problema</button>`, { "#pn": () => renderStep() });
    else {
      if (st.exam && pl.good < Math.ceil(pl.list.length * .75)) V.fail = `Has acertado ${pl.good} de ${pl.list.length}. Necesitas ${Math.ceil(pl.list.length * .75)}: entrena táctica unos días y repite el examen.`;
      nextBtn("Terminar");
    }
  });
  $("#lt").insertAdjacentHTML("afterbegin", head());
  setActs(`<button class="btn sm" id="ph">Pista</button><button class="btn sm ghost" id="ps">Ver solución</button>`, { "#ph": () => ctl.hint(), "#ps": () => ctl.solve() });
}
const themeLine = k => { const t = pzTh(PZ[k]).filter(x => TH[x] && x !== "mate").map(x => TH[x]); return t.length ? `Tema: ${t.join(", ")}.` : ""; };
function markSeen(k, ok, rated) {
  P.seen.push(k); if (P.seen.length > Math.min(600, PZ.length * .7)) P.seen.splice(0, P.seen.length - Math.floor(PZ.length * .5));
  let d = 0;
  if (rated) {
    const r = PZ[k][2], E = 1 / (1 + Math.pow(10, (r - P.pr) / 400)), K = P.pn < 20 ? 40 : 20;
    d = Math.round(K * ((ok ? 1 : 0) - E)); P.pr = Math.max(400, P.pr + d); P.pn++;
    P.ph.push(P.pr); if (P.ph.length > 120) P.ph.shift();
  }
  bump("pz"); return d;
}
function finishLesson() {
  const l = LES[V.ui].lessons[V.li], nx0 = V.fail ? null : true;
  const s = V.fail ? 0 : V.err <= 1 ? 3 : V.err <= 3 ? 2 : 1;
  if (s) { P.les[l.id] = Math.max(P.les[l.id] || 0, s); bump("les"); } else save();
  const nx = nextLesson();
  show(`${topBar("← Escuela", "LECCIÓN")}
    <div class="end"><h2>${s ? "¡Lección completada!" : "Casi…"}</h2>
      <p><b>${esc(l.t)}</b></p>${s ? stars(s) : ""}
      <p class="muted">${s ? (s === 3 ? "Perfecta. " : s === 2 ? "Muy bien. Repítela cuando quieras para sacar las 3 estrellas. " : "Completada, pero con fallos: repásala mañana. ") : esc(V.fail)}</p>
      <div class="row">${nx0 && nx ? `<button class="btn gold" id="nl">Siguiente: ${esc(nx.l.t)}</button>` : ""}<button class="btn ghost" id="hm">Volver a la escuela</button></div>
      ${s ? "" : `<button class="btn" id="rp">Repetir</button>`}</div>`);
  if (s) SFX.magic();
  A.on("#bk", "click", goHome); A.on("#hm", "click", goHome);
  A.on("#nl", "click", () => startLesson(nx.ui, nx.li));
  A.on("#rp", "click", () => startLesson(V.ui, V.li));
}

/* ---------- entrenamiento de táctica ---------- */
function renderTactics() {
  const k = pickPuzzles(1, { lo: P.pr - 150, hi: P.pr + 150 })[0];
  const tok = show(`${topBar("← Escuela", "TÁCTICA")}
    <div class="ltitle"><h2>Tu nivel: <span class="gold">${P.pr}</span></h2><p class="muted small">Problemas de partidas jugadas por el motor. Si aciertas a la primera sube tu nivel; si fallas o pides pista, baja.</p></div>
    <div class="ltxt" id="lt"></div>${boardHTML()}<p class="fb" id="fb" role="status" aria-live="polite"></p><div class="acts" id="la"></div>`);
  A.on("#bk", "click", goHome);
  if (k == null) { fb("No hay problemas."); return; }
  const ctl = runPuzzle(k, tok, ok => {
    const d = markSeen(k, ok, true);
    if (ok) SFX.magic();
    fb(`${ok ? "✓ ¡Resuelto!" : "✗ Fallado."} Nivel ${P.pr} (${d >= 0 ? "+" : ""}${d}). ${themeLine(k)}`, ok ? "ok" : "bad");
    setActs(`<button class="btn gold wide" id="pn">Siguiente problema</button>`, { "#pn": renderTactics });
  });
  setActs(`<button class="btn sm" id="ph">Pista</button><button class="btn sm ghost" id="ps">Ver solución</button>`, { "#ph": () => ctl.hint(), "#ps": () => ctl.solve() });
}

/* ---------- partidas: escalera y revisión ---------- */
function recordGame(L, res) {
  const r = res.winner ? (res.winner === L.human ? 1 : 0) : .5, lv = L.level;
  const e = P.lad[lv] || (P.lad[lv] = { w: 0, d: 0, l: 0 });
  e[r === 1 ? "w" : r === 0 ? "l" : "d"]++;
  const t = Date.now(); L.t = t;
  P.games.unshift({ t, lvl: lv, c: L.human, r, n: L.moves.length, moves: L.moves.slice(), undos: L.undos || 0 });
  P.games = P.games.slice(0, 20);
  bump("g");
  if (r === 1 && e.w === 2 && lv < 10) {
    S.aiLevel = lv + 1; ls.set("ajedrez.lvl10", lv + 1);
    setTimeout(() => toast(`¡Nivel ${lv} superado! Siguiente: nivel ${lv + 1}, ${LVL(lv + 1)}.`), 2600);
  }
}
const CLS = loss => loss >= 20 ? "??" : loss >= 10 ? "?" : loss >= 5 ? "?!" : "";
const pl = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const CLSN = { "??": "Error grave", "?": "Error", "?!": "Imprecisión" };
function review(g) {
  const back = S.mode;
  V = { v: "review", g, back, an: null, k: 0, prog: 0 };
  S.mode = "school"; S.thinking = 0;
  renderReview();
  analyse();
}
async function analyse() {
  const g = V.g, me = V, rp = C.replay(g.moves), n = rp.hist.length;
  let pos = C.fromFEN(C.START);
  const pos_ = [pos];
  for (const h of rp.hist) { pos = C.make(pos, C.findMove(pos, h.uci)); pos_.push(pos); }
  const ev = [];
  for (let i = 0; i <= n; i++) {
    if (V !== me) return;
    const p = pos_[i], sgn = p.turn === "w" ? 1 : -1;
    if (!C.legalMoves(p).length) ev.push({ s: C.inCheck(p) ? -10000 * sgn : 0, line: null });
    else {
      const r = await AJSF.go(C.toFEN(p), { depth: 10 });
      if (V !== me) return;
      if (!r || !r.lines.length) { me.err = true; renderReview(); return; }
      ev.push({ s: SCORE(r.lines[0]) * sgn, line: r.lines[0] });
    }
    me.prog = i + 1;
    const pb = $("#rvp"); if (pb) { pb.style.width = Math.round(((i + 1) / (n + 1)) * 100) + "%"; const t = $("#rvt"); if (t) t.textContent = `Analizando jugada ${Math.min(i + 1, n)} de ${n}…`; }
  }
  const mv = rp.hist.map((h, k) => {
    const c = h.by, sg = c === "w" ? 1 : -1, before = wp(ev[k].s * sg), after = wp(ev[k + 1].s * sg), loss = Math.max(0, before - after);
    const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * loss) - 3.1669));
    const best = ev[k].line && ev[k].line.pv[0];
    const cl = best === h.uci ? "" : CLS(loss);
    return { h, k, c, loss, acc, cl, best, pos: pos_[k], expl: cl === "??" || cl === "?" ? explain(pos_[k], C.findMove(pos_[k], h.uci), ev[k].line, ev[k + 1].line ? { ...ev[k + 1].line } : null, true) : "" };
  });
  const accOf = c => { const a = mv.filter(x => x.c === c); return a.length ? Math.round(a.reduce((s, x) => s + x.acc, 0) / a.length) : null; };
  me.an = { ev, mv, pos: pos_, acc: { w: accOf("w"), b: accOf("b") } };
  const my = g.my;
  if (my) { const e = P.games.find(x => x.t === g.t || (x.moves && x.moves.join(" ") === g.moves.join(" "))); if (e) e.acc = me.an.acc[my]; }
  bump("rev");
  const first = mv.find(x => (!my || x.c === my) && (x.cl === "??" || x.cl === "?"));
  me.k = first ? first.k : 0;
  if (V === me) renderReview();
}
function renderReview() {
  const g = V.g, an = V.an, my = g.my;
  const n = C.replay(g.moves).hist.length;
  if (!an) {
    show(`${topBar("← Volver", "REVISIÓN")}
      <div class="card"><h2>Revisando la partida</h2>${V.err ? `<p class="muted">Este móvil no puede ejecutar el motor de análisis. Prueba desde otro navegador (Chrome o Safari actualizados).</p>` : `<p class="muted" id="rvt">Analizando jugada 1 de ${n}…</p><div class="pbar"><i id="rvp" style="width:${Math.round((V.prog / (n + 1)) * 100)}%"></i></div><p class="muted small">El motor mira cada jugada con calma. Tarda un poco.</p>`}</div>`);
    A.on("#bk", "click", () => V.back === "school" ? goHome() : exit());
    return;
  }
  const mine = an.mv.filter(x => !my || x.c === my);
  const cnt = cl => mine.filter(x => x.cl === cl).length;
  const errs = mine.filter(x => x.cl === "??" || x.cl === "?");
  const pts = an.ev.map((e, i) => `${(i / Math.max(1, an.ev.length - 1)) * 300},${(100 - wp(e.s)) * .8}`).join(" ");
  const dots = an.mv.filter(x => x.cl === "??" || x.cl === "?").map(x => `<circle cx="${((x.k + 1) / Math.max(1, an.ev.length - 1)) * 300}" cy="${(100 - wp(an.ev[x.k + 1].s)) * .8}" r="4" fill="${x.cl === "??" ? "#FF6B5E" : "#E3B04B"}" data-k="${x.k}"/>`).join("");
  const accTxt = my ? `Tu precisión: <b>${an.acc[my]}%</b> · rival: ${an.acc[other(my)]}%` : `Precisión: blancas <b>${an.acc.w}%</b> · negras <b>${an.acc.b}%</b>`;
  const tok = show(`${topBar("← Volver", "REVISIÓN")}
    <div class="card"><h2>Resumen</h2><p>${accTxt}</p>
      <div class="cnt"><span class="c1">${pl(cnt("??"), "error grave", "errores graves")}</span><span class="c2">${pl(cnt("?"), "error", "errores")}</span><span class="c3">${pl(cnt("?!"), "imprecisión", "imprecisiones")}</span></div>
      <svg class="graph" id="gr" viewBox="0 0 300 80" preserveAspectRatio="none" aria-label="Gráfica de la ventaja"><rect width="300" height="80" fill="#2A2530"/><polygon points="0,80 ${pts} 300,80" fill="#E9E1D2"/><line x1="0" y1="40" x2="300" y2="40" stroke="#A99F93" stroke-width=".6" stroke-dasharray="3 3"/>${dots}<line id="gcur" x1="0" y1="0" x2="0" y2="80" stroke="#E3B04B" stroke-width="1.5"/></svg>
      <p class="muted small">Blanco arriba = ventaja de blancas. Los puntos rojos son errores graves.</p></div>
    <div class="ltxt" id="lt"></div>${boardHTML()}
    <div class="acts" id="la"></div>
    ${errs.length ? `<div class="card"><h2>${my ? "Tus errores" : "Errores"}</h2><div class="errs">${errs.map(x => `<button class="er" data-k="${x.k}"><b>${Math.floor(x.k / 2) + 1}.${x.c === "b" ? ".." : ""} ${esc(sanES(x.h.san))}${x.cl}</b><span class="muted small">${CLSN[x.cl]}</span></button>`).join("")}</div></div>` : `<div class="card"><p>✓ Sin errores graves${my ? " por tu parte" : ""}. ¡Muy bien jugado!</p></div>`}
    <p class="muted small">Consejo: en cada error, intenta ver tú la jugada buena antes de mirar la flecha verde.</p>`);
  A.on("#bk", "click", () => V.back === "school" ? goHome() : exit());
  newBoard(an.pos[0], { bottom: my || "w" });
  const go = k => {
    V.k = Math.max(0, Math.min(n, k));
    const x = an.mv[V.k];
    if (!B) return;
    B.pos = an.pos[V.k]; B.sel = null; B.marks = {};
    const prev = an.mv[V.k - 1]; B.last = prev ? { f: prev.h.f, t: prev.h.t } : null;
    B.arrows = [];
    let t = "";
    if (x) {
      const bad = x.cl === "??" || x.cl === "?";
      B.arrows.push([x.h.uci.slice(0, 2), x.h.uci.slice(2, 4), bad ? "r" : "y"]);
      if (x.cl && x.best && x.best !== x.h.uci) B.arrows.push([x.best.slice(0, 2), x.best.slice(2, 4), "g"]);
      t = `<p><b>${Math.floor(x.k / 2) + 1}.${x.c === "b" ? ".." : ""} ${esc(sanES(x.h.san))}${x.cl}</b> ${x.cl ? `<span class="muted">${CLSN[x.cl]}.</span> ` : ""}${x.expl || (x.cl === "?!" && x.best ? `Era mejor <b>${sanOf(x.pos, x.best)}</b>.` : x.cl ? "" : "Buena jugada.")}</p><p class="small muted">Flecha ${bad ? "roja" : "dorada"}: lo que se jugó${x.cl && x.best !== x.h.uci ? " · verde: lo que recomienda el motor" : ""}.</p>`;
    } else t = `<p><b>Posición final.</b></p>`;
    txtEl(t); draw();
    const gc = $("#gcur"); if (gc) { const X = ((V.k + (x ? 1 : 0)) / Math.max(1, an.ev.length - 1)) * 300; gc.setAttribute("x1", X); gc.setAttribute("x2", X); }
    const nextErr = errs.find(e => e.k > V.k);
    setActs(`<button class="btn sm" id="rb"${V.k ? "" : " disabled"}>◀</button><button class="btn sm" id="rf"${V.k < n ? "" : " disabled"}>▶</button><button class="btn sm gold" id="re"${nextErr ? "" : " disabled"}>Siguiente error</button><button class="btn sm ghost" id="rt">Practicar</button>`, {
      "#rb": () => go(V.k - 1), "#rf": () => go(V.k + 1), "#re": () => nextErr && go(nextErr.k),
      "#rt": () => tryHere(an, V.k, tok, go)
    });
  };
  document.querySelectorAll(".er").forEach(b => b.addEventListener("click", () => { go(+b.dataset.k); $("#bd").scrollIntoView({ behavior: "smooth", block: "center" }); }));
  const gr = $("#gr"); if (gr) gr.addEventListener("click", e => { const r = gr.getBoundingClientRect(); go(Math.round(((e.clientX - r.left) / r.width) * (an.ev.length - 1)) - 1); });
  go(V.k);
}
/* Practicar desde una posición de la partida: buscas tú la jugada buena */
function tryHere(an, k, tok, go) {
  const x = an.mv[k]; if (!x || !x.best || !B) return;
  B.pos = an.pos[k]; B.arrows = []; B.marks = {}; B.last = null; B.user = B.pos.turn; draw();
  txtEl(`<p><span class="side ${B.pos.turn}"></span><b>Juegan ${B.pos.turn === "w" ? "blancas" : "negras"}.</b> Busca la jugada que recomienda el motor.</p>`);
  let tries = 0;
  B.onMove = async u => {
    const ok = u === x.best || (mates(B.pos, x.best) && mates(B.pos, u));
    if (ok) { B.user = null; await play(u); if (tok !== gen) return; SFX.magic(); txtEl(`<p>✓ <b>¡Eso es!</b> ${sanOf(an.pos[k], x.best)} era la mejor.</p>`); }
    else if (++tries >= 2) { wrong(); B.user = null; B.arrows = [[x.best.slice(0, 2), x.best.slice(2, 4), "g"]]; draw(); txtEl(`<p>La buena era <b>${sanOf(an.pos[k], x.best)}</b> (flecha verde).</p>`); }
    else { wrong(); txtEl(`<p>No es esa. Una vez más: mira jaques, capturas y amenazas.</p>`); }
  };
  setActs(`<button class="btn sm ghost" id="rx">Volver a la revisión</button>`, { "#rx": () => { B.user = null; B.onMove = null; go(k); } });
}

/* ================= enganches con la pantalla principal ================= */
window.AJ_SCHOOL = {
  render,
  homeCard() {
    const d = doneCount(), t = allLessons().length;
    return `<div class="card school"><div class="sch-h"><span class="sch-i" aria-hidden="true">🎓</span><div><h2>Escuela de ajedrez</h2><p class="muted small">${d ? `${d}/${t} lecciones · táctica ${P.pr} · escalera nivel ${recLevel()}` : "¿Empiezas de cero? Aprende paso a paso, con ejercicios, hasta nivel de club."}</p></div></div>
      <button class="btn gold wide" id="school">${d ? "Seguir aprendiendo" : "Empezar a aprender"}</button></div>`;
  },
  ladderHint() { const r = recLevel(), w = (P.lad[r] || {}).w || 0; return `Tu escalón: <b>nivel ${r}</b>${w ? ` (te falta ${2 - w} victoria)` : ""}.`; },
  stamp: () => `${doneCount()}|${P.pr}|${recLevel()}`,
  recordGame, review, _dbg: () => ({ B: B && { user: B.user, busy: B.busy, turn: B.pos.turn, fen: C.toFEN(B.pos) }, V })
};
if (S.ready && !S.mode) { S.lastKey = ""; A.render(); }
})();
