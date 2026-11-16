/* Clave Mecánica: motor de reglas.
   Código secreto de 3 cifras (engranaje, rayo y estrella) del 1 al 5. Cada sensor comprueba una regla oculta de su panel.
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

/* ---------- paneles de reglas de los sensores ---------- */
const SH = ["{A}", "{B}", "{C}"];
const cnt = (d, n) => d.filter(x => x === n).length;
const sum = d => d[0] + d[1] + d[2];
const each = (fmt, f) => [0, 1, 2].map(i => [fmt(SH[i]), d => f(d[i], d, i)]);

const FAMS = [];
const fam = (title, rules, lvl) => FAMS.push({ id: FAMS.length + 1, title, rules: rules.map(r => r[0]), fns: rules.map(r => r[1]), lvl });
const PRIME = x => x === 2 || x === 3 || x === 5;
const PAIRS = [[0, 1], [1, 2], [0, 2]];
const mx = d => Math.max(...d), mn = d => Math.min(...d);
const has = (d, n) => d.includes(n);
// Banco de sensores propio de Clave Mecánica.
// lvl 1: opciones excluyentes. 2: opciones que se solapan («¿cuál…?»). 3: paneles largos.
fam("Zona del {A}", [["{A} es 1 o 2", d => d[0] <= 2], ["{A} es 3 o 4", d => d[0] === 3 || d[0] === 4], ["{A} es 5", d => d[0] === 5]], 1);
fam("Zona del {B}", [["{B} es 1", d => d[1] === 1], ["{B} es 2 o 3", d => d[1] === 2 || d[1] === 3], ["{B} es 4 o 5", d => d[1] >= 4]], 1);
fam("Zona del {C}", [["{C} es 1, 2 o 3", d => d[2] <= 3], ["{C} es 4", d => d[2] === 4], ["{C} es 5", d => d[2] === 5]], 1);
[0, 1, 2].forEach(i => fam(`¿El ${SH[i]} es primo?`, [[`${SH[i]} es primo (2, 3 o 5)`, d => PRIME(d[i])], [`${SH[i]} no es primo (1 o 4)`, d => !PRIME(d[i])]], 1));
PAIRS.forEach(([i, j]) => fam(`Distancia entre ${SH[i]} y ${SH[j]}`, [[`${SH[i]} y ${SH[j]} iguales`, d => d[i] === d[j]], [`Se llevan 1`, d => Math.abs(d[i] - d[j]) === 1], [`Se llevan 2 o más`, d => Math.abs(d[i] - d[j]) >= 2]], 1));
fam("El {B} frente a sus vecinos", [["{B} es pico: mayor que {A} y que {C}", d => d[1] > d[0] && d[1] > d[2]], ["{B} es valle: menor que {A} y que {C}", d => d[1] < d[0] && d[1] < d[2]], ["Ni pico ni valle", d => !(d[1] > d[0] && d[1] > d[2]) && !(d[1] < d[0] && d[1] < d[2])]], 1);
fam("Peso total", [["La suma va de 3 a 6", d => sum(d) <= 6], ["La suma va de 7 a 9", d => sum(d) >= 7 && sum(d) <= 9], ["La suma es 10 o más", d => sum(d) >= 10]], 1);
fam("La suma dividida entre 3", [["Resto 0 (múltiplo de 3)", d => sum(d) % 3 === 0], ["Resto 1", d => sum(d) % 3 === 1], ["Resto 2", d => sum(d) % 3 === 2]], 1);
fam("La cifra más alta del código", [["Ninguna pasa de 3", d => mx(d) <= 3], ["La más alta es un 4", d => mx(d) === 4], ["Hay algún 5", d => mx(d) === 5]], 1);
fam("La cifra más baja del código", [["Hay algún 1", d => mn(d) === 1], ["La más baja es un 2", d => mn(d) === 2], ["Todas son 3 o más", d => mn(d) >= 3]], 1);
fam("Separación: la más alta menos la más baja", [["Separación 0 o 1", d => mx(d) - mn(d) <= 1], ["Separación 2", d => mx(d) - mn(d) === 2], ["Separación 3 o 4", d => mx(d) - mn(d) >= 3]], 1);
fam("Cuántos 2 lleva", [["Ningún 2", d => cnt(d, 2) === 0], ["Un solo 2", d => cnt(d, 2) === 1], ["Dos o tres 2", d => cnt(d, 2) >= 2]], 1);
fam("Cuántos 5 lleva", [["Ningún 5", d => cnt(d, 5) === 0], ["Un solo 5", d => cnt(d, 5) === 1], ["Dos o tres 5", d => cnt(d, 5) >= 2]], 1);
fam("Cuántas cifras primas", [["Como mucho una prima", d => d.filter(PRIME).length <= 1], ["Justo dos primas", d => d.filter(PRIME).length === 2], ["Las tres primas", d => d.filter(PRIME).length === 3]], 1);
fam("Los extremos contra el centro", [["{A} + {C} es menor que {B}", d => d[0] + d[2] < d[1]], ["{A} + {C} es igual que {B}", d => d[0] + d[2] === d[1]], ["{A} + {C} es mayor que {B}", d => d[0] + d[2] > d[1]]], 1);
fam("Multiplicando las tres", [["El producto es par", d => (d[0] * d[1] * d[2]) % 2 === 0], ["El producto es impar", d => (d[0] * d[1] * d[2]) % 2 === 1]], 1);
fam("{A} + {B}", [["{A} + {B} es 5 o menos", d => d[0] + d[1] <= 5], ["{A} + {B} es 6 o 7", d => d[0] + d[1] === 6 || d[0] + d[1] === 7], ["{A} + {B} es 8 o más", d => d[0] + d[1] >= 8]], 1);
fam("{B} + {C}, par o impar", [["{B} + {C} es par", d => (d[1] + d[2]) % 2 === 0], ["{B} + {C} es impar", d => (d[1] + d[2]) % 2 === 1]], 1);
fam("¿Dónde hay un 5?", each(s => `${s} es 5`, x => x === 5), 2);
fam("¿Dónde hay un 2?", each(s => `${s} es 2`, x => x === 2), 2);
fam("¿Qué cifra es prima?", each(s => `${s} es primo`, x => PRIME(x)), 2);
fam("¿Qué cifra es alta?", each(s => `${s} es 4 o 5`, x => x >= 4), 2);
fam("¿Qué cifra está en un extremo?", each(s => `${s} es 1 o 5`, x => x === 1 || x === 5), 2);
fam("¿Qué pareja suma 7?", PAIRS.map(([i, j]) => [`${SH[i]} + ${SH[j]} = 7`, d => d[i] + d[j] === 7]), 2);
fam("¿Qué pareja suma 5?", PAIRS.map(([i, j]) => [`${SH[i]} + ${SH[j]} = 5`, d => d[i] + d[j] === 5]), 2);
fam("¿Qué pareja es gemela?", PAIRS.map(([i, j]) => [`${SH[i]} = ${SH[j]}`, d => d[i] === d[j]]), 2);
fam("¿Qué pareja va seguida?", PAIRS.map(([i, j]) => [`${SH[i]} y ${SH[j]} se llevan 1`, d => Math.abs(d[i] - d[j]) === 1]), 2);
fam("Rasgos de la suma", [["La suma es menor que 8", d => sum(d) < 8], ["La suma es par", d => sum(d) % 2 === 0], ["La suma es mayor que 10", d => sum(d) > 10]], 2);
fam("Rasgos del código", [["Lleva algún 1", d => has(d, 1)], ["Lleva algún 3", d => has(d, 3)], ["Lleva algún 4", d => has(d, 4)]], 2);
fam("Zona de una cifra", [0, 1, 2].flatMap(i => [[`${SH[i]} es 1 o 2`, d => d[i] <= 2], [`${SH[i]} es 3 o 4`, d => d[i] === 3 || d[i] === 4], [`${SH[i]} es 5`, d => d[i] === 5]]), 3);
fam("Distancia en una pareja", PAIRS.flatMap(([i, j]) => [[`${SH[i]} = ${SH[j]}`, d => d[i] === d[j]], [`${SH[i]} y ${SH[j]} se llevan 1`, d => Math.abs(d[i] - d[j]) === 1], [`${SH[i]} y ${SH[j]} se llevan 2+`, d => Math.abs(d[i] - d[j]) >= 2]]), 3);
fam("Una cifra, prima o no", [0, 1, 2].flatMap(i => [[`${SH[i]} es primo`, d => PRIME(d[i])], [`${SH[i]} no es primo`, d => !PRIME(d[i])]]), 3);

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
const VER = 2; // banco de sensores 2 (los retos de la versión 1 ya no se pueden reconstruir)
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
    return { v: VER, seed, level: L.lvl, fams, rules: pick.rules, sol: str(CODES[pick.sol]) };
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

const api = { VER, FAMS, LEVELS, CODES, rng, mix, str, parse, valid, generate, combosOf, check, consistent, hint, newPlayer, round, testsIn, isOut, isRight, result, canPlay, revealed, aiPlay, aiState };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Clave = api;
})(typeof window !== "undefined" ? window : globalThis);
