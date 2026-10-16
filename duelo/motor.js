/* Duelo de Maravillas: motor de reglas (sin interfaz).
   Funciona igual en el navegador (window.Motor) y en Node (module.exports). */
(function (root) {
"use strict";

/* ================= datos ================= */
const RES = ["W", "C", "S", "G", "P"];
const RAW = ["W", "C", "S"];
/* coste: letras = recursos, número = monedas. k("SSG", 2) -> {S:2, G:1, c:2} */
function k(res, coins) { const o = {}; for (const r of res || "") o[r] = (o[r] || 0) + 1; if (coins) o.c = coins; return o; }

const CARD_LIST = [
  /* ---------- Era I ---------- */
  ["lenera", "Leñera", 1, "brown", k(""), { prod: { W: 1 } }],
  ["campamento", "Campamento maderero", 1, "brown", k("", 1), { prod: { W: 1 } }],
  ["charca", "Charca de barro", 1, "brown", k(""), { prod: { C: 1 } }],
  ["barrero", "Barrero", 1, "brown", k("", 1), { prod: { C: 1 } }],
  ["cantera", "Cantera", 1, "brown", k(""), { prod: { S: 1 } }],
  ["pedrera", "Pedrera", 1, "brown", k("", 1), { prod: { S: 1 } }],
  ["vidrieria", "Vidriería", 1, "grey", k("", 1), { prod: { G: 1 } }],
  ["prensa", "Prensa", 1, "grey", k("", 1), { prod: { P: 1 } }],
  ["teatro", "Teatro", 1, "blue", k(""), { vp: 3 }],
  ["altar", "Altar", 1, "blue", k(""), { vp: 3 }],
  ["termas", "Termas", 1, "blue", k("S"), { vp: 3 }],
  ["botica", "Botica", 1, "green", k("G"), { sci: "rueda", vp: 1 }],
  ["taller", "Taller", 1, "green", k("P"), { sci: "plomada", vp: 1 }],
  ["escriptorio", "Escriptorio", 1, "green", k("", 2), { sci: "pluma" }],
  ["herbolario", "Herbolario", 1, "green", k("", 2), { sci: "mortero" }],
  ["establo", "Establo", 1, "red", k("W"), { sh: 1 }],
  ["guarnicion", "Guarnición", 1, "red", k("C"), { sh: 1 }],
  ["empalizada", "Empalizada", 1, "red", k("", 2), { sh: 1 }],
  ["atalaya", "Atalaya", 1, "red", k(""), { sh: 1 }],
  ["taberna", "Taberna", 1, "yellow", k(""), { gain: 4 }],
  ["alm_piedra", "Almacén de piedra", 1, "yellow", k("", 3), { trade: ["S"] }],
  ["alm_arcilla", "Almacén de arcilla", 1, "yellow", k("", 3), { trade: ["C"] }],
  ["alm_madera", "Almacén de madera", 1, "yellow", k("", 3), { trade: ["W"] }],
  /* ---------- Era II ---------- */
  ["serreria", "Serrería", 2, "brown", k("", 2), { prod: { W: 2 } }],
  ["tejar", "Tejar", 2, "brown", k("", 2), { prod: { C: 2 } }],
  ["cantera_honda", "Cantera honda", 2, "brown", k("", 2), { prod: { S: 2 } }],
  ["soplador", "Soplador de vidrio", 2, "grey", k(""), { prod: { G: 1 } }],
  ["secadero", "Secadero", 2, "grey", k(""), { prod: { P: 1 } }],
  ["juzgado", "Juzgado", 2, "blue", k("WWG"), { vp: 5 }],
  ["estatua", "Estatua", 2, "blue", k("CC"), { vp: 4, free: "teatro" }],
  ["templo", "Templo", 2, "blue", k("WP"), { vp: 4, free: "altar" }],
  ["acueducto", "Acueducto", 2, "blue", k("SSS"), { vp: 5, free: "termas" }],
  ["tribuna", "Tribuna", 2, "blue", k("SW"), { vp: 4 }],
  ["biblioteca", "Biblioteca", 2, "green", k("SWG"), { sci: "pluma", vp: 2, free: "escriptorio" }],
  ["dispensario", "Dispensario", 2, "green", k("CCS"), { sci: "mortero", vp: 2, free: "herbolario" }],
  ["escuela", "Escuela", 2, "green", k("WPP"), { sci: "rueda", vp: 1 }],
  ["laboratorio", "Laboratorio", 2, "green", k("WGG"), { sci: "plomada", vp: 1 }],
  ["yeguada", "Yeguada", 2, "red", k("CW"), { sh: 1, free: "establo" }],
  ["cuartel", "Cuartel", 2, "red", k("", 3), { sh: 1, free: "guarnicion" }],
  ["campo_tiro", "Campo de tiro", 2, "red", k("SWP"), { sh: 2 }],
  ["plaza_armas", "Plaza de armas", 2, "red", k("CCG"), { sh: 2 }],
  ["murallas", "Murallas", 2, "red", k("SS"), { sh: 2 }],
  ["foro", "Foro", 2, "yellow", k("C", 3), { choice: ["G", "P"] }],
  ["caravasar", "Caravasar", 2, "yellow", k("GP", 2), { choice: ["W", "C", "S"] }],
  ["aduana", "Aduana", 2, "yellow", k("", 4), { trade: ["G", "P"] }],
  ["cerveceria", "Cervecería", 2, "yellow", k(""), { gain: 6 }],
  /* ---------- Era III ---------- */
  ["palacio", "Palacio", 3, "blue", k("CSWGG"), { vp: 7 }],
  ["ayuntamiento", "Ayuntamiento", 3, "blue", k("SSSWW"), { vp: 7 }],
  ["obelisco", "Obelisco", 3, "blue", k("SSG"), { vp: 5 }],
  ["jardines", "Jardines", 3, "blue", k("CCWW"), { vp: 6, free: "estatua" }],
  ["panteon", "Panteón", 3, "blue", k("CWPP"), { vp: 6, free: "templo" }],
  ["senado", "Senado", 3, "blue", k("CCSP"), { vp: 5, free: "tribuna" }],
  ["academia", "Academia", 3, "green", k("SWGG"), { sci: "sol", vp: 3 }],
  ["estudio", "Estudio", 3, "green", k("WWGP"), { sci: "sol", vp: 3 }],
  ["universidad", "Universidad", 3, "green", k("CGP"), { sci: "globo", vp: 2, free: "escuela" }],
  ["observatorio", "Observatorio", 3, "green", k("SPP"), { sci: "globo", vp: 2, free: "laboratorio" }],
  ["arsenal", "Arsenal", 3, "red", k("CCCWW"), { sh: 3 }],
  ["pretorio", "Pretorio", 3, "red", k("", 8), { sh: 3 }],
  ["fortificaciones", "Fortificaciones", 3, "red", k("SSCP"), { sh: 2, free: "empalizada" }],
  ["taller_asedio", "Taller de asedio", 3, "red", k("WWWG"), { sh: 2, free: "campo_tiro" }],
  ["circo", "Circo", 3, "red", k("CCSS"), { sh: 2, free: "plaza_armas" }],
  ["camara", "Cámara de comercio", 3, "yellow", k("PP"), { vp: 3, per: { of: "grey", c: 3 } }],
  ["puerto", "Puerto", 3, "yellow", k("WGP"), { vp: 3, per: { of: "brown", c: 2 } }],
  ["armeria", "Armería", 3, "yellow", k("SSG"), { vp: 3, per: { of: "red", c: 1 } }],
  ["faro", "Faro", 3, "yellow", k("CCG"), { vp: 3, per: { of: "yellow", c: 1 }, free: "taberna" }],
  ["arena", "Arena", 3, "yellow", k("CSW"), { vp: 3, per: { of: "wonder", c: 2 }, free: "cerveceria" }],
  /* ---------- Gremios (Era III) ---------- */
  ["g_mercaderes", "Gremio de mercaderes", 3, "purple", k("CWGP"), { guild: { of: ["yellow"], c: 1, vp: 1 } }],
  ["g_armadores", "Gremio de armadores", 3, "purple", k("CSGP"), { guild: { of: ["brown", "grey"], c: 1, vp: 1 } }],
  ["g_constructores", "Gremio de constructores", 3, "purple", k("SSCWG"), { guild: { of: ["wonder"], c: 0, vp: 2 } }],
  ["g_magistrados", "Gremio de magistrados", 3, "purple", k("WWCP"), { guild: { of: ["blue"], c: 1, vp: 1 } }],
  ["g_sabios", "Gremio de sabios", 3, "purple", k("CCWW"), { guild: { of: ["green"], c: 1, vp: 1 } }],
  ["g_prestamistas", "Gremio de prestamistas", 3, "purple", k("SSWW"), { guild: { of: ["coins"], c: 0, vp: 1 } }],
  ["g_estrategas", "Gremio de estrategas", 3, "purple", k("SSCP"), { guild: { of: ["red"], c: 1, vp: 1 } }]
];
const CARDS = {};
CARD_LIST.forEach(([id, n, age, col, cost, more]) => { CARDS[id] = { id, n, age, col, cost, ...more }; });
for (const c of Object.values(CARDS)) if (c.free) CARDS[c.free].chainTo = c.id;

const WONDERS = {
  via_apia: { id: "via_apia", n: "Vía Apia", e: "🛣️", cost: k("SSCCP"), vp: 3, gain: 3, steal: 3, replay: true },
  circo_maximo: { id: "circo_maximo", n: "Circo Máximo", e: "🏟️", cost: k("SSWG"), vp: 3, sh: 1, destroy: "grey" },
  coloso: { id: "coloso", n: "Coloso", e: "🗿", cost: k("CCCG"), vp: 3, sh: 2 },
  gran_biblioteca: { id: "gran_biblioteca", n: "Gran Biblioteca", e: "📚", cost: k("WWWGP"), vp: 4, library: true },
  faro_alejandria: { id: "faro_alejandria", n: "Faro de Alejandría", e: "🗼", cost: k("WSPP"), vp: 4, choice: ["W", "C", "S"] },
  jardines_colgantes: { id: "jardines_colgantes", n: "Jardines Colgantes", e: "🌿", cost: k("WWGP"), vp: 3, gain: 6, replay: true },
  mausoleo: { id: "mausoleo", n: "Mausoleo", e: "⚱️", cost: k("CCGGP"), vp: 2, mausoleo: true },
  pireo: { id: "pireo", n: "El Pireo", e: "⚓", cost: k("WWSC"), vp: 2, choice: ["G", "P"], replay: true },
  piramides: { id: "piramides", n: "Pirámides", e: "🔺", cost: k("SSSP"), vp: 9 },
  esfinge: { id: "esfinge", n: "Esfinge", e: "🦁", cost: k("SCGG"), vp: 6, replay: true },
  zeus: { id: "zeus", n: "Estatua de Zeus", e: "⚡", cost: k("SSWCP"), vp: 3, sh: 1, destroy: "brown" },
  artemisa: { id: "artemisa", n: "Templo de Artemisa", e: "🏹", cost: k("WSGP"), vp: 0, gain: 12, replay: true }
};

const TOKENS = {
  agricultura: { id: "agricultura", n: "Agricultura", e: "🌾", d: "Ganas 6 monedas al momento y 4 puntos al final." },
  arquitectura: { id: "arquitectura", n: "Arquitectura", e: "🏛️", d: "Tus próximas maravillas cuestan 2 recursos menos." },
  economia: { id: "economia", n: "Economía", e: "💰", d: "Las monedas que tu rival gaste en comprar recursos son para ti." },
  ley: { id: "ley", n: "Ley", e: "⚖️", d: "Cuenta como un símbolo científico más (la balanza)." },
  albanileria: { id: "albanileria", n: "Albañilería", e: "🔨", d: "Tus próximos edificios civiles (azules) cuestan 2 recursos menos." },
  matematicas: { id: "matematicas", n: "Matemáticas", e: "➗", d: "Al final, 3 puntos por cada ficha de progreso que tengas (esta incluida)." },
  filosofia: { id: "filosofia", n: "Filosofía", e: "🦉", d: "7 puntos al final." },
  estrategia: { id: "estrategia", n: "Estrategia", e: "⚔️", d: "Tus próximos edificios militares (rojos) dan 1 escudo más." },
  teologia: { id: "teologia", n: "Teología", e: "🕊️", d: "Todas tus próximas maravillas te dan un turno extra." },
  urbanismo: { id: "urbanismo", n: "Urbanismo", e: "🏘️", d: "Ganas 6 monedas al momento y 4 más cada vez que construyas gratis por encadenamiento." }
};

const SCI = { rueda: "🛞", plomada: "📐", pluma: "🪶", mortero: "⚗️", sol: "☀️", globo: "🌐", ley: "⚖️" };
const SCI_N = { rueda: "Rueda", plomada: "Plomada", pluma: "Pluma", mortero: "Mortero", sol: "Reloj de sol", globo: "Globo", ley: "Balanza" };

/* disposición de cada era: [cartas de la fila, boca arriba, posiciones x (medias cartas)] */
const xs = n => Array.from({ length: n }, (_, i) => 2 * i - (n - 1));
const LAYOUT = {
  1: [[xs(2), 1], [xs(3), 0], [xs(4), 1], [xs(5), 0], [xs(6), 1]],
  2: [[xs(6), 1], [xs(5), 0], [xs(4), 1], [xs(3), 0], [xs(2), 1]],
  3: [[xs(2), 1], [xs(3), 0], [xs(4), 1], [[-2, 2], 0], [xs(4), 1], [xs(3), 0], [xs(2), 1]]
};

/* ================= utilidades ================= */
const clone = o => JSON.parse(JSON.stringify(o));
function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const err = m => { const e = new Error(m); e.rule = true; return e; };

/* ================= partida nueva ================= */
function newGame(first, rng) {
  rng = rng || Math.random;
  first = first === 1 ? 1 : 0;
  const toks = shuffle(Object.keys(TOKENS), rng), wons = shuffle(Object.keys(WONDERS), rng).slice(0, 8);
  const o = 1 - first;
  return {
    v: 1, phase: "draft", age: 0, first, cur: first, turn: 0,
    draft: { pool: wons.slice(0, 4), rest: wons.slice(4), step: 0, order: [first, o, o, first, o, first, first, o] },
    tokens: toks.slice(0, 5), box: toks.slice(5),
    slots: [], discard: [], pawn: 0, loot: { a2: true, a5: true, b2: true, b5: true },
    P: [0, 1].map(() => ({ coins: 7, cards: [], wonders: [], tokens: [] })),
    pending: [], replay: false, open: false, winner: null, log: [], last: null
  };
}

function deal(s, age, rng) {
  rng = rng || Math.random;
  let deck = shuffle(Object.values(CARDS).filter(c => c.age === age && c.col !== "purple").map(c => c.id), rng);
  if (age === 3) deck = shuffle(deck.slice(0, 17).concat(shuffle(Object.values(CARDS).filter(c => c.col === "purple").map(c => c.id), rng).slice(0, 3)), rng);
  else deck = deck.slice(0, 20);
  s.age = age; s.slots = [];
  LAYOUT[age].forEach(([row, up], r) => row.forEach(x => s.slots.push({ c: deck[s.slots.length], r, x, up: !!up, gone: false })));
}

/* ================= consultas ================= */
function accessible(s, i) {
  const t = s.slots[i];
  if (!t || t.gone) return false;
  return !s.slots.some(o => !o.gone && o.r === t.r + 1 && Math.abs(o.x - t.x) === 1);
}
const count = (p, col) => p.cards.filter(id => CARDS[id].col === col).length;
const builtWonders = p => p.wonders.filter(w => w.built).length;
const hasTok = (p, id) => p.tokens.includes(id);
function countOf(s, pi, of) {
  const p = s.P[pi];
  if (of === "wonder") return builtWonders(p);
  if (of === "coins") return p.coins;
  return count(p, of);
}
/* producción fija: solo cartas marrones y grises */
function prod(p) {
  const o = { W: 0, C: 0, S: 0, G: 0, P: 0 };
  p.cards.forEach(id => { const c = CARDS[id]; if (c.prod) for (const r in c.prod) o[r] += c.prod[r]; });
  return o;
}
function choices(p) {
  const out = [];
  p.cards.forEach(id => { if (CARDS[id].choice) out.push(CARDS[id].choice); });
  p.wonders.forEach(w => { if (w.built && WONDERS[w.id].choice) out.push(WONDERS[w.id].choice); });
  return out;
}
function tradePrice(s, pi, r) {
  const p = s.P[pi];
  if (p.cards.some(id => (CARDS[id].trade || []).includes(r))) return 1;
  return 2 + prod(s.P[1 - pi])[r];
}

/* precio mínimo en monedas de un coste, probando todas las elecciones de recursos variables */
function quote(s, pi, cost, discount) {
  const p = s.P[pi], have = prod(p), ch = choices(p);
  const need = {}; RES.forEach(r => { need[r] = Math.max(0, (cost[r] || 0) - have[r]); });
  const price = {}; RES.forEach(r => { price[r] = tradePrice(s, pi, r); });
  let best = null;
  const rec = (i, nd) => {
    if (i === ch.length) {
      const units = [];
      RES.forEach(r => { for (let j = 0; j < nd[r]; j++) units.push({ r, p: price[r] }); });
      units.sort((a, b) => b.p - a.p);
      const buy = units.slice(discount || 0), tot = buy.reduce((a, u) => a + u.p, 0);
      if (!best || tot < best.trade) best = { trade: tot, buy };
      return;
    }
    rec(i + 1, nd);
    ch[i].forEach(r => { if (nd[r] > 0) { nd[r]--; rec(i + 1, nd); nd[r]++; } });
  };
  rec(0, need);
  const coins = cost.c || 0;
  return { coins, trade: best.trade, total: coins + best.trade, buy: best.buy.map(u => u.r), price, chain: false };
}
function cardPrice(s, pi, id) {
  const p = s.P[pi], c = CARDS[id];
  if (c.free && p.cards.includes(c.free)) return { coins: 0, trade: 0, total: 0, buy: [], chain: true, ok: true };
  const q = quote(s, pi, c.cost, c.col === "blue" && hasTok(p, "albanileria") ? 2 : 0);
  q.ok = p.coins >= q.total;
  return q;
}
function wonderPrice(s, pi, wid) {
  const p = s.P[pi];
  const q = quote(s, pi, WONDERS[wid].cost, hasTok(p, "arquitectura") ? 2 : 0);
  q.ok = p.coins >= q.total;
  return q;
}
const wondersLeft = s => 7 - builtWonders(s.P[0]) - builtWonders(s.P[1]);
const discardGain = (s, pi) => 2 + count(s.P[pi], "yellow");
function sciSymbols(p) {
  const o = {};
  p.cards.forEach(id => { const c = CARDS[id]; if (c.sci) o[c.sci] = (o[c.sci] || 0) + 1; });
  if (hasTok(p, "ley")) o.ley = (o.ley || 0) + 1;
  return o;
}
function actor(s) {
  if (s.phase === "end") return null;
  if (s.phase === "draft") return s.draft.order[s.draft.step];
  if (s.pending.length) return s.pending[0].who;
  return s.cur;
}

/* ================= puntos ================= */
function militaryVP(pawn, pi) {
  const d = pi === 0 ? pawn : -pawn;
  if (d <= 0) return 0;
  return d >= 6 ? 10 : d >= 3 ? 5 : 2;
}
function score(s, pi) {
  const p = s.P[pi], o = { blue: 0, green: 0, yellow: 0, purple: 0, wonders: 0, tokens: 0, coins: 0, military: 0 };
  p.cards.forEach(id => {
    const c = CARDS[id];
    if (c.col === "purple") {
      const g = c.guild, n = Math.max(...[0, 1].map(i => g.of.reduce((a, of) => a + countOf(s, i, of), 0)));
      o.purple += g.of[0] === "coins" ? Math.floor(n / 3) : n * g.vp;
    } else if (c.vp && o[c.col] !== undefined) o[c.col] += c.vp;
  });
  p.wonders.forEach(w => { if (w.built) o.wonders += WONDERS[w.id].vp; });
  if (hasTok(p, "agricultura")) o.tokens += 4;
  if (hasTok(p, "filosofia")) o.tokens += 7;
  if (hasTok(p, "matematicas")) o.tokens += 3 * p.tokens.length;
  o.coins = Math.floor(p.coins / 3);
  o.military = militaryVP(s.pawn, pi);
  o.total = Object.values(o).reduce((a, b) => a + b, 0);
  return o;
}

/* ================= efectos ================= */
function log(s, p, m) { s.log.push({ p, m }); if (s.log.length > 40) s.log.shift(); }
function win(s, who, how) { if (!s.winner) s.winner = { who, how }; }

function military(s, pi, n) {
  if (!n) return;
  s.pawn = Math.max(-9, Math.min(9, s.pawn + (pi === 0 ? n : -n)));
  const L = s.loot, hit = (key, victim, amt) => {
    if (!L[key]) return; L[key] = false;
    const v = s.P[victim], lost = Math.min(v.coins, amt); v.coins -= lost;
    log(s, victim, `pierde ${lost} 🪙 por el avance militar`);
  };
  if (s.pawn >= 3) hit("a2", 1, 2);
  if (s.pawn >= 6) hit("a5", 1, 5);
  if (s.pawn <= -3) hit("b2", 0, 2);
  if (s.pawn <= -6) hit("b5", 0, 5);
  if (Math.abs(s.pawn) >= 9) win(s, s.pawn > 0 ? 0 : 1, "military");
}
function checkScience(s, pi) {
  if (Object.keys(sciSymbols(s.P[pi])).length >= 6) win(s, pi, "science");
}
function gainToken(s, pi, id) {
  const p = s.P[pi];
  p.tokens.push(id);
  if (id === "agricultura" || id === "urbanismo") p.coins += 6;
  log(s, pi, `consigue la ficha ${TOKENS[id].e} ${TOKENS[id].n}`);
  if (id === "ley") checkScience(s, pi);
}
function placeCard(s, pi, id, viaChain) {
  const p = s.P[pi], c = CARDS[id];
  p.cards.push(id);
  if (viaChain && hasTok(p, "urbanismo")) p.coins += 4;
  if (c.gain) p.coins += c.gain;
  if (c.per) p.coins += c.per.c * countOf(s, pi, c.per.of);
  if (c.guild && c.guild.c) p.coins += c.guild.c * Math.max(...[0, 1].map(i => c.guild.of.reduce((a, of) => a + countOf(s, i, of), 0)));
  if (c.sh) military(s, pi, c.sh + (hasTok(p, "estrategia") ? 1 : 0));
  if (c.sci) {
    if (sciSymbols(p)[c.sci] === 2 && s.tokens.length) s.pending.push({ t: "sci", who: pi });
    checkScience(s, pi);
  }
}
function pay(s, pi, q) {
  const p = s.P[pi], o = s.P[1 - pi];
  p.coins -= q.total;
  if (q.trade && hasTok(o, "economia")) o.coins += q.trade;
}
function take(s, i) {
  s.slots[i].gone = true;
  s.slots.forEach((t, j) => { if (!t.gone && !t.up && accessible(s, j)) t.up = true; });
}

/* ================= turnos ================= */
function pendingValid(s, x) {
  const o = s.P[1 - x.who];
  if (x.t === "sci") return s.tokens.length > 0;
  if (x.t === "destroy") return o.cards.some(id => CARDS[id].col === x.col);
  if (x.t === "mau") return s.discard.length > 0;
  if (x.t === "lib") return x.opts && x.opts.length > 0;
  return true;
}
function settle(s, rng) {
  if (s.winner) { s.phase = "end"; s.pending = []; return; }
  if (s.phase === "draft") {
    const d = s.draft;
    if (d.pool.length === 1) { s.P[d.order[d.step]].wonders.push({ id: d.pool[0], built: false }); d.pool = []; d.step++; }
    if (!d.pool.length && d.rest.length) { d.pool = d.rest; d.rest = []; }
    if (d.step >= 8) { s.phase = "age"; deal(s, 1, rng); s.cur = s.first; log(s, null, "Empieza la Era I"); }
    return;
  }
  while (s.pending.length && !pendingValid(s, s.pending[0])) s.pending.shift();
  if (s.pending.length || !s.open) return;
  s.open = false;
  if (s.slots.every(t => t.gone)) return endAge(s);
  if (!s.replay) s.cur = 1 - s.cur;
  else log(s, s.cur, "juega otro turno");
  s.replay = false;
}
function endAge(s) {
  s.replay = false;
  if (s.age === 3) {
    const a = score(s, 0), b = score(s, 1);
    const who = a.total !== b.total ? (a.total > b.total ? 0 : 1) : a.blue !== b.blue ? (a.blue > b.blue ? 0 : 1) : -1;
    s.winner = { who, how: "civil" }; s.phase = "end";
    return;
  }
  const who = s.pawn > 0 ? 1 : s.pawn < 0 ? 0 : s.cur;
  s.pending.push({ t: "start", who });
}

/* acción del jugador pi; devuelve un estado nuevo o lanza un error con el motivo */
function act(state, pi, a, rng) {
  rng = rng || Math.random;
  const s = clone(state);
  if (s.phase === "end") throw err("La partida ha terminado.");
  if (actor(s) !== pi) throw err("No es tu turno.");
  const p = s.P[pi], o = s.P[1 - pi], pen = s.pending[0];
  s.last = { p: pi, t: a.t };

  if (s.phase === "draft") {
    if (a.t !== "draft" || !s.draft.pool.includes(a.w)) throw err("Elige una maravilla de las disponibles.");
    s.draft.pool = s.draft.pool.filter(w => w !== a.w);
    p.wonders.push({ id: a.w, built: false });
    s.draft.step++;
    log(s, pi, `elige ${WONDERS[a.w].e} ${WONDERS[a.w].n}`);
    s.last.w = a.w;
  } else if (pen) {
    if (a.t !== pen.t) throw err("Primero resuelve la elección pendiente.");
    if (a.t === "sci") {
      if (!s.tokens.includes(a.id)) throw err("Esa ficha no está disponible.");
      s.tokens = s.tokens.filter(t => t !== a.id); gainToken(s, pi, a.id);
    } else if (a.t === "lib") {
      if (!pen.opts.includes(a.id)) throw err("Esa ficha no está disponible.");
      s.box = s.box.filter(t => t !== a.id); gainToken(s, pi, a.id);
    } else if (a.t === "destroy") {
      const i = o.cards.indexOf(a.card);
      if (i < 0 || CARDS[a.card].col !== pen.col) throw err("Elige una carta válida del rival.");
      o.cards.splice(i, 1); s.discard.push(a.card);
      log(s, pi, `destruye ${CARDS[a.card].n} del rival`);
    } else if (a.t === "mau") {
      const i = s.discard.indexOf(a.card);
      if (i < 0) throw err("Esa carta no está en el descarte.");
      s.discard.splice(i, 1);
      log(s, pi, `rescata ${CARDS[a.card].n} del descarte y la construye gratis`);
      s.pending.shift(); placeCard(s, pi, a.card, false); s.last.card = a.card;
      settle(s, rng); return s;
    } else if (a.t === "start") {
      if (a.who !== 0 && a.who !== 1) throw err("Elige quién empieza.");
      s.pending.shift();
      deal(s, s.age + 1, rng); s.cur = a.who;
      log(s, a.who, `empieza la Era ${["", "I", "II", "III"][s.age]}`);
      s.last.start = a.who;
      settle(s, rng); return s;
    }
    s.pending.shift();
  } else {
    const i = a.slot;
    if (!accessible(s, i)) throw err("Esa carta no está libre.");
    const id = s.slots[i].c, c = CARDS[id];
    s.last.card = id;
    if (a.t === "build") {
      const q = cardPrice(s, pi, id);
      if (!q.ok) throw err("No te llegan las monedas.");
      pay(s, pi, q); take(s, i);
      log(s, pi, `construye ${c.n}${q.chain ? " gratis por encadenamiento" : q.total ? ` (paga ${q.total} 🪙)` : ""}`);
      placeCard(s, pi, id, q.chain);
    } else if (a.t === "discard") {
      const g = discardGain(s, pi);
      take(s, i); s.discard.push(id); p.coins += g;
      log(s, pi, `descarta ${c.n} y gana ${g} 🪙`);
    } else if (a.t === "wonder") {
      const w = p.wonders.find(x => x.id === a.w && !x.built && !x.lost), W = WONDERS[a.w];
      if (!w) throw err("Esa maravilla no es tuya o ya está construida.");
      if (wondersLeft(s) <= 0) throw err("Ya se han construido las 7 maravillas.");
      const q = wonderPrice(s, pi, a.w);
      if (!q.ok) throw err("No te llegan las monedas.");
      pay(s, pi, q); take(s, i);
      w.built = true; w.card = id; w.age = s.age;
      s.last.w = a.w;
      log(s, pi, `construye la maravilla ${W.e} ${W.n}${q.total ? ` (paga ${q.total} 🪙)` : ""}`);
      if (W.gain) p.coins += W.gain;
      if (W.steal) { const l = Math.min(o.coins, W.steal); o.coins -= l; }
      if (W.sh) military(s, pi, W.sh);
      if (W.destroy) s.pending.push({ t: "destroy", who: pi, col: W.destroy });
      if (W.library) s.pending.push({ t: "lib", who: pi, opts: shuffle(s.box, rng).slice(0, 3) });
      if (W.mausoleo) s.pending.push({ t: "mau", who: pi });
      if (W.replay || hasTok(p, "teologia")) s.replay = true;
      if (wondersLeft(s) === 0) [s.P[0], s.P[1]].forEach(x => x.wonders.forEach(y => { if (!y.built) y.lost = true; }));
    } else throw err("Acción no válida.");
    s.turn++; s.open = true;
  }
  settle(s, rng);
  return s;
}

/* acciones legales para el jugador al que le toca (para pruebas y ayudas) */
function legal(s) {
  const pi = actor(s); if (pi === null) return [];
  if (s.phase === "draft") return s.draft.pool.map(w => ({ t: "draft", w }));
  const pen = s.pending[0], o = s.P[1 - pi];
  if (pen) {
    if (pen.t === "sci") return s.tokens.map(id => ({ t: "sci", id }));
    if (pen.t === "lib") return pen.opts.map(id => ({ t: "lib", id }));
    if (pen.t === "destroy") return o.cards.filter(id => CARDS[id].col === pen.col).map(card => ({ t: "destroy", card }));
    if (pen.t === "mau") return s.discard.map(card => ({ t: "mau", card }));
    if (pen.t === "start") return [{ t: "start", who: 0 }, { t: "start", who: 1 }];
  }
  const out = [];
  s.slots.forEach((t, i) => {
    if (!accessible(s, i)) return;
    out.push({ t: "discard", slot: i });
    if (cardPrice(s, pi, t.c).ok) out.push({ t: "build", slot: i });
    if (wondersLeft(s) > 0) s.P[pi].wonders.forEach(w => { if (!w.built && !w.lost && wonderPrice(s, pi, w.id).ok) out.push({ t: "wonder", slot: i, w: w.id }); });
  });
  return out;
}

const Motor = { RES, RAW, CARDS, WONDERS, TOKENS, SCI, SCI_N, LAYOUT, newGame, act, actor, legal, accessible, cardPrice, wonderPrice, discardGain, wondersLeft, prod, choices, tradePrice, sciSymbols, score, count };
if (typeof module !== "undefined" && module.exports) module.exports = Motor;
else root.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
