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

/* ================= expansión Panteón ================= */
const MYTHS = {
  griega: { n: "Griega", e: "🏺", col: "blue", d: "civil" },
  fenicia: { n: "Fenicia", e: "⛵", col: "yellow", d: "comercio" },
  meso: { n: "Mesopotámica", e: "🏯", col: "green", d: "ciencia" },
  egipcia: { n: "Egipcia", e: "🐫", col: "brown", d: "maravillas" },
  romana: { n: "Romana", e: "🦅", col: "red", d: "militar" }
};
const GODS = {
  enki: { m: "meso", n: "Enki", e: "🌊", eff: "enki", d: "Al revelarse, se ponen encima 2 fichas de progreso que no están en juego. Al invocarlo te quedas una de las dos." },
  ishtar: { m: "meso", n: "Ishtar", e: "🌟", sci: "ley", d: "Te da el símbolo científico de la balanza (el mismo que la ficha Ley)." },
  nisaba: { m: "meso", n: "Nisaba", e: "🐍", eff: "nisaba", d: "Pones la serpiente en una carta verde del rival: Nisaba copia su símbolo científico." },
  astarte: { m: "fenicia", n: "Astarté", e: "🌙", eff: "astarte", d: "Pones 7 monedas sobre ella. Puedes gastarlas, nadie te las puede quitar y las que queden valen 1 punto cada una." },
  baal: { m: "fenicia", n: "Baal", e: "🐂", eff: "baal", d: "Robas al rival una carta marrón o gris y la pones en tu ciudad." },
  tanit: { m: "fenicia", n: "Tanit", e: "🪔", gain: 12, d: "Ganas 12 monedas." },
  afrodita: { m: "griega", n: "Afrodita", e: "🌹", vp: 9, d: "9 puntos de victoria." },
  hades: { m: "griega", n: "Hades", e: "💀", eff: "hades", d: "Construyes gratis una carta del descarte." },
  zeus_dios: { m: "griega", n: "Zeus", e: "🌩️", eff: "zeus", d: "Mandas al descarte una carta de la pirámide (boca arriba o boca abajo), junto con la ficha que tenga." },
  anubis: { m: "egipcia", n: "Anubis", e: "🐺", eff: "anubis", d: "Descartas la carta usada para construir una maravilla (tuya o del rival). Sus efectos inmediatos se mantienen y se puede volver a construir." },
  isis: { m: "egipcia", n: "Isis", e: "🪽", eff: "isis", d: "Con una carta del descarte construyes gratis una de tus maravillas." },
  ra: { m: "egipcia", n: "Ra", e: "🌞", eff: "ra", d: "Robas al rival una maravilla que aún no haya construido." },
  marte: { m: "romana", n: "Marte", e: "🗡️", sh: 2, d: "2 escudos." },
  minerva: { m: "romana", n: "Minerva", e: "🪖", eff: "minerva", d: "Pones su figura en una casilla del frente militar: el ejército se para antes de pisarla. Después se retira." },
  neptuno: { m: "romana", n: "Neptuno", e: "🔱", eff: "neptuno", d: "Quitas una ficha de botín militar sin aplicarla y después aplicas otra (de cualquier lado)." }
};
const GATE = { n: "La Puerta", e: "🚪", d: "Se revela la primera carta de cada mitología: eliges una y la invocas gratis. Cuesta el doble que su casilla." };
/* coste de cada casilla del Panteón para el jugador 0 (el jugador 1 la ve al revés) */
const PAN_COST = [3, 4, 5, 6, 7, 8];
const MYTH_POS = [[1, -2], [1, 2], [3, -4], [3, 0], [3, 4]];
const OFR_POS = [[1, -2], [1, 2], [3, 0]];
const TEMPLE_VP = [0, 5, 12, 21];
[["t_griega", "Gran Templo griego", "griega", "SSWGGP"], ["t_fenicia", "Gran Templo fenicio", "fenicia", "WWCCGP"], ["t_meso", "Gran Templo mesopotámico", "meso", "CCSSPP"],
 ["t_egipcia", "Gran Templo egipcio", "egipcia", "SSSWGG"], ["t_romana", "Gran Templo romano", "romana", "CCWWSP"]]
  .forEach(([id, n, m, c]) => { CARDS[id] = { id, n, age: 3, col: "temple", cost: k(c), templeOf: m, exp: "pan" }; });
Object.assign(WONDERS, {
  santuario: { id: "santuario", n: "El Santuario", e: "⛩️", cost: k("WSGPP"), vp: 0, sanct: true, replay: true, exp: "pan" },
  teatro_divino: { id: "teatro_divino", n: "Teatro Divino", e: "🎭", cost: k("SSWCGP"), vp: 2, theater: true, exp: "pan" }
});
Object.assign(TOKENS, {
  misticismo: { id: "misticismo", n: "Misticismo", e: "🔮", exp: "pan", d: "Al final, 2 puntos por cada ficha de mitología y de ofrenda que tengas." },
  poliorcetica: { id: "poliorcetica", n: "Poliorcética", e: "🏹", exp: "pan", d: "Cada casilla que tu ejército avance hacia la capital rival, el rival pierde 1 moneda." },
  ingenieria: { id: "ingenieria", n: "Ingeniería", e: "⚙️", exp: "pan", d: "Puedes construir por 1 moneda cualquier carta que tenga símbolo de encadenamiento, aunque no tengas la carta previa." }
});

/* ================= expansión Ágora ================= */
const CHAMBER_VP = [1, 2, 3, 3, 2, 1];
const SECTIONS = { L: [0, 1], M: [2, 3], R: [4, 5] };
const SEC_N = { L: "izquierda", M: "centro", R: "derecha" };
[["s_demagogo", "Demagogo", "L"], ["s_tribuno", "Tribuno", "L"], ["s_consul", "Cónsul", "M"], ["s_censor", "Censor", "M"], ["s_edil", "Edil", "M"], ["s_pretor", "Pretor", "R"], ["s_cuestor", "Cuestor", "R"]]
  .forEach(([id, n, sec]) => { CARDS[id] = { id, n, age: 0, col: "senator", kind: "pol", sec, cost: {}, exp: "ag" }; });
[["c_conjurado", "Conjurado"], ["c_intrigante", "Intrigante"], ["c_sicofante", "Sicofante"], ["c_agitador", "Agitador"], ["c_espia", "Espía"], ["c_delator", "Delator"]]
  .forEach(([id, n]) => { CARDS[id] = { id, n, age: 0, col: "senator", kind: "consp", cost: {}, exp: "ag" }; });
