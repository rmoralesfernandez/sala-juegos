/* Mercaderes: motor de reglas (estilo Jaipur, 2 jugadores) y jugador automático.
   Funciona en el navegador (window.Bazar) y en Node (module.exports). */
(function (root) {
"use strict";

const GOODS = ["D", "O", "P", "T", "E", "C"];          // diamantes, oro, plata, telas, especias, cuero
const CAMEL = "K";
const PRECIOUS = { D: 1, O: 1, P: 1 };                  // se venden de 2 en 2 como mínimo
const COUNT = { D: 6, O: 6, P: 6, T: 8, E: 8, C: 10, K: 11 };
const TOKENS = {
  D: [7, 7, 5, 5, 5], O: [6, 6, 5, 5, 5], P: [5, 5, 5, 5, 5],
  T: [5, 3, 3, 2, 2, 1, 1], E: [5, 3, 3, 2, 2, 1, 1], C: [4, 3, 2, 1, 1, 1, 1, 1, 1]
};
const BONUS = { 3: [3, 3, 2, 2, 2, 1, 1], 4: [6, 6, 5, 5, 4, 4], 5: [10, 10, 9, 8, 8] };
const BONUS_AVG = { 3: 2, 4: 5, 5: 9 };
const CAMEL_TOKEN = 5;
const HAND_MAX = 7;
const NAME = { D: "diamantes", O: "oro", P: "plata", T: "telas", E: "especias", C: "cuero", K: "camellos" };
const NAME1 = { D: "diamante", O: "oro", P: "plata", T: "tela", E: "especia", C: "cuero", K: "camello" };

const clone = o => JSON.parse(JSON.stringify(o));
function rngOf(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle(arr, r) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const mix = (a, b) => (Math.imul((a >>> 0) ^ 0x9E3779B9, 2654435761) + Math.imul(b + 1, 40503)) >>> 0;
const ORDER = { D: 0, O: 1, P: 2, T: 3, E: 4, C: 5, K: 6 };
const sortHand = h => h.sort((a, b) => ORDER[a] - ORDER[b]);
const count = (arr, t) => arr.reduce((n, x) => n + (x === t), 0);

/* ---------- partida y rondas ---------- */
function newRound(seed, starter, seals, round) {
  const r = rngOf(mix(seed, round));
  const deck = [];
  for (const t of [...GOODS, CAMEL]) for (let i = 0; i < COUNT[t] - (t === CAMEL ? 3 : 0); i++) deck.push(t);
  shuffle(deck, r);
  const market = [CAMEL, CAMEL, CAMEL, deck.pop(), deck.pop()];
  const hands = [[], []], herd = [0, 0];
  for (let p = 0; p < 2; p++) for (let i = 0; i < 5; i++) { const c = deck.pop(); if (c === CAMEL) herd[p]++; else hands[p].push(c); }
  hands.forEach(sortHand);
  const bon = {}; for (const k of [3, 4, 5]) bon[k] = shuffle(BONUS[k].slice(), r);
  return {
    v: 1, seed, round, turn: starter, start: starter, deck, market, hands, herd,
    tok: clone(TOKENS), bon, won: [[], []], seals: (seals || [0, 0]).slice(), n: 0,
    last: null, hist: [], over: null, match: null
  };
}
const newMatch = (seed, starter) => newRound(seed, starter, [0, 0], 1);
function nextRound(s) {
  if (!s.over || s.match !== null) return s;
  const loser = s.over.win === null ? s.start : 1 - s.over.win;
  return newRound(s.seed, loser, s.seals, s.round + 1);
}
const rematch = (s, newSeed) => newMatch(newSeed, s.match === null ? 0 : 1 - s.match);

/* ---------- validación (mensajes pensados para quien aprende) ---------- */
function check(s, p, a) {
  if (s.over) return "La ronda ya ha terminado.";
  if (s.turn !== p) return "No es tu turno.";
  const hand = s.hands[p], mk = s.market;
  if (!a || !a.t) return "Elige qué quieres hacer.";
  if (a.t === "sell") {
    if (!GOODS.includes(a.k)) return "Elige un tipo de mercancía para vender.";
    const have = count(hand, a.k), n = a.n | 0;
    if (n < 1) return "Elige al menos una carta para vender.";
    if (n > have) return `Solo tienes ${have} de ${NAME[a.k]}.`;
    if (PRECIOUS[a.k] && n < 2) return `Diamantes, oro y plata son valiosos: hay que vender al menos 2 cartas a la vez.`;
    return null;
  }
  if (a.t === "camels") {
    if (!mk.includes(CAMEL)) return "No hay camellos en el mercado.";
    return null;
  }
  if (a.t === "take") {
    const c = mk[a.i];
    if (c === undefined) return "Elige una carta del mercado.";
    if (c === CAMEL) return "Los camellos se cogen todos a la vez.";
    if (hand.length >= HAND_MAX) return "Ya tienes 7 cartas en la mano: no puedes coger más. Vende o cambia.";
    return null;
  }
  if (a.t === "swap") {
    const take = a.take || [], give = a.give || [], cam = a.camels | 0;
    if (new Set(take).size !== take.length || new Set(give).size !== give.length) return "Selección repetida.";
    if (take.length < 2) return "Para cambiar hay que coger al menos 2 cartas del mercado.";
    if (take.some(i => mk[i] === undefined)) return "Esa carta no está en el mercado.";
    if (take.some(i => mk[i] === CAMEL)) return "En un cambio no puedes coger camellos del mercado (sí puedes dar los tuyos).";
    if (give.some(i => hand[i] === undefined)) return "Esa carta no está en tu mano.";
    if (cam < 0 || cam > s.herd[p]) return `Solo tienes ${s.herd[p]} camellos.`;
    if (give.length + cam !== take.length) return `Coges ${take.length} y das ${give.length + cam}: tienen que ser las mismas.`;
    const tt = new Set(take.map(i => mk[i]));
    const clash = give.map(i => hand[i]).find(t => tt.has(t));
    if (clash) return `No puedes coger y devolver el mismo tipo de mercancía (${NAME[clash]}).`;
    if (hand.length + take.length - give.length > HAND_MAX) return "Acabarías con más de 7 cartas en la mano. Da más cartas de tu mano en lugar de camellos.";
    return null;
  }
  return "Acción desconocida.";
}

/* ---------- aplicar una acción ---------- */
function apply(s0, p, a, opt) {
  const err = check(s0, p, a);
  if (err) throw new Error(err);
  const s = clone(s0), hand = s.hands[p], mk = s.market;
  const last = { p, t: a.t, n: s.n + 1 };
  let refill = 0;
  if (a.t === "sell") {
    let left = a.n;
    for (let i = hand.length - 1; i >= 0 && left; i--) if (hand[i] === a.k) { hand.splice(i, 1); left--; }
    const got = [];
    for (let i = 0; i < a.n; i++) { const v = s.tok[a.k].shift(); if (v !== undefined) got.push(v); }
    got.forEach(v => s.won[p].push({ k: a.k, v }));
    const bk = a.n >= 5 ? 5 : a.n >= 3 ? a.n : 0;
    let bonus = 0;
    if (bk && s.bon[bk].length) { bonus = s.bon[bk].shift(); s.won[p].push({ k: "b" + bk, v: bonus }); }
    Object.assign(last, { k: a.k, cnt: a.n, got, bonus: bk ? (bonus ? bk : -bk) : 0 });
  } else if (a.t === "camels") {
    const c = count(mk, CAMEL);
    s.market = mk.filter(x => x !== CAMEL); s.herd[p] += c; refill = c;
    last.cnt = c;
  } else if (a.t === "take") {
    const c = mk.splice(a.i, 1)[0]; hand.push(c); sortHand(hand); refill = 1;
    last.k = c;
  } else {
    const takeSet = new Set(a.take), giveSet = new Set(a.give);
    const took = a.take.map(i => mk[i]), gave = a.give.map(i => hand[i]);
    for (let i = 0; i < a.camels; i++) gave.push(CAMEL);
    s.herd[p] -= a.camels;
    s.hands[p] = sortHand([...hand.filter((_, i) => !giveSet.has(i)), ...took]);
    const keep = mk.filter((_, i) => !takeSet.has(i));
    s.market = [...keep, ...gave];
    Object.assign(last, { took: sortHand(took.slice()), gave: sortHand(gave.slice()) });
  }
  let deckOut = false;
  last.drawn = [];
  for (let i = 0; i < refill && !(opt && opt.noDraw); i++) {
    if (!s.deck.length) { deckOut = true; break; }
    const c = s.deck.pop(); s.market.push(c); last.drawn.push(c);
  }
  last.newIdx = last.drawn.map((_, i) => s.market.length - last.drawn.length + i);
  if (a.t === "swap") last.newIdx = s.market.map((_, i) => i).slice(s.market.length - a.take.length);
  s.last = last; s.n++;
  s.hist.push(last);
  const empty = GOODS.filter(t => !s.tok[t].length).length;
  if (empty >= 3 || deckOut) finish(s, deckOut ? "deck" : "stacks");
  else s.turn = 1 - p;
  return s;
}

function points(s, p) { return s.won[p].reduce((n, x) => n + x.v, 0); }
function finish(s, reason) {
  const camel = s.herd[0] > s.herd[1] ? 0 : s.herd[1] > s.herd[0] ? 1 : null;
  if (camel !== null) s.won[camel].push({ k: "K", v: CAMEL_TOKEN });
  const pts = [points(s, 0), points(s, 1)];
  const nb = p => s.won[p].filter(x => x.k[0] === "b").length;
  const ng = p => s.won[p].filter(x => GOODS.includes(x.k)).length;
  let win = pts[0] > pts[1] ? 0 : pts[1] > pts[0] ? 1 : null, tie = "";
  if (win === null) { win = nb(0) > nb(1) ? 0 : nb(1) > nb(0) ? 1 : null; tie = "bonus"; }
  if (win === null) { win = ng(0) > ng(1) ? 0 : ng(1) > ng(0) ? 1 : null; tie = "goods"; }
  if (win === null) tie = "total";
  if (win !== null) s.seals[win]++;
  s.over = { reason, camel, pts, win, tie, nb: [nb(0), nb(1)], ng: [ng(0), ng(1)] };
  if (win !== null && s.seals[win] >= 2) s.match = win;
}

/* ---------- textos ---------- */
const plural = (n, t) => n === 1 ? `1 ${NAME1[t]}` : `${n} ${NAME[t]}`;
function describe(last, who, you) {
  if (!last) return "";
  const v = (el, tu) => you ? tu : el;
  if (last.t === "sell") {
    const sum = last.got.reduce((a, b) => a + b, 0);
    return `${who} ${v("vende", "vendes")} ${plural(last.cnt, last.k)}` + (last.got.length ? ` (+${sum})` : " (ya no quedaban fichas)") + (last.bonus > 0 ? ` y ${v("gana", "ganas")} una bonificación de ${last.bonus} cartas` : "");
  }
  if (last.t === "camels") return `${who} ${v("coge", "coges")} ${last.cnt === 1 ? "1 camello" : last.cnt + " camellos"} del mercado`;
  if (last.t === "take") return `${who} ${v("coge", "coges")} 1 ${NAME1[last.k]}`;
  const grp = arr => { const c = {}; arr.forEach(t => c[t] = (c[t] || 0) + 1); return Object.entries(c).map(([t, n]) => plural(n, t)).join(", "); };
  return `${who} ${v("cambia", "cambias")} ${grp(last.gave)} por ${grp(last.took)}`;
}

/* ---------- jugador automático ---------- */
function allActions(s, p) {
  const out = [], hand = s.hands[p], mk = s.market;
  for (const k of GOODS) { const n = count(hand, k); for (let c = PRECIOUS[k] ? 2 : 1; c <= n; c++) out.push({ t: "sell", k, n: c }); }
  if (mk.includes(CAMEL)) out.push({ t: "camels" });
  if (hand.length < HAND_MAX) { const seen = {}; mk.forEach((c, i) => { if (c !== CAMEL && !seen[c]) { seen[c] = 1; out.push({ t: "take", i }); } }); }
  const gi = mk.map((c, i) => c === CAMEL ? -1 : i).filter(i => i >= 0);
  const seenSets = {};
  for (let m = 1; m < 1 << gi.length; m++) {
    const take = gi.filter((_, b) => m >> b & 1);
    if (take.length < 2) continue;
    const key = take.map(i => mk[i]).sort().join("");
    if (seenSets[key]) continue; seenSets[key] = 1;
    const tt = new Set(take.map(i => mk[i]));
    const pool = hand.map((c, i) => ({ c, i })).filter(x => !tt.has(x.c));
    pool.sort((a, b) => cardKeep(s, hand, a.c) - cardKeep(s, hand, b.c));
    for (let cam = 0; cam <= Math.min(s.herd[p], take.length); cam++) {
      const need = take.length - cam; if (need > pool.length) continue;
      const a = { t: "swap", take, give: pool.slice(0, need).map(x => x.i), camels: cam };
      if (!check(s, p, a)) out.push(a);
    }
  }
  return out;
}
function cardKeep(s, hand, c) {           // cuánto nos duele soltar esta carta (menor = mejor para dar)
  const n = count(hand, c), st = s.tok[c];
  return (st[0] || 0) * .6 + n * 1.2;
}
function setValue(s, k, n, f) {
  if (!n) return 0;
  const st = s.tok[k];
  let v = 0; for (let i = 0; i < Math.min(n, st.length); i++) v += st[i];
  if (PRECIOUS[k] && n < 2) v *= .45;
  if (n >= 3) v += BONUS_AVG[Math.min(n, 5)];
  else if (n === 2 && !PRECIOUS[k]) v += .8;
  return v * f;
}
function evalFor(s, p, gainNow, opts) {
  const hand = s.hands[p], opp = 1 - p;
  const empty = GOODS.filter(t => !s.tok[t].length).length;
  const urgency = empty >= 2 || s.deck.length < 6;
  const f = urgency ? .4 : .72;
  let v = gainNow;
  for (const k of GOODS) v += setValue(s, k, count(hand, k), f);
  if (hand.length >= 6) v -= (hand.length - 5) * 1.3;
  const h = s.herd[p];
  v += Math.min(h, 4) * .9 + Math.max(0, h - 4) * .35;
  const diff = s.herd[p] - s.herd[opp];
  v += (diff > 0 ? 2.2 : diff < 0 ? -2.2 : 0) * (urgency ? 1.4 : .6);
  if (opts.risk !== false) {
    const goods = s.market.filter(c => c !== CAMEL).map(c => (s.tok[c][0] || 0) + (PRECIOUS[c] ? 1.5 : 0)).sort((a, b) => b - a);
    v -= (goods[0] || 0) * .45 + (goods[1] || 0) * .15;
    const holes = 5 - s.market.length, cams = count(s.market, CAMEL);
    v -= holes * .9;
    if (cams >= 3) v -= cams * .35;
  }
  return v;
}
/* Simula la acción sin mirar el mazo (el mercado se queda con huecos). */
function peek(s, p, a) {
  let r;
  try { r = apply(s, p, a, { noDraw: true }); } catch { return null; }
  const l = r.last, gain = l.t === "sell" ? l.got.reduce((a, b) => a + b, 0) + (l.bonus > 0 ? BONUS_AVG[l.bonus] : 0) : 0;
  return { st: r, gain };
}
function scoreAction(s, p, a) {
  const real = apply(s, p, a);
  const before = points(s, p);
  if (real.over) {
    // final de ronda: vale lo que se gane en la comparación de rupias (estimando las bonificaciones del rival)
    const mine = points(real, p), opp = real.won[1 - p].reduce((n, x) => n + (x.k[0] === "b" ? BONUS_AVG[x.k[1]] : x.v), 0);
    return 200 + (mine - opp) * 3;
  }
  const sim = peek(s, p, a);
  if (!sim) return -1e9;
  return evalFor(sim.st, p, sim.gain, {});
}
function oppReply(s, p, sim, r, samples) {
  // valor de la mejor jugada del rival tras la nuestra, sorteando lo que no vemos (su mano y el relleno del mercado)
  const opp = 1 - p, n = s.hands[opp].length, holes = 5 - sim.market.length;
  const unseen = [...s.deck, ...s.hands[opp]];
  let tot = 0;
  for (let k = 0; k < samples; k++) {
    const t = clone(sim); t.over = null; t.turn = opp;
    const pool = shuffle(unseen.slice(), r);
    t.market = [...t.market, ...pool.splice(0, holes)];
    const goods = pool.filter(c => c !== CAMEL);
    t.hands[opp] = sortHand(goods.slice(0, n)); t.deck = pool;
    let best = -1e9;
    for (const a of allActions(t, opp)) {
      const ps = peek(t, opp, a); if (!ps) continue;
      const v = evalFor(ps.st, opp, ps.gain, {}) ;
      if (v > best) best = v;
    }
    const base = evalFor(t, opp, 0, { risk: false });
    tot += Math.max(0, best - base);
  }
  return tot / samples;
}
const W3 = .45;
function bestMove(s, p, level, rand) {
  const r = rand || Math.random;
  const acts = allActions(s, p);
  if (!acts.length) return null;
  const sc = acts.map(a => ({ a, v: scoreAction(s, p, a) })).sort((x, y) => y.v - x.v);
  if (level <= 1) {
    if (r() < .15) return acts[Math.floor(r() * acts.length)];
    const top = sc.slice(0, 3); return top[Math.floor(r() * top.length)].a;
  }
  if (level >= 3) {
    const cand = sc.slice(0, 6);
    for (const c of cand) {
      if (c.v >= 150) continue;
      const sim = peek(s, p, c.a);
      c.v = evalFor(sim.st, p, sim.gain, { risk: false }) - oppReply(s, p, sim.st, r, 4) * W3;
    }
    cand.sort((x, y) => y.v - x.v);
    return cand[0].a;
  }
  return sc[0].a;
}

const api = { GOODS, CAMEL, PRECIOUS, COUNT, TOKENS, BONUS, HAND_MAX, NAME, NAME1, CAMEL_TOKEN,
  newMatch, newRound, nextRound, rematch, check, apply, points, describe, allActions, bestMove, count, rngOf, mix };
if (typeof module !== "undefined" && module.exports) module.exports = api;
else root.Bazar = api;

})(typeof window !== "undefined" ? window : this);
