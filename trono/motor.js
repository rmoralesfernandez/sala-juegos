/* Por el Trono: motor de reglas (estilo Claim, 2 jugadores) y jugador automático.
   Funciona en el navegador (window.Trono) y en Node (module.exports). */
(function (root) {
"use strict";

/* ---------- cartas ---------- */
const FAC = ["G", "K", "U", "D", "X"];                 // trasgos, caballeros, no muertos, enanos, cambiaformas
const NAME = { G: "Trasgos", K: "Caballeros", U: "No muertos", D: "Enanos", X: "Cambiaformas" };
const NAME1 = { G: "trasgo", K: "caballero", U: "no muerto", D: "enano", X: "cambiaformas" };
const CARDS = [];
for (let i = 0; i < 5; i++) CARDS.push({ f: "G", v: 0 });
for (let v = 1; v <= 9; v++) CARDS.push({ f: "G", v });
for (let v = 2; v <= 9; v++) CARDS.push({ f: "K", v });
for (const f of ["U", "D", "X"]) for (let v = 0; v <= 9; v++) CARDS.push({ f, v });
const NCARDS = CARDS.length;                             // 52
const FI = { G: 0, K: 1, U: 2, D: 3, X: 4 };
const CF = CARDS.map(c => FI[c.f]), CV = CARDS.map(c => c.v);
const TOT = FAC.map(f => CARDS.filter(c => c.f === f).length);
const TOTAL = {}; FAC.forEach((f, i) => TOTAL[f] = TOT[i]);
const fac = c => CARDS[c].f, val = c => CARDS[c].v;
const sortHand = h => h.sort((a, b) => CF[a] - CF[b] || CV[a] - CV[b] || a - b);
const cardName = c => `${val(c)} de ${NAME[fac(c)]}`;

const clone = o => JSON.parse(JSON.stringify(o));
function rngOf(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle(arr, r) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const mix = (a, b) => (Math.imul((a >>> 0) ^ 0x9E3779B9, 2654435761) + Math.imul(b + 1, 40503)) >>> 0;

/* ---------- reglas de la baza ---------- */
/* ¿Gana quien sigue? a = carta del que sale, b = carta del que sigue */
function followerWins(a, b) {
  const lf = CF[a]; let ff = CF[b];
  if (ff === 4) ff = lf;                                 // el cambiaformas que sigue copia la facción de salida
  if (ff === lf) return CV[b] > CV[a];                  // empate: gana quien salió
  return lf === 0 && ff === 1;                          // un caballero siempre vence a un trasgo
}
function legalOf(hand, lead) {
  if (lead < 0) return hand.slice();
  const lf = CF[lead];
  if (!hand.some(c => CF[c] === lf)) return hand.slice();
  return hand.filter(c => CF[c] === lf || CF[c] === 4);
}

/* ---------- partida ---------- */
function newGame(seed, starter, wins, gn) {
  const r = rngOf(seed);
  const deck = shuffle([...Array(NCARDS).keys()], r);
  const hands = [sortHand(deck.splice(0, 13)), sortHand(deck.splice(0, 13))];
  const up = deck.pop();
  return {
    v: 1, seed, gn: gn || 1, phase: 1, hands, deck, up,
    fol: [[], []], pub: [[], []], score: [[], []], disc: [],
    lead: starter, turn: starter, start: starter, table: [], trick: 1,
    voids: [{}, {}], last: null, hist: [], n: 0, over: null, wins: (wins || [0, 0]).slice()
  };
}
function rematch(s, newSeed) {
  const st = !s.over || s.over.win === null ? 1 - s.start : 1 - s.over.win;   // empieza quien ha perdido
  return newGame(newSeed, st, s.wins, (s.gn || 1) + 1);
}
const legal = (s, p) => (s.over || s.turn !== p) ? [] : sortHand(legalOf(s.hands[p], s.table.length ? s.table[0].c : -1));

function check(s, p, c) {
  if (s.over) return "La partida ya ha terminado.";
  if (s.turn !== p) return "No es tu turno.";
  if (!s.hands[p].includes(c)) return "Esa carta no está en tu mano.";
  if (s.table.length) {
    const a = s.table[0].c, lf = CF[a];
    if (CF[c] !== lf && CF[c] !== 4 && s.hands[p].some(x => CF[x] === lf))
      return `Tienes ${NAME[fac(a)].toLowerCase()}: hay que seguir esa facción (o jugar un cambiaformas).`;
  }
  return null;
}

function apply(s0, p, c) {
  const err = check(s0, p, c);
  if (err) throw new Error(err);
  const s = clone(s0), h = s.hands[p];
  h.splice(h.indexOf(c), 1);
  s.n++;
  if (!s.table.length) { s.table.push({ p, c }); s.turn = 1 - p; s.last = { n: s.n, t: "lead", p, c, phase: s.phase }; return s; }
  const a = s.table[0].c, L = s.table[0].p, Fo = p;
  if (CF[c] !== CF[a] && CF[c] !== 4) s.voids[Fo][fac(a)] = 1;
  const fw = followerWins(a, c), w = fw ? Fo : L, l = 1 - w;
  const rec = { n: s.n, t: "trick", phase: s.phase, trick: s.trick, lp: L, a, b: c, w,
    why: null, copy: CF[c] === 4 && CF[a] !== 4 };
  { const lf = CF[a], cf = CF[c], ff = cf === 4 ? lf : cf;
    rec.why = ff === lf ? (CV[c] === CV[a] ? "tie" : "high") : (lf === 0 && cf === 1) || (lf === 1 && cf === 0) ? "knight" : "offsuit"; }
  if (s.phase === 1) {
    rec.up = s.up; s.fol[w].push(s.up); s.pub[w].push(s.up);
    const d = s.deck.pop(); s.fol[l].push(d); rec.drew = l; rec.d = d;
    rec.und = [];
    for (const x of [a, c]) { if (CF[x] === 2) { s.score[w].push(x); rec.und.push(x); } else s.disc.push(x); }
    s.up = s.deck.length ? s.deck.pop() : null;
  } else {
    rec.dw = [];
    for (const x of [a, c]) { if (CF[x] === 3) { s.score[l].push(x); rec.dw.push(x); } else s.score[w].push(x); }
  }
  s.table = []; s.lead = s.turn = w; s.trick++;
  s.last = rec; s.hist.push(rec);
  if (!s.hands[0].length && !s.hands[1].length) {
    if (s.phase === 1) {
      s.phase = 2; s.hands = s.fol.map(f => sortHand(f.slice())); s.trick = 1; s.voids = [{}, {}];
      rec.phaseEnd = true;
    } else finish(s);
  }
  return s;
}

function tally(s) {
  return FAC.map(f => {
    const a = s.score[0].filter(c => fac(c) === f), b = s.score[1].filter(c => fac(c) === f);
    const mx = x => x.length ? Math.max(...x.map(val)) : -1;
    const n = [a.length, b.length], max = [mx(a), mx(b)];
    let w = n[0] > n[1] ? 0 : n[1] > n[0] ? 1 : null, tie = false;
    if (w === null && n[0]) { tie = true; w = max[0] > max[1] ? 0 : max[1] > max[0] ? 1 : null; }
    return { f, n, max, w, tie };
  });
}
function finish(s) {
  const res = tally(s);
  const cnt = [0, 1].map(p => res.filter(r => r.w === p).length);
  const win = cnt[0] > cnt[1] ? 0 : cnt[1] > cnt[0] ? 1 : null;
  if (win !== null) s.wins[win]++;
  s.over = { res, cnt, win };
}

/* ======================================================================
   Jugador automático
   ====================================================================== */

/* Estado ligero para simular rápido */
function toSim(s) {
  const sc = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], mx = [[-1, -1, -1, -1, -1], [-1, -1, -1, -1, -1]], gone = [0, 0, 0, 0, 0];
  s.score.forEach((pile, p) => pile.forEach(c => { sc[p][CF[c]]++; if (CV[c] > mx[p][CF[c]]) mx[p][CF[c]] = CV[c]; gone[CF[c]]++; }));
  s.disc.forEach(c => gone[CF[c]]++);
  return { ph: s.phase, h: [s.hands[0].slice(), s.hands[1].slice()], fol: [s.fol[0].slice(), s.fol[1].slice()], deck: s.deck.slice(),
    up: s.up === null || s.up === undefined ? -1 : s.up, sc, mx, gone, lead: s.table.length ? s.table[0].c : -1, turn: s.turn, done: !!s.over };
}
const cloneSim = t => ({ ph: t.ph, h: [t.h[0].slice(), t.h[1].slice()], fol: [t.fol[0].slice(), t.fol[1].slice()], deck: t.deck.slice(), up: t.up,
  sc: [t.sc[0].slice(), t.sc[1].slice()], mx: [t.mx[0].slice(), t.mx[1].slice()], gone: t.gone.slice(), lead: t.lead, turn: t.turn, done: t.done });
function addSc(t, p, x) { const f = CF[x]; t.sc[p][f]++; if (CV[x] > t.mx[p][f]) t.mx[p][f] = CV[x]; t.gone[f]++; }
function simPlay(t, p, c) {
  const h = t.h[p]; h.splice(h.indexOf(c), 1);
  if (t.lead < 0) { t.lead = c; t.turn = 1 - p; return; }
  const a = t.lead, w = followerWins(a, c) ? p : 1 - p, l = 1 - w;
  if (t.ph === 1) {
    t.fol[w].push(t.up); t.fol[l].push(t.deck.pop());
    for (const x of [a, c]) { if (CF[x] === 2) addSc(t, w, x); else t.gone[CF[x]]++; }
    t.up = t.deck.length ? t.deck.pop() : -1;
  } else for (const x of [a, c]) addSc(t, CF[x] === 3 ? l : w, x);
  t.lead = -1; t.turn = w;
  if (!t.h[0].length && !t.h[1].length) { if (t.ph === 1) { t.ph = 2; t.h = t.fol; t.fol = [[], []]; } else t.done = true; }
}
function simResult(t) {
  const r = [0, 0];
  for (let f = 0; f < 5; f++) {
    const a = t.sc[0][f], b = t.sc[1][f];
    if (a > b) r[0]++; else if (b > a) r[1]++;
    else if (a) { if (t.mx[0][f] > t.mx[1][f]) r[0]++; else if (t.mx[1][f] > t.mx[0][f]) r[1]++; }
  }
  return r;
}

/* Heurística (nivel 2 y simulaciones) */
const W1 = c => CV[c] / 9 + (CF[c] === 1 ? .12 : CF[c] === 4 ? .1 : CF[c] === 0 ? -.06 : 0);   // lo que vale reclutar esa carta
const AVG = .45, UV = .35;
const cost1 = c => .25 * CV[c] / 9 + (CF[c] === 1 ? .05 : 0);
const cost2 = c => .12 * CV[c] / 9 + (CF[c] === 4 ? .06 : 0);
function imp(t, p, f) {
  const my = t.sc[p][f], op = t.sc[1 - p][f], rem = TOT[f] - t.gone[f];
  if (my > op + rem || op > my + rem) return .05;       // facción ya decidida
  return 1 + (rem <= 3 ? .3 : 0);
}
function contrib(t, p, w, cards) {
  if (t.ph === 1) {
    let d = W1(t.up) - AVG;
    for (const x of cards) if (CF[x] === 2) d += UV;
    return w === p ? d : -d;
  }
  let v = 0;
  for (const x of cards) { const to = CF[x] === 3 ? 1 - w : w; v += (to === p ? 1 : -1) * imp(t, p, CF[x]); }
  return v;
}
const costOf = (t, c) => t.ph === 1 ? cost1(c) : cost2(c);
function bestFollow(t, p, leg, noise, r) {
  let best = leg[0], bv = -1e9;
  for (const c of leg) {
    const w = followerWins(t.lead, c) ? p : 1 - p;
    const v = contrib(t, p, w, [t.lead, c]) - costOf(t, c) + (noise ? r() * noise : 0);
    if (v > bv) { bv = v; best = c; }
  }
  return best;
}
function bestLead(t, p, perfect, noise, r) {
  const o = 1 - p, hand = t.h[p];
  let best = hand[0], bv = -1e9;
  for (const c of hand) {
    let v;
    if (perfect) {
      t.lead = c;
      const d = bestFollow(t, o, legalOf(t.h[o], c), 0, r);
      t.lead = -1;
      const w = followerWins(c, d) ? o : p;
      v = contrib(t, p, w, [c, d]) - costOf(t, c);
    } else {
      const pw = Math.min(.95, .1 + .78 * CV[c] / 9 + (CF[c] === 1 ? .08 : 0));
      v = pw * contrib(t, p, p, [c]) + (1 - pw) * contrib(t, p, o, [c]) - costOf(t, c);
    }
    v += noise ? r() * noise : 0;
    if (v > bv) { bv = v; best = c; }
  }
  return best;
}
function policy(t, p, perfect, noise, r) {
  if (t.lead < 0) return bestLead(t, p, perfect, noise, r);
  return bestFollow(t, p, legalOf(t.h[p], t.lead), noise, r);
}

/* Reparte lo que p no ve de forma coherente con lo que sabe (incluidas las facciones que el rival no tiene) */
function determinize(s, p, r) {
  const o = 1 - p, t = toSim(s);
  const known = new Set([...s.hands[p], ...s.fol[p], ...s.pub[o], ...s.score[0], ...s.score[1], ...s.disc, ...s.table.map(x => x.c)]);
  if (s.up !== null && s.up !== undefined) known.add(s.up);
  const pool = shuffle([...Array(NCARDS).keys()].filter(c => !known.has(c)), r);
  let hand = [];
  if (s.phase === 2) {
    const played = new Set([...s.score[0], ...s.score[1], ...s.table.map(x => x.c)]);
    hand = s.pub[o].filter(c => !played.has(c));
  }
  const need = s.hands[o].length - hand.length, vd = s.voids[o];
  const ok = [], bad = [];
  for (const c of pool) (vd[fac(c)] ? bad : ok).push(c);
  const pick = ok.splice(0, need);
  if (pick.length < need) pick.push(...bad.splice(0, need - pick.length));
  hand = hand.concat(pick);
  const rest = shuffle(ok.concat(bad), r);
  t.h[o] = hand;
  if (s.phase === 1) {
    const hid = s.fol[o].length - s.pub[o].length;
    t.fol[o] = s.pub[o].concat(rest.splice(0, hid));
    t.deck = rest;
  }
  return t;
}
function rollout(t, r) {
  while (!t.done) {
    const q = t.turn, leg = legalOf(t.h[q], t.lead);
    const c = r() < .08 ? leg[Math.floor(r() * leg.length)] : (t.lead < 0 ? bestLead(t, q, true, .05, r) : bestFollow(t, q, leg, .05, r));
    simPlay(t, q, c);
  }
}
function mcMove(s, p, budget, r) {
  const leg = legal(s, p);
  if (leg.length <= 1) return leg[0];
  const samples = Math.max(12, Math.min(220, Math.floor(budget / leg.length / (s.phase === 2 ? 4 : 1))));
  const tot = leg.map(() => 0), o = 1 - p;
  for (let k = 0; k < samples; k++) {
    const base = determinize(s, p, r);
    leg.forEach((c, i) => {
      const t = cloneSim(base); simPlay(t, p, c); rollout(t, r);
      const res = simResult(t);
      tot[i] += (res[p] > res[o] ? 1 : res[p] < res[o] ? 0 : .5) + .03 * (res[p] - res[o]);
    });
  }
  let bi = 0; tot.forEach((v, i) => { if (v > tot[bi] || (v === tot[bi] && CV[leg[i]] < CV[leg[bi]])) bi = i; });
  return leg[bi];
}
function bestMove(s, p, level, rand) {
  const r = rand || Math.random, leg = legal(s, p);
  if (!leg.length) return null;
  if (leg.length === 1) return leg[0];
  if (level <= 1) {
    if (r() < .3) return leg[Math.floor(r() * leg.length)];
    return policy(toSim(s), p, false, .35, r);
  }
  if (level === 2) {
    if (s.phase === 2) return policy(determinize(s, p, r), p, true, 0, r);   // en la fase 2 contando cartas se sabe todo
    return policy(toSim(s), p, false, 0, r);
  }
  return mcMove(s, p, 2400, r);
}

const api = { FAC, NAME, NAME1, CARDS, TOTAL, fac, val, cardName, sortHand, followerWins, legalOf, legal,
  newGame, rematch, check, apply, tally, bestMove, rngOf, mix, determinize };
if (typeof module !== "undefined" && module.exports) module.exports = api;
else root.Trono = api;

})(typeof window !== "undefined" ? window : this);