const DECREES = {
  imp_rojo: { n: "Impuesto de guerra", e: "🛡️", d: "Cada vez que alguien construye una carta roja, ganas tantas monedas como la era actual." },
  imp_verde: { n: "Impuesto del saber", e: "🔬", d: "Cada vez que alguien construye una carta verde, ganas tantas monedas como la era actual." },
  imp_azul: { n: "Impuesto cívico", e: "🏛️", d: "Cada vez que alguien construye una carta azul, ganas tantas monedas como la era actual." },
  imp_amarillo: { n: "Impuesto mercantil", e: "⚖️", d: "Cada vez que alguien construye una carta amarilla, ganas tantas monedas como la era actual." },
  imp_marron: { n: "Impuesto de minas", e: "⛏️", d: "Cada vez que alguien construye una carta marrón, ganas tantas monedas como la era actual." },
  imp_gris: { n: "Impuesto de talleres", e: "🏭", d: "Cada vez que alguien construye una carta gris, ganas tantas monedas como la era actual." },
  imp_maravilla: { n: "Tributo monumental", e: "🗿", d: "Cada vez que alguien construye una maravilla, ganas tantas monedas como la era actual." },
  reb_marron: { n: "Tarifa minera", e: "🪨", d: "Pagas 1 moneda menos por cada materia prima (madera, arcilla, piedra) que compres al banco (mínimo 1)." },
  reb_gris: { n: "Tarifa artesana", e: "🧪", d: "Pagas 1 moneda menos por cada vidrio o papiro que compres al banco (mínimo 1)." },
  reb_maravilla: { n: "Mecenazgo", e: "🏗️", d: "Tus maravillas cuestan 1 recurso menos." },
  oratoria: { n: "Oratoria", e: "🗣️", d: "Sumas 2 a tus cartas azules para calcular tus acciones en el Senado." },
  legion: { n: "Legión", e: "⚔️", d: "Mientras controles esta cámara tienes 1 escudo: el ejército avanza 1 hacia el rival (y retrocede si la pierdes)." },
  subasta: { n: "Subasta pública", e: "🔨", d: "Al descartar una carta por monedas, ganas 2 monedas más." },
  espias: { n: "Red de espías", e: "🕵️", d: "Puedes encadenar gratis usando también las cartas del rival." },
  intriga: { n: "Intriga palaciega", e: "🎭", d: "Cuando reclutas un conspirador juegas otro turno." },
  clientela: { n: "Clientelismo", e: "🤝", d: "Cada vez que el rival recluta un senador, ganas tantas monedas como la era actual." }
};
const CONSPS = {
  golpe: { n: "Golpe de Estado", e: "⚔️", d: "Tu ejército avanza 2 casillas." },
  expropiacion: { n: "Expropiación", e: "🏚️", d: "Descartas una carta azul del rival." },
  boicot: { n: "Boicot", e: "🚫", d: "Descartas una carta amarilla del rival." },
  chantaje: { n: "Chantaje", e: "💸", d: "Te llevas la mitad de las monedas del rival (redondeando hacia arriba)." },
  sabotaje: { n: "Sabotaje", e: "💣", d: "Devuelves a la caja una maravilla construida del rival." },
  extorsion: { n: "Extorsión", e: "🗝️", d: "Te quedas una maravilla sin construir del rival." },
  coaccion: { n: "Coacción", e: "🔄", d: "Cambias una carta azul o verde del rival por una tuya del mismo color, y colocas 1 influencia." },
  traicion: { n: "Traición", e: "🗡️", d: "Construyes gratis una de las cartas apartadas al preparar las eras." },
  espionaje: { n: "Espionaje", e: "🔍", d: "Miras las fichas de progreso fuera del juego y te quedas una." },
  oscurantismo: { n: "Oscurantismo", e: "🌑", d: "Sacas del juego una ficha de progreso de la mesa o del rival." },
  vuelco: { n: "Vuelco", e: "🌀", d: "Descartas una carta libre de la pirámide, y si quieres otra más." },
  purga: { n: "Purga", e: "🧹", d: "Quitas una influencia del rival del Senado." },
  soborno: { n: "Soborno", e: "👛", d: "Ganas 1 moneda por cada influencia tuya en el Senado." },
  ruina: { n: "Ruina", e: "📉", d: "El rival pierde 1 moneda por cada influencia suya en el Senado." },
  contrabando: { n: "Contrabando", e: "📦", d: "Robas al rival una carta marrón o gris." },
  reforma: { n: "Reforma", e: "📜", d: "Mueves un decreto a otra cámara (se queda debajo del que haya)." }
};
Object.assign(WONDERS, {
  curia_julia: { id: "curia_julia", n: "Curia Julia", e: "🏛️", cost: k("SSWGP"), vp: 0, gain: 6, replay: true, curia: true, onPick: "conspire", exp: "ag" },
  knossos: { id: "knossos", n: "Cnosos", e: "🐂", cost: k("WWCCG"), vp: 3, knossos: true, onPick: "place", exp: "ag" }
});
Object.assign(TOKENS, {
  corrupcion: { id: "corrupcion", n: "Corrupción", e: "🤑", exp: "ag", d: "Reclutas a todos los senadores gratis." },
  crimen: { id: "crimen", n: "Crimen organizado", e: "🃏", exp: "ag", d: "Cuando conspiras, te quedas las dos conspiraciones." }
});

