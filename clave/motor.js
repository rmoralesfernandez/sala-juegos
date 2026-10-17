/* Clave Mecánica: motor de reglas (estilo Turing Machine).
   Código secreto de 3 cifras (▲ ■ ●) del 1 al 5. Cada verificador comprueba una regla oculta de su tarjeta.
   Las reglas elegidas dejan un único código y ninguna sobra. Sin dependencias: sirve en navegador y en node. */
(function (root) {
"use strict";

/* ---------- azar con semilla ---------- */
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mix = (a, b) => { let h = (a ^ Math.imul(b + 0x9E3779B9, 0x85EBCA6B)) >>> 0; h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
const shuffle = (arr, r) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- códigos ---------- */
const CODES = [];
for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) for (let c = 1; c <= 5; c++) CODES.push([a, b, c]);
const idx = d => (d[0] - 1) * 25 + (d[1] - 1) * 5 + (d[2] - 1);
const str = d => d.join("");
const parse = s => String(s).split("").map(Number);
const valid = s => /^[1-5]{3}$/.test(String(s));

/* ---------- tarjetas de criterio ---------- */
const SH = ["{A}", "{B}", "{C}"];
const cnt = (d, n) => d.filter(x => x === n).length;
const sum = d => d[0] + d[1] + d[2];
const cmp3 = (x, y) => x < y ? 0 : x === y ? 1 : 2;
const cmpRules = (lab, f, n) => [[`${lab} < ${n}`, d => f(d) < n], [`${lab} = ${n}`, d => f(d) === n], [`${lab} > ${n}`, d => f(d) > n]];
const parity = (lab, f) => [[`${lab} es par`, d => f(d) % 2 === 0], [`${lab} es impar`, d => f(d) % 2 === 1]];
const pairCmp = (i, j) => [[`${SH[i]} < ${SH[j]}`, d => d[i] < d[j]], [`${SH[i]} = ${SH[j]}`, d => d[i] === d[j]], [`${SH[i]} > ${SH[j]}`, d => d[i] > d[j]]];
const count = (n) => [[`Ningún ${n}`, d => cnt(d, n) === 0], [`Un ${n}`, d => cnt(d, n) === 1], [`Dos ${n}`, d => cnt(d, n) === 2], [`Tres ${n}`, d => cnt(d, n) === 3]];
const each = (fmt, f) => [0, 1, 2].map(i => [fmt(SH[i]), d => f(d[i], d, i)]);
const run = (d, dir) => (d[1] - d[0] === dir ? 1 : 0) + (d[2] - d[1] === dir ? 1 : 0);

const FAMS = [];
const fam = (title, rules, lvl) => FAMS.push({ id: FAMS.length + 1, title, rules: rules.map(r => r[0]), fns: rules.map(r => r[1]), lvl });
// lvl 1: tarjetas sencillas (opciones excluyentes). 2: opciones que se solapan. 3: tarjetas largas.
fam("{A} comparado con 1", [["{A} = 1", d => d[0] === 1], ["{A} > 1", d => d[0] > 1]], 1);
fam("{A} comparado con 3", cmpRules("{A}", d => d[0], 3), 1);
fam("{B} comparado con 3", cmpRules("{B}", d => d[1], 3), 1);
fam("{B} comparado con 4", cmpRules("{B}", d => d[1], 4), 1);
fam("{C} comparado con 3", cmpRules("{C}", d => d[2], 3), 1);
fam("{C} comparado con 4", cmpRules("{C}", d => d[2], 4), 1);
fam("{A} par o impar", parity("{A}", d => d[0]), 1);
fam("{B} par o impar", parity("{B}", d => d[1]), 1);
fam("{C} par o impar", parity("{C}", d => d[2]), 1);
fam("Cuántos 1 hay", count(1), 1);
fam("Cuántos 3 hay", count(3), 1);
fam("Cuántos 4 hay", count(4), 1);
fam("{A} comparado con {B}", pairCmp(0, 1), 1);
fam("{A} comparado con {C}", pairCmp(0, 2), 1);
fam("{B} comparado con {C}", pairCmp(1, 2), 1);
fam("Cifras pares contra impares", [["Hay más pares que impares", d => d.filter(x => x % 2 === 0).length >= 2], ["Hay más impares que pares", d => d.filter(x => x % 2 === 1).length >= 2]], 1);
fam("Cuántas cifras pares hay", [0, 1, 2, 3].map(n => [n === 0 ? "Ninguna par" : n === 1 ? "Una par" : n === 2 ? "Dos pares" : "Tres pares", d => d.filter(x => x % 2 === 0).length === n]), 1);
fam("La suma de las tres", parity("La suma", sum), 1);
fam("{A} + {B} comparado con 6", cmpRules("{A} + {B}", d => d[0] + d[1], 6), 1);
fam("La suma comparada con 6", cmpRules("La suma", sum, 6), 1);
fam("Repeticiones", [["Una cifra sale 3 veces", d => d[0] === d[1] && d[1] === d[2]], ["Una cifra sale 2 veces", d => new Set(d).size === 2], ["Ninguna se repite", d => new Set(d).size === 3]], 1);
fam("¿Hay pareja?", [["Hay pareja (dos iguales, no tres)", d => new Set(d).size === 2], ["No hay pareja", d => new Set(d).size !== 2]], 1);
fam("Orden de las cifras", [["Crecientes: {A} < {B} < {C}", d => d[0] < d[1] && d[1] < d[2]], ["Decrecientes: {A} > {B} > {C}", d => d[0] > d[1] && d[1] > d[2]], ["Ni crecientes ni decrecientes", d => !(d[0] < d[1] && d[1] < d[2]) && !(d[0] > d[1] && d[1] > d[2])]], 1);
fam("Escalera hacia arriba (como 3 4 5)", [["3 cifras seguidas subiendo", d => run(d, 1) === 2], ["2 cifras seguidas subiendo", d => run(d, 1) === 1], ["Ninguna seguida subiendo", d => run(d, 1) === 0]], 1);
fam("Escalera en cualquier sentido", [["3 seguidas (subiendo o bajando)", d => run(d, 1) === 2 || run(d, -1) === 2], ["2 seguidas, no 3", d => run(d, 1) < 2 && run(d, -1) < 2 && (Math.abs(d[1] - d[0]) === 1 || Math.abs(d[2] - d[1]) === 1)], ["Ninguna seguida", d => Math.abs(d[1] - d[0]) !== 1 && Math.abs(d[2] - d[1]) !== 1]], 1);
fam("La suma, ¿múltiplo de…?", [["Múltiplo de 3", d => sum(d) % 3 === 0], ["Múltiplo de 4", d => sum(d) % 4 === 0], ["Múltiplo de 5", d => sum(d) % 5 === 0]], 2);
fam("La cifra más pequeña", each(s => `${s} es la más pequeña`, (x, d, i) => d.every((y, j) => j === i || x < y)), 2);
fam("La cifra más grande", each(s => `${s} es la más grande`, (x, d, i) => d.every((y, j) => j === i || x > y)), 2);
fam("Pequeña o empatada", each(s => `${s} ≤ las otras dos`, (x, d) => x === Math.min(...d)), 2);
fam("Grande o empatada", each(s => `${s} ≥ las otras dos`, (x, d) => x === Math.max(...d)), 2);
fam("Alguna cifra menor que 3", each(s => `${s} < 3`, x => x < 3), 2);
fam("Alguna cifra menor que 4", each(s => `${s} < 4`, x => x < 4), 2);
fam("Alguna cifra igual a 1", each(s => `${s} = 1`, x => x === 1), 2);
fam("Alguna cifra igual a 3", each(s => `${s} = 3`, x => x === 3), 2);
fam("Alguna cifra igual a 4", each(s => `${s} = 4`, x => x === 4), 2);
fam("Alguna cifra mayor que 1", each(s => `${s} > 1`, x => x > 1), 2);
fam("Alguna cifra mayor que 3", each(s => `${s} > 3`, x => x > 3), 2);
fam("Dos cifras que suman 4", [[0, 1], [0, 2], [1, 2]].map(([i, j]) => [`${SH[i]} + ${SH[j]} = 4`, d => d[i] + d[j] === 4]), 2);
fam("Dos cifras que suman 6", [[0, 1], [0, 2], [1, 2]].map(([i, j]) => [`${SH[i]} + ${SH[j]} = 6`, d => d[i] + d[j] === 6]), 2);
fam("Una cifra, par o impar", [0, 1, 2].flatMap(i => parity(SH[i], d => d[i])), 2);
fam("{A} comparado con las otras", [...pairCmp(0, 1), ...pairCmp(0, 2)], 2);
fam("{B} comparado con las otras", [...pairCmp(1, 0), ...pairCmp(1, 2)], 2);
fam("Cuántos 1 o cuántos 3", [...count(1).slice(0, 3), ...count(3).slice(0, 3)], 2);
fam("Cuántos 3 o cuántos 4", [...count(3).slice(0, 3), ...count(4).slice(0, 3)], 2);
fam("Cuántos 1 o cuántos 4", [...count(1).slice(0, 3), ...count(4).slice(0, 3)], 2);
fam("Una cifra comparada con 3", [0, 1, 2].flatMap(i => cmpRules(SH[i], d => d[i], 3)), 3);
fam("Una cifra comparada con 4", [0, 1, 2].flatMap(i => cmpRules(SH[i], d => d[i], 4)), 3);
fam("Dos cifras comparadas", [...pairCmp(0, 1), ...pairCmp(0, 2), ...pairCmp(1, 2)], 3);

/* máscaras de 125 bits (4 enteros) */
const MASK = FAMS.map(f => f.fns.map(fn => { const m = [0, 0, 0, 0]; CODES.forEach((d, i) => { if (fn(d)) m[i >> 5] |= 1 << (i & 31); }); return m; }));
const and = (x, y) => [x[0] & y[0], x[1] & y[1], x[2] & y[2], x[3] & y[3]];
const pop32 = n => { n = n - ((n >>> 1) & 0x55555555); n = (n & 0x33333333) + ((n >>> 2) & 0x33333333); return (((n + (n >>> 4)) & 0xF0F0F0F) * 0x1010101) >>> 24; };
const pop = m => pop32(m[0]) + pop32(m[1]) + pop32(m[2]) + pop32(m[3]);
const first = m => { for (let k = 0; k < 4; k++) if (m[k]) return k * 32 + (31 - Math.clz32(m[k] & -m[k])); return -1; };
const FULL = (() => { const m = [0, 0, 0, 0]; for (let i = 0; i < 125; i++) m[i >> 5] |= 1 << (i & 31); return m; })();

/* Todas las combinaciones de reglas (una por tarjeta) que dan un único código sin que sobre ninguna. */
function validCombos(fams, loose) {
  const n = fams.length, M = fams.map(id => MASK[id - 1]), out = [], pick = new Array(n);
  const go = (i, acc) => {
    if (i === n) {
      if (pop(acc) !== 1) return;
      if (!loose) for (let k = 0; k < n; k++) { let m = FULL; for (let j = 0; j < n; j++) if (j !== k) m = and(m, M[j][pick[j]]); if (pop(m) === 1) return; }
      out.push({ rules: pick.slice(), sol: first(acc) });
      return;
    }
    for (let r = 0; r < M[i].length; r++) { const nx = and(acc, M[i][r]); if (!pop(nx)) continue; pick[i] = r; go(i + 1, nx); }
  };
  go(0, FULL);
  return out;
}
const comboCache = new Map();
function combosOf(pz) { const k = pz.fams.join(","); if (!comboCache.has(k)) comboCache.set(k, validCombos(pz.fams)); return comboCache.get(k); }

/* ---------- generador de retos ---------- */
const LEVELS = { 1: { nv: 4, lvl: 1, name: "Fácil" }, 2: { nv: 5, lvl: 2, name: "Normal" }, 3: { nv: 6, lvl: 3, name: "Difícil" } };
function generate(seed, level) {
  const L = LEVELS[level] || LEVELS[2], r = rng(seed), pool = FAMS.filter(f => f.lvl <= L.lvl).map(f => f.id);
  for (let tries = 0; tries < 400; tries++) {
    let fams = shuffle(pool, r).slice(0, L.nv);
    // en normal y difícil, al menos una tarjeta sencilla y no más de dos largas
    if (L.lvl >= 2 && !fams.some(id => FAMS[id - 1].lvl === 1)) continue;
    if (fams.filter(id => FAMS[id - 1].lvl === 3).length > 2) continue;
    fams = fams.sort((a, b) => a - b);
    const all = validCombos(fams);
    if (!all.length) continue;
    // que no salga casi resuelto: al menos 6 códigos candidatos al principio
    if (new Set(all.map(c => c.sol)).size < (L.lvl === 1 ? 4 : 6)) continue;
    comboCache.set(fams.join(","), all);
    const pick = all[Math.floor(r() * all.length)];
    return { seed, level: L.lvl, fams, rules: pick.rules, sol: str(CODES[pick.sol]) };
  }
  return generate(mix(seed, 99), level);
}

/* ---------- jugar ---------- */
const check = (pz, code, v) => !!FAMS[pz.fams[v] - 1].fns[pz.rules[v]](parse(code));
function consistent(pz, tests) {
  const all = combosOf(pz);
  const ok = all.filter(c => tests.every(t => FAMS[pz.fams[t.v] - 1].fns[c.rules[t.v]](parse(t.c)) === !!t.ok));
  const sols = [...new Set(ok.map(c => c.sol))].map(i => str(CODES[i]));
  return { combos: ok, sols };
}
/* Pista: una regla imposible que el jugador aún no ha tachado; si no queda, una cifra imposible. */
function hint(pz, tests, struck) {
  const { combos, sols } = consistent(pz, tests);
  if (sols.length === 1) return { t: "solved", sols: 1 };
  const order = shuffle(pz.fams.map((_, v) => v), rng(mix(pz.seed, tests.length * 31 + Object.keys(struck || {}).length)));
  for (const v of order) {
    const live = new Set(combos.map(c => c.rules[v]));
    for (let r = 0; r < FAMS[pz.fams[v] - 1].rules.length; r++) if (!live.has(r) && !(struck && struck["r" + v + "-" + r])) return { t: "rule", v, r, sols: sols.length };
  }
  for (let s = 0; s < 3; s++) for (let n = 1; n <= 5; n++) if (!sols.some(c => +c[s] === n) && !(struck && struck["d" + s + "-" + n])) return { t: "digit", s, n, sols: sols.length };
  return { t: "none", sols: sols.length };
}

/* ---------- partida: rondas simultáneas ----------
   Jugador P = { end: rondas terminadas, tests: [{r, c, v, ok}], g: {r, c} | null, hints, miss }
   Ronda actual = end + 1. Se puede jugar si no vas por delante de un rival que sigue vivo. */
const newPlayer = () => ({ end: 0, tests: [], g: null, hints: 0, miss: 0 });
const round = P => P.end + 1;
const testsIn = (P, r) => P.tests.filter(t => t.r === r);
const isOut = (pz, P) => !!(P && P.g && P.g.c !== pz.sol);
const isRight = (pz, P) => !!(P && P.g && P.g.c === pz.sol);
function result(pz, ps, solo) {
  const live = ps.map((P, i) => i).filter(i => ps[i]);
  if (solo) return isRight(pz, ps[0]) ? { over: true, winners: [0], r: ps[0].g.r } : { over: false };
  const right = live.filter(i => isRight(pz, ps[i]));
  if (right.length) {
    const R = Math.min(...right.map(i => ps[i].g.r));
    const settled = live.every(i => (ps[i].g && ps[i].g.r <= R) || ps[i].end >= R);
    if (settled) {
      const at = right.filter(i => ps[i].g.r === R), best = Math.min(...at.map(i => ps[i].tests.length));
      return { over: true, winners: at.filter(i => ps[i].tests.length === best), r: R };
    }
    return { over: false };
  }
  if (live.every(i => isOut(pz, ps[i]))) return { over: true, winners: [], r: Math.max(...live.map(i => ps[i].g.r)) };
  return { over: false };
}
/* ¿Puede jugar i? Solo si no está fuera y ningún rival vivo va por detrás. Las fallas se ven cuando el rival cierra esa ronda. */
function canPlay(pz, ps, i, solo) {
  const P = ps[i];
  if (!P || result(pz, ps, solo).over) return false;
  if (!solo && P.g) return false;
  return ps.every((Q, j) => j === i || !Q || (Q.g && !isRight(pz, Q) && revealed(ps, j)) || Q.end >= P.end);
}
/* La apuesta de j se descubre cuando todos los demás han cerrado esa ronda. */
function revealed(ps, j) { const Q = ps[j]; return !!Q.g && ps.every((O, k) => k === j || !O || O.end >= Q.g.r || (O.g && O.g.r < Q.g.r)); }

/* ---------- la máquina ----------
   Nivel 1: razona cada verificador por separado. Nivel 2: además sabe que el código es único.
   Nivel 3: también sabe que ningún verificador sobra (como un experto). */
function naiveCombos(pz) {
  // todas las combinaciones posibles, sin exigir nada; se recortan con las pruebas
  const n = pz.fams.length, out = [], pick = new Array(n), M = pz.fams.map(id => MASK[id - 1]);
  const go = (i, acc) => {
    if (i === n) { let m = acc; for (let x = first(m); x >= 0; x = first(m)) { out.push({ rules: pick.slice(), sol: x }); m = m.slice(); m[x >> 5] &= ~(1 << (x & 31)); } return; }
    for (let r = 0; r < M[i].length; r++) { const nx = and(acc, M[i][r]); if (!pop(nx)) continue; pick[i] = r; go(i + 1, nx); }
  };
  go(0, FULL);
  return out;
}
function aiPlay(pz, level, seed) {
  const r = rng(seed), nv = pz.fams.length, fns = pz.fams.map(id => FAMS[id - 1].fns);
  let combos = level >= 3 ? combosOf(pz).slice() : level === 2 ? validCombos(pz.fams, true) : naiveCombos(pz);
  const tests = [], rounds = [];
  const solsOf = cs => new Set(cs.map(c => c.sol)).size;
  // valor de una prueba: soluciones distintas que quedarían, ponderadas por probabilidad
  const score = (cs, d, v) => {
    const a = new Set(), b = new Set(); let na = 0;
    for (const c of cs) { if (fns[v][c.rules[v]](d)) { na++; a.add(c.sol); } else b.add(c.sol); }
    if (!na || na === cs.length) return Infinity;
    return (na * a.size + (cs.length - na) * b.size) / cs.length;
  };
  for (let rd = 1; rd <= 30; rd++) {
    if (solsOf(combos) === 1) { rounds.push([]); break; }
    let d, used = [];
    const cand = level >= 3 ? CODES : level === 2 ? shuffle(CODES, r).slice(0, 30) : null;
    const pickV = () => {
      const free = [...Array(nv).keys()].filter(v => !used.includes(v));
      if (level === 1) { const f = free.filter(v => score(combos, d, v) < Infinity); return f.length ? f[Math.floor(r() * f.length)] : -1; }
      let best = -1, bs = Infinity;
      for (const v of shuffle(free, r)) { const s = score(combos, d, v); if (s < bs) { bs = s; best = v; } }
      return best;
    };
    if (level === 1) { const sols = [...new Set(combos.map(c => c.sol))]; d = CODES[sols[Math.floor(r() * sols.length)]]; }
    else {
      let bs = Infinity;
      for (const x of cand) for (let v = 0; v < nv; v++) { const s = score(combos, x, v); if (s < bs) { bs = s; d = x; } }
      if (!d) d = CODES[combos[0].sol];
    }
    const rt = [];
    while (rt.length < (level === 1 ? 2 : 3) && solsOf(combos) > 1) {
      const v = pickV(); if (v < 0) break;
      used.push(v);
      const ok = check(pz, str(d), v);
      combos = combos.filter(c => fns[v][c.rules[v]](d) === ok);
      const t = { r: rd, c: str(d), v, ok: ok ? 1 : 0 };
      rt.push(t); tests.push(t);
    }
    rounds.push(rt);
    if (solsOf(combos) === 1) break;
  }
  const code = str(CODES[combos[0].sol]);
  return { rounds, tests, guessRound: rounds.length, code };
}
/* Estado de la máquina cuando el humano ha terminado `humanEnd` rondas: juega su ronda por adelantado. */
function aiState(trace, humanEnd) {
  const end = Math.min(humanEnd + 1, trace.guessRound);
  return { end, tests: trace.tests.filter(t => t.r <= end), g: end >= trace.guessRound ? { r: trace.guessRound, c: trace.code } : null, hints: 0, miss: 0 };
}

const api = { FAMS, LEVELS, CODES, rng, mix, str, parse, valid, generate, combosOf, check, consistent, hint, newPlayer, round, testsIn, isOut, isRight, result, canPlay, revealed, aiPlay, aiState };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Clave = api;
})(typeof window !== "undefined" ? window : globalThis);
