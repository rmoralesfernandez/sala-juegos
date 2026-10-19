/* Retales: motor de reglas puro (estilo Patchwork) + máquina con 3 niveles.
   Sin DOM: se usa igual en el navegador (window.Retales) y en node (module.exports).
   El estado es JSON plano; el único azar (orden del círculo y quién empieza) sale de la semilla. */
(function (root) {
"use strict";

/* 33 retales: [botones que cuesta, tiempo, botones que da, forma] (forma: filas separadas por "/") */
const RAW = [[2,1,0,"#/#"],[1,3,0,".#/##"],[3,1,0,".#/##"],[2,2,0,"#/#/#"],[3,2,1,".#/##/#."],[2,2,0,"#./##/##"],[1,4,1,"..#../#####/..#.."],[0,3,1,".#./###/.#./.#."],[6,5,2,"##/##"],[4,2,0,"#./##/##/.#"],[2,2,0,".#/##/.#"],[1,5,1,"##/.#/.#/##"],[3,3,1,"#/#/#/#"],[7,1,1,"#####"],[3,4,1,"#./#./##/#."],[7,4,2,"#./##/##/#."],[3,6,2,".#./###/#.#"],[2,1,0,".#./.##/##./.#."],[4,6,2,".#/.#/##"],[5,4,2,".#./###/.#."],[2,3,0,"#.#/###/#.#"],[5,3,1,".#./###/###/.#."],[10,3,2,".#/.#/.#/##"],[5,5,2,".#./.#./###"],[10,5,3,"##/##/.#/.#"],[1,2,0,"##./.#./.#./.##"],[4,2,1,"#./#./##"],[7,2,2,".#./.#./.#./###"],[10,4,3,"#../##./.##"],[1,2,0,"#.#/###"],[2,3,1,".#/.#/##/#."],[7,6,3,".##/##."],[8,6,3,".##/.##/##."]];
const N = 9, END = 53, LEATHER = 34;
const INCOME = [5, 11, 17, 23, 29, 35, 41, 47, 53];
const LEATHERS = [20, 26, 32, 44, 50];

/* Todas las orientaciones distintas (girar y dar la vuelta) de una forma */
function orients(cells) {
  const out = [], seen = new Set();
  let cur = cells;
  for (let f = 0; f < 2; f++) {
    for (let r = 0; r < 4; r++) {
      const mr = Math.min(...cur.map(c => c[0])), mc = Math.min(...cur.map(c => c[1]));
      const norm = cur.map(c => [c[0] - mr, c[1] - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const key = norm.map(c => c.join(",")).join(";");
      if (!seen.has(key)) { seen.add(key); out.push({ c: norm, h: Math.max(...norm.map(c => c[0])) + 1, w: Math.max(...norm.map(c => c[1])) + 1 }); }
      cur = cur.map(c => [c[1], -c[0]]);
    }
    cur = cur.map(c => [c[0], -c[1]]);
  }
  return out;
}
const PATCHES = [null];
RAW.forEach((r, i) => {
  const cells = [];
  r[3].split("/").forEach((row, y) => row.split("").forEach((ch, x) => { if (ch === "#") cells.push([y, x]); }));
  PATCHES.push({ id: i + 1, cost: r[0], time: r[1], btn: r[2], n: cells.length, cells, or: orients(cells) });
});
PATCHES[LEATHER] = { id: LEATHER, cost: 0, time: 0, btn: 0, n: 1, cells: [[0, 0]], or: [{ c: [[0, 0]], h: 1, w: 1 }] };

/* Índice de orientación tras girar rot veces y voltear (flip) la forma original */
function orientOf(id, rot, flip) {
  let cur = PATCHES[id].cells;
  if (flip) cur = cur.map(c => [c[0], -c[1]]);
  for (let r = 0; r < rot; r++) cur = cur.map(c => [c[1], -c[0]]);
  const mr = Math.min(...cur.map(c => c[0])), mc = Math.min(...cur.map(c => c[1]));
  const key = cur.map(c => [c[0] - mr, c[1] - mc]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(c => c.join(",")).join(";");
  return Math.max(0, PATCHES[id].or.findIndex(O => O.c.map(c => c.join(",")).join(";") === key));
}
/* Casillas de un retal colocado con orientación o y esquina (r, c); null si se sale */
function cellsOf(id, o, r, c) {
  const O = PATCHES[id].or[o]; if (!O) return null;
  if (r < 0 || c < 0 || r + O.h > N || c + O.w > N) return null;
  return O.c.map(x => (r + x[0]) * N + c + x[1]);
}
/* Las casillas con botón dentro del retal, repartidas */
function btnCells(id, cells) {
  const b = PATCHES[id].btn, out = [];
  for (let i = 0; i < b; i++) out.push(cells[Math.floor((i + .5) * cells.length / b)]);
  return out;
}

/* ================= azar con semilla ================= */
function rnd(s) { let t = (s.r = (s.r + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function shuffle(s, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const mix = (a, b) => ((Math.imul(a ^ 0x9E3779B9, 2654435761) ^ b) >>> 0) % 2147483647;

/* ================= partida nueva ================= */
function newGame(seed, first) {
  const s = { v: 1, seed: seed >>> 0, r: seed >>> 0, first: first ? 1 : 0, turn: first ? 1 : 0, top: first ? 1 : 0, n: 0,
    circle: [], pos: [0, 0], btn: [5, 5], quilt: [[], []], leather: LEATHERS.slice(), bonus: null, endFirst: null,
    pend: null, over: null, last: null, hist: [], wins: [0, 0] };
  const ids = []; for (let i = 2; i <= 33; i++) ids.push(i);
  shuffle(s, ids);
  s.circle = ids.concat([1]);   // el dedal empieza justo detrás del retal pequeño (1×2): ese queda el último
  return s;
}
function rematch(s) {
  const loser = s.over ? 1 - s.over.win : s.first;
  const ns = newGame(mix(s.seed, 4242 + s.wins[0] + s.wins[1]), loser);
  ns.wins = s.wins.slice();
  return ns;
}

/* ================= consultas ================= */
const patch = id => PATCHES[id];
function grid(s, p) { const g = Array(N * N).fill(0); for (const q of s.quilt[p]) for (const i of q.c) g[i] = q.id; return g; }
function income(s, p) { let b = 0; for (const q of s.quilt[p]) b += PATCHES[q.id].btn; return b; }
function empty(s, p) { let e = N * N; for (const q of s.quilt[p]) e -= q.c.length; return e; }
function score(s, p) { return s.btn[p] - 2 * empty(s, p) + (s.bonus === p ? 7 : 0); }
const avail = s => s.circle.slice(0, 3);
const incomeLeft = pos => INCOME.filter(m => m > pos).length;
function fits(g, cells) { return !!cells && cells.every(i => !g[i]); }
function placements(g, id) {
  const out = [], P = PATCHES[id];
  P.or.forEach((O, o) => { for (let r = 0; r + O.h <= N; r++) for (let c = 0; c + O.w <= N; c++) { const cl = cellsOf(id, o, r, c); if (fits(g, cl)) out.push({ o, r, c, cells: cl }); } });
  return out;
}
function canPlaceAny(g, id) {
  const P = PATCHES[id];
  for (let o = 0; o < P.or.length; o++) { const O = P.or[o]; for (let r = 0; r + O.h <= N; r++) for (let c = 0; c + O.w <= N; c++) if (fits(g, cellsOf(id, o, r, c))) return true; }
  return false;
}
function has7(g) {
  for (let r = 0; r <= N - 7; r++) for (let c = 0; c <= N - 7; c++) {
    let ok = true;
    for (let y = 0; y < 7 && ok; y++) for (let x = 0; x < 7; x++) if (!g[(r + y) * N + c + x]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}
/* Por qué no puede comprar el retal k (o "" si puede) */
function buyWhy(s, p, k) {
  const id = s.circle[k]; if (!id || k > 2) return "Solo puedes elegir uno de los 3 retales que siguen al dedal.";
  const P = PATCHES[id];
  if (P.cost > s.btn[p]) return `Te faltan botones: cuesta ${P.cost} y tienes ${s.btn[p]}.`;
  if (!canPlaceAny(grid(s, p), id)) return "No cabe en ninguna parte de tu colcha.";
  return "";
}
function whoseTurn(s) {
  if (s.pos[0] !== s.pos[1]) return s.pos[0] < s.pos[1] ? 0 : 1;
  return s.top;
}
/* Cuántos botones daría avanzar ahora */
function advGain(s, p) { return Math.min(END, s.pos[1 - p] + 1) - s.pos[p]; }

/* ================= validar y aplicar ================= */
function check(s, p, a) {
  if (s.over) return "La partida ha terminado.";
  if (p !== s.turn) return "No es tu turno.";
  if (!a || !a.t) return "Jugada no válida.";
  if (s.pend) {
    if (a.t !== "leather") return "Primero coloca el retal de cuero.";
    const g = grid(s, p);
    if (!(a.i >= 0 && a.i < N * N) || g[a.i]) return "Ese hueco ya está ocupado.";
    return "";
  }
  if (a.t === "adv") return s.pos[p] >= END ? "Ya has llegado al final." : "";
  if (a.t === "buy") {
    const why = buyWhy(s, p, a.k); if (why) return why;
    const cl = cellsOf(s.circle[a.k], a.o, a.r, a.c);
    if (!cl) return "El retal se sale de la colcha.";
    if (!fits(grid(s, p), cl)) return "Se monta encima de otro retal.";
    return "";
  }
  return "Jugada no válida.";
}
function moveTime(s, p, to) {
  const from = s.pos[p]; to = Math.min(END, to);
  const ev = { inc: 0, leather: false };
  const inc = income(s, p);
  for (const m of INCOME) if (m > from && m <= to) { s.btn[p] += inc; ev.inc += inc; }
  for (const L of s.leather.slice()) if (L > from && L <= to) { s.leather = s.leather.filter(x => x !== L); ev.leather = true; }
  s.pos[p] = to;
  if (to === s.pos[1 - p]) s.top = p;           // al caer en la misma casilla, tu ficha va encima
  if (to === END && s.endFirst === null) s.endFirst = p;
  return ev;
}
function afterPlace(s, p) { if (s.bonus === null && has7(grid(s, p))) { s.bonus = p; return true; } return false; }
function finish(s) {
  if (s.pend) { s.turn = s.pend.p; return; }
  if (s.pos[0] >= END && s.pos[1] >= END) {
    const sc = [score(s, 0), score(s, 1)];
    const win = sc[0] !== sc[1] ? (sc[0] > sc[1] ? 0 : 1) : s.endFirst;
    s.over = { win, sc, tie: sc[0] === sc[1] };
    s.wins[win]++;
    return;
  }
  s.turn = whoseTurn(s);
}
function apply(s0, p, a) {
  const s = JSON.parse(JSON.stringify(s0));
  s.n++;
  const L = { n: s.n, p, t: a.t };
  if (a.t === "leather") {
    s.quilt[p].push({ id: LEATHER, c: [a.i] });
    s.pend = null;
    L.i = a.i; L.bonus = afterPlace(s, p);
  } else if (a.t === "adv") {
    const to = Math.min(END, s.pos[1 - p] + 1), d = to - s.pos[p];
    s.btn[p] += d; L.d = d;
    const ev = moveTime(s, p, to); L.inc = ev.inc; L.leather = ev.leather;
    if (ev.leather) { if (canPlaceAny(grid(s, p), LEATHER)) s.pend = { t: "leather", p }; else L.lost = true; }
  } else if (a.t === "buy") {
    const id = s.circle[a.k], P = PATCHES[id], cl = cellsOf(id, a.o, a.r, a.c);
    s.btn[p] -= P.cost;
    s.quilt[p].push({ id, c: cl });
    s.circle = s.circle.slice(a.k + 1).concat(s.circle.slice(0, a.k));
    L.id = id; L.k = a.k; L.bonus = afterPlace(s, p);
    const ev = moveTime(s, p, s.pos[p] + P.time); L.inc = ev.inc; L.leather = ev.leather;
    if (ev.leather) { if (canPlaceAny(grid(s, p), LEATHER)) s.pend = { t: "leather", p }; else L.lost = true; }
  }
  s.last = L; s.hist.push(L); if (s.hist.length > 80) s.hist.shift();
  finish(s);
  return s;
}

/* ================= textos ================= */
const plural = (n, a, b) => n === 1 ? `${n} ${a}` : `${n} ${b}`;
function describe(L, who, you) {
  if (!L) return "";
  let t = "";
  if (L.t === "adv") t = `${who} ${you ? "avanzas" : "avanza"} ${plural(L.d, "casilla", "casillas")} y ${you ? "cobras" : "cobra"} ${plural(L.d, "botón", "botones")}`;
  else if (L.t === "buy") { const P = PATCHES[L.id]; t = `${who} ${you ? "coses" : "cose"} un retal de ${P.n} huecos (${plural(P.cost, "botón", "botones")}, ${plural(P.time, "tiempo", "tiempos")})`; }
  else if (L.t === "leather") t = `${who} ${you ? "coses" : "cose"} el retal de cuero`;
  if (L.inc) t += `; ${you ? "cobras" : "cobra"} ${plural(L.inc, "botón", "botones")} de ${you ? "tu" : "su"} colcha`;
  if (L.leather) t += L.lost ? "; gana un retal de cuero pero no le cabe" : `; ${you ? "ganas" : "gana"} un retal de cuero`;
  if (L.bonus) t += `; ${you ? "completas" : "completa"} un cuadrado de 7×7 (+7)`;
  return t;
}

/* ================= máquina ================= */
/* Lo bien que queda una colcha: bordes expuestos, huecos sueltos que nadie podrá tapar y cuadrado 7×7 */
function shapeEval(g, lv) {
  let edges = 0;
  for (let i = 0; i < N * N; i++) if (!g[i]) {
    const r = Math.floor(i / N), c = i % N;
    if (r > 0 && g[i - N]) edges++; if (r < N - 1 && g[i + N]) edges++;
    if (c > 0 && g[i - 1]) edges++; if (c < N - 1 && g[i + 1]) edges++;
  }
  let v = -edges * (lv >= 3 ? .32 : .25);
  if (lv >= 3) {
    const seen = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) if (!g[i] && !seen[i]) {
      let sz = 0; const st = [i]; seen[i] = 1;
      while (st.length) { const j = st.pop(); sz++; const r = Math.floor(j / N), c = j % N;
        for (const k of [r > 0 ? j - N : -1, r < N - 1 ? j + N : -1, c > 0 ? j - 1 : -1, c < N - 1 ? j + 1 : -1]) if (k >= 0 && !g[k] && !seen[k]) { seen[k] = 1; st.push(k); } }
      if (sz <= 2) v -= sz * 1.6; else if (sz <= 4) v -= .6;
    }
    let best = 0;
    for (let r = 0; r <= 2; r++) for (let c = 0; c <= 2; c++) { let f = 0; for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (g[(r + y) * N + c + x]) f++; if (f > best) best = f; }
    v += best * .06;
  }
  return v;
}
function bestPlace(g, id, lv, rng) {
  const all = placements(g, id); if (!all.length) return null;
  if (lv === 1) { // aprendiz: arrimado a una esquina con algo de despiste
    let b = null, bv = -1e9;
    for (const pl of all) { const v = -(pl.r + pl.c) + rng() * 6; if (v > bv) { bv = v; b = pl; } }
    return { ...b, q: 0 };
  }
  let b = null, bv = -1e9;
  for (const pl of all) { for (const i of pl.cells) g[i] = id; const v = shapeEval(g, lv); for (const i of pl.cells) g[i] = 0; if (v > bv) { bv = v; b = pl; } }
  return { ...b, q: bv };
}
/* Valor en botones de comprar el retal k (sin contar la colocación) */
function buyValue(s, p, k, lv) {
  const P = PATCHES[s.circle[k]], from = s.pos[p], to = Math.min(END, from + P.time), spent = to - from;
  const left = 53 - from;
  let v = P.btn * incomeLeft(from) + 2 * P.n - P.cost - spent * (lv >= 3 ? (left < 12 ? .7 : 1) : 1);
  if (s.leather.some(L => L > from && L <= to)) v += 2.5;
  if (lv >= 3 && left < 10) v += P.n * .4; // al final, tapar huecos vale más que ahorrar tiempo
  return v;
}
/* Nivel 3: busca unas jugadas por delante (suyas y del rival) y valora la mesa resultante */
function standing(s, q) {
  const g = grid(s, q), left = END - s.pos[q];
  return s.btn[q] + income(s, q) * incomeLeft(s.pos[q]) - 2 * empty(s, q) + left * 1 + shapeEval(g, 3) + (s.bonus === q ? 7 : 0)
    + s.leather.filter(L => L > s.pos[q]).length * .3;
}
function moves(s, p) {
  if (s.pend) return [plan(s, p, 2)];
  const out = [{ t: "adv" }], g = grid(s, p);
  for (let k = 0; k < 3 && k < s.circle.length; k++) {
    if (buyWhy(s, p, k)) continue;
    const pl = bestPlace(g, s.circle[k], 3); if (pl) out.push({ t: "buy", k, o: pl.o, r: pl.r, c: pl.c });
  }
  return out;
}
function search(s, me, depth) {
  if (s.over || depth === 0) return s.over ? (s.over.win === me ? 1000 : -1000) + s.over.sc[me] - s.over.sc[1 - me] : standing(s, me) - standing(s, 1 - me);
  const p = s.turn, ms = moves(s, p);
  let best = p === me ? -1e9 : 1e9;
  for (const a of ms) { const v = search(apply(s, p, a), me, depth - 1); if (p === me ? v > best : v < best) best = v; }
  return best;
}
function plan(s, p, lv, rng) {
  if (lv >= 3 && !s.pend) {
    let best = null, bv = -1e9;
    for (const a of moves(s, p)) { const v = search(apply(s, p, a), p, 3); if (v > bv) { bv = v; best = a; } }
    return best;
  }
  rng = rng || Math.random;
  if (s.pend) {
    const g = grid(s, p), pl = bestPlace(g, LEATHER, lv === 1 ? 2 : lv, rng);
    return { t: "leather", i: pl.cells[0] };
  }
  const g = grid(s, p), opts = [];
  const advTo = Math.min(END, s.pos[1 - p] + 1);
  const advLeather = s.leather.some(L => L > s.pos[p] && L <= advTo);
  opts.push({ a: { t: "adv" }, v: (advLeather ? 2.5 : 0) + (lv >= 3 && s.pos[1 - p] >= END ? .5 : 0) });
  for (let k = 0; k < 3 && k < s.circle.length; k++) {
    if (buyWhy(s, p, k)) continue;
    const id = s.circle[k], pl = bestPlace(g, id, lv, rng); if (!pl) continue;
    for (const i of pl.cells) g[i] = id; const q = lv === 1 ? 0 : shapeEval(g, lv); for (const i of pl.cells) g[i] = 0;
    const base = lv === 1 ? 0 : shapeEval(g, lv);
    let v = buyValue(s, p, k, lv) + (q - base);
    if (lv >= 3) {
      // lo que le dejo a mi rival si le toca justo después
      const ns = apply(s, p, { t: "buy", k, o: pl.o, r: pl.r, c: pl.c });
      if (!ns.over && ns.turn !== p) { let ob = 0; for (let j = 0; j < 3 && j < ns.circle.length; j++) if (!buyWhy(ns, 1 - p, j)) ob = Math.max(ob, buyValue(ns, 1 - p, j, 3)); v -= ob * .35; }
      if (has7(grid(ns, p)) && s.bonus === null) v += 7;
    }
    opts.push({ a: { t: "buy", k, o: pl.o, r: pl.r, c: pl.c }, v });
  }
  if (lv >= 3) {
    const ns = apply(s, p, { t: "adv" });
    if (!ns.over && ns.turn !== p) { let ob = 0; for (let j = 0; j < 3 && j < ns.circle.length; j++) if (!buyWhy(ns, 1 - p, j)) ob = Math.max(ob, buyValue(ns, 1 - p, j, 3)); opts[0].v -= ob * .35; }
  }
  if (lv === 1) opts.forEach(o => o.v += rng() * 6 - 1);
  opts.sort((x, y) => y.v - x.v);
  return opts[0].a;
}

const api = { PATCHES, N, END, LEATHER, INCOME, LEATHERS, newGame, rematch, check, apply, describe, patch, grid, income, empty, score,
  avail, incomeLeft, orientOf, cellsOf, btnCells, placements, canPlaceAny, buyWhy, advGain, whoseTurn, has7, plan, mix };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Retales = api;
})(typeof window !== "undefined" ? window : globalThis);