/* ================= utilidades ================= */
const clone = o => JSON.parse(JSON.stringify(o));
function shuffle(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const err = m => { const e = new Error(m); e.rule = true; return e; };
const inExp = (s, o) => !o.exp || !!(s.x && s.x[o.exp]);

/* ================= partida nueva ================= */
function newGame(first, rng, opt) {
  rng = rng || Math.random; opt = opt || {};
  first = first === 1 ? 1 : 0;
  const x = { pan: !!opt.pan, ag: !!opt.ag }, sx = { x };
  const toks = shuffle(Object.keys(TOKENS).filter(t => inExp(sx, TOKENS[t])), rng);
  const wons = shuffle(Object.keys(WONDERS).filter(w => inExp(sx, WONDERS[w])), rng).slice(0, 8);
  const o = 1 - first;
  const s = {
    v: 2, x, phase: "draft", age: 0, first, cur: first, turn: 0,
    draft: { pool: wons.slice(0, 4), rest: wons.slice(4), step: 0, order: [first, o, o, first, o, first, first, o] },
    tokens: toks.slice(0, 5), box: toks.slice(5), removed: [],
    slots: [], discard: [], pawn: 0, loot: { a2: true, a5: true, b2: true, b5: true },
    P: [0, 1].map(() => ({ coins: 7, cards: [], wonders: [], tokens: [], gods: [], myth: [], ofr: [], astarte: 0, nisaba: null, consp: [], cubes: 12 })),
    pending: [], replay: false, open: false, winner: null, log: [], last: null
  };
  if (x.pan) {
    const decks = {}; Object.keys(MYTHS).forEach(m => { decks[m] = shuffle(Object.keys(GODS).filter(g => GODS[g].m === m), rng); });
    const mt = []; Object.keys(MYTHS).forEach(m => { mt.push({ m, tp: false }, { m, tp: true }); });
    s.pan = { sp: [null, null, null, null, null, null], decks, minerva: null, enki: [], mtok: shuffle(mt, rng).slice(0, 5) };
  }
  if (x.ag) {
    const decs = shuffle(Object.keys(DECREES), rng).slice(0, 6);
    const sen = shuffle(Object.keys(CARDS).filter(id => CARDS[id].col === "senator"), rng);
    s.ag = { ch: CHAMBER_VP.map((vp, i) => ({ c: [0, 0], dec: [{ id: decs[i], up: i % 2 === 0 }], ctrl: null })), deck: shuffle(Object.keys(CONSPS), rng), sen: { 1: sen.slice(0, 5), 2: sen.slice(5, 10), 3: sen.slice(10, 13) }, trig: -1 };
  }
  return s;
}

function deal(s, age, rng) {
  rng = rng || Math.random;
  let deck = shuffle(Object.values(CARDS).filter(c => c.age === age && !["purple", "temple", "senator"].includes(c.col)).map(c => c.id), rng);
  const keep = age === 3 ? 17 : 20;
  s.removed.push(...deck.slice(keep)); deck = deck.slice(0, keep);
  if (age === 3) deck = deck.concat(shuffle(Object.values(CARDS).filter(c => c.col === (s.x && s.x.pan ? "temple" : "purple")).map(c => c.id), rng).slice(0, 3));
  if (s.x && s.x.ag) { const sen = s.ag.sen[age]; deck = shuffle(deck, rng).slice(0, 20 - sen.length).concat(sen); }
  deck = shuffle(deck, rng);
  s.age = age; s.slots = [];
  LAYOUT[age].forEach(([row, up], r) => row.forEach(x => s.slots.push({ c: deck[s.slots.length], r, x, up: !!up, gone: false, tok: null })));
  const at = (r, x) => s.slots.find(t => t.r === r && t.x === x);
  if (s.pan && age === 1) MYTH_POS.forEach(([r, x], i) => { at(r, x).tok = { k: "myth", ...s.pan.mtok[i] }; });
  if (s.pan && age === 2) {
    const v = shuffle([2, 3, 4], rng);
    OFR_POS.forEach(([r, x], i) => { at(r, x).tok = { k: "ofr", v: v[i] }; });
    const empty = s.pan.sp.findIndex(x => !x);
    if (empty >= 0) s.pan.sp[empty] = { g: "gate", up: true };
    s.pan.sp.forEach(x => { if (x) x.up = true; });
    if (s.pan.sp.some(x => x && x.g === "enki")) { const e = shuffle(s.box, rng).slice(0, 2); s.pan.enki = e; s.box = s.box.filter(t => !e.includes(t)); }
  }
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
const avail = p => p.coins + (p.astarte || 0);
function countOf(s, pi, of) {
  const p = s.P[pi];
  if (of === "wonder") return builtWonders(p);
  if (of === "coins") return p.coins;
  return count(p, of);
}
/* ¿controla pi una cámara con ese decreto? */
function hasDecree(s, pi, id) { return !!(s.ag && s.ag.ch.some(ch => ch.ctrl === pi && ch.dec.some(d => d.id === id))); }
function ctrlOf(ch) { return ch.c[0] > ch.c[1] ? 0 : ch.c[1] > ch.c[0] ? 1 : null; }
const cubesOn = (s, pi) => s.ag ? s.ag.ch.reduce((a, ch) => a + ch.c[pi], 0) : 0;
function senateActions(s, pi) { const b = count(s.P[pi], "blue") + (hasDecree(s, pi, "oratoria") ? 2 : 0); return b >= 4 ? 3 : b >= 2 ? 2 : 1; }
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
  let v = 2 + prod(s.P[1 - pi])[r];
  if (hasDecree(s, pi, RAW.includes(r) ? "reb_marron" : "reb_gris")) v = Math.max(1, v - 1);
  return v;
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
const senatorCost = (s, pi) => hasTok(s.P[pi], "corrupcion") ? 0 : count(s.P[pi], "senator");
function cardPrice(s, pi, id) {
  const p = s.P[pi], o = s.P[1 - pi], c = CARDS[id];
  const free = q => ({ coins: 0, trade: 0, total: 0, buy: [], chain: true, ok: true, ...q });
  if (c.col === "senator") { const n = senatorCost(s, pi); return { coins: n, trade: 0, total: n, buy: [], chain: false, ok: avail(p) >= n, senator: true }; }
  if (c.free && (p.cards.includes(c.free) || (hasDecree(s, pi, "espias") && o.cards.includes(c.free)))) return free();
  if (c.templeOf && p.myth.some(t => t.m === c.templeOf && t.tp)) return free();
  const q = quote(s, pi, c.cost, c.col === "blue" && hasTok(p, "albanileria") ? 2 : 0);
  if ((c.free || c.templeOf) && hasTok(p, "ingenieria") && q.total > 1) return { coins: 1, trade: 0, total: 1, buy: [], chain: false, eng: true, ok: avail(p) >= 1 };
  q.ok = avail(p) >= q.total;
  return q;
}
function wonderPrice(s, pi, wid) {
  const p = s.P[pi];
  const q = quote(s, pi, WONDERS[wid].cost, (hasTok(p, "arquitectura") ? 2 : 0) + (hasDecree(s, pi, "reb_maravilla") ? 1 : 0));
  q.ok = avail(p) >= q.total;
  return q;
}
function godCost(s, pi, sp) {
  const x = s.pan && s.pan.sp[sp]; if (!x) return null;
  let c = pi === 0 ? PAN_COST[sp] : PAN_COST[5 - sp];
  if (x.g === "gate") c *= 2;
  if (s.P[pi].wonders.some(w => w.built && WONDERS[w.id].sanct)) c -= 2;
  return Math.max(0, c);
}
const wondersLeft = s => 7 - builtWonders(s.P[0]) - builtWonders(s.P[1]);
const discardGain = (s, pi) => 2 + count(s.P[pi], "yellow") + (hasDecree(s, pi, "subasta") ? 2 : 0);
function sciSymbols(p) {
  const o = {}, add = k => { o[k] = (o[k] || 0) + 1; };
  p.cards.forEach(id => { const c = CARDS[id]; if (c.sci) add(c.sci); });
  if (hasTok(p, "ley")) add("ley");
  (p.gods || []).forEach(g => { if (GODS[g] && GODS[g].sci) add(GODS[g].sci); });
  if (p.nisaba) add(p.nisaba);
  return o;
}
function actor(s) {
  if (s.phase === "end") return null;
  if (s.pending.length) return s.pending[0].who;
  if (s.phase === "draft") return s.draft.order[s.draft.step];
  return s.cur;
}
/* ¿puede pi activar ya una conspiración preparada al principio de su turno? */
function canTrigger(s, pi) {
  return !!(s.ag && s.phase === "age" && !s.pending.length && !s.open && s.cur === pi && s.ag.trig !== s.turn && s.P[pi].consp.some(c => c.prep && !c.used));
}

/* ================= puntos ================= */
function militaryVP(pawn, pi) {
  const d = pi === 0 ? pawn : -pawn;
  if (d <= 0) return 0;
  return d >= 6 ? 10 : d >= 3 ? 5 : 2;
}
function score(s, pi) {
  const p = s.P[pi], o = { blue: 0, green: 0, yellow: 0, purple: 0, wonders: 0, tokens: 0, coins: 0, military: 0, gods: 0, temples: 0, senate: 0 };
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
  if (hasTok(p, "misticismo")) o.tokens += 2 * (p.myth.length + p.ofr.length);
  o.coins = Math.floor(p.coins / 3);
  o.military = militaryVP(s.pawn, pi);
  p.gods.forEach(g => { if (GODS[g] && GODS[g].vp) o.gods += GODS[g].vp; });
  o.gods += p.astarte || 0;
  o.temples = TEMPLE_VP[Math.min(3, count(p, "temple"))];
  if (s.ag) s.ag.ch.forEach((ch, i) => { if (ch.ctrl === pi) o.senate += CHAMBER_VP[i]; });
  o.total = Object.values(o).reduce((a, b) => a + b, 0);
  return o;
}

/* ================= efectos ================= */
function log(s, p, m) { s.log.push({ p, m }); if (s.log.length > 40) s.log.shift(); }
function win(s, who, how) { if (!s.winner) s.winner = { who, how }; }
const push = (s, x) => { s.pending.push(x); };
function loseCoins(s, pi, n) { const p = s.P[pi], l = Math.min(p.coins, n); p.coins -= l; return l; }
function spend(p, n) { const a = Math.min(p.coins, n); p.coins -= a; p.astarte -= (n - a); }

/* botín militar: el que retrocede pierde monedas; con Ágora el que avanza además gana influencia */
function applyLoot(s, key) {
  const victim = key[0] === "a" ? 1 : 0, amt = key[1] === "2" ? 2 : 5;
  s.loot[key] = false;
  const lost = loseCoins(s, victim, amt);
  log(s, victim, `pierde ${lost} 🪙 por el avance militar`);
  if (s.ag) push(s, amt === 2 ? { t: "senate", who: 1 - victim, n: 1, allow: "place", sec: null } : { t: "purga", who: 1 - victim });
}
function military(s, pi, n) {
  if (!n) return;
  const dir = pi === 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const next = s.pawn + dir;
    if (Math.abs(next) > 9) break;
    if (s.pan && s.pan.minerva === next) { s.pan.minerva = null; log(s, null, "Minerva detiene al ejército"); break; }
    s.pawn = next;
    if (hasTok(s.P[pi], "poliorcetica")) loseCoins(s, 1 - pi, 1);
    if (s.pawn >= 3 && s.loot.a2) applyLoot(s, "a2");
    if (s.pawn >= 6 && s.loot.a5) applyLoot(s, "a5");
    if (s.pawn <= -3 && s.loot.b2) applyLoot(s, "b2");
    if (s.pawn <= -6 && s.loot.b5) applyLoot(s, "b5");
  }
  if (Math.abs(s.pawn) >= 9) win(s, s.pawn > 0 ? 0 : 1, "military");
}
function checkScience(s, pi) {
  if (Object.keys(sciSymbols(s.P[pi])).length >= 6) win(s, pi, "science");
}
function sciGain(s, pi, sym) {
  if (sym && sciSymbols(s.P[pi])[sym] === 2 && s.tokens.length) push(s, { t: "sci", who: pi });
  checkScience(s, pi);
}
function gainToken(s, pi, id) {
  const p = s.P[pi];
  p.tokens.push(id);
  if (id === "agricultura" || id === "urbanismo") p.coins += 6;
  log(s, pi, `consigue la ficha ${TOKENS[id].e} ${TOKENS[id].n}`);
  if (id === "ley") sciGain(s, pi, "ley");
}
function tax(s, kind) {
  if (!s.ag) return;
  [0, 1].forEach(i => { if (hasDecree(s, i, "imp_" + kind)) s.P[i].coins += s.age; });
}
function placeCard(s, pi, id, viaChain) {
  const p = s.P[pi], c = CARDS[id];
  p.cards.push(id);
  if (viaChain && hasTok(p, "urbanismo")) p.coins += 4;
  if (c.gain) p.coins += c.gain;
  if (c.per) p.coins += c.per.c * countOf(s, pi, c.per.of);
  if (c.guild && c.guild.c) p.coins += c.guild.c * Math.max(...[0, 1].map(i => c.guild.of.reduce((a, of) => a + countOf(s, i, of), 0)));
  if (["red", "green", "blue", "yellow", "brown", "grey"].includes(c.col)) tax(s, { red: "rojo", green: "verde", blue: "azul", yellow: "amarillo", brown: "marron", grey: "gris" }[c.col]);
  if (c.sh) military(s, pi, c.sh + (hasTok(p, "estrategia") ? 1 : 0));
  if (c.sci) sciGain(s, pi, c.sci);
  if (c.col === "senator") {
    if (s.ag && hasDecree(s, 1 - pi, "clientela")) s.P[1 - pi].coins += s.age;
    if (c.kind === "pol") push(s, { t: "senate", who: pi, n: senateActions(s, pi), allow: "both", sec: c.sec });
    else { push(s, { t: "cons", who: pi }); if (hasDecree(s, pi, "intriga")) s.replay = true; }
  }
}
function pay(s, pi, q) {
  const p = s.P[pi], o = s.P[1 - pi];
  spend(p, q.total);
  if (q.trade && hasTok(o, "economia")) o.coins += q.trade;
}
function giveTok(s, pi, tok) {
  const p = s.P[pi];
  if (tok.k === "ofr") { p.ofr.push(tok.v); log(s, pi, `consigue una ofrenda de ${tok.v}`); return; }
  p.myth.push({ m: tok.m, tp: tok.tp });
  log(s, pi, `consigue la ficha de mitología ${MYTHS[tok.m].e} ${MYTHS[tok.m].n}${tok.tp ? " (con templo)" : ""}`);
  const d = s.pan.decks[tok.m];
  if (d.length && s.pan.sp.some(x => !x)) push(s, { t: "myth", who: pi, m: tok.m, opts: d.slice(0, 2) });
}
function take(s, i, pi) {
  s.slots[i].gone = true;
  s.slots.forEach((t, j) => {
    if (!t.gone && !t.up && accessible(s, j)) { t.up = true; if (t.tok) { const tk = t.tok; t.tok = null; giveTok(s, pi, tk); } }
  });
}
function buildWonder(s, pi, w, cardId) {
  const p = s.P[pi], o = s.P[1 - pi], W = WONDERS[w.id];
  w.built = true; w.card = cardId; w.age = s.age;
  if (W.gain) p.coins += W.gain;
  if (W.steal) loseCoins(s, 1 - pi, W.steal);
  if (W.sh) military(s, pi, W.sh);
  if (W.destroy) push(s, { t: "steal", who: pi, cols: [W.destroy], destroy: true });
  if (W.library) push(s, { t: "pickbox", who: pi, opts: shuffle(s.box, Math.random).slice(0, 3) });
  if (W.mausoleo) push(s, { t: "mau", who: pi });
  if (W.theater) push(s, { t: "theater", who: pi });
  if (W.curia) push(s, { t: "curia", who: pi });
  if (W.knossos) { push(s, { t: "senate", who: pi, n: 1, allow: "place", sec: null }); push(s, { t: "senate", who: pi, n: 1, allow: "move", sec: null, opt: true }); }
  if (W.replay || hasTok(p, "teologia")) s.replay = true;
  tax(s, "maravilla");
  if (wondersLeft(s) === 0) [s.P[0], s.P[1]].forEach(x => x.wonders.forEach(y => { if (!y.built) y.lost = true; }));
}
function invokeGod(s, pi, g) {
  const p = s.P[pi], G = GODS[g];
  log(s, pi, `invoca a ${G.e} ${G.n}`);
  if (G.gain) p.coins += G.gain;
  if (G.sh) military(s, pi, G.sh);
  if (G.sci) sciGain(s, pi, G.sci);
  const e = G.eff;
  if (e === "enki") push(s, { t: "pickbox", who: pi, opts: s.pan.enki.slice(), enki: true });
  if (e === "nisaba") push(s, { t: "nisaba", who: pi });
  if (e === "astarte") p.astarte += 7;
  if (e === "baal") push(s, { t: "steal", who: pi, cols: ["brown", "grey"] });
  if (e === "hades") push(s, { t: "mau", who: pi });
  if (e === "zeus") push(s, { t: "zeus", who: pi });
  if (e === "anubis") push(s, { t: "anubis", who: pi });
  if (e === "isis") push(s, { t: "isis", who: pi });
  if (e === "ra") push(s, { t: "ra", who: pi });
  if (e === "minerva") push(s, { t: "minerva", who: pi });
  if (e === "neptuno") push(s, { t: "neptuno", who: pi });
}
/* ---- Senado ---- */
function senateUpdate(s) {
  if (!s.ag) return;
  s.ag.ch.forEach(ch => {
    const nc = ctrlOf(ch);
    if (nc === ch.ctrl) return;
    const legion = ch.dec.some(d => d.id === "legion");
    if (legion && ch.ctrl !== null) military(s, 1 - ch.ctrl, 1);
    if (legion && nc !== null) military(s, nc, 1);
    ch.ctrl = nc;
  });
  [0, 1].forEach(i => { if (s.ag.ch.every(ch => ch.ctrl === i)) win(s, i, "political"); });
}
function placeCube(s, pi, i) {
  const ch = s.ag.ch[i];
  s.P[pi].cubes--; ch.c[pi]++;
  ch.dec.forEach(d => { if (!d.up) { d.up = true; log(s, null, `se revela el decreto ${DECREES[d.id].e} ${DECREES[d.id].n}`); } });
  senateUpdate(s);
}
function conspire(s, pi) {
  const d = s.ag.deck; if (!d.length) return;
  push(s, { t: "drawc", who: pi, opts: d.slice(0, 2) });
}
function consEffect(s, pi, id) {
  const p = s.P[pi], o = s.P[1 - pi];
  log(s, pi, `desvela la conspiración ${CONSPS[id].e} ${CONSPS[id].n}`);
  switch (id) {
    case "golpe": military(s, pi, 2); break;
    case "expropiacion": push(s, { t: "steal", who: pi, cols: ["blue"], destroy: true }); break;
    case "boicot": push(s, { t: "steal", who: pi, cols: ["yellow"], destroy: true }); break;
    case "chantaje": p.coins += loseCoins(s, 1 - pi, Math.ceil(o.coins / 2)); break;
    case "sabotaje": push(s, { t: "sabotaje", who: pi }); break;
    case "extorsion": push(s, { t: "ra", who: pi }); break;
    case "coaccion": push(s, { t: "coaccion", who: pi }); push(s, { t: "senate", who: pi, n: 1, allow: "place", sec: null }); break;
    case "traicion": push(s, { t: "traicion", who: pi }); break;
    case "espionaje": push(s, { t: "pickbox", who: pi, opts: s.box.slice() }); break;
    case "oscurantismo": push(s, { t: "oscuro", who: pi }); break;
    case "vuelco": push(s, { t: "vuelco", who: pi, left: 2 }); break;
    case "purga": push(s, { t: "purga", who: pi }); break;
    case "soborno": p.coins += cubesOn(s, pi); break;
    case "ruina": loseCoins(s, 1 - pi, cubesOn(s, 1 - pi)); break;
    case "contrabando": push(s, { t: "steal", who: pi, cols: ["brown", "grey"] }); break;
    case "reforma": push(s, { t: "reforma", who: pi }); break;
  }
}

/* ================= turnos ================= */
const rebuildable = id => CARDS[id].col !== "senator";
function pendingValid(s, x) {
  const p = s.P[x.who], o = s.P[1 - x.who];
  switch (x.t) {
    case "sci": return s.tokens.length > 0;
    case "steal": return o.cards.some(id => x.cols.includes(CARDS[id].col));
    case "mau": return s.discard.some(rebuildable);
    case "pickbox": return x.opts && x.opts.length > 0;
    case "myth": return s.pan.sp.some(v => !v) && x.opts.length > 0;
    case "nisaba": return o.cards.some(id => CARDS[id].col === "green");
    case "zeus": return s.slots.some(t => !t.gone);
    case "anubis": return [s.P[0], s.P[1]].some(q => q.wonders.some(w => w.built));
    case "isis": return wondersLeft(s) > 0 && s.discard.some(rebuildable) && p.wonders.some(w => !w.built && !w.lost);
    case "ra": return o.wonders.some(w => !w.built && !w.lost);
    case "neptuno": return Object.values(s.loot).some(Boolean);
    case "theater": return Object.values(s.pan.decks).some(d => d.length);
    case "gate": return x.opts && x.opts.length > 0;
    case "senate": return x.allow === "move" ? cubesOn(s, x.who) > 0 : x.allow === "place" ? p.cubes > 0 : (p.cubes > 0 || cubesOn(s, x.who) > 0);
    case "purga": return cubesOn(s, 1 - x.who) > 0;
    case "drawc": return x.opts.length > 0;
    case "curia": return p.consp.some(c => !c.prep && !c.used);
    case "sabotaje": return o.wonders.some(w => w.built);
    case "coaccion": return ["blue", "green"].some(col => count(o, col) && count(p, col));
    case "traicion": return s.removed.length > 0;
    case "oscuro": return s.tokens.length > 0 || o.tokens.length > 0;
    case "vuelco": return x.left > 0 && s.slots.some((t, i) => accessible(s, i));
    case "reforma": return s.ag.ch.some(ch => ch.dec.length);
    default: return true;
  }
}
function settle(s, rng) {
  if (s.winner) { s.phase = "end"; s.pending = []; return; }
  while (s.pending.length && !pendingValid(s, s.pending[0])) s.pending.shift();
  if (s.pending.length) return;
  if (s.phase === "draft") {
    const d = s.draft;
    if (d.pool.length === 1) { const w = d.pool[0], who = d.order[d.step]; d.pool = []; d.step++; pickWonder(s, who, w); if (s.pending.length) return; }
    if (!d.pool.length && d.rest.length) { d.pool = d.rest; d.rest = []; }
    if (d.step >= 8) { s.phase = "age"; deal(s, 1, rng); s.cur = s.first; log(s, null, "Empieza la Era I"); }
    return;
  }
  if (s.phase !== "age") return;
  if (s.open) {
    s.open = false;
    if (s.slots.every(t => t.gone)) return endAge(s);
    if (!s.replay) s.cur = 1 - s.cur;
    else log(s, s.cur, "juega otro turno");
    s.replay = false;
  } else if (s.slots.length && s.slots.every(t => t.gone)) endAge(s);
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
  push(s, { t: "start", who });
}
function pickWonder(s, pi, w) {
  s.P[pi].wonders.push({ id: w, built: false });
  log(s, pi, `elige ${WONDERS[w].e} ${WONDERS[w].n}`);
  const W = WONDERS[w];
  if (W.onPick === "conspire") conspire(s, pi);
  if (W.onPick === "place") push(s, { t: "senate", who: pi, n: 1, allow: "place", sec: null });
}

/* resuelve la elección pendiente pen con la acción a */
function resolve(s, pi, pen, a, rng) {
  const p = s.P[pi], o = s.P[1 - pi];
  const done = () => { s.pending.shift(); };
  if (a.t !== pen.t) throw err("Primero resuelve la elección pendiente.");
  switch (pen.t) {
    case "sci": {
      if (!s.tokens.includes(a.id)) throw err("Esa ficha no está disponible.");
      done(); s.tokens = s.tokens.filter(t => t !== a.id); gainToken(s, pi, a.id); return;
    }
    case "pickbox": {
      if (!pen.opts.includes(a.id)) throw err("Esa ficha no está disponible.");
      done(); s.box = s.box.filter(t => t !== a.id);
      if (pen.enki) { s.box.push(...s.pan.enki.filter(t => t !== a.id)); s.pan.enki = []; }
      gainToken(s, pi, a.id); return;
    }
    case "steal": {
      const i = o.cards.indexOf(a.card);
      if (i < 0 || !pen.cols.includes(CARDS[a.card].col)) throw err("Elige una carta válida del rival.");
      done(); o.cards.splice(i, 1);
      if (pen.destroy) { s.discard.push(a.card); log(s, pi, `destruye ${CARDS[a.card].n} del rival`); }
      else { p.cards.push(a.card); log(s, pi, `le roba ${CARDS[a.card].n} al rival`); }
      return;
    }
    case "mau": {
      const i = s.discard.indexOf(a.card);
      if (i < 0 || !rebuildable(a.card)) throw err("Esa carta no está en el descarte.");
      done(); s.discard.splice(i, 1);
      log(s, pi, `rescata ${CARDS[a.card].n} del descarte y la construye gratis`);
      placeCard(s, pi, a.card, false); s.last.card = a.card; return;
    }
    case "traicion": {
      const i = s.removed.indexOf(a.card);
      if (i < 0) throw err("Esa carta no está apartada.");
      done(); s.removed.splice(i, 1);
      log(s, pi, `construye gratis ${CARDS[a.card].n}, que estaba apartada`);
      placeCard(s, pi, a.card, false); return;
    }
    case "start": {
      if (a.who !== 0 && a.who !== 1) throw err("Elige quién empieza.");
      done(); deal(s, s.age + 1, rng); s.cur = a.who;
      log(s, a.who, `empieza la Era ${["", "I", "II", "III"][s.age]}`);
      s.last.start = a.who; return;
    }
    case "myth": {
      if (!pen.opts.includes(a.g) || !(a.sp >= 0 && a.sp < 6) || s.pan.sp[a.sp]) throw err("Elige un dios y una casilla libre del Panteón.");
      done(); s.pan.decks[pen.m] = s.pan.decks[pen.m].filter(g => g !== a.g);
      s.pan.sp[a.sp] = { g: a.g, up: false };
      log(s, pi, `coloca un dios ${MYTHS[pen.m].e} en el Panteón`); return;
    }
    case "nisaba": {
      if (!o.cards.includes(a.card) || CARDS[a.card].col !== "green") throw err("Elige una carta verde del rival.");
      done(); p.nisaba = CARDS[a.card].sci;
      log(s, pi, `Nisaba copia el símbolo de ${CARDS[a.card].n}`);
      sciGain(s, pi, p.nisaba); return;
    }
    case "zeus": {
      const t = s.slots[a.slot];
      if (!t || t.gone) throw err("Elige una carta de la pirámide.");
      done(); t.tok = null; s.discard.push(t.c);
      log(s, pi, `manda al descarte ${t.up ? CARDS[t.c].n : "una carta boca abajo"}`);
      take(s, a.slot, pi); return;
    }
    case "anubis": {
      const P2 = s.P[a.who], w = P2 && P2.wonders.find(x => x.id === a.w && x.built);
      if (!w) throw err("Elige una maravilla construida.");
      done(); w.built = false; if (w.card) s.discard.push(w.card); w.card = null;
      log(s, pi, `deshace ${WONDERS[a.w].n}`); return;
    }
    case "isis": {
      const i = s.discard.indexOf(a.card), w = p.wonders.find(x => x.id === a.w && !x.built && !x.lost);
      if (i < 0 || !rebuildable(a.card) || !w) throw err("Elige una carta del descarte y una maravilla tuya.");
      done(); s.discard.splice(i, 1);
      log(s, pi, `construye gratis la maravilla ${WONDERS[a.w].e} ${WONDERS[a.w].n} con Isis`);
      buildWonder(s, pi, w, a.card); return;
    }
    case "ra": {
      const i = o.wonders.findIndex(x => x.id === a.w && !x.built && !x.lost);
      if (i < 0) throw err("Elige una maravilla sin construir del rival.");
      done(); p.wonders.push(o.wonders.splice(i, 1)[0]);
      log(s, pi, `le quita al rival la maravilla ${WONDERS[a.w].n}`); return;
    }
    case "sabotaje": {
      const w = o.wonders.find(x => x.id === a.w && x.built);
      if (!w) throw err("Elige una maravilla construida del rival.");
      done(); w.built = false; w.lost = true; if (w.card) s.discard.push(w.card); w.card = null;
      log(s, pi, `sabotea ${WONDERS[a.w].n}`); return;
    }
    case "minerva": {
      const pos = a.pos | 0;
      if (pos < -9 || pos > 9 || pos === s.pawn) throw err("Elige una casilla libre del frente.");
      done(); s.pan.minerva = pos; log(s, pi, "coloca a Minerva en el frente"); return;
    }
    case "neptuno": {
      if (!s.loot[a.off] || (a.apply && (a.apply === a.off || !s.loot[a.apply]))) throw err("Elige fichas de botín válidas.");
      done(); s.loot[a.off] = false; log(s, pi, "retira una ficha de botín");
      if (a.apply) applyLoot(s, a.apply); return;
    }
    case "gate": case "theater": {
      const opts = pen.t === "gate" ? pen.opts : [].concat(...Object.values(s.pan.decks));
      if (!opts.includes(a.g)) throw err("Elige un dios.");
      done(); const m = GODS[a.g].m; s.pan.decks[m] = s.pan.decks[m].filter(g => g !== a.g);
      p.gods.push(a.g); invokeGod(s, pi, a.g); return;
    }
    case "senate": {
      if (a.op === "end") { done(); return; }
      const secOk = i => !pen.sec || SECTIONS[pen.sec].includes(i);
      if (a.op === "place") {
        if (pen.allow === "move" || p.cubes <= 0 || !(a.ch >= 0 && a.ch < 6) || !secOk(a.ch)) throw err("No puedes colocar ahí.");
        placeCube(s, pi, a.ch); log(s, pi, `coloca influencia en la cámara ${a.ch + 1}`);
      } else if (a.op === "move") {
        const ch = s.ag.ch[a.from];
        if (pen.allow === "place" || !ch || ch.c[pi] <= 0 || Math.abs(a.to - a.from) !== 1 || a.to < 0 || a.to > 5) throw err("No puedes mover ahí.");
        ch.c[pi]--; s.ag.ch[a.to].c[pi]++;
        s.ag.ch[a.to].dec.forEach(d => { d.up = true; });
        senateUpdate(s); log(s, pi, `mueve influencia a la cámara ${a.to + 1}`);
      } else throw err("Acción no válida.");
      pen.n--; if (pen.n <= 0 || !pendingValid(s, pen)) done();
      return;
    }
    case "purga": {
      const ch = s.ag.ch[a.ch];
      if (!ch || ch.c[1 - pi] <= 0) throw err("Ahí no hay influencia del rival.");
      done(); ch.c[1 - pi]--; o.cubes++; senateUpdate(s); log(s, pi, `quita influencia del rival en la cámara ${a.ch + 1}`); return;
    }
    case "cons": {
      if (a.op === "place") { if (p.cubes <= 0 || !(a.ch >= 0 && a.ch < 6)) throw err("No puedes colocar ahí."); done(); placeCube(s, pi, a.ch); log(s, pi, `coloca influencia en la cámara ${a.ch + 1}`); return; }
      if (a.op === "conspire") { done(); if (s.ag.deck.length) { conspire(s, pi); log(s, pi, "conspira"); } return; }
      throw err("Elige colocar influencia o conspirar.");
    }
    case "drawc": {
      const both = a.keep === "both" && hasTok(p, "crimen");
      if (!both && !pen.opts.includes(a.keep)) throw err("Elige qué conspiración te quedas.");
      done();
      const keep = both ? pen.opts : [a.keep], other = pen.opts.filter(id => !keep.includes(id));
      s.ag.deck = s.ag.deck.filter(id => !pen.opts.includes(id));
      if (other.length) { if (a.bottom) s.ag.deck.push(...other); else s.ag.deck.unshift(...other); }
      keep.forEach(id => p.consp.push({ id, prep: false, used: false }));
      return;
    }
    case "curia": {
      const c = p.consp.find(x => x.id === a.id && !x.prep && !x.used);
      if (!c) throw err("Elige una conspiración sin preparar.");
      done(); c.used = true; c.prep = true; consEffect(s, pi, c.id); return;
    }
    case "coaccion": {
      const mine = p.cards.indexOf(a.mine), theirs = o.cards.indexOf(a.theirs);
      if (mine < 0 || theirs < 0 || CARDS[a.mine].col !== CARDS[a.theirs].col || !["blue", "green"].includes(CARDS[a.mine].col)) throw err("Elige dos cartas del mismo color (azul o verde).");
      done(); p.cards[mine] = a.theirs; o.cards[theirs] = a.mine;
      log(s, pi, `cambia ${CARDS[a.mine].n} por ${CARDS[a.theirs].n}`);
      if (CARDS[a.theirs].sci) sciGain(s, pi, CARDS[a.theirs].sci);
      if (CARDS[a.mine].sci) sciGain(s, 1 - pi, CARDS[a.mine].sci);
      return;
    }
    case "oscuro": {
      const fromBoard = s.tokens.includes(a.id), fromOpp = o.tokens.includes(a.id);
      if (!fromBoard && !fromOpp) throw err("Elige una ficha de la mesa o del rival.");
      done();
      if (fromBoard) s.tokens = s.tokens.filter(t => t !== a.id); else o.tokens = o.tokens.filter(t => t !== a.id);
      log(s, pi, `saca del juego la ficha ${TOKENS[a.id].n}`); return;
    }
    case "vuelco": {
      if (a.skip) { done(); return; }
      if (!accessible(s, a.slot)) throw err("Elige una carta libre.");
      const t = s.slots[a.slot]; s.discard.push(t.c); log(s, pi, `manda al descarte ${CARDS[t.c].n}`);
      take(s, a.slot, pi);
      pen.left--; if (pen.left <= 0 || !pendingValid(s, pen)) s.pending.splice(s.pending.indexOf(pen), 1);
      return;
    }
    case "reforma": {
      const from = s.ag.ch[a.from], to = s.ag.ch[a.to];
      if (!from || !to || a.from === a.to || !from.dec.length) throw err("Elige de qué cámara a qué cámara.");
      done(); const d = from.dec.shift(); d.up = true; to.dec.push(d);
      const keepCtrl = s.ag.ch.map(ch => ch.ctrl);
      /* la Legión se aplica según quién controle la cámara nueva */
      if (d.id === "legion") { if (keepCtrl[a.from] !== null) military(s, 1 - keepCtrl[a.from], 1); if (keepCtrl[a.to] !== null) military(s, keepCtrl[a.to], 1); }
      log(s, pi, `mueve el decreto ${DECREES[d.id].n} a la cámara ${a.to + 1}`); return;
    }
  }
  throw err("Acción no válida.");
}

/* partidas guardadas con la versión sin expansiones */
function upgrade(s) {
  if (s.v >= 2) return s;
  s.v = 2; s.x = { pan: false, ag: false }; s.removed = s.removed || [];
  s.P.forEach(p => Object.assign(p, { gods: [], myth: [], ofr: [], astarte: 0, nisaba: null, consp: [], cubes: 12 }, { ...p }));
  s.pending = s.pending.map(x => x.t === "lib" ? { ...x, t: "pickbox" } : x.t === "destroy" ? { t: "steal", who: x.who, cols: [x.col], destroy: true } : x);
  return s;
}

/* acción del jugador pi; devuelve un estado nuevo o lanza un error con el motivo */
function act(state, pi, a, rng) {
  rng = rng || Math.random;
  const s = upgrade(clone(state));
  if (s.phase === "end") throw err("La partida ha terminado.");
  if (actor(s) !== pi) throw err("No es tu turno.");
  const p = s.P[pi], pen = s.pending[0];
  s.last = { p: pi, t: a.t };

  if (pen) resolve(s, pi, pen, a, rng);
  else if (s.phase === "draft") {
    if (a.t !== "draft" || !s.draft.pool.includes(a.w)) throw err("Elige una maravilla de las disponibles.");
    s.draft.pool = s.draft.pool.filter(w => w !== a.w);
    s.draft.step++;
    pickWonder(s, pi, a.w);
    s.last.w = a.w;
  } else if (a.t === "trigger") {
    if (!canTrigger(s, pi)) throw err("Ahora no puedes desvelar una conspiración.");
    const c = p.consp.find(x => x.id === a.id && x.prep && !x.used);
    if (!c) throw err("Esa conspiración no está preparada.");
    c.used = true; s.ag.trig = s.turn; consEffect(s, pi, c.id);
  } else if (a.t === "god") {
    if (!s.pan || s.age < 2) throw err("Los dioses se invocan a partir de la Era II.");
    const x = s.pan.sp[a.sp]; if (!x) throw err("Esa casilla está vacía.");
    const use = (a.ofr || []).slice().sort((u, v) => v - u);
    const pool = p.ofr.slice(); for (const v of use) { const i = pool.indexOf(v); if (i < 0) throw err("No tienes esa ofrenda."); pool.splice(i, 1); }
    const cost = Math.max(0, godCost(s, pi, a.sp) - use.reduce((u, v) => u + v, 0));
    if (avail(p) < cost) throw err("No te llegan las monedas.");
    spend(p, cost); p.ofr = pool; s.pan.sp[a.sp] = null;
    s.last.god = x.g;
    if (x.g === "gate") {
      p.gods.push("gate"); log(s, pi, `abre ${GATE.e} La Puerta${cost ? ` (paga ${cost} 🪙)` : ""}`);
      push(s, { t: "gate", who: pi, opts: Object.values(s.pan.decks).filter(d => d.length).map(d => d[0]) });
    } else { if (cost) log(s, pi, `paga ${cost} 🪙 al Panteón`); p.gods.push(x.g); invokeGod(s, pi, x.g); }
    s.turn++; s.open = true;
  } else {
    const i = a.slot;
    if (!accessible(s, i)) throw err("Esa carta no está libre.");
    const id = s.slots[i].c, c = CARDS[id];
    s.last.card = id;
    if (a.t === "build") {
      const q = cardPrice(s, pi, id);
      if (!q.ok) throw err("No te llegan las monedas.");
      pay(s, pi, q); take(s, i, pi);
      log(s, pi, `${c.col === "senator" ? "recluta a" : "construye"} ${c.n}${q.chain ? " gratis por encadenamiento" : q.total ? ` (paga ${q.total} 🪙)` : ""}`);
      placeCard(s, pi, id, q.chain && !c.templeOf);
    } else if (a.t === "discard") {
      const g = discardGain(s, pi);
      take(s, i, pi); s.discard.push(id); p.coins += g;
      log(s, pi, `descarta ${c.n} y gana ${g} 🪙`);
    } else if (a.t === "wonder") {
      const w = p.wonders.find(x => x.id === a.w && !x.built && !x.lost), W = WONDERS[a.w];
      if (!w) throw err("Esa maravilla no es tuya o ya está construida.");
      if (wondersLeft(s) <= 0) throw err("Ya se han construido las 7 maravillas.");
      const q = wonderPrice(s, pi, a.w);
      if (!q.ok) throw err("No te llegan las monedas.");
      pay(s, pi, q); take(s, i, pi);
      s.last.w = a.w;
      log(s, pi, `construye la maravilla ${W.e} ${W.n}${q.total ? ` (paga ${q.total} 🪙)` : ""}`);
      buildWonder(s, pi, w, id);
    } else if (a.t === "prep") {
      if (!s.ag) throw err("Acción no válida.");
      const cs = p.consp.find(x => x.id === a.id && !x.prep && !x.used);
      if (!cs) throw err("Esa conspiración no se puede preparar.");
      take(s, i, pi); cs.prep = true; cs.card = id;
      log(s, pi, "prepara una conspiración en secreto");
    } else throw err("Acción no válida.");
    s.turn++; s.open = true;
  }
  settle(s, rng);
  return s;
}

/* acciones legales para el jugador al que le toca (para pruebas y ayudas) */
function legal(s) {
  const pi = actor(s); if (pi === null) return [];
  const p = s.P[pi], o = s.P[1 - pi], pen = s.pending[0];
  if (pen) {
    switch (pen.t) {
      case "sci": return s.tokens.map(id => ({ t: "sci", id }));
      case "pickbox": return pen.opts.map(id => ({ t: "pickbox", id }));
      case "steal": return o.cards.filter(id => pen.cols.includes(CARDS[id].col)).map(card => ({ t: "steal", card }));
      case "mau": return s.discard.filter(rebuildable).map(card => ({ t: "mau", card }));
      case "traicion": return s.removed.map(card => ({ t: "traicion", card }));
      case "start": return [{ t: "start", who: 0 }, { t: "start", who: 1 }];
      case "myth": { const out = []; pen.opts.forEach(g => s.pan.sp.forEach((v, sp) => { if (!v) out.push({ t: "myth", g, sp }); })); return out; }
      case "nisaba": return o.cards.filter(id => CARDS[id].col === "green").map(card => ({ t: "nisaba", card }));
      case "zeus": return s.slots.map((t, slot) => t.gone ? null : { t: "zeus", slot }).filter(Boolean);
      case "anubis": { const out = []; [0, 1].forEach(w => s.P[w].wonders.forEach(x => { if (x.built) out.push({ t: "anubis", who: w, w: x.id }); })); return out; }
      case "isis": { const out = []; s.discard.filter(rebuildable).forEach(card => p.wonders.forEach(w => { if (!w.built && !w.lost) out.push({ t: "isis", card, w: w.id }); })); return out; }
      case "ra": return o.wonders.filter(w => !w.built && !w.lost).map(w => ({ t: "ra", w: w.id }));
      case "sabotaje": return o.wonders.filter(w => w.built).map(w => ({ t: "sabotaje", w: w.id }));
      case "minerva": { const out = []; for (let x = -9; x <= 9; x++) if (x !== s.pawn) out.push({ t: "minerva", pos: x }); return out; }
      case "neptuno": { const ks = Object.keys(s.loot).filter(q => s.loot[q]), out = []; ks.forEach(off => { out.push({ t: "neptuno", off, apply: null }); ks.forEach(ap => { if (ap !== off) out.push({ t: "neptuno", off, apply: ap }); }); }); return out; }
      case "gate": return pen.opts.map(g => ({ t: "gate", g }));
      case "theater": return [].concat(...Object.values(s.pan.decks)).map(g => ({ t: "theater", g }));
      case "senate": {
        const out = [{ t: "senate", op: "end" }];
        if (pen.allow !== "move" && p.cubes > 0) (pen.sec ? SECTIONS[pen.sec] : [0, 1, 2, 3, 4, 5]).forEach(ch => out.push({ t: "senate", op: "place", ch }));
        if (pen.allow !== "place") s.ag.ch.forEach((ch, i) => { if (ch.c[pi] > 0) [i - 1, i + 1].forEach(to => { if (to >= 0 && to < 6) out.push({ t: "senate", op: "move", from: i, to }); }); });
        return out;
      }
      case "purga": return s.ag.ch.map((ch, i) => ch.c[1 - pi] > 0 ? { t: "purga", ch: i } : null).filter(Boolean);
      case "cons": { const out = [{ t: "cons", op: "conspire" }]; if (p.cubes > 0) for (let ch = 0; ch < 6; ch++) out.push({ t: "cons", op: "place", ch }); return out; }
      case "drawc": { const out = pen.opts.map(keep => ({ t: "drawc", keep, bottom: false })); if (hasTok(p, "crimen")) out.push({ t: "drawc", keep: "both" }); return out; }
      case "curia": return p.consp.filter(c => !c.prep && !c.used).map(c => ({ t: "curia", id: c.id }));
      case "coaccion": { const out = []; p.cards.forEach(m => o.cards.forEach(t => { if (CARDS[m].col === CARDS[t].col && ["blue", "green"].includes(CARDS[m].col)) out.push({ t: "coaccion", mine: m, theirs: t }); })); return out; }
      case "oscuro": return s.tokens.concat(o.tokens).map(id => ({ t: "oscuro", id }));
      case "vuelco": return [{ t: "vuelco", skip: true }].concat(s.slots.map((t, slot) => accessible(s, slot) ? { t: "vuelco", slot } : null).filter(Boolean));
      case "reforma": { const out = []; s.ag.ch.forEach((ch, f) => { if (ch.dec.length) for (let to = 0; to < 6; to++) if (to !== f) out.push({ t: "reforma", from: f, to }); }); return out; }
    }
    return [];
  }
  if (s.phase === "draft") return s.draft.pool.map(w => ({ t: "draft", w }));
  const out = [];
  if (canTrigger(s, pi)) p.consp.filter(c => c.prep && !c.used).forEach(c => out.push({ t: "trigger", id: c.id }));
  s.slots.forEach((t, i) => {
    if (!accessible(s, i)) return;
    out.push({ t: "discard", slot: i });
    if (cardPrice(s, pi, t.c).ok) out.push({ t: "build", slot: i });
    if (wondersLeft(s) > 0) p.wonders.forEach(w => { if (!w.built && !w.lost && wonderPrice(s, pi, w.id).ok) out.push({ t: "wonder", slot: i, w: w.id }); });
    p.consp.forEach(c => { if (!c.prep && !c.used) out.push({ t: "prep", slot: i, id: c.id }); });
  });
  if (s.pan && s.age >= 2) s.pan.sp.forEach((x, sp) => {
    if (!x) return;
    const ofr = p.ofr.slice(), c = godCost(s, pi, sp);
    if (avail(p) >= c) out.push({ t: "god", sp, ofr: [] });
    else if (avail(p) + ofr.reduce((u, v) => u + v, 0) >= c) out.push({ t: "god", sp, ofr });
  });
  return out;
}

const Motor = { RES, RAW, CARDS, WONDERS, TOKENS, SCI, SCI_N, LAYOUT, MYTHS, GODS, GATE, PAN_COST, TEMPLE_VP, CHAMBER_VP, SECTIONS, SEC_N, DECREES, CONSPS,
  newGame, act, actor, upgrade, legal, accessible, cardPrice, wonderPrice, godCost, discardGain, wondersLeft, prod, choices, tradePrice, sciSymbols, score, count,
  senateActions, senatorCost, canTrigger, cubesOn, hasDecree, avail };
if (typeof module !== "undefined" && module.exports) module.exports = Motor;
else root.Motor = Motor;
})(typeof window !== "undefined" ? window : globalThis);
