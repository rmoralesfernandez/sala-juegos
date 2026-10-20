/* Enjambre: motor de reglas puro (estilo Hive Pocket: juego base + Mosquito + Mariquita).
   Casillas hexagonales en coordenadas axiales (q,r) codificadas como entero k = (q+128)*256 + (r+128).
   Pieza = dueño*8 + tipo. Pilas de abajo arriba. El estado (st) es JSON plano para guardarlo en la partida. */
(() => {
"use strict";
const NAME = ["Reina", "Escarabajo", "Saltamontes", "Araña", "Hormiga", "Mosquito", "Mariquita"];
const ART = ["la", "el", "el", "la", "la", "el", "la"];
const COUNT = [1, 2, 3, 2, 3, 1, 1];
const TOTAL = 13;
const Q = 0, BEE = 1, GRA = 2, SPI = 3, ANT = 4, MOS = 5, LAD = 6;
const DK = [256, 255, -1, -256, -255, 1];          // E, NE, NO, O, SO, SE (en orden circular)
const key = (q, r) => (q + 128) * 256 + (r + 128);
const qOf = k => (k >> 8) - 128, rOf = k => (k & 255) - 128;
const ORIGIN = key(0, 0);

/* ---------- utilidades del tablero ---------- */
const H = (m, k) => { const s = m.get(k); return s ? s.length : 0; };
const topOf = (m, k) => { const s = m.get(k); return s ? s[s.length - 1] : -1; };
function lift(m, k) { const s = m.get(k), pc = s.pop(); if (!s.length) m.delete(k); return pc; }
function drop(m, k, pc) { let s = m.get(k); if (!s) { s = []; m.set(k, s); } s.push(pc); }

/* puertas: un hueco entre dos casillas altas no deja pasar; a ras de suelo hay que ir pegado a la colmena */
function gate(m, a, i, hs, hd) {
  const h1 = H(m, a + DK[(i + 5) % 6]), h2 = H(m, a + DK[(i + 1) % 6]);
  if (hs === 0 && hd === 0) return (h1 > 0) !== (h2 > 0);
  return Math.min(h1, h2) <= Math.max(hs, hd);
}

/* puntos de articulación: piezas que no se pueden quitar sin partir la colmena */
function artPoints(m) {
  const ap = new Set(); if (m.size < 3) return ap;
  const disc = new Map(), low = new Map(); let t = 0;
  const dfs = (u, parent) => {
    disc.set(u, ++t); low.set(u, t); let ch = 0;
    for (let i = 0; i < 6; i++) {
      const v = u + DK[i]; if (!m.has(v)) continue;
      if (!disc.has(v)) {
        ch++; dfs(v, u); low.set(u, Math.min(low.get(u), low.get(v)));
        if (parent !== -1 && low.get(v) >= disc.get(u)) ap.add(u);
      } else if (v !== parent) low.set(u, Math.min(low.get(u), disc.get(v)));
    }
    if (parent === -1 && ch > 1) ap.add(u);
  };
  dfs(m.keys().next().value, -1);
  return ap;
}

/* ---------- movimientos de cada bicho (la pieza ya está levantada de a) ---------- */
function slides1(m, a) {
  const out = [];
  for (let i = 0; i < 6; i++) { const b = a + DK[i]; if (!m.has(b) && gate(m, a, i, 0, 0)) out.push(b); }
  return out;
}
function mvQueen(m, a, res) { for (const b of slides1(m, a)) res.add(b); }
function mvAnt(m, a, res) {
  const seen = new Set([a]), qu = [a];
  while (qu.length) { const c = qu.pop(); for (const b of slides1(m, c)) if (!seen.has(b)) { seen.add(b); res.add(b); qu.push(b); } }
}
function mvSpider(m, a, res) {
  const go = (c, d, vis) => {
    if (d === 3) { if (c !== a) res.add(c); return; }
    for (const b of slides1(m, c)) if (!vis.includes(b)) go(b, d + 1, vis.concat(b));
  };
  go(a, 0, [a]);
}
function mvGrass(m, a, res) {
  for (let i = 0; i < 6; i++) { let b = a + DK[i]; if (!m.has(b)) continue; while (m.has(b)) b += DK[i]; res.add(b); }
}
function mvBeetle(m, a, res) {
  const hs = H(m, a);
  for (let i = 0; i < 6; i++) { const b = a + DK[i]; if (gate(m, a, i, hs, H(m, b))) res.add(b); }
}
function mvLady(m, a, res) {
  for (let i = 0; i < 6; i++) {
    const b1 = a + DK[i], h1 = H(m, b1); if (!h1 || !gate(m, a, i, 0, h1)) continue;
    for (let j = 0; j < 6; j++) {
      const b2 = b1 + DK[j], h2 = H(m, b2); if (!h2 || !gate(m, b1, j, h1, h2)) continue;
      for (let k = 0; k < 6; k++) {
        const b3 = b2 + DK[k]; if (b3 === a || H(m, b3) || !gate(m, b2, k, h2, 0)) continue;
        res.add(b3);
      }
    }
  }
}
const MV = [mvQueen, mvBeetle, mvGrass, mvSpider, mvAnt, null, mvLady];
function mvMosq(m, a, res) {
  if (H(m, a) > 0) { mvBeetle(m, a, res); return; }   // encima de la colmena se mueve como escarabajo
  const done = new Set();
  for (let i = 0; i < 6; i++) {
    const t = topOf(m, a + DK[i]); if (t < 0) continue;
    const kd = t & 7; if (kd === MOS || done.has(kd)) continue;
    done.add(kd); MV[kd](m, a, res);
  }
}
MV[MOS] = mvMosq;

/* destinos de la pieza de arriba de la casilla k */
function dests(m, k) {
  const pc = lift(m, k), res = new Set();
  MV[pc & 7](m, k, res);
  res.delete(k);
  drop(m, k, pc);
  return [...res];
}

/* ---------- posición mutable ---------- */
function toPos(st) {
  const m = new Map();
  for (const [k, s] of st.b) m.set(k, s.slice());
  return { m, hand: [st.hand[0].slice(), st.hand[1].slice()], turn: st.turn };
}
const handN = h => h.reduce((a, b) => a + b, 0);

function placeCells(P, p) {
  const m = P.m;
  if (m.size === 0) return [ORIGIN];
  if (handN(P.hand[p]) === TOTAL) {   // primera pieza del segundo jugador: pegada a la del rival
    const [k] = m.keys(); return DK.map(d => k + d);
  }
  const out = [], seen = new Set();
  for (const [k, s] of m) {
    if ((s[s.length - 1] >> 3) !== p) continue;
    for (const d of DK) {
      const c = k + d; if (m.has(c) || seen.has(c)) continue; seen.add(c);
      let ok = true;
      for (const e of DK) { const t = topOf(m, c + e); if (t >= 0 && (t >> 3) !== p) { ok = false; break; } }
      if (ok) out.push(c);
    }
  }
  return out;
}

/* todas las jugadas legales: {t:"p",k,to} colocar, {t:"m",fr,to} mover, {t:"x"} pasar (solo si no hay otra) */
function gen(P) {
  const p = P.turn, m = P.m, hand = P.hand[p], acts = [];
  const queenIn = hand[Q] === 0, placed = TOTAL - handN(hand);
  const mustQ = !queenIn && placed === 3;
  if (placed < TOTAL) {
    const cells = placeCells(P, p);
    for (let kd = 0; kd < 7; kd++) {
      if (!hand[kd] || (mustQ && kd !== Q)) continue;
      for (const c of cells) acts.push({ t: "p", k: kd, to: c });
    }
  }
  if (queenIn) {
    const ap = artPoints(m);
    for (const [k, s] of [...m]) {
      if ((s[s.length - 1] >> 3) !== p || (s.length === 1 && ap.has(k))) continue;
      for (const to of dests(m, k)) acts.push({ t: "m", fr: k, to });
    }
  }
  if (!acts.length) acts.push({ t: "x" });
  return acts;
}
function doAct(P, a) {
  const p = P.turn;
  if (a.t === "p") { drop(P.m, a.to, p * 8 + a.k); P.hand[p][a.k]--; }
  else if (a.t === "m") drop(P.m, a.to, lift(P.m, a.fr));
  P.turn = 1 - p;
}
function undoAct(P, a) {
  P.turn = 1 - P.turn; const p = P.turn;
  if (a.t === "p") { lift(P.m, a.to); P.hand[p][a.k]++; }
  else if (a.t === "m") drop(P.m, a.fr, lift(P.m, a.to));
}
function queenAt(m, o) { for (const [k, s] of m) for (const pc of s) if (pc === o * 8) return k; return -1; }
function queenNb(m, o) { const k = queenAt(m, o); if (k < 0) return -1; let n = 0; for (const d of DK) if (m.has(k + d)) n++; return n; }
/* -1 sigue; 0/1 gana ese asiento; 2 tablas (las dos reinas rodeadas a la vez) */
function result(m) {
  const a = queenNb(m, 0) === 6, b = queenNb(m, 1) === 6;
  return a && b ? 2 : a ? 1 : b ? 0 : -1;
}
const sameAct = (a, b) => a.t === b.t && (a.t === "x" || (a.to === b.to && (a.t === "p" ? a.k === b.k : a.fr === b.fr)));

/* ---------- API del estado ---------- */
function posHash(P) {
  const ks = [...P.m.keys()].sort((a, b) => a - b);
  return P.turn + "|" + P.hand[0].join("") + P.hand[1].join("") + "|" + ks.map(k => k + ":" + P.m.get(k).join(".")).join(",");
}
function newGame(seed, white) {
  return { v: 1, seed, white, turn: white, b: [], hand: [COUNT.slice(), COUNT.slice()], n: 0, last: null, hist: [], over: null, rep: {}, wins: [0, 0] };
}
function rematch(st) {
  const g = newGame((st.seed * 1103515245 + 12345) % 2147483648, 1 - st.white);
  g.wins = st.wins.slice(); return g;
}
function legal(st) { return st.over ? [] : gen(toPos(st)); }
function check(st, p, a) {
  if (!a) return "Jugada no válida.";
  if (st.over) return "La partida ya ha terminado.";
  if (a.t === "r") return "";
  if (st.turn !== p) return "No es tu turno.";
  const P = toPos(st), acts = gen(P);
  if (acts.some(x => sameAct(x, a))) return "";
  if (a.t === "x") return "Solo puedes pasar si no tienes ninguna jugada.";
  if (a.t === "p") {
    if (!P.hand[p][a.k]) return `Ya no te quedan piezas de ${NAME[a.k]}.`;
    if (P.hand[p][Q] && TOTAL - handN(P.hand[p]) === 3 && a.k !== Q) return "Es tu cuarta pieza: tienes que colocar ya la Reina.";
    return "Ahí no se puede colocar: las piezas nuevas solo pueden tocar piezas de tu color.";
  }
  if (P.hand[p][Q]) return "No puedes mover piezas hasta que tu Reina esté en el tablero.";
  return "Ese movimiento no está permitido.";
}
function apply(st0, p, a) {
  const st = JSON.parse(JSON.stringify(st0));
  const n = st.n + 1;
  if (a.t === "r") {
    st.over = { win: 1 - p, why: "rendicion" }; st.wins[1 - p]++;
    st.last = { n, p, t: "r" }; st.hist.push(st.last); st.n = n; return st;
  }
  const P = toPos(st);
  const L = { n, p, t: a.t };
  if (a.t === "p") { L.k = a.k; L.to = a.to; }
  if (a.t === "m") {
    const s = P.m.get(a.fr); L.k = s[s.length - 1] & 7; L.fr = a.fr; L.to = a.to;
    L.up = H(P.m, a.to) > 0; L.down = s.length > 1 && !L.up;
    if (L.up) L.on = topOf(P.m, a.to);
  }
  doAct(P, a);
  st.b = [...P.m].map(([k, s]) => [k, s]); st.hand = P.hand; st.turn = P.turn; st.n = n;
  const res = result(P.m);
  if (res === 2) st.over = { win: -1, why: "reinas" };
  else if (res >= 0) { st.over = { win: res, why: "reina" }; st.wins[res]++; }
  else {
    const h = posHash(P); st.rep[h] = (st.rep[h] || 0) + 1;
    if (st.rep[h] >= 3) st.over = { win: -1, why: "repeticion" };
  }
  st.last = L; st.hist.push(L); if (st.hist.length > 400) st.hist.shift();
  return st;
}
function describe(L, who, you) {
  if (L.t === "r") return `${who} ${you ? "te rindes" : "se rinde"}`;
  if (L.t === "x") return `${who} ${you ? "pasas" : "pasa"}: no ${you ? "tienes" : "tiene"} ninguna jugada posible`;
  const pz = `${ART[L.k]} ${NAME[L.k]}`;
  if (L.t === "p") return `${who} ${you ? "colocas" : "coloca"} ${pz}`;
  let s = `${who} ${you ? "mueves" : "mueve"} ${pz}`;
  if (L.up) {
    const ok = L.on & 7, o = ART[ok] === "la" ? "a" : "o";
    s += ` encima de ${ART[ok]} ${NAME[ok]} ${(L.on >> 3) === L.p ? (you ? "tuy" : "suy") + o : "rival"}`;
  } else if (L.down) s += " y baja de la colmena";
  return s;
}

/* ---------- la máquina ---------- */
const VAL = [5, 5, 3, 2.5, 6, 5, 4];
const QW = [0, 3, 8, 15, 26, 45, 0];
function evalPos(P, p) {
  const m = P.m, res = result(m);
  if (res === p) return 1e5; if (res === 2) return 0; if (res >= 0) return -1e5;
  let sc = 0;
  const ap = artPoints(m);
  for (const [k, s] of m) {
    const top = s[s.length - 1], sign = (top >> 3) === p ? 1 : -1, kd = top & 7;
    const free = s.length > 1 || !ap.has(k);
    sc += sign * VAL[kd] * (free ? 1 : .35);
    for (let i = 0; i < s.length - 1; i++) sc -= ((s[i] >> 3) === p ? 1 : -1) * VAL[s[i] & 7] * .5;
    if (s.length > 1 && s.includes((1 - (top >> 3)) * 8)) sc += sign * 4;   // escarabajo encima de la reina rival
  }
  for (let o = 0; o < 2; o++) {
    const n = queenNb(m, o); if (n < 0) continue;
    sc += (o === p ? -1.15 : 1) * QW[n];
  }
  for (let o = 0; o < 2; o++) { const h = P.hand[o]; let v = 0; for (let kd = 0; kd < 7; kd++) v += h[kd] * VAL[kd] * .45; sc += (o === p ? 1 : -1) * v; }
  return sc;
}
function search(P, depth, alpha, beta, beam, deadline) {
  const r = result(P.m);
  if (depth === 0 || r !== -1 || Date.now() > deadline) return evalPos(P, P.turn);
  let acts = gen(P);
  if (acts.length > beam) {
    for (const a of acts) { doAct(P, a); a.s = -evalPos(P, P.turn); undoAct(P, a); }
    acts.sort((x, y) => y.s - x.s); acts = acts.slice(0, beam);
  }
  let best = -Infinity;
  for (const a of acts) {
    doAct(P, a);
    const v = -search(P, depth - 1, -beta, -alpha, beam, deadline);
    undoAct(P, a);
    if (v > best) best = v;
    if (v > alpha) alpha = v;
    if (alpha >= beta) break;
  }
  return best;
}
function plan(st, p, level) {
  if (st.over || st.turn !== p) return null;
  const P = toPos(st), acts = gen(P);
  if (acts.length === 1) return acts[0];
  for (const a of acts) { doAct(P, a); const r = result(P.m); undoAct(P, a); if (r === p) return a; }   // gana ya
  const lv = level || 2;
  for (const a of acts) { doAct(P, a); a.s = -evalPos(P, P.turn); undoAct(P, a); }
  if (lv === 1) {
    if (Math.random() < .3) return acts[Math.floor(Math.random() * acts.length)];
    let b = null, bv = -Infinity;
    for (const a of acts) { const v = a.s + Math.random() * 10; if (v > bv) { bv = v; b = a; } }
    return b;
  }
  acts.sort((x, y) => y.s - x.s);
  const C = lv === 2 ? [2, 99, 99] : [3, 10, 24];   // [profundidad, anchura, jugadas raíz]
  const depth = C[0], beam = C[1], deadline = Date.now() + (lv === 2 ? 1500 : 2500);
  const root = acts.slice(0, C[2]);
  let best = root[0], bv = -Infinity;
  for (const a of root) {
    doAct(P, a);
    const v = -search(P, depth - 1, -Infinity, -bv, beam, deadline) + Math.random() * .3;
    undoAct(P, a);
    if (v > bv) { bv = v; best = a; }
    if (Date.now() > deadline) break;
  }
  return { t: best.t, k: best.k, fr: best.fr, to: best.to };
}

/* informe de una casilla para la interfaz */
function info(st, k) {
  const P = toPos(st), s = P.m.get(k);
  if (!s) return null;
  const ap = artPoints(P.m);
  return { stack: s.slice(), pinned: s.length === 1 && ap.has(k) };
}

window.Enjambre = {
  NAME, ART, COUNT, TOTAL, DK, key, qOf, rOf, ORIGIN, Q, BEE, GRA, SPI, ANT, MOS, LAD,
  newGame, rematch, legal, check, apply, plan, describe, info,
  queenNb: (st, o) => queenNb(toPos(st).m, o),
  _int: { toPos, gen, doAct, undoAct, result, evalPos, artPoints, dests, placeCells, sameAct }
};
})();
