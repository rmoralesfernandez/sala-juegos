/* Duelo de Gemas: motor de reglas puro (estilo Splendor Duel) + máquina con 3 niveles.
   Sin DOM: se usa igual en el navegador (window.Gemas) y en node (module.exports).
   El estado es JSON plano; todo el azar sale de s.r (semilla), así los dos móviles calculan lo mismo. */
(function (root) {
"use strict";

const GEMS = ["W", "U", "G", "R", "K"];            // diamante, zafiro, esmeralda, rubí, ónice
const TOK = ["W", "U", "G", "R", "K", "P", "O"];   // + perla y oro
const NAME1 = { W: "diamante", U: "zafiro", G: "esmeralda", R: "rubí", K: "ónice", P: "perla", O: "oro" };
const NAME = { W: "diamantes", U: "zafiros", G: "esmeraldas", R: "rubíes", K: "ónices", P: "perlas", O: "oros" };

/* 67 cartas de joya: [nivel, color del bonus ("" = sin color), bonus, puntos, coronas, habilidad, coste WUGRKP] */
const RAW = [[1,"W",1,1,0,"","002300"],[1,"W",1,0,1,"","030000"],[1,"W",1,0,0,"turn","022001"],[1,"W",1,0,0,"gem","000220"],[1,"W",1,0,0,"","011110"],[1,"U",1,1,0,"","000230"],[1,"U",1,0,1,"","003000"],[1,"U",1,0,0,"turn","002201"],[1,"U",1,0,0,"gem","200020"],[1,"U",1,0,0,"","101110"],[1,"G",1,1,0,"","300020"],[1,"G",1,0,1,"","000300"],[1,"G",1,0,0,"turn","000221"],[1,"G",1,0,0,"gem","220000"],[1,"G",1,0,0,"","110110"],[1,"R",1,1,0,"","230000"],[1,"R",1,0,1,"","000030"],[1,"R",1,0,0,"turn","200021"],[1,"R",1,0,0,"gem","022000"],[1,"R",1,0,0,"","111010"],[1,"K",1,1,0,"","023000"],[1,"K",1,0,1,"","300000"],[1,"K",1,0,0,"turn","220001"],[1,"K",1,0,0,"gem","002200"],[1,"K",1,0,0,"","111100"],[1,"",0,3,0,"","000401"],[1,"",1,1,0,"wild","202011"],[1,"",1,1,0,"wild","020211"],[1,"",1,1,0,"wild","000041"],[1,"",1,0,1,"wild","400011"],[2,"W",1,2,1,"","002221"],[2,"W",1,2,0,"priv","400021"],[2,"W",2,1,0,"","052000"],[2,"W",1,1,0,"steal","040300"],[2,"U",1,2,1,"","200221"],[2,"U",1,2,0,"priv","240001"],[2,"U",2,1,0,"","005200"],[2,"U",1,1,0,"steal","004030"],[2,"G",1,2,1,"","220021"],[2,"G",1,2,0,"priv","024001"],[2,"G",2,1,0,"","000520"],[2,"G",1,1,0,"steal","300400"],[2,"R",1,2,1,"","222001"],[2,"R",1,2,0,"priv","002401"],[2,"R",2,1,0,"","200050"],[2,"R",1,1,0,"steal","030040"],[2,"K",1,2,1,"","022201"],[2,"K",1,2,0,"priv","000241"],[2,"K",2,1,0,"","520000"],[2,"K",1,1,0,"steal","403000"],[2,"",0,5,0,"","060001"],[2,"",1,2,0,"wild","006001"],[2,"",1,0,2,"wild","006001"],[2,"",1,0,2,"wild","060001"],[3,"W",1,4,0,"","620020"],[3,"W",1,3,2,"","030531"],[3,"U",1,4,0,"","262000"],[3,"U",1,3,2,"","303051"],[3,"G",1,4,0,"","026200"],[3,"G",1,3,2,"","530301"],[3,"R",1,4,0,"","002620"],[3,"R",1,3,2,"","053031"],[3,"K",1,4,0,"","200260"],[3,"K",1,3,2,"","305301"],[3,"",0,6,0,"","800000"],[3,"",1,0,3,"wild","000080"],[3,"",1,3,0,"wildturn","000800"]];
const CARDS = [null];
RAW.forEach((r, i) => {
  const cost = {}; "WUGRKP".split("").forEach((c, j) => { const n = +r[6][j]; if (n) cost[c] = n; });
  CARDS.push({ id: i + 1, lv: r[0], col: r[1] || null, bon: r[2], pts: r[3], cr: r[4], ab: r[5] || null, cost, wild: r[5] === "wild" || r[5] === "wildturn" });
});
/* 4 cartas reales */
const ROYALS = [null, { id: 1, pts: 3, ab: null }, { id: 2, pts: 2, ab: "turn" }, { id: 3, pts: 2, ab: "steal" }, { id: 4, pts: 2, ab: "priv" }];
const PYR = { 1: 5, 2: 4, 3: 3 };
/* 25 fichas: 4 de cada gema, 2 perlas, 3 oros */
const BAG0 = [].concat(...GEMS.map(c => [c, c, c, c]), ["P", "P", "O", "O", "O"]);

/* Espiral del tablero 5×5 desde el centro */
const SPIRAL = (() => {
  const out = [12]; let r = 2, c = 2, step = 1;
  const dirs = [[-1, 0], [0, 1], [1, 0], [0, -1]]; let d = 0;
  while (out.length < 25) {
    for (let k = 0; k < 2 && out.length < 25; k++) {
      for (let i = 0; i < step && out.length < 25; i++) { r += dirs[d][0]; c += dirs[d][1]; if (r >= 0 && r < 5 && c >= 0 && c < 5) out.push(r * 5 + c); }
      d = (d + 1) % 4;
    }
    step++;
  }
  return out;
})();

/* ================= azar con semilla ================= */
function rnd(s) { let t = (s.r = (s.r + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function shuffle(s, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const mix = (a, b) => ((Math.imul(a ^ 0x9E3779B9, 2654435761) ^ b) >>> 0) % 2147483647;

/* ================= partida nueva ================= */
const zeroTok = () => ({ W: 0, U: 0, G: 0, R: 0, K: 0, P: 0, O: 0 });
function newPlayer() { return { t: zeroTok(), cards: [], res: [], roy: [], priv: 0 }; }
function newGame(seed, first) {
  const s = { v: 1, seed: seed >>> 0, r: seed >>> 0, first: first ? 1 : 0, turn: first ? 1 : 0, n: 0,
    board: Array(25).fill(null), bag: BAG0.slice(), decks: { 1: [], 2: [], 3: [] }, pyr: { 1: [], 2: [], 3: [] },
    priv: 3, roys: [1, 2, 3, 4], P: [newPlayer(), newPlayer()], q: [], ph: "opt", filled: false, extra: false,
    over: null, last: null, hist: [], wins: [0, 0] };
  for (let id = 1; id < CARDS.length; id++) s.decks[CARDS[id].lv].push(id);
  [1, 2, 3].forEach(lv => { shuffle(s, s.decks[lv]); for (let k = 0; k < PYR[lv]; k++) s.pyr[lv].push(s.decks[lv].pop()); });
  refill(s);
  givePriv(s, 1 - s.turn);
  return s;
}
function rematch(s) {
  const loser = s.over ? 1 - s.over.win : s.first;
  const ns = newGame(mix(s.seed, 7777 + s.wins[0] + s.wins[1]), loser);
  ns.wins = s.wins.slice();
  return ns;
}
function refill(s) {
  shuffle(s, s.bag);
  for (const i of SPIRAL) if (!s.board[i] && s.bag.length) s.board[i] = s.bag.pop();
  s.bag = [];
}

/* ================= consultas ================= */
const card = id => CARDS[id];
const ntok = pl => TOK.reduce((a, c) => a + pl.t[c], 0);
function bonus(pl) { const b = { W: 0, U: 0, G: 0, R: 0, K: 0 }; for (const x of pl.cards) if (x.c) b[x.c] += card(x.id).bon; return b; }
function points(pl) { let p = 0; for (const x of pl.cards) p += card(x.id).pts; for (const r of pl.roy) p += ROYALS[r].pts; return p; }
function crowns(pl) { let p = 0; for (const x of pl.cards) p += card(x.id).cr; return p; }
function colorPts(pl) { const b = { W: 0, U: 0, G: 0, R: 0, K: 0 }; for (const x of pl.cards) if (x.c) b[x.c] += card(x.id).pts; return b; }
function ownColors(pl) { return GEMS.filter(c => pl.cards.some(x => x.c === c)); }
/* Lo que cuesta de verdad una carta a un jugador: gemas a pagar por color y oro que falta */
function price(pl, id) {
  const cd = card(id), b = bonus(pl), pay = {}; let gold = 0;
  for (const c of ["W", "U", "G", "R", "K", "P"]) {
    const need = Math.max(0, (cd.cost[c] || 0) - (b[c] || 0));
    if (!need) continue;
    const use = Math.min(need, pl.t[c]);
    if (use) pay[c] = use;
    gold += need - use;
  }
  return { pay, gold, ok: gold <= pl.t.O };
}
function canBuy(s, p, id) { const pl = s.P[p]; if (card(id).wild && !ownColors(pl).length) return false; return price(pl, id).ok; }
const isGem = t => t && t !== "O";

/* Línea recta de 1 a 3 fichas contiguas sin oro ni huecos */
function lineOK(board, cells) {
  if (!Array.isArray(cells) || cells.length < 1 || cells.length > 3) return false;
  if (new Set(cells).size !== cells.length) return false;
  for (const i of cells) if (!(i >= 0 && i < 25) || !isGem(board[i])) return false;
  if (cells.length === 1) return true;
  const pts = cells.map(i => [Math.floor(i / 5), i % 5]);
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const key = ([r, c]) => dr === 0 ? r : dc === 0 ? c : dc === 1 ? r - c : r + c;
    const pos = ([r, c]) => dr === 0 ? c : r;
    if (!pts.every(q => key(q) === key(pts[0]))) continue;
    const ps = pts.map(pos).sort((a, b) => a - b);
    if (ps.every((v, k) => k === 0 || v === ps[k - 1] + 1)) return true;
  }
  return false;
}
function anyMandatory(s, p) {
  const pl = s.P[p];
  if (s.board.some(isGem)) return true;
  if (s.board.includes("O") && pl.res.length < 3 && ([1, 2, 3].some(lv => s.decks[lv].length || s.pyr[lv].some(Boolean)))) return true;
  for (const lv of [1, 2, 3]) for (const id of s.pyr[lv]) if (id && canBuy(s, p, id)) return true;
  return pl.res.some(id => canBuy(s, p, id));
}
const mustFill = (s, p) => s.ph === "opt" && !s.q.length && s.bag.length > 0 && !anyMandatory(s, p);

/* ================= reglas: comprobar ================= */
function check(s, p, a) {
  if (s.over) return "La partida ha terminado.";
  if (p !== s.turn) return "No es tu turno.";
  if (!a || !a.t) return "Jugada no válida.";
  const pl = s.P[p], head = s.q[0];
  if (head) {
    if (a.t !== head.t) return "Antes tienes que terminar lo que tienes pendiente.";
    if (a.t === "pick") return s.board[a.i] === head.c ? null : `Elige una ficha de ${NAME1[head.c]} del tablero.`;
    if (a.t === "steal") return (a.c && a.c !== "O" && s.P[1 - p].t[a.c] > 0) ? null : "Elige una gema o perla de tu rival.";
    if (a.t === "royal") return s.roys.includes(a.id) ? null : "Esa carta real ya no está.";
    if (a.t === "drop") {
      const d = a.c || {}; let n = 0;
      for (const c of TOK) { const k = d[c] || 0; if (k < 0 || k > pl.t[c] || k !== Math.floor(k)) return "Descarte no válido."; n += k; }
      for (const c in d) if (!TOK.includes(c)) return "Descarte no válido.";
      return n === head.n ? null : `Tienes que devolver exactamente ${head.n} ${head.n === 1 ? "ficha" : "fichas"}.`;
    }
    return "Jugada no válida.";
  }
  if (s.ph !== "opt") return "Jugada no válida.";
  if (a.t === "priv") {
    if (s.filled) return "Los pergaminos se usan antes de reponer el tablero.";
    if (pl.priv < 1) return "No tienes pergaminos.";
    return isGem(s.board[a.i]) ? null : "Con un pergamino coges una gema o perla (no oro).";
  }
  if (a.t === "fill") return s.bag.length ? null : "La bolsa está vacía: no hay nada que reponer.";
  if (mustFill(s, p)) return "No puedes hacer nada: primero tienes que reponer el tablero.";
  if (a.t === "take") return lineOK(s.board, a.cells) ? null : "Coge de 1 a 3 fichas seguidas en línea recta (sin oro ni huecos en medio).";
  if (a.t === "res") {
    if (pl.res.length >= 3) return "Ya tienes 3 cartas reservadas.";
    if (s.board[a.g] !== "O") return "Para reservar coges una ficha de oro del tablero.";
    if (![1, 2, 3].includes(a.lv)) return "Elige una carta.";
    if (a.k === -1) return s.decks[a.lv].length ? null : "Ese mazo está vacío.";
    return s.pyr[a.lv][a.k] ? null : "Elige una carta.";
  }
  if (a.t === "buy") {
    const id = a.from === "r" ? pl.res[a.k] : (s.pyr[a.lv] || [])[a.k];
    if (!id) return "Elige una carta.";
    const cd = card(id);
    if (cd.wild) {
      if (!ownColors(pl).length) return "Esta carta se une a uno de tus colores: primero necesitas una carta de color.";
      if (!ownColors(pl).includes(a.c)) return "Elige a qué color tuyo se une.";
    }
    return price(pl, id).ok ? null : "No tienes fichas suficientes para comprarla.";
  }
  return "Jugada no válida.";
}

/* ================= reglas: aplicar ================= */
function clone(s) {
  return { ...s, board: s.board.slice(), bag: s.bag.slice(), decks: { 1: s.decks[1].slice(), 2: s.decks[2].slice(), 3: s.decks[3].slice() },
    pyr: { 1: s.pyr[1].slice(), 2: s.pyr[2].slice(), 3: s.pyr[3].slice() }, roys: s.roys.slice(), q: s.q.map(x => ({ ...x })),
    P: s.P.map(pl => ({ t: { ...pl.t }, cards: pl.cards.map(x => ({ ...x })), res: pl.res.slice(), roy: pl.roy.slice(), priv: pl.priv })),
    hist: s.hist, wins: s.wins.slice(), last: s.last };
}
function givePriv(s, p) {
  const pl = s.P[p];
  if (pl.priv >= 3) return 0;
  if (s.priv > 0) { s.priv--; pl.priv++; return 1; }
  if (s.P[1 - p].priv > 0) { s.P[1 - p].priv--; pl.priv++; return 2; }
  return 0;
}
function log(s, e) { e.p = e.p ?? s.turn; e.n = s.n; s.last = e; s.hist = s.hist.concat([e]).slice(-60); }
function draw(s, lv, k) { s.pyr[lv][k] = s.decks[lv].length ? s.decks[lv].pop() : null; }

function apply(s0, p, a, opt) {
  const s = clone(s0), pl = s.P[p], o = 1 - p;
  s.n++;
  if (s.q.length) {
    const head = s.q.shift();
    if (a.t === "pick") { s.board[a.i] = null; pl.t[head.c]++; log(s, { t: "pick", c: head.c }); }
    else if (a.t === "steal") { s.P[o].t[a.c]--; pl.t[a.c]++; log(s, { t: "steal", c: a.c }); }
    else if (a.t === "royal") {
      s.roys = s.roys.filter(r => r !== a.id); pl.roy.push(a.id); log(s, { t: "royal", id: a.id });
      ability(s, p, ROYALS[a.id].ab, null, true);
    } else if (a.t === "drop") {
      for (const c of TOK) { const k = a.c[c] || 0; pl.t[c] -= k; for (let i = 0; i < k; i++) s.bag.push(c); }
      log(s, { t: "drop", c: a.c });
      return endTurn(s);
    }
    return flush(s);
  }
  if (a.t === "priv") {
    const c = s.board[a.i]; s.board[a.i] = null; pl.t[c]++; pl.priv--; s.priv++;
    log(s, { t: "priv", c }); return s;
  }
  if (a.t === "fill") {
    const before = s.bag.length; refill(s); s.filled = true; const g = givePriv(s, o);
    log(s, { t: "fill", k: before, g }); return s;
  }
  s.ph = "post";
  if (a.t === "take") {
    const got = a.cells.map(i => s.board[i]);
    a.cells.forEach(i => { s.board[i] = null; });
    got.forEach(c => pl.t[c]++);
    const pearls = got.filter(c => c === "P").length;
    const same = got.length === 3 && got.every(c => c === got[0]);
    const g = same || pearls >= 2 ? givePriv(s, o) : -1;
    log(s, { t: "take", got, g });
  } else if (a.t === "res") {
    s.board[a.g] = null; pl.t.O++;
    let id;
    if (a.k === -1) { id = s.decks[a.lv].pop(); } else { id = s.pyr[a.lv][a.k]; draw(s, a.lv, a.k); }
    pl.res.push(id);
    log(s, { t: "res", lv: a.lv, id: a.k === -1 ? null : id, blind: a.k === -1 });
  } else if (a.t === "buy") {
    let id;
    if (a.from === "r") { id = pl.res[a.k]; pl.res.splice(a.k, 1); } else { id = s.pyr[a.lv][a.k]; draw(s, a.lv, a.k); }
    const cd = card(id), pr = price(pl, id), crBefore = crowns(pl);
    for (const c in pr.pay) { pl.t[c] -= pr.pay[c]; for (let i = 0; i < pr.pay[c]; i++) s.bag.push(c); }
    pl.t.O -= pr.gold; for (let i = 0; i < pr.gold; i++) s.bag.push("O");
    pl.cards.push({ id, c: cd.wild ? a.c : cd.col });
    log(s, { t: "buy", id, c: cd.wild ? a.c : cd.col, from: a.from, pay: pr.pay, gold: pr.gold });
    ability(s, p, cd.ab, cd.wild ? a.c : cd.col, false);
    const crAfter = crowns(pl);
    for (const th of [3, 6]) if (crBefore < th && crAfter >= th && s.roys.length) s.q.push({ t: "royal" });
  }
  return flush(s);
}
/* Habilidades de cartas (y de cartas reales) */
function ability(s, p, ab, col, front) {
  const add = x => front ? s.q.unshift(x) : s.q.push(x);
  if (ab === "turn" || ab === "wildturn") s.extra = true;
  else if (ab === "gem") { if (col && s.board.includes(col)) add({ t: "pick", c: col }); }
  else if (ab === "steal") add({ t: "steal" });
  else if (ab === "priv") { const g = givePriv(s, p); log(s, { t: "gotpriv", g, p }); }
}
/* Resuelve solo lo que no tiene elección; se para cuando el jugador tiene que decidir */
function flush(s) {
  const p = s.turn, pl = s.P[p];
  while (s.q.length) {
    const h = s.q[0];
    if (h.t === "pick") {
      const cells = s.board.map((t, i) => t === h.c ? i : -1).filter(i => i >= 0);
      if (!cells.length) { s.q.shift(); continue; }
      if (cells.length === 1) { s.q.shift(); s.board[cells[0]] = null; pl.t[h.c]++; log(s, { t: "pick", c: h.c }); continue; }
      return s;
    }
    if (h.t === "steal") {
      const opts = ["W", "U", "G", "R", "K", "P"].filter(c => s.P[1 - p].t[c] > 0);
      if (!opts.length) { s.q.shift(); log(s, { t: "steal", c: null }); continue; }
      if (opts.length === 1) { s.q.shift(); s.P[1 - p].t[opts[0]]--; pl.t[opts[0]]++; log(s, { t: "steal", c: opts[0] }); continue; }
      return s;
    }
    if (h.t === "royal") {
      if (!s.roys.length) { s.q.shift(); continue; }
      if (s.roys.length === 1) { const id = s.roys[0]; s.q.shift(); s.roys = []; pl.roy.push(id); log(s, { t: "royal", id }); ability(s, p, ROYALS[id].ab, null, true); continue; }
      return s;
    }
    return s; // drop
  }
  if (s.ph !== "post") return s;
  const w = winReason(pl);
  if (w) { s.over = { win: p, reason: w }; s.wins[p]++; log(s, { t: "win", why: w }); return s; }
  const n = ntok(pl);
  if (n > 10) { s.q.push({ t: "drop", n: n - 10 }); return s; }
  return endTurn(s);
}
function winReason(pl) {
  if (points(pl) >= 20) return "pts";
  if (crowns(pl) >= 10) return "cr";
  const cp = colorPts(pl);
  if (GEMS.some(c => cp[c] >= 10)) return "col";
  return null;
}
function endTurn(s) {
  const again = s.extra;
  if (!again) s.turn = 1 - s.turn;
  s.ph = "opt"; s.filled = false; s.extra = false;
  if (again) log(s, { t: "again" });
  return s;
}

/* ================= texto de lo que ha pasado ================= */
function listTok(arr) {
  const cnt = {}; arr.forEach(c => { cnt[c] = (cnt[c] || 0) + 1; });
  return Object.keys(cnt).map(c => cnt[c] === 1 ? `1 ${NAME1[c]}` : `${cnt[c]} ${NAME[c]}`).join(", ");
}
function cardName(id) {
  const cd = card(id);
  return cd.wild ? `una carta comodín de nivel ${cd.lv}` : cd.col ? `una carta de ${NAME1[cd.col]} de nivel ${cd.lv}` : `una carta de prestigio de nivel ${cd.lv}`;
}
function describe(e, who, you) {
  const v = (a, b) => you ? a : b;
  switch (e.t) {
    case "priv": return `${who} ${v("usas", "usa")} un pergamino y ${v("coges", "coge")} 1 ${NAME1[e.c]}`;
    case "fill": return `${who} ${v("repones", "repone")} el tablero` + (e.g ? (you ? " (tu rival gana un pergamino)" : " y tú ganas un pergamino") : "");
    case "take": return `${who} ${v("coges", "coge")} ${listTok(e.got)}` + (e.g >= 0 ? (e.g ? (you ? " (tu rival gana un pergamino)" : " y tú ganas un pergamino") : "") : "");
    case "res": return `${who} ${v("reservas", "reserva")} ${e.blind ? `una carta oculta del mazo ${e.lv}` : cardName(e.id)} y ${v("coges", "coge")} 1 oro`;
    case "buy": return `${who} ${v("compras", "compra")} ${cardName(e.id)}${e.from === "r" ? " reservada" : ""}`;
    case "pick": return `${who} ${v("ganas", "gana")} 1 ${NAME1[e.c]} del tablero`;
    case "steal": return e.c ? `${who} le ${v("quitas", "quita")} 1 ${NAME1[e.c]} ${v("a tu rival", "a su rival")}` : `${who} no ${v("puedes", "puede")} quitar nada`;
    case "royal": return `${who} ${v("consigues", "consigue")} una carta real (${ROYALS[e.id].pts} puntos)`;
    case "gotpriv": return `${who} ${v("ganas", "gana")} un pergamino`;
    case "drop": return `${who} ${v("devuelves", "devuelve")} ${listTok(Object.keys(e.c).flatMap(c => Array(e.c[c]).fill(c)))} a la bolsa`;
    case "again": return `${who} ${v("vuelves", "vuelve")} a jugar`;
    case "win": return `${who} ${v("ganas", "gana")} la partida`;
  }
  return "";
}

/* ================= la máquina ================= */
const AB_VAL = { turn: 7, wildturn: 7, gem: 2.5, steal: 3, priv: 2.5, wild: 0 };
function cardVal(pl, id) {
  const cd = card(id), cr = crowns(pl), cp = colorPts(pl), pts = points(pl);
  let v = cd.pts * 4 + cd.bon * 5 + cd.cr * 3 + (AB_VAL[cd.ab] || 0);
  if (cd.cr && ((cr < 3 && cr + cd.cr >= 3) || (cr < 6 && cr + cd.cr >= 6))) v += 9;
  if (cr + cd.cr >= 10) v += 200;
  if (pts + cd.pts >= 20) v += 200;
  const cols = cd.wild ? ownColors(pl) : cd.col ? [cd.col] : [];
  if (cols.length && cd.pts) { const best = Math.max(...cols.map(c => cp[c])); v += best * cd.pts * 0.6; if (best + cd.pts >= 10) v += 200; }
  return v;
}
/* Cuánto le falta a un jugador para pagar una carta (en fichas) */
function deficit(pl, id) {
  const cd = card(id), b = bonus(pl); let need = 0;
  for (const c of ["W", "U", "G", "R", "K", "P"]) need += Math.max(0, (cd.cost[c] || 0) - (b[c] || 0) - pl.t[c]);
  if (cd.wild && !ownColors(pl).length) need += 2;
  return Math.max(0, need - pl.t.O);
}
function playerVal(s, q, hideRes, skip) {
  const pl = s.P[q], pts = points(pl), cr = crowns(pl), cp = colorPts(pl), mc = Math.max(...GEMS.map(c => cp[c]));
  const prog = Math.max(pts / 20, cr / 10, mc / 10);
  let v = 90 * prog * prog + 14 * (pts / 20 + cr / 10 + mc / 10);
  const b = bonus(pl);
  for (const c of GEMS) v += Math.min(b[c], 4) * 7 + Math.max(0, b[c] - 4) * 2.5;
  const nt = ntok(pl);
  v += (pl.t.W + pl.t.U + pl.t.G + pl.t.R + pl.t.K) * 1.1 + pl.t.P * 1.7 + pl.t.O * 1.9 - Math.max(0, nt - 8) * 0.8;
  v += pl.priv * 2.2;
  let pot = 0;
  const cand = [];
  for (const lv of [1, 2, 3]) for (const id of s.pyr[lv]) if (id) cand.push(id);
  if (!hideRes) for (const id of pl.res) { if (id === skip) v += 3; else cand.push(id); } else v += pl.res.length * 3;
  for (const id of cand) { const d = deficit(pl, id); const cv = cardVal(pl, id) / (1 + d * 0.9); if (cv > pot) pot = cv; }
  v += pot * 0.55;
  return v;
}
function evalFor(s, p, blind) {
  if (s.over) return s.over.win === p ? 1e6 : -1e6;
  let v = playerVal(s, p, false, blind) - playerVal(s, 1 - p, true);
  if (s.turn === p && !s.over) v += 6; // turno extra
  return v;
}
/* Decisiones pendientes de la máquina (elegir ficha, robo, carta real, descarte) */
function resolvePending(s, p) {
  let guard = 0;
  while (!s.over && s.turn === p && s.q.length && guard++ < 20) {
    const h = s.q[0];
    let best = null, bv = -Infinity;
    const opts = pendingOptions(s, p);
    if (h.t === "drop") { s = apply(s, p, dropChoice(s, p, h.n)); continue; }
    for (const a of opts) { const ns = apply(s, p, a); const v = evalFor(ns, p); if (v > bv) { bv = v; best = ns; } }
    if (!best) break;
    s = best;
  }
  return s;
}
function pendingOptions(s, p) {
  const h = s.q[0]; if (!h) return [];
  if (h.t === "pick") return s.board.map((t, i) => t === h.c ? { t: "pick", i } : null).filter(Boolean).slice(0, 1);
  if (h.t === "steal") return ["W", "U", "G", "R", "K", "P"].filter(c => s.P[1 - p].t[c] > 0).map(c => ({ t: "steal", c }));
  if (h.t === "royal") return s.roys.map(id => ({ t: "royal", id }));
  return [];
}
function dropChoice(s, p, n) {
  const pl = s.P[p], have = { ...pl.t }, d = {};
  for (let k = 0; k < n; k++) {
    let bc = null, bv = -Infinity;
    for (const c of TOK) {
      if (have[c] <= 0) continue;
      const t = clone(s); t.P[p].t = { ...have }; t.P[p].t[c]--;
      const v = playerVal(t, p, false);
      if (v > bv) { bv = v; bc = c; }
    }
    have[bc]--; d[bc] = (d[bc] || 0) + 1;
  }
  return { t: "drop", c: d };
}
/* Todas las jugadas obligatorias posibles */
function mandatoryMoves(s, p) {
  const out = [], pl = s.P[p], seen = new Set();
  for (let i = 0; i < 25; i++) {
    if (!isGem(s.board[i])) continue;
    const r = Math.floor(i / 5), c = i % 5;
    const k1 = s.board[i]; if (!seen.has(k1)) { seen.add(k1); out.push({ t: "take", cells: [i] }); }
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const cells = [i];
      for (let k = 1; k < 3; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr > 4 || cc < 0 || cc > 4 || !isGem(s.board[rr * 5 + cc])) break;
        cells.push(rr * 5 + cc);
        const key = cells.map(j => s.board[j]).sort().join("");
        if (!seen.has(key)) { seen.add(key); out.push({ t: "take", cells: cells.slice() }); }
      }
    }
  }
  for (const lv of [1, 2, 3]) s.pyr[lv].forEach((id, k) => { if (id) buyMoves(s, p, { t: "buy", from: "p", lv, k }, id, out); });
  pl.res.forEach((id, k) => buyMoves(s, p, { t: "buy", from: "r", k }, id, out));
  const g = s.board.indexOf("O");
  if (g >= 0 && pl.res.length < 3) {
    for (const lv of [1, 2, 3]) {
      s.pyr[lv].forEach((id, k) => { if (id) out.push({ t: "res", g, lv, k }); });
      if (s.decks[lv].length) out.push({ t: "res", g, lv, k: -1 });
    }
  }
  return out;
}
function buyMoves(s, p, base, id, out) {
  if (!canBuy(s, p, id)) return;
  if (card(id).wild) for (const c of ownColors(s.P[p])) out.push({ ...base, c });
  else out.push(base);
}
/* Un turno completo: opcionales + obligatoria + pendientes. Devuelve [{acts, s}] */
function plans(s, p, wide) {
  const starts = [{ acts: [], s }];
  if (wide && s.P[p].priv > 0 && !s.filled) {
    const cols = {};
    s.board.forEach((t, i) => { if (isGem(t) && cols[t] === undefined) cols[t] = i; });
    for (const c in cols) {
      const a = { t: "priv", i: cols[c] }, s1 = apply(s, p, a);
      starts.push({ acts: [a], s: s1 });
      if (s1.P[p].priv > 0) for (const c2 in cols) {
        if (c2 < c) continue;
        const i2 = s1.board.indexOf(c2); if (i2 < 0) continue;
        const a2 = { t: "priv", i: i2 }; starts.push({ acts: [a, a2], s: apply(s1, p, a2) });
      }
    }
  }
  const res = [];
  for (const st of starts) {
    const variants = [];
    if (mustFill(st.s, p)) variants.push({ acts: st.acts.concat([{ t: "fill" }]), s: apply(st.s, p, { t: "fill" }) });
    else {
      variants.push(st);
      if (wide && st.s.bag.length >= 4 && !st.s.filled) variants.push({ acts: st.acts.concat([{ t: "fill" }]), s: apply(st.s, p, { t: "fill" }) });
    }
    for (const vt of variants) {
      for (const m of mandatoryMoves(vt.s, p)) {
        const ns = resolvePending(apply(vt.s, p, m), p);
        res.push({ acts: vt.acts.concat([m]), s: ns, blind: m.t === "res" && m.k === -1 ? ns.P[p].res[ns.P[p].res.length - 1] : null });
      }
    }
  }
  return res;
}
function bestPlan(s, p, level, rng) {
  const R = rng || Math.random;
  const ps = plans(s, p, level >= 2);
  if (!ps.length) return null;
  for (const x of ps) x.v = evalFor(x.s, p, x.blind) + (x.blind != null ? 2 : 0);
  ps.sort((a, b) => b.v - a.v);
  if (level <= 1) {
    if (ps[0].v > 5e5) return ps[0];
    const top = ps.slice(0, Math.max(3, Math.ceil(ps.length * 0.35)));
    return top[Math.floor(R() * top.length)];
  }
  if (level === 2 || ps[0].v > 5e5) return ps[0];
  /* nivel 3: mira la mejor respuesta del rival */
  const top = ps.slice(0, 8);
  let best = top[0], bv = -Infinity;
  for (const x of top) {
    let v = x.v;
    if (!x.s.over && x.s.turn !== p) {
      const rp = plans(x.s, 1 - p, false);
      let worst = Infinity;
      for (const y of rp) { const yv = evalFor(y.s, p); if (yv < worst) worst = yv; }
      if (rp.length) v = worst * 0.7 + x.v * 0.3;
    }
    if (v > bv) { bv = v; best = x; }
  }
  return best;
}
/* Siguiente acción suelta de la máquina (para jugar paso a paso con animación) */
function nextAI(s, p) {
  if (s.q.length) {
    const h = s.q[0];
    if (h.t === "drop") return dropChoice(s, p, h.n);
    let best = null, bv = -Infinity;
    for (const a of pendingOptions(s, p)) { const v = evalFor(apply(s, p, a), p); if (v > bv) { bv = v; best = a; } }
    return best;
  }
  return null;
}

const api = { GEMS, TOK, NAME, NAME1, CARDS, ROYALS, PYR, SPIRAL, newGame, rematch, check, apply, describe, card, bonus, points, crowns, colorPts, ownColors,
  price, canBuy, lineOK, mustFill, anyMandatory, ntok, bestPlan, nextAI, mandatoryMoves, mix, winReason, evalFor };
if (typeof module !== "undefined" && module.exports) module.exports = api;
else root.Gemas = api;
})(typeof window !== "undefined" ? window : globalThis);
