/* Azulejos: motor de reglas puro (estilo Azul, reglas oficiales del juego base) + máquina con 3 niveles.
   Sin DOM: se usa igual en el navegador (window.Azulejos) y en node (module.exports).
   El estado es JSON plano; el único azar (sacar losetas de la bolsa) sale de la semilla s.r. */
(function (root) {
"use strict";

const NC = 5, PER = 20, FP = 5;                       // 5 colores x 20 losetas; FP = ficha de jugador inicial
const NAME = ["azul", "amarilla", "roja", "negra", "celeste"];
const NAMEP = ["azules", "amarillas", "rojas", "negras", "celestes"];
const FLOOR = [-1, -1, -2, -2, -2, -3, -3];
const NFAC = { 2: 5, 3: 7, 4: 9 };
const wallCol = (row, c) => (c + row) % NC;          // columna del color c en la fila row del muro
const colorAt = (row, col) => (col - row + NC) % NC;  // color que va en esa casilla del muro
const clone = o => JSON.parse(JSON.stringify(o));
const sum = a => a.reduce((x, y) => x + y, 0);

/* ================= azar con semilla ================= */
function rnd(s) { let t = (s.r = (s.r + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function draw(s) {
  if (!sum(s.bag)) { if (!sum(s.lid)) return -1; s.bag = s.lid; s.lid = [0, 0, 0, 0, 0]; s.refills++; }
  let x = Math.floor(rnd(s) * sum(s.bag));
  for (let c = 0; c < NC; c++) { if (x < s.bag[c]) { s.bag[c]--; return c; } x -= s.bag[c]; }
  return -1;
}
function fill(s) {
  for (let i = 0; i < s.fac.length; i++) {
    const f = [];
    for (let k = 0; k < 4; k++) { const t = draw(s); if (t < 0) break; f.push(t); }
    s.fac[i] = f.sort((a, b) => a - b);
  }
  s.ctr = [0, 0, 0, 0, 0]; s.ctrFP = true; s.fpBy = -1;
}

/* ================= partida ================= */
const newPlayer = () => ({ sc: 0, ln: [0, 1, 2, 3, 4].map(() => ({ c: -1, n: 0 })), wall: [0, 1, 2, 3, 4].map(() => [0, 0, 0, 0, 0]), fl: [] });
function newGame(seed, np, start) {
  np = Math.max(2, Math.min(4, np | 0)); start = ((start | 0) % np + np) % np;
  const s = { v: 1, np, seed, r: seed >>> 0, bag: [PER, PER, PER, PER, PER], lid: [0, 0, 0, 0, 0], refills: 0,
    fac: Array.from({ length: NFAC[np] }, () => []), ctr: [0, 0, 0, 0, 0], ctrFP: true,
    pl: Array.from({ length: np }, newPlayer), first: start, start, turn: start, round: 1, n: 0,
    last: null, hist: [], rep: null, over: null, wins: Array(np).fill(0) };
  fill(s);
  return s;
}
function rematch(s) {
  const seed = (Math.imul(s.seed ^ 0x5bd1e995, 1103515245) + 12345 + s.n) >>> 1;
  const ns = newGame(seed, s.np, (s.first + 1) % s.np);
  ns.wins = s.wins.slice();
  return ns;
}

/* ================= reglas ================= */
const srcCount = (s, f, c) => f < 0 ? s.ctr[c] : s.fac[f].filter(x => x === c).length;
function lineErr(P, l, c) {
  const L = P.ln[l];
  if (P.wall[l][wallCol(l, c)]) return `Ya tienes una loseta ${NAME[c]} en esa fila del muro.`;
  if (L.n && L.c !== c) return `Esa fila ya tiene losetas ${NAMEP[L.c]}: solo admite ese color.`;
  if (L.n >= l + 1) return "Esa fila ya está completa.";
  return "";
}
const canLine = (P, l, c) => !lineErr(P, l, c);
function check(s, p, a) {
  if (s.over) return "La partida ha terminado.";
  if (p !== s.turn) return "No es tu turno.";
  if (!a || typeof a !== "object") return "Jugada no válida.";
  const f = a.f | 0, c = a.c | 0, l = a.l | 0;
  if (f < -1 || f >= s.fac.length || c < 0 || c >= NC || l < 0 || l > 5) return "Jugada no válida.";
  if (!srcCount(s, f, c)) return f < 0 ? "En el centro no hay losetas de ese color." : "En esa fábrica no hay losetas de ese color.";
  if (l < 5) return lineErr(s.pl[p], l, c);
  return "";
}
function legal(s) {
  const out = [], P = s.pl[s.turn];
  const srcs = [];
  s.fac.forEach((f, i) => { const seen = new Set(f); seen.forEach(c => srcs.push([i, c])); });
  for (let c = 0; c < NC; c++) if (s.ctr[c]) srcs.push([-1, c]);
  for (const [f, c] of srcs) {
    for (let l = 0; l < 5; l++) if (canLine(P, l, c)) out.push({ f, c, l });
    out.push({ f, c, l: 5 });
  }
  return out;
}
function toFloor(s, P, c, k) {
  for (let i = 0; i < k; i++) { if (P.fl.length < 7) P.fl.push(c); else if (c !== FP) s.lid[c]++; }
}
function scoreAt(w, r, c) {
  let h = 1, v = 1;
  for (let x = c - 1; x >= 0 && w[r][x]; x--) h++;
  for (let x = c + 1; x < NC && w[r][x]; x++) h++;
  for (let y = r - 1; y >= 0 && w[y][c]; y--) v++;
  for (let y = r + 1; y < NC && w[y][c]; y++) v++;
  return h === 1 && v === 1 ? 1 : (h > 1 ? h : 0) + (v > 1 ? v : 0);
}
const floorPen = n => sum(FLOOR.slice(0, Math.min(7, n)));
function bonusOf(P) {
  const w = P.wall;
  const rows = w.filter(r => r.every(Boolean)).length;
  let cols = 0, colors = 0;
  for (let c = 0; c < NC; c++) { if (w.every(r => r[c])) cols++; if (w.every((r, i) => r[wallCol(i, c)])) colors++; }
  return { rows, cols, colors, pts: rows * 2 + cols * 7 + colors * 10 };
}
const fullRows = P => P.wall.filter(r => r.every(Boolean)).length;

function apply(s0, p, a, lite) {
  const s = clone(s0); if (lite) { s.hist = []; s.rep = null; }
  const f = a.f | 0, c = a.c | 0, l = a.l | 0, P = s.pl[p];
  let k, fp = false;
  if (f >= 0) { k = s.fac[f].filter(x => x === c).length; s.fac[f].forEach(x => { if (x !== c) s.ctr[x]++; }); s.fac[f] = []; }
  else { k = s.ctr[c]; s.ctr[c] = 0; if (s.ctrFP) { s.ctrFP = false; fp = true; s.fpBy = p; toFloor(s, P, FP, 1); } }
  let over = k;
  if (l < 5) { const L = P.ln[l], put = Math.min(k, l + 1 - L.n); L.c = c; L.n += put; over = k - put; }
  toFloor(s, P, c, over);
  s.n++;
  s.last = { n: s.n, p, f, c, k, l, fl: over, fp, round: s.round };
  if (!lite) { s.hist.push(s.last); if (s.hist.length > 80) s.hist = s.hist.slice(-80); }
  if (s.fac.every(x => !x.length) && !sum(s.ctr)) endRound(s);
  else s.turn = (p + 1) % s.np;
  return s;
}
function endRound(s) {
  const rep = { round: s.round, n: s.n, pl: [] };
  const next = s.ctrFP || s.fpBy < 0 ? s.start : s.fpBy;
  s.pl.forEach((P, q) => {
    const gains = [], before = P.sc;
    for (let r = 0; r < 5; r++) {
      const L = P.ln[r];
      if (L.n === r + 1) {
        const cl = wallCol(r, L.c); P.wall[r][cl] = 1;
        const pts = scoreAt(P.wall, r, cl); P.sc += pts;
        gains.push({ r, c: L.c, pts }); s.lid[L.c] += r; P.ln[r] = { c: -1, n: 0 };
      }
    }
    const pen = floorPen(P.fl.length);
    P.sc = Math.max(0, P.sc + pen);
    P.fl.forEach(x => { if (x !== FP) s.lid[x]++; });
    rep.pl.push({ gains, pen, fl: P.fl.slice(), before, sc: P.sc });
    P.fl = [];
  });
  s.rep = rep;
  const ends = s.pl.some(P => fullRows(P) > 0);
  if (!ends) {
    s.round++; s.start = next; s.turn = s.start;
    fill(s);
    if (s.fac.every(x => !x.length)) finish(s, rep);   // sin losetas en ningún sitio: no se puede seguir
  } else finish(s, rep);
}
function finish(s, rep) {
  rep.bonus = s.pl.map(P => { const b = bonusOf(P); P.sc += b.pts; return b; });
  const order = s.pl.map((P, q) => q).sort((a, b) => s.pl[b].sc - s.pl[a].sc || fullRows(s.pl[b]) - fullRows(s.pl[a]) || a - b);
  const top = order[0], win = order.filter(q => s.pl[q].sc === s.pl[top].sc && fullRows(s.pl[q]) === fullRows(s.pl[top]));
  win.forEach(q => s.wins[q]++);
  s.over = { order, win, tieRows: win.length === 1 && order.length > 1 && s.pl[order[1]].sc === s.pl[top].sc };
}

/* Lo que puntuaría cada fila llena si la ronda acabase ahora (para la vista previa) */
function preview(P) {
  const w = P.wall.map(r => r.slice()), out = [];
  let tot = 0;
  for (let r = 0; r < 5; r++) {
    const L = P.ln[r];
    if (L.n === r + 1) { const cl = wallCol(r, L.c); w[r][cl] = 1; const pts = scoreAt(w, r, cl); tot += pts; out.push({ r, pts }); }
  }
  const pen = floorPen(P.fl.length);
  return { rows: out, pen, tot: Math.max(-P.sc, tot + pen) };
}

/* ================= máquina ================= */
/* Valor de un tablero: puntos + lo que dará al alicatar + promesa de lo empezado − suelo + progreso hacia bonus */
function boardVal(s, q) {
  const P = s.pl[q];
  if (s.over) return P.sc;
  const w = P.wall.map(r => r.slice());
  let v = P.sc;
  for (let r = 0; r < 5; r++) {
    const L = P.ln[r];
    if (L.n === r + 1) { const cl = wallCol(r, L.c); w[r][cl] = 1; v += scoreAt(w, r, cl); }
  }
  for (let r = 0; r < 5; r++) {
    const L = P.ln[r];
    if (L.n && L.n < r + 1) {
      const cl = wallCol(r, L.c); w[r][cl] = 1; const pts = scoreAt(w, r, cl); w[r][cl] = 0;
      const frac = L.n / (r + 1);
      v += pts * frac * .7 - (r + 1 - L.n) * .25;
    }
  }
  v += floorPen(P.fl.length);
  for (let r = 0; r < 5; r++) { const k = sum(w[r]); v += k === 5 ? 2 : k * k * .05; }
  for (let c = 0; c < 5; c++) {
    let kc = 0, kk = 0;
    for (let r = 0; r < 5; r++) { kc += w[r][c]; kk += w[r][wallCol(r, c)]; }
    v += kc === 5 ? 7 : kc * kc * .14; v += kk === 5 ? 10 : kk * kk * .16;
  }
  return v;
}
/* Diferencia frente al mejor rival (en partidas de 3-4 cuenta sobre todo el que va delante) */
function standing(s, q) {
  const me = boardVal(s, q);
  let best = -Infinity;
  for (let o = 0; o < s.np; o++) if (o !== q) best = Math.max(best, boardVal(s, o));
  return me - best * (s.np === 2 ? 1 : .6);
}
function plan(s, p, level) {
  const acts = legal(s);
  if (!acts.length) return null;
  const rand = s0 => { s0.rr = ((s0.rr || (s.r ^ 0x9e3779b9) >>> 0) + 0x6D2B79F5) >>> 0; let t = s0.rr; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rs = {};
  const scored = acts.map(a => { const ns = apply(s, p, a, true); return { a, ns, v: boardVal(ns, p) - boardVal(s, p) }; });
  if (level <= 1) {
    let best = null, bv = -Infinity;
    for (const x of scored) { const v = x.v + rand(rs) * 11; if (v > bv) { bv = v; best = x.a; } }
    return best;
  }
  if (level === 2) {
    let best = null, bv = -Infinity;
    for (const x of scored) { const v = x.v + rand(rs) * .05; if (v > bv) { bv = v; best = x.a; } }
    return best;
  }
  /* nivel 3: mis 10 mejores jugadas, y para cada una la mejor respuesta del siguiente jugador */
  scored.sort((a, b) => b.v - a.v);
  const top = scored.slice(0, 10);
  let best = top[0].a, bv = -Infinity;
  for (const x of top) {
    let v;
    if (x.ns.over || x.ns.round !== s.round) v = standing(x.ns, p);
    else {
      const o = x.ns.turn, base = boardVal(x.ns, o);
      let reply = null, rv = -Infinity;
      for (const b of legal(x.ns)) { const ns2 = apply(x.ns, o, b, true); const g = boardVal(ns2, o) - base; if (g > rv) { rv = g; reply = ns2; } }
      v = reply ? standing(reply, p) : standing(x.ns, p);
    }
    v += rand(rs) * .02;
    if (v > bv) { bv = v; best = x.a; }
  }
  return best;
}

/* ================= textos ================= */
function describe(L, who, you) {
  const k = L.k, cn = k === 1 ? `1 loseta ${NAME[L.c]}` : `${k} losetas ${NAMEP[L.c]}`;
  const src = L.f < 0 ? "del centro" : `de la fábrica ${L.f + 1}`;
  const pr = k === 1 ? "la" : "las";
  let t = `${who} ${you ? "coges" : "coge"} ${cn} ${src}`;
  if (L.fp) t += " (y la ficha de inicio)";
  if (L.l === 5) t += ` y ${pr} ${you ? "tiras" : "tira"} al suelo`;
  else { t += ` y ${pr} ${you ? "pones" : "pone"} en la fila ${L.l + 1}`; if (L.fl) t += ` (${L.fl} al suelo)`; }
  return t;
}

const api = { NC, FP, NAME, NAMEP, FLOOR, NFAC, wallCol, colorAt, newGame, rematch, check, apply, legal, canLine, lineErr, scoreAt, floorPen, bonusOf, fullRows, preview, plan, describe, srcCount, boardVal };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Azulejos = api;
})(typeof window !== "undefined" ? window : globalThis);
