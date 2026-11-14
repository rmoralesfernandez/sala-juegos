/* Doble Mando: motor de reglas puro (estilo Sky Team) + compañero IA.
   Sin DOM: se usa igual en el navegador (window.Cabina) y en node (module.exports).
   Asiento 0 = Piloto (dados azules), asiento 1 = Copiloto (dados naranjas).
   El estado es JSON plano; todo el azar sale de s.r (semilla), así los dos móviles calculan lo mismo.
   Incluye el «Libro de vuelo»: 21 escenarios, dado de tráfico, giros, módulos y capacidades especiales. */
(function (root) {
"use strict";

const P = 0, C = 1;
const ROLE = ["Piloto", "Copiloto"];
const ROUNDS = 7;
const ALT = [6000, 5000, 4000, 3000, 2000, 1000, 0];
const BLUE0 = 4.5, ORANGE0 = 8.5;    // marcadores de aerodinámica (entre 4|5 y entre 8|9)
const BRAKE = [0, 2, 4, 6];          // valor del freno según frenos desplegados (sin frenos no se puede parar)
const ICE = [0, 2, 3, 4, 5];         // frenos para el hielo: valor del marcador según columnas completadas
const MAX_COFFEE = 3, MAX_RR = 3, FUEL0 = 20, KERO_MISS = 6, PLANES = 12;   // 12 contadores de avión en la caja
/* Anillo de viento: 20 marcas en el sentido de las agujas del reloj, empezando arriba (morro al centro blanco) */
const WIND = [3, 3, 2, 2, 1, 0, -1, -2, -2, -3, -3, -3, -2, -2, -1, 0, 1, 2, 2, 3];

/* ================= escenarios =================
   Cada casilla de la aproximación: [aviones, iconos de tráfico, giro permitido (posiciones del eje) o 0].
   Eje negativo = inclinado hacia el piloto (izquierda), positivo = hacia el copiloto (derecha).
   col: g verde (rutina), y amarillo (excepcional), r rojo (élite), k negro (heroico).
   mods: kero (queroseno), leak (fuga), trainee (piloto en prácticas), wind (viento), rt (tiempo real), ice (frenos para el hielo). */
const L2 = [-2, -1], L1 = [-1, 0], R1 = [0, 1], R2 = [1, 2], M1 = [-1, 0, 1], Z0 = [0], L3 = [-2, -1, 0], R3 = [0, 1, 2];
const SC = [
  { id: "yul", col: "g", code: "YUL", name: "Montréal-Trudeau", mods: [], caps: 0, tr: [[0], [0], [1], [2], [1], [3], [2]],
    txt: "Tu primer vuelo va bien: el sol se alza sobre el río San Lorenzo. Condiciones ideales para un aterrizaje perfecto." },
  { id: "lhr1", col: "g", code: "LHR", name: "Heathrow", mods: [], caps: 0, tr: [[0, 1], [0], [1], [0], [1, 1], [1], [2]],
    txt: "El Támesis atraviesa las luces de Londres. Hay tráfico al final de la aproximación: mantén la calma." },
  { id: "hnd1", col: "g", code: "HND", name: "Haneda", mods: [], caps: 0, tr: [[0], [1], [0], [1, 0, L1], [1, 0, L2], [0, 0, L1], [1], [0]],
    txt: "Con el monte Fuji en el horizonte, un giro amplio a la izquierda para sobrevolar la bahía de Tokio." },
  { id: "osl1", col: "g", code: "OSL", name: "Gardermoen", mods: ["kero"], caps: 0, tr: [[0], [0], [1], [1], [2], [1], [0]],
    txt: "Descenso hacia Oslo, con el lago Øyeren a la derecha. No apartes la vista del indicador de combustible." },
  { id: "atl1", col: "g", code: "ATL", name: "Hartsfield-Jackson", mods: ["trainee"], caps: 0, tr: [[0, 2], [0, 1], [1], [0], [1], [0], [0], [2]],
    txt: "Atlanta y un cielo atestado de aviones. Además tienes que instruir a un piloto en prácticas muy nervioso." },
  { id: "prg1", col: "g", code: "PRG", name: "Václav Havel", mods: ["kero"], caps: 2, tr: [[0, 1], [0, 0, L1], [1], [1], [0], [2], [0], [1]],
    txt: "Tus habilidades están mejorando. Úsalas para aterrizar sin peligro en Praga." },
  { id: "lhr2", col: "y", code: "LHR", name: "Heathrow", mods: ["trainee"], caps: 0, tr: [[0, 1], [1, 1], [1, 1], [0], [1], [1], [0]],
    txt: "La niebla ha llenado el cielo de aviones en espera sobre Londres. Alerta desde el principio de la aproximación." },
  { id: "tgu1", col: "y", code: "TGU", name: "Toncontín", mods: ["kero"], caps: 2, tr: [[0], [0], [1], [2, 0, R1], [1, 0, R2], [0]],
    txt: "Aeropuerto al pie de una cuenca de montañas: descenso rápido y giro final muy cerrado. ¡Bienvenidos a Honduras!" },
  { id: "gig1", col: "y", code: "GIG", name: "Galeão", mods: ["wind"], caps: 1, tr: [[0], [0], [1, 0, R1], [0, 0, R2], [1, 0, R1], [1], [1], [0]],
    txt: "La torre de Río no responde y el viento de cola dispara la velocidad sobre Copacabana. Giro amplio y velocidad controlada." },
  { id: "kef1", col: "y", code: "KEF", name: "Keflavík", mods: ["ice"], caps: 1, tr: [[0], [0], [1], [1], [1], [1], [0]],
    txt: "Todo está blanco por la nieve recién caída. Delicadeza para aterrizar en la tierra del fuego y el hielo." },
  { id: "prg2", col: "y", code: "PRG", name: "Václav Havel", mods: ["leak"], caps: 2, tr: [[0], [1], [0], [2, 1], [0], [1], [0]],
    txt: "Cielo despejado sobre los Cárpatos... hasta que suena la alarma: estáis perdiendo combustible." },
  { id: "kul1", col: "y", code: "KUL", name: "Kuala Lumpur", mods: ["kero"], caps: 1, tr: [[0], [0, 1], [1, 0, M1], [1, 0, M1], [0, 0, M1], [1, 0, M1], [1], [0]],
    txt: "Tormentas eléctricas sobre Malasia. Mantén el avión entre los relámpagos: viaje accidentado." },
  { id: "atl2", col: "y", code: "ATL", name: "Hartsfield-Jackson", mods: ["leak"], caps: 1, tr: [[0, 1], [1, 1], [0, 1], [1], [1, 1], [0], [1], [0]],
    txt: "Acción de Gracias en el aeropuerto con más tráfico del mundo... y una fuga de combustible." },
  { id: "pbh1", col: "r", code: "PBH", name: "Paro", mods: ["kero", "rt"], caps: 2, tr: [[0], [0, 0, L2], [1, 0, L1], [0, 0, R1], [1, 0, R2], [1, 0, R1], [0]],
    txt: "Bután, al filo del Himalaya, a más de 7000 pies. Un valle estrecho entre montañas altísimas. Sin tiempo para pensar." },
  { id: "hnd2", col: "r", code: "HND", name: "Haneda", mods: ["kero", "trainee"], caps: 1, tr: [[0, 1], [1], [1, 1], [1, 0, L2], [0, 1, L1], [1], [1], [0]],
    txt: "Hanami: el corredor aéreo se ha estrechado y numerosos aviones surcan el cielo." },
  { id: "gig2", col: "r", code: "GIG", name: "Galeão", mods: ["wind", "leak"], caps: 2, tr: [[0], [0], [1, 0, R1], [1, 0, R2], [1, 0, R2], [0, 0, R1], [1], [0]],
    txt: "Un ciclón tropical: vientos fuertes y un corredor estrecho. Puedes hacerlo, pero ¿por qué te sudan las manos?" },
  { id: "osl2", col: "r", code: "OSL", name: "Gardermoen", mods: ["leak", "ice"], caps: 2, tr: [[0], [1], [1], [1], [1], [1], [0]],
    txt: "Pista helada y reservas bajas desde hace 30 minutos. 150 personas dependen de ti." },
  { id: "tgu2", col: "r", code: "TGU", name: "Toncontín", mods: ["kero", "wind"], caps: 2, tr: [[0], [0], [1], [1], [1, 0, L2], [1, 0, L2], [0]],
    txt: "La idea de aterrizar en Tegucigalpa te da pesadillas. Desciende a la izquierda entre las montañas." },
  { id: "kul2", col: "r", code: "KUL", name: "Kuala Lumpur", mods: ["kero", "rt"], caps: 2, tr: [[0], [0, 1, M1], [1, 0, M1], [1, 1, M1], [1, 0, M1], [1, 1, M1], [1, 0, M1], [0]],
    txt: "Los relámpagos refulgen alrededor. Es como volar hacia el infierno, y el tiempo corre en vuestra contra." },
  { id: "kef2", col: "k", code: "KEF", name: "Keflavík", mods: ["wind", "ice"], caps: 2, tr: [[0], [1], [0, 1], [1], [1, 1, L1], [1, 0, R1], [1], [0]],
    txt: "Una ventisca increíble: las luces de la pista apenas se ven bajo la nieve. Lleva tu atención al extremo." },
  { id: "pbh2", col: "k", code: "PBH", name: "Paro", mods: ["kero", "rt"], caps: 2, tr: [[0], [1, 0, L2], [1, 1, L1], [1, 0, R1], [1, 0, R2], [1, 0, R1], [0]],
    txt: "Solo 8 pilotos en el mundo tienen licencia para aterrizar aquí. Ha llegado el momento de añadir tu nombre a la lista." },
  /* «Listo para jugar»: aproximaciones de la caja con otros módulos (cara roja/negra de la altitud) */
  { id: "yul2", grp: "rtp", col: "r", code: "YUL", name: "Montréal-Trudeau", mods: ["ice", "trainee"], caps: 1, base: "yul",
    txt: "De vuelta a Montreal en pleno invierno. Al piloto en prácticas le preocupa aterrizar sobre una pista helada... ¿y a vosotros?" },
  { id: "lhr3", grp: "rtp", col: "r", code: "LHR", name: "Heathrow", mods: [], caps: 1, base: "lhr1", add: [[0, 1]], alt0: 1,
    txt: "Os acercáis a Londres y ya estáis a 5000 pies. ¿Mantendréis la calma con los reflejos a prueba?" },
  { id: "prg3", grp: "rtp", col: "r", code: "PRG", name: "Václav Havel", mods: ["kero", "wind"], caps: 1, base: "prg1", add: [[0, 1], [1, 1]],
    txt: "Tráfico denso y fuertes corrientes de viento sobre Praga: hará falta mucha precisión en la maniobra." },
  { id: "atl3", grp: "rtp", col: "k", code: "ATL", name: "Hartsfield-Jackson", mods: ["kero"], caps: 1, base: "atl1",
    txt: "El aeropuerto más concurrido del mundo y un atasco aéreo como nunca habéis visto. ¿En qué pensarán los controladores?" },
  /* Escenarios promocionales (imprimir y jugar), con sus aproximaciones exactas */
  { id: "blq1", grp: "promo", col: "g", code: "BLQ", name: "Guglielmo Marconi", mods: ["leak"], caps: 0, tr: [[1, 3], [1, 0, L1], [1, 1], [1, 0, R1], [2], [2]],
    txt: "Dejas atrás los Dolomitas y el lago de Garda y te lanzas sobre Emilia-Romaña. Bolonia aparece en el horizonte." },
  { id: "blq2", grp: "promo", col: "r", code: "BLQ", name: "Guglielmo Marconi", mods: ["kero"], caps: 1, tr: [[1, 3], [1, 0, Z0], [2], [1, 0, Z0], [1], [2]],
    txt: "Cielo despejado sobre Bolonia, pero el corredor es estrecho: hay que mantener el avión perfectamente nivelado." },
  { id: "bud1", grp: "promo", col: "y", code: "BUD", name: "Budapest Ferenc Liszt", mods: ["wind"], caps: 0, tr: [[0, 3], [1], [1, 0, R1], [2, 1], [1, 0, L2], [2]],
    txt: "Sobrevuelas el lago Balaton hacia la capital húngara. El viento sopla fuerte en tu cola: alinéate con la pista." },
  { id: "bud2", grp: "promo", col: "r", code: "BUD", name: "Budapest Ferenc Liszt", mods: ["wind"], caps: 2, alt0: 1, tr: [[1, 4], [1], [1, 1, R1], [1, 1, R2], [1, 0, L2], [1]],
    txt: "Con viento de cola sobre Budapest y empezando ya a 5000 pies (sin ficha de volver a tirar)." },
  { id: "cdg1", grp: "promo", col: "y", code: "CDG", name: "Paris-Charles de Gaulle", mods: ["wind", "trainee"], caps: 0, tr: [[0, 3], [1], [0], [0, 1], [2, 1], [2, 1], [1], [2]],
    txt: "Vientos potentes sobre París y un tráfico muy denso: un bautismo de fuego para el piloto en prácticas." },
  { id: "cdg2", grp: "promo", col: "r", code: "CDG", name: "Paris-Charles de Gaulle", mods: ["kero", "wind", "trainee"], caps: 0, tr: [[1, 2], [0], [0], [0, 1, L2], [1], [1, 1, R2], [2], [1]],
    txt: "París con viento, tráfico, poco combustible y un piloto en prácticas a tu lado. ¿Estás listo?" },
  { id: "dus1", grp: "promo", col: "y", code: "DUS", name: "Düsseldorf", mods: ["leak"], caps: 2, tr: [[0, 3], [1], [1], [2, 0, M1], [1], [2, 2, M1], [1], [1]],
    txt: "Un fallo informático ha cerrado Ámsterdam y te desvían a Düsseldorf. Ya hay atasco entre las nubes." },
  { id: "dus2", grp: "promo", col: "k", code: "DUS", name: "Düsseldorf", mods: ["rt", "leak"], caps: 1, tr: [[1, 2], [0, 0, Z0], [0, 1], [1, 2, L2], [2], [1, 1, R2], [3], [2]],
    txt: "Desvío a Düsseldorf con una fuga de combustible y el reloj en contra. ¿Qué más puede pasar?" },
  { id: "lga1", grp: "promo", col: "y", code: "LGA", name: "LaGuardia", mods: ["ice"], caps: 2, tr: [[0, 1], [0, 0, R3], [0, 1], [1, 0, L3], [2, 1], [1], [1]],
    txt: "Un frente frío ha congelado la costa este. Brooklyn y Manhattan relucen de escarcha y la pista está helada." },
  { id: "lga2", grp: "promo", col: "k", code: "LGA", name: "LaGuardia", mods: ["kero", "ice"], caps: 1, tr: [[0, 0, R3], [0], [0, 1, R2], [0], [1, 1, L2], [1], [0]],
    txt: "Pista congelada en Nueva York y combustible justo. Ahora todo depende de ti." },
  { id: "nzir1", grp: "promo", col: "r", code: "NZIR", name: "Ice Runway (Antártida)", mods: ["wind", "ice"], caps: 1, wind: "front", tr: [[0, 3], [0, 0, L2], [0], [1], [1, 0, R1], [1], [0], [0]],
    txt: "Un fuerte viento frontal del polo sacude el avión. Aterrizar un avión de pasajeros en una pista sobre el hielo parece surrealista." },
  { id: "nzir2", grp: "promo", col: "k", code: "NZIR", name: "Ice Runway (Antártida)", mods: ["wind", "ice", "kero", "trainee"], caps: 0, wind: "front", tr: [[0, 2], [1], [0, 0, L1], [0], [0, 0, R2], [0], [0, 0, L1], [0]],
    txt: "Viento frontal, pista helada, poco combustible y un piloto en prácticas, en el fin del mundo." },
  { id: "ter1", grp: "promo", col: "y", code: "TER", name: "Lajes, Azores", mods: ["ice"], caps: 2, noEng: 1, tr: [[0, 3, L2], [0, 0, R3], [0, 0, L2], [0, 0, R2], [1, 0, L2], [1, 0, R2], [1]],
    txt: "24 de agosto de 2001, vuelo TS-236: el A330 se ha quedado sin queroseno y los dos motores se han parado. Hay que planear hasta Lajes." },
  { id: "ter2", grp: "promo", col: "k", code: "TER", name: "Lajes, Azores", mods: ["ice"], caps: 1, noEng: 1, tr: [[0, 3, L2], [0, 0, R2], [0, 0, L2], [1, 0, R2], [1, 0, L2], [1, 0, R2], [1]],
    txt: "Sin motores, demasiado rápido y demasiado alto. Después de un 360º, giros para frenar el avión. «Vamos a tener que hacer lo imposible»." }
];
/* Los escenarios «Listo para jugar» usan la aproximación de otro escenario */
for (const x of SC) if (x.base) { const b = SC.find(y => y.id === x.base); x.tr = b.tr.map(c => c.slice()); for (const [i, n] of x.add || []) x.tr[i][0] += n; }
const SC_BY = Object.fromEntries(SC.map(x => [x.id, x]));
const COLOR_NAME = { g: "Aterrizaje rutinario", y: "Condiciones excepcionales", r: "Solo pilotos de élite", k: "Aterrizaje heroico" };
const GROUPS = { libro: "Libro de vuelo", rtp: "Listo para jugar", promo: "Escenarios promocionales" };
const MODS = {
  kero: { n: "Queroseno", i: "⛽", t: "Empezáis con 20 de queroseno. Cualquiera puede poner un dado en el depósito: gasta tanto como su valor. Si en una ronda no se pone, se gastan 6. Si llega a 0, os quedáis secos y perdéis." },
  leak: { n: "Fuga de queroseno", i: "💧", t: "Empezáis con 20 de queroseno y el depósito no se puede usar. Cada ronda perdéis la diferencia entre los dos dados de motores, +1. Si llega a 0, perdéis." },
  trainee: { n: "Piloto en prácticas", i: "🧑‍✈️", t: "En tu turno pon un dado en tu casilla de prácticas (distinto del valor de la ficha que toca) y coloca esa ficha donde podrías poner un dado: actúa con su valor. El café no cambia las fichas y no valen para concentración. Al aterrizar no puede quedar ninguna." },
  wind: { n: "Viento", i: "🌬️", t: "La velocidad del viento se suma a los motores, también en la última ronda. Tras resolver el eje, el anillo de viento gira tantas marcas como esté inclinado el avión, hacia ese lado." },
  rt: { n: "Tiempo real", i: "⏱️", t: "Cada ronda tenéis 60 segundos desde que se tiran los dados. Al acabar el tiempo, los dados sin poner se pierden; si faltan el eje o los motores, perdéis." },
  ice: { n: "Frenos para el hielo", i: "❄️", t: "Sustituyen a los frenos. Cuatro columnas (2, 3, 4, 5) en orden: piloto arriba y copiloto abajo tienen que poner ese mismo valor en la misma ronda. Un dado solo se pierde. Hay que completarlas todas y en la última ronda la velocidad debe ser menor que 5." }
};
const CAPS = {
  adapt: { n: "Adaptación", t: "Una vez por partida, cada jugador puede dar la vuelta a uno de sus dados sin colocar (1↔6, 2↔5, 3↔4)." },
  antic: { n: "Anticipación", t: "Cada ronda, antes de poner su primer dado, quien empieza puede volver a tirar uno de sus dados." },
  control: { n: "Control", t: "Si en el eje se juegan 2 dados del mismo valor, ganáis un café al momento." },
  master: { n: "Maestría", t: "Si en los motores se juegan 2 dados del mismo valor, ganáis una ficha de volver a tirar (si queda alguna disponible)." },
  sync: { n: "Sincronización", t: "Una vez por ronda, con al menos 1 dado en el tren y 1 en los flaps, el copiloto tira el dado de tráfico y lo pone en cualquier casilla libre, sea del color que sea, con su efecto normal." },
  team: { n: "Trabajo en equipo", t: "Una vez por ronda, en tu turno, pones un dado en esta carta y tu compañero tiene que poner uno de los suyos: os intercambiáis los valores y os los quedáis." }
};
const CAP_IDS = Object.keys(CAPS);

/* Casillas del panel (las de módulos solo existen si el escenario las usa) */
const SLOTS = {
  axP: { who: P, k: "axis" }, axC: { who: C, k: "axis" },
  enP: { who: P, k: "eng" }, enC: { who: C, k: "eng" },
  raP: { who: P, k: "radio" }, raC1: { who: C, k: "radio" }, raC2: { who: C, k: "radio" },
  g1: { who: P, k: "gear", i: 0, ok: [1, 2] }, g2: { who: P, k: "gear", i: 1, ok: [3, 4] }, g3: { who: P, k: "gear", i: 2, ok: [5, 6] },
  b1: { who: P, k: "brake", i: 0, ok: [2] }, b2: { who: P, k: "brake", i: 1, ok: [4] }, b3: { who: P, k: "brake", i: 2, ok: [6] },
  f1: { who: C, k: "flap", i: 0, ok: [1, 2] }, f2: { who: C, k: "flap", i: 1, ok: [2, 3] }, f3: { who: C, k: "flap", i: 2, ok: [4, 5] }, f4: { who: C, k: "flap", i: 3, ok: [5, 6] },
  c1: { who: -1, k: "conc" }, c2: { who: -1, k: "conc" }, c3: { who: -1, k: "conc" },
  ke: { who: -1, k: "kero", m: "kero" },
  trP: { who: P, k: "train", m: "trainee" }, trC: { who: C, k: "train", m: "trainee" },
  iP0: { who: P, k: "ice", i: 0, ok: [2], m: "ice" }, iP1: { who: P, k: "ice", i: 1, ok: [3], m: "ice" }, iP2: { who: P, k: "ice", i: 2, ok: [4], m: "ice" }, iP3: { who: P, k: "ice", i: 3, ok: [5], m: "ice" },
  iC0: { who: C, k: "ice", i: 0, ok: [2], m: "ice" }, iC1: { who: C, k: "ice", i: 1, ok: [3], m: "ice" }, iC2: { who: C, k: "ice", i: 2, ok: [4], m: "ice" }, iC3: { who: C, k: "ice", i: 3, ok: [5], m: "ice" }
};
const SLOT_IDS = Object.keys(SLOTS);
const MAND = [["axP", "enP"], ["axC", "enC"]];

/* Compatibilidad: la ruta de iniciación de antes */
const ROUTE = { code: "YUL", name: "Montréal-Trudeau", planes: SC[0].tr.map(x => x[0]) };
const AIRPORT = ROUTE.planes.length - 1;
const REROLL_AT = [0, 4];

/* ================= azar con semilla ================= */
function rnd(s) { let t = (s.r = (s.r + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const d6 = s => 1 + Math.floor(rnd(s) * 6);
const mix = (a, b) => (Math.imul((a ^ b) >>> 0, 2654435761) ^ (b * 40503)) >>> 0;
const clone = o => JSON.parse(JSON.stringify(o));

/* ================= escenario del estado ================= */
const scen = s => SC_BY[s.sc] || SC[0];
const airport = s => scen(s).tr.length - 1;
const has = (s, m) => scen(s).mods.includes(m);
const hasCap = (s, c) => (s.caps || []).includes(c);
const rerollAt = s => scen(s).col === "g" || scen(s).col === "y" ? [0, 4] : [0];
const traffic = (s, i) => (scen(s).tr[i] || [])[1] || 0;
const turnAt = (s, i) => (scen(s).tr[i] || [])[2] || null;
const windVal = s => has(s, "wind") ? (scen(s).wind === "front" ? -1 : 1) * WIND[((s.wind || 0) % 20 + 20) % 20] : 0;
const noEng = s => !!scen(s).noEng;
const mandOf = (s, p) => noEng(s) ? [MAND[p][0]] : MAND[p];
const playN = s => noEng(s) ? 3 : 4;                          // Lajes: se tiran 4 dados pero solo se juegan 3
const playsLeft = (s, p) => Math.min(s.dice[p].length, playN(s) - ((s.pl && s.pl[p]) || 0));
const slotOn = (s, id) => { const S = SLOTS[id]; if (!S) return false; if (S.k === "eng" && noEng(s)) return false; if (S.m && !has(s, S.m)) return false; if (S.k === "brake" && has(s, "ice")) return false; if (S.k === "kero" && has(s, "leak")) return false; return true; };
/* Fichas de volver a tirar que quedan para Maestría (3 en total: las que tenéis y las que aún esperan en la altitud no cuentan) */
const rrPool = s => Math.max(0, MAX_RR - s.rr - rerollAt(s).filter(i => i > s.round - 1).length);

function newGame(seed, wins, opt) {
  opt = opt || {};
  const sc = SC_BY[opt.sc] ? opt.sc : "yul", def = SC_BY[sc];
  const caps = (opt.caps || []).filter(c => CAPS[c]).slice(0, def.caps);
  const s = {
    v: 2, seed: seed >>> 0, r: seed >>> 0, sc, caps, route: def.code,
    round: 1 + (def.alt0 || 0), pos: 0, planes: def.tr.map(x => x[0]), axis: 0, gear: [0, 0, 0], flaps: 0, brakes: 0,
    coffee: 0, rr: 0, dice: [[], []], sl: {}, turn: P, first: P, speed: null, adv: null,
    rrPend: null, n: 0, last: null, hist: [], over: null, wins: wins || [0, 0], played: 0,
    fuel: def.mods.includes("kero") || def.mods.includes("leak") ? FUEL0 : null,
    wind: 0, ice: 0, tr: null, syncPend: null, syncR: 0, wtPend: null, wtR: 0, adapt: [0, 0], anticR: 0, pl: [0, 0]
  };
  if (def.mods.includes("trainee")) {
    const t = [1, 2, 3, 4, 5, 6];
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
    s.tr = t;
  }
  startRound(s);
  return s;
}
function startRound(s) {
  s.sl = {}; s.speed = null; s.adv = null; s.pl = [0, 0]; s.syncPend = null; s.wtPend = null;
  if (rerollAt(s).includes(s.round - 1) && s.rr < MAX_RR) s.rr++;
  /* dado de tráfico: tantas tiradas como iconos tenga la casilla actual */
  const nT = traffic(s, s.pos);
  if (nT && !final(s)) {
    const rolls = [], at = [];
    let none = 0;
    for (let i = 0; i < nT; i++) {
      const d = d6(s), a = Math.min(s.pos + d - 1, airport(s)); rolls.push(d);
      if (s.planes.reduce((x, y) => x + y, 0) < PLANES) { s.planes[a]++; at.push(a); } else { none++; at.push(-1); }   // sin contadores en la reserva no se pone ninguno
    }
    const L = { n: ++s.n, t: "traffic", rolls, at, pos: s.pos, r: s.round, none };
    s.hist.push(L); s.last = L;
  }
  s.dice = [[0, 0, 0, 0].map(() => d6(s)).sort(), [0, 0, 0, 0].map(() => d6(s)).sort()];
  s.first = s.turn = (s.round - 1) % 2 === 0 ? P : C;
}
function rematch(s) {
  const w = s.wins.slice();
  const ns = newGame(mix(s.seed, 9001 + w[0] + w[1] + s.n), w, { sc: s.sc, caps: s.caps });
  ns.played = (s.played || 0);
  return ns;
}

/* ================= consultas ================= */
const final = s => s.round === ROUNDS;
const gearCount = s => s.gear[0] + s.gear[1] + s.gear[2];
const blue = s => BLUE0 + gearCount(s);
const orange = s => ORANGE0 + s.flaps;
const brakeVal = s => has(s, "ice") ? ICE[s.ice || 0] : BRAKE[s.brakes];
function advFor(s, speed) { return speed < blue(s) ? 0 : speed > orange(s) ? 2 : 1; }
const placed = s => Object.keys(s.sl).length;
function mandLeft(s, p, except) { return mandOf(s, p).filter(id => !s.sl[id] && id !== except).length; }
/* Quién tiene que actuar ahora */
function actor(s) {
  if (s.over) return null;
  if (s.rrPend) return s.rrPend.need[0] ? 0 : s.rrPend.need[1] ? 1 : null;
  if (s.syncPend) return C;
  if (s.wtPend) return 1 - s.wtPend.p;
  return s.turn;
}
const nextTrainee = (s, p) => s.tr && s.tr.length ? (p === P ? s.tr[0] : s.tr[s.tr.length - 1]) : null;
/* ¿Puede el jugador p poner un valor v en la casilla id? (sin contar el café). any: el dado de tráfico va donde sea */
function slotWhy(s, p, id, v, o) {
  o = o || {};
  const S = SLOTS[id];
  if (!S || !slotOn(s, id)) return "Esa casilla no existe en este vuelo.";
  if (s.sl[id]) return "Esa casilla ya está ocupada esta ronda.";
  if (!o.any && S.who !== -1 && S.who !== p) return `Esa casilla es del ${ROLE[S.who].toLowerCase()}.`;
  if (S.ok && v != null && !S.ok.includes(v)) return `Ahí solo vale ${S.ok.join(" o ")}.`;
  if (S.k === "flap" && s.flaps < S.i) return "Los flaps se despliegan en orden, de arriba abajo.";
  if (S.k === "brake" && s.brakes < S.i) return "Los frenos se despliegan en orden: 2, luego 4, luego 6.";
  if (S.k === "ice" && (s.ice || 0) !== S.i) return (s.ice || 0) > S.i ? "Esa columna de frenos ya está desplegada." : "Los frenos para el hielo van en orden: 2, 3, 4 y 5.";
  if (S.k === "train") {
    if (o.tok) return "Una ficha de prácticas no puede ir a otra casilla de prácticas.";
    if (!s.tr || !s.tr.length) return "Tu piloto en prácticas ya ha terminado la instrucción.";
    if (v != null && v === nextTrainee(s, p)) return `El dado tiene que ser distinto de la ficha que toca (${nextTrainee(s, p)}).`;
  }
  if (o.tok && S.k === "conc") return "Las fichas de prácticas no valen para concentración.";
  return "";
}
/* Comprobar una acción; devuelve texto de error o "" */
function check(s, p, a) {
  if (!a || typeof a !== "object") return "Acción no válida.";
  if (s.over) return "La partida ha terminado.";
  if (a.t === "timeout") return has(s, "rt") && a.r === s.round ? "" : "No hay cuenta atrás que acabar.";
  if (a.t === "reroll") {
    if (s.rrPend) return "Ya estáis volviendo a tirar.";
    if (s.syncPend || s.wtPend) return "Termina antes lo que estáis haciendo.";
    if (s.rr < 1) return "No os quedan fichas para volver a tirar.";
    if (!s.dice[0].length && !s.dice[1].length) return "Ya no quedan dados por colocar.";
    return "";
  }
  if (a.t === "rerollPick") {
    if (!s.rrPend || !s.rrPend.need[p]) return "No tienes que elegir dados ahora.";
    if (!Array.isArray(a.idx) || a.idx.some(i => !Number.isInteger(i) || i < 0 || i >= s.dice[p].length) || new Set(a.idx).size !== a.idx.length) return "Dados no válidos.";
    return "";
  }
  if (s.rrPend) return "Espera a que los dos elijáis qué dados volver a tirar.";
  if (a.t === "sync") {
    if (!s.syncPend || p !== C) return "Ahora no hay dado de tráfico que colocar.";
    if (a.s == null) return syncTargets(s).length ? "Todavía hay sitio para el dado de tráfico." : "";
    return slotWhy(s, p, a.s, s.syncPend.v, { any: 1, tok: 1 });
  }
  if (s.syncPend) return "El copiloto tiene que colocar el dado de tráfico.";
  if (a.t === "wtPick") {
    if (!s.wtPend || p === s.wtPend.p) return "No tienes que dar ningún dado ahora.";
    return s.dice[p][a.d] == null ? "Ese dado no existe." : "";
  }
  if (s.wtPend) return "Tu compañero tiene que poner un dado en «Trabajo en equipo».";
  if (s.turn !== p) return "No es tu turno.";
  if (a.t === "flip") {
    if (!hasCap(s, "adapt")) return "No tenéis la capacidad Adaptación.";
    if (s.adapt[p]) return "Ya has usado Adaptación en esta partida.";
    return s.dice[p][a.d] == null ? "Ese dado no existe." : "";
  }
  if (a.t === "antic") {
    if (!hasCap(s, "antic")) return "No tenéis la capacidad Anticipación.";
    if (p !== s.first) return "Solo puede usarla quien empieza la ronda.";
    if (s.pl[p] || s.anticR === s.round) return "Solo antes de poner tu primer dado de la ronda.";
    return s.dice[p][a.d] == null ? "Ese dado no existe." : "";
  }
  if (a.t === "wt") {
    if (!hasCap(s, "team")) return "No tenéis la capacidad Trabajo en equipo.";
    if (s.wtR === s.round) return "Trabajo en equipo solo se usa una vez por ronda.";
    if (!s.dice[1 - p].length) return "Tu compañero ya no tiene dados.";
    return s.dice[p][a.d] == null ? "Ese dado no existe." : "";
  }
  if (a.t === "skip") {
    if (s.dice[p][a.d] == null) return "Ese dado no existe.";
    return canPlace(s, p) ? "Todavía puedes colocar algún dado." : "";
  }
  if (a.t !== "place") return "Acción no válida.";
  const v0 = s.dice[p][a.d];
  if (v0 == null) return "Ese dado no existe.";
  const k = a.k | 0;
  if (Math.abs(k) > s.coffee) return "No tenéis tanto café.";
  const v = v0 + k;
  if (v < 1 || v > 6) return "Con el café un dado no pasa de 6 ni baja de 1.";
  const why = slotWhy(s, p, a.s, v);
  if (why) return why;
  const S = SLOTS[a.s];
  if (S.k === "train") {
    if (!a.tt) return "Elige dónde va la ficha del piloto en prácticas.";
    const tv = nextTrainee(s, p), w2 = slotWhy(s, p, a.tt, tv, { tok: 1 });
    if (w2) return "Ficha " + tv + ": " + w2.charAt(0).toLowerCase() + w2.slice(1);
    if (playsLeft(s, p) - 1 < mandLeft(s, p, a.tt)) return "Te quedan justo los dados para el eje y los motores.";
    return "";
  }
  if (!mandOf(s, p).includes(a.s) && playsLeft(s, p) - 1 < mandLeft(s, p)) return noEng(s) ? "Te queda justo una jugada y falta tu dado del eje: ponlo ahí." : "Te quedan justo los dados para el eje y los motores: ponlos ahí.";
  return "";
}
/* ¿Tiene p alguna jugada de colocar? (para no quedarse atascado) */
function canPlace(s, p) {
  for (let d = 0; d < s.dice[p].length; d++) for (const id of SLOT_IDS) {
    if (!slotOn(s, id) || SLOTS[id].k === "train") continue;
    for (let k = -s.coffee; k <= s.coffee; k++) if (!check(s, p, { t: "place", d, s: id, k })) return true;
  }
  return false;
}
function syncTargets(s) { return SLOT_IDS.filter(id => !slotWhy(s, C, id, s.syncPend.v, { any: 1, tok: 1 })); }

/* ================= aplicar ================= */
function lose(s, why, txt) { s.over = { win: false, why, txt }; s.wins[1] = (s.wins[1] || 0) + 1; s.played = (s.played || 0) + 1; }
function burn(s, n, L) {
  if (s.fuel == null) return;
  s.fuel -= n; if (L) L.fuel = s.fuel;
  if (s.fuel <= 0) { s.fuel = 0; lose(s, "fuel", "Os habéis quedado sin queroseno."); }
}
/* Poner el valor v en la casilla id con todos sus efectos. who: quien lo pone; kind: "d" dado, "t" ficha de prácticas, "x" dado de tráfico */
function resolve(s, who, id, v, kind, L) {
  const S = SLOTS[id];
  s.sl[id] = { p: who, v }; if (kind !== "d") s.sl[id][kind] = 1;
  if (S.k === "axis" && s.sl.axP && s.sl.axC) {
    const d = s.sl.axC.v - s.sl.axP.v;
    s.axis += d; L.ax = s.axis; L.d = d;
    if (Math.abs(s.axis) >= 3) { lose(s, "spin", "El avión se ha inclinado demasiado y ha entrado en barrena."); return; }
    if (has(s, "wind")) { s.wind = ((s.wind + s.axis) % 20 + 20) % 20; L.wv = windVal(s); }
    if (hasCap(s, "control") && s.sl.axP.v === s.sl.axC.v && s.coffee < MAX_COFFEE) { s.coffee++; L.ctl = 1; }
  } else if (S.k === "eng" && s.sl.enP && s.sl.enC) {
    const a = s.sl.enP.v, b = s.sl.enC.v, w = windVal(s), sp = a + b + w;
    s.speed = sp; L.sp = sp; if (w) L.w = w;
    if (hasCap(s, "master") && a === b && rrPool(s) > 0) { s.rr++; L.mst = 1; }
    if (has(s, "leak")) { L.leak = Math.abs(a - b) + 1; burn(s, L.leak, L); if (s.over) return; }
    if (final(s)) {
      L.brk = brakeVal(s);
      if (sp >= brakeVal(s)) lose(s, "brakes", `Velocidad ${sp} y frenos ${brakeVal(s)}: no frenáis a tiempo y os salís de la pista.`);
    } else {
      const adv = advFor(s, sp); s.adv = adv; L.adv = adv;
      for (let i = 0; i < adv && !s.over; i++) {
        const tn = turnAt(s, s.pos);
        if (s.pos === airport(s)) lose(s, "overshoot", "Habéis pasado de largo el aeropuerto.");
        else if (s.planes[s.pos] > 0) lose(s, "crash", "Habéis chocado con un avión que seguía en vuestra posición.");
        else if (tn && !tn.includes(s.axis)) lose(s, "turn", "No habéis tomado bien el giro: el avión no tenía la inclinación que pedía la aproximación.");
        else s.pos++;
      }
      L.pos = s.pos;
    }
  } else if (S.k === "radio") {
    const t = s.pos + v - 1; L.tg = t;
    if (t <= airport(s) && s.planes[t] > 0) { s.planes[t]--; L.hit = 1; }
  } else if (S.k === "gear") { if (!s.gear[S.i]) { s.gear[S.i] = 1; L.on = 1; } }
  else if (S.k === "flap") { if (s.flaps === S.i) { s.flaps++; L.on = 1; } }
  else if (S.k === "brake") { if (s.brakes === S.i) { s.brakes++; L.on = 1; } }
  else if (S.k === "conc") { if (s.coffee < MAX_COFFEE) { s.coffee++; L.on = 1; } }
  else if (S.k === "kero") { L.fuel0 = s.fuel; burn(s, v, L); }
  else if (S.k === "ice") {
    const a = s.sl["iP" + S.i], b = s.sl["iC" + S.i];
    if (a && b) { s.ice++; L.on = 1; }
  }
}
function syncCheck(s) {
  if (!hasCap(s, "sync") || s.syncR === s.round || s.over) return;
  const g = ["g1", "g2", "g3"].some(id => s.sl[id]), f = ["f1", "f2", "f3", "f4"].some(id => s.sl[id]);
  if (g && f) {
    s.syncR = s.round; s.syncPend = { v: d6(s) };
    const L = { n: ++s.n, t: "syncRoll", v: s.syncPend.v, p: C };
    s.hist.push(L); s.last = L;
  }
}
function afterPlace(s, p) {
  if (s.over) return;
  syncCheck(s);
  for (const x of [P, C]) if (s.dice[x].length && playsLeft(s, x) <= 0) { s.dice[x] = []; }
  const q = 1 - p;
  if (s.dice[q].length) s.turn = q; else s.turn = p;
  maybeEnd(s);
}
function maybeEnd(s) {
  if (s.over || s.rrPend || s.syncPend || s.wtPend) return;
  if (!s.dice[0].length && !s.dice[1].length) endRound(s);
}
function apply(s0, p, a) {
  const s = clone(s0);
  if (!s.pl) s.pl = [0, 0];
  if (!s.adapt) s.adapt = [0, 0];
  s.n++;
  if (a.t === "timeout") {
    const L = { n: s.n, t: "timeout", p: -1, lost: s.dice[0].length + s.dice[1].length };
    s.hist.push(L); s.last = L;
    s.dice = [[], []]; s.rrPend = null; s.syncPend = null; s.wtPend = null;
    if (!(s.sl.axP && s.sl.axC) || (!noEng(s) && !(s.sl.enP && s.sl.enC))) { lose(s, "time", "Se acabó el tiempo sin completar el eje y los motores."); return s; }
    endRound(s);
    return s;
  }
  if (a.t === "reroll") {
    s.rr--;
    s.rrPend = { id: s.n, by: p, need: [s.dice[0].length > 0, s.dice[1].length > 0] };
    s.last = { n: s.n, t: "reroll", p };
    s.hist.push(s.last);
    return s;
  }
  if (a.t === "rerollPick") {
    for (const i of a.idx) s.dice[p][i] = d6(s);
    s.dice[p].sort();
    s.rrPend.need[p] = false;
    if (!s.rrPend.need[0] && !s.rrPend.need[1]) s.rrPend = null;
    s.last = { n: s.n, t: "pick", p, c: a.idx.length };
    s.hist.push(s.last);
    return s;
  }
  if (a.t === "flip") {
    const v = s.dice[p][a.d]; s.dice[p][a.d] = 7 - v; s.dice[p].sort(); s.adapt[p] = 1;
    s.last = { n: s.n, t: "flip", p, a: v, b: 7 - v }; s.hist.push(s.last); return s;
  }
  if (a.t === "antic") {
    const v = s.dice[p][a.d]; s.dice[p][a.d] = d6(s); s.anticR = s.round;
    s.last = { n: s.n, t: "antic", p, a: v }; s.dice[p].sort(); s.hist.push(s.last); return s;
  }
  if (a.t === "wt") {
    const v = s.dice[p][a.d]; s.dice[p].splice(a.d, 1); s.wtR = s.round; s.wtPend = { p, v };
    s.last = { n: s.n, t: "wt", p, v }; s.hist.push(s.last); return s;
  }
  if (a.t === "wtPick") {
    const q = s.wtPend.p, mine = s.dice[p][a.d];
    s.dice[p][a.d] = s.wtPend.v; s.dice[q].push(mine); s.dice[p].sort(); s.dice[q].sort();
    s.last = { n: s.n, t: "wtPick", p, a: mine, b: s.wtPend.v }; s.hist.push(s.last); s.wtPend = null; return s;
  }
  if (a.t === "skip") {
    const v = s.dice[p][a.d]; s.dice[p].splice(a.d, 1);
    s.last = { n: s.n, t: "skip", p, v }; s.hist.push(s.last);
    afterPlace(s, p); return s;
  }
  if (a.t === "sync") {
    const v = s.syncPend.v; s.syncPend = null;
    const L = { n: s.n, t: "sync", p: C, s: a.s, v };
    if (a.s != null) resolve(s, C, a.s, v, "x", L);
    s.last = L; s.hist.push(L);
    if (!s.over) maybeEnd(s);
    return s;
  }
  const k = a.k | 0, v0 = s.dice[p][a.d], v = v0 + k, S = SLOTS[a.s];
  s.dice[p].splice(a.d, 1);
  s.coffee -= Math.abs(k);
  s.pl[p]++;
  const L = { n: s.n, t: "place", p, s: a.s, v, k, r: s.round };
  if (S.k === "train") {
    const tv = p === P ? s.tr.shift() : s.tr.pop();
    s.sl[a.s] = { p, v };
    L.tv = tv; L.tt = a.tt;
    const L2 = {};
    resolve(s, p, a.tt, tv, "t", L2);
    Object.assign(L, { ax: L2.ax, d: L2.d, sp: L2.sp, adv: L2.adv, brk: L2.brk, pos: L2.pos, tg: L2.tg, hit: L2.hit, on: L2.on, fuel: L2.fuel, leak: L2.leak, w: L2.w, wv: L2.wv, ctl: L2.ctl, mst: L2.mst });
  } else resolve(s, p, a.s, v, "d", L);
  s.last = L; s.hist.push(L);
  afterPlace(s, p);
  return s;
}
function endRound(s) {
  if (has(s, "kero") && !s.sl.ke) {
    const L = { n: ++s.n, t: "kero", p: -1 };
    burn(s, KERO_MISS, L); L.fuel = s.fuel; s.hist.push(L); s.last = L;
    if (s.over) return;
  }
  if (final(s)) {
    const bad = [];
    if (s.planes.some(x => x > 0)) bad.push("quedan aviones en la aproximación");
    if (gearCount(s) < 3) bad.push("el tren de aterrizaje no está desplegado entero");
    if (s.flaps < 4) bad.push("faltan flaps por desplegar");
    if (s.axis !== 0) bad.push("el avión no está recto");
    if (has(s, "ice") && s.ice < 4) bad.push("faltan frenos para el hielo");
    if (s.tr && s.tr.length) bad.push("el piloto en prácticas no ha terminado su instrucción");
    if (!noEng(s) && !(s.sl.enP && s.sl.enC)) bad.push("faltan los motores");
    if (bad.length) { lose(s, "land", "Aterrizaje fallido: " + bad.join(", ") + "."); return; }
    s.over = { win: true, why: "land", txt: "¡Aterrizaje perfecto!" };
    s.wins[0] = (s.wins[0] || 0) + 1; s.played = (s.played || 0) + 1;
    return;
  }
  if (noEng(s)) {
    /* Lajes: sin motores, el avión planea 1 casilla al final de cada ronda */
    const tn = turnAt(s, s.pos), L = { n: ++s.n, t: "glide", p: -1 };
    if (s.pos === airport(s)) { lose(s, "overshoot", "Habéis pasado de largo el aeropuerto."); return; }
    if (s.planes[s.pos] > 0) { lose(s, "crash", "Habéis chocado con un avión que seguía en vuestra posición."); return; }
    if (tn && !tn.includes(s.axis)) { lose(s, "turn", "No habéis tomado bien el giro: el avión no tenía la inclinación que pedía la aproximación."); return; }
    s.pos++; L.pos = s.pos; s.hist.push(L); s.last = L;
  }
  s.round++;
  if (final(s) && s.pos !== airport(s)) { lose(s, "late", "Habéis llegado al suelo sin tener la pista delante."); return; }
  const L = { n: ++s.n, t: "round", r: s.round };
  s.hist.push(L);
  startRound(s);
}

/* ================= descripciones ================= */
const SLOT_NAME = { axis: "el eje", eng: "los motores", radio: "la radio", gear: "el tren de aterrizaje", flap: "los flaps", brake: "los frenos", conc: "concentración", kero: "el depósito de queroseno", train: "prácticas", ice: "los frenos para el hielo" };
function effTxt(L, S) {
  let t = "";
  if (L.ax != null) t += L.d ? `: el avión se inclina ${Math.abs(L.d)} hacia el ${L.d > 0 ? "copiloto" : "piloto"}` : ": el avión no se mueve";
  if (L.wv != null) t += ` (viento ${L.wv > 0 ? "+" : ""}${L.wv})`;
  if (L.ctl) t += ", +1 café por Control";
  if (L.sp != null) t += L.brk != null ? `: velocidad ${L.sp}${L.w ? ` (viento ${L.w > 0 ? "+" : ""}${L.w})` : ""} con frenos ${L.brk}` : `: velocidad ${L.sp}${L.w ? ` (viento ${L.w > 0 ? "+" : ""}${L.w})` : ""}, ${L.adv === 0 ? "no avanzáis" : `avanzáis ${L.adv}`}`;
  if (L.mst) t += ", +1 ficha por Maestría";
  if (L.leak) t += `, la fuga gasta ${L.leak} de queroseno (quedan ${L.fuel})`;
  if (S && S.k === "radio") t += L.hit ? ": un avión despejado" : ": no había ningún avión ahí";
  if (S && (S.k === "gear" || S.k === "flap" || S.k === "brake" || S.k === "ice") && L.on) t += ": desplegado";
  if (S && S.k === "conc") t += L.on ? ": +1 café" : "";
  if (S && S.k === "kero") t += `: queda ${L.fuel} de queroseno`;
  return t;
}
function describe(L, who, you) {
  if (L.t === "reroll") return `${who} ${you ? "gastas" : "gasta"} una ficha: los dos podéis volver a tirar dados`;
  if (L.t === "pick") return L.c ? `${who} ${you ? "vuelves" : "vuelve"} a tirar ${L.c === 1 ? "1 dado" : L.c + " dados"}` : `${who} ${you ? "te quedas" : "se queda"} con sus dados`;
  if (L.t === "round") return `Empieza la ronda ${L.r} (${ALT[L.r - 1]} pies)`;
  if (L.t === "traffic") return "Dado de tráfico: " + L.rolls.map((d, i) => {
    const a = L.at ? L.at[i] : null;
    if (a === -1) return `sale un ${d}, pero no quedan aviones en la reserva`;
    if (a == null) return `sale un ${d}`;
    return `sale un ${d} → entra 1 avión ${a === L.pos ? "en vuestra casilla (¡quitadlo con la radio 1 antes de avanzar!)" : L.pos + d - 1 > a ? "en el aeropuerto (se pasaba de la pista)" : `en la casilla ${d} contando la vuestra como 1`}`;
  }).join("; ");
  if (L.t === "glide") return `Sin motores, el avión planea 1 casilla`;
  if (L.t === "kero") return `Nadie ha usado el depósito: se gastan ${KERO_MISS} de queroseno (quedan ${L.fuel})`;
  if (L.t === "timeout") return `¡Se acabó el tiempo!${L.lost ? ` ${L.lost === 1 ? "Se pierde 1 dado" : `Se pierden ${L.lost} dados`}` : ""}`;
  if (L.t === "flip") return `${who} ${you ? "das" : "da"} la vuelta a un ${L.a}: ahora es un ${L.b} (Adaptación)`;
  if (L.t === "antic") return `${who} ${you ? "vuelves" : "vuelve"} a tirar un dado (Anticipación)`;
  if (L.t === "wt") return `${who} ${you ? "pones" : "pone"} un ${L.v} en Trabajo en equipo`;
  if (L.t === "wtPick") return `${who} ${you ? "das" : "da"} un ${L.a} a cambio del ${L.b} (Trabajo en equipo)`;
  if (L.t === "skip") return `${who} no ${you ? "puedes" : "puede"} colocar su ${L.v} en ningún sitio y lo ${you ? "descartas" : "descarta"}`;
  if (L.t === "syncRoll") return `Sincronización: el copiloto tira el dado de tráfico y saca un ${L.v}`;
  if (L.t === "sync") return L.s ? `${who} ${you ? "pones" : "pone"} el ${L.v} de tráfico en ${SLOT_NAME[SLOTS[L.s].k]}${effTxt(L, SLOTS[L.s])}` : `El ${L.v} de tráfico no cabe en ningún sitio`;
  const S = SLOTS[L.s], put = you ? "pones" : "pone";
  if (S.k === "train") {
    const T = SLOTS[L.tt];
    return `${who} ${put} un ${L.v} en prácticas y la ficha ${L.tv} va a ${SLOT_NAME[T.k]}${effTxt(L, T)}`;
  }
  return `${who} ${put} un ${L.v}${L.k ? ` (con ${Math.abs(L.k)} café${Math.abs(L.k) > 1 ? "s" : ""})` : ""} en ${SLOT_NAME[S.k]}${effTxt(L, S)}`;
}

/* ================= compañero IA =================
   Solo mira sus propios dados y la mesa. Reparte sus dados entre las casillas (todas las combinaciones),
   puntúa el resultado suponiendo que el compañero responderá lo mejor que pueda con los dados que le quedan,
   y juega primero lo que no depende del otro (radio, interruptores) y deja para el final lo que sí. */
const COFFEE_COST = 2.5;
/* ¿Qué casilla tendrá que respetar el giro la próxima vez que avancemos? */
function turnPen(s, a, enDone) {
  const at = s.pos, tn = turnAt(s, at), tn2 = turnAt(s, at + 1);
  let v = 0;
  if (tn && !tn.includes(a)) v -= enDone ? 60 : 300;
  if (tn2 && !tn2.includes(a)) v -= enDone ? 25 : 8;
  return v;
}
function axisPen(a, s, enDone) {
  const A = Math.abs(a);
  if (A >= 3) return -1000;
  if (final(s)) return A ? -1000 : 0;
  const left = ROUNDS - s.round;           // rondas para corregir
  let v = -(A * 5 + (A === 2 ? 12 : 0)) * (left <= 1 ? 3 : 1);
  if (turnAt(s, s.pos) || turnAt(s, s.pos + 1)) v = -(A === 2 ? 6 : A * 2) * (left <= 1 ? 3 : 1);
  return v + turnPen(s, a, enDone);
}
/* Valor de la posición tras avanzar en esta ronda */
function posVal(s, pos) {
  const AP = airport(s);
  const M = Math.max(0, 6 - s.round);     // rondas que aún pueden mover el avión después de esta
  const d = AP - pos;
  if (s.round >= 6 && d > 0) return -1000;
  if (d > 2 * M) return -400 - 100 * (d - 2 * M);
  let v = d > M ? -14 * (d - M) : d === 0 && M > 0 ? -12 * M - 8 : -4 * (M - d);
  if (d > 0 && M > 0 && d / M > 1.5) v -= 10;
  return v;
}
function fuelVal(t, s) {
  if (t.fuel == null) return 0;
  const after = has(s, "kero") && !t.ke ? t.fuel - KERO_MISS : t.fuel;
  const R = ROUNDS - t.round;              // rondas que quedan después de esta
  if (after <= 0) return -1000;
  let v = 0;
  if (has(s, "kero")) { if (after - R < 1) v -= 200; v -= 25 * Math.max(0, R * 2.2 - after) / Math.max(1, R); }
  if (has(s, "leak")) { if (after - R * 1.5 < 1) v -= 60 * (R * 1.5 + 1 - after); }
  return v + 0.6 * Math.min(after, 12);
}
/* Simular la ronda tras poner los dados elegidos (sin el eje y los motores) y valorar el resto */
function restVal(t, s) {
  let v = 0;
  const left = ROUNDS - t.round;               // rondas completas que quedan después de esta
  const ice = has(s, "ice");
  const gR = 3 - (t.gear[0] + t.gear[1] + t.gear[2]), fR = 4 - t.flaps, bR = ice ? 4 - t.ice : Math.max(0, 2 - t.brakes);
  v -= 9 * gR + 9 * fR + (ice ? 16 : 9) * bR + (!ice && t.brakes < 3 ? 4 : 0);
  if (ice && bR > left - 1) v -= 45 * (bR - left + 1);
  const capP = 2 * left, capC = 2 * left;
  const plAhead = t.planes.reduce((a, x, i) => a + (i >= t.pos ? x : 0), 0);
  const trL = t.tr ? t.tr.length : 0;
  const needP = gR + bR + Math.ceil(plAhead / 3) + Math.ceil(trL / 2), needC = fR + (ice ? bR : 0) + Math.ceil(plAhead / 2) + Math.floor(trL / 2);
  if (needP > capP) v -= 70 * (needP - capP);
  if (needC > capC) v -= 70 * (needC - capC);
  if (trL > 2 * left) v -= 120 * (trL - 2 * left);
  v -= 7 * trL;
  if (t.round === ROUNDS) { if (gR || fR || t.planes.some(x => x) || (ice && bR) || trL) v -= 1000; }
  v -= 8 * plAhead;
  v += 3.5 * t.coffee;
  v += fuelVal(t, s);
  return v;
}
/* El mejor valor esperado que conseguirá un jugador con k dados al azar (pudiendo usar café) */
function bestOfK(u, k, coffee) {
  const eff = [];
  for (let f = 1; f <= 6; f++) {
    let b = u[f];
    for (let d = 1; d <= coffee; d++) { if (f + d <= 6) b = Math.max(b, u[f + d] - COFFEE_COST * d); if (f - d >= 1) b = Math.max(b, u[f - d] - COFFEE_COST * d); }
    eff.push(b);
  }
  eff.sort((a, b) => b - a);
  if (k <= 0) return eff[5];
  let e = 0;
  for (let i = 0; i < 6; i++) e += (Math.pow((6 - i) / 6, k) - Math.pow((5 - i) / 6, k)) * eff[i];
  return e;
}
function assignVal(s, p, asg) {
  const q = 1 - p, AP = airport(s);
  const t = { sc: s.sc, round: s.round, pos: s.pos, planes: s.planes.slice(), gear: s.gear.slice(), flaps: s.flaps, brakes: s.brakes, ice: s.ice || 0, coffee: s.coffee, fuel: s.fuel, ke: !!s.sl.ke, tr: s.tr };
  let v = 0, myAx = null, myEn = null;
  const ord = asg.slice().sort((a, b) => SLOT_IDS.indexOf(a.s) - SLOT_IDS.indexOf(b.s));
  for (const x of asg) { t.coffee -= Math.abs(x.k); v -= COFFEE_COST * Math.abs(x.k); }
  const kq = s.dice[q].length;
  for (const x of ord) {
    if (x.skip) continue;
    const S = SLOTS[x.s];
    if (S.k === "gear") { if (!t.gear[S.i]) { t.gear[S.i] = 1; v += 2; } else v -= 1; }
    else if (S.k === "flap") { if (t.flaps < S.i) return -1e9; if (t.flaps === S.i) { t.flaps++; v += 2; } else v -= 1; }
    else if (S.k === "brake") { if (t.brakes < S.i) return -1e9; if (t.brakes === S.i) { t.brakes++; v += 2; } else v -= 1; }
    else if (S.k === "ice") {
      if (t.ice !== S.i) return -1e9;
      const opp = s.sl[(p === P ? "iC" : "iP") + S.i];
      if (opp) { t.ice++; v += 3; }
      else { const ph = kq ? 1 - Math.pow(5 / 6, kq) : 0; v += 10 * ph - 3; }
    }
    else if (S.k === "conc") { if (t.coffee < MAX_COFFEE) t.coffee++; else v -= 1; }
    else if (S.k === "kero") { if (t.ke) return -1e9; t.ke = true; t.fuel -= x.v; if (t.fuel <= 0) return -1e9; v -= 0.4 * x.v; }
    else if (S.k === "radio") { const tg = t.pos + x.v - 1; if (tg <= AP && t.planes[tg] > 0) { t.planes[tg]--; v += 6 + (tg === t.pos ? 10 : tg === t.pos + 1 ? 4 : 0); } else v -= 2; }
    else if (S.k === "axis") myAx = x.v;
    else if (S.k === "eng") myEn = x.v;
  }
  const cof = Math.max(0, t.coffee);
  const enDone = noEng(s) ? false : !!(s.sl.enP && s.sl.enC);
  if (noEng(s) && !final(s) && t.planes[t.pos] > 0) v -= 800;   // al planear chocaríamos
  /* eje */
  const axMine = p === P ? "axP" : "axC", axTheirs = p === P ? "axC" : "axP";
  const axRes = (vp, vc) => axisPen(s.axis + (vc - vp), t, enDone);
  let axKnown = null;
  if (s.sl.axP && s.sl.axC) { v += axisPen(s.axis, t, true); axKnown = s.axis; }
  else {
    const mine = myAx != null ? myAx : s.sl[axMine] ? s.sl[axMine].v : null, theirs = s.sl[axTheirs] ? s.sl[axTheirs].v : null;
    if (mine != null && theirs != null) { v += p === P ? axRes(mine, theirs) : axRes(theirs, mine); axKnown = s.axis + (p === P ? theirs - mine : mine - theirs); }
    else if (mine != null) { const u = [0]; for (let w = 1; w <= 6; w++) u.push(p === P ? axRes(mine, w) : axRes(w, mine)); v += bestOfK(u, kq, cof); }
    else v += -6;
  }
  /* motores */
  const enMine = p === P ? "enP" : "enC", enTheirs = p === P ? "enC" : "enP";
  const axNow = s.sl.axP && s.sl.axC ? s.axis : axKnown != null && (s.sl.axP || s.sl.axC) ? axKnown : s.axis;
  const wNow = has(s, "wind") ? (scen(s).wind === "front" ? -1 : 1) * WIND[(((s.wind || 0) + (s.sl.axP && s.sl.axC ? 0 : axNow)) % 20 + 20) % 20] : 0;
  /* el compañero aún puede despejar con la radio un avión que nos cerraría el paso */
  const help = kq > 0 && (p === P ? !s.sl.raC1 || !s.sl.raC2 : !s.sl.raP);
  const engRes = (a, b) => {
    const sp = a + b + (s.sl.axP && s.sl.axC ? windVal(s) : wNow);
    let r = 0;
    if (has(s, "leak")) { const f = t.fuel - (Math.abs(a - b) + 1); if (f <= 0) return -1000; r -= 2.5 * Math.abs(a - b); }
    if (t.round === ROUNDS) return sp < (has(s, "ice") ? ICE[Math.min(4, t.ice)] : BRAKE[t.brakes]) ? r : -1000;
    const adv = sp < BLUE0 + t.gear[0] + t.gear[1] + t.gear[2] ? 0 : sp > ORANGE0 + t.flaps ? 2 : 1;
    let pos = t.pos;
    for (let i = 0; i < adv; i++) {
      if (pos === AP) return -1000;
      if (t.planes[pos] > 0) { if (help) r -= 260 * t.planes[pos]; else return -1000; }
      const tn = turnAt(s, pos); if (tn && !tn.includes(axNow)) return -1000;
      pos++;
    }
    r += posVal(t, pos);
    /* trayectorias largas: hacen falta avances de 2, así que el marcador naranja no debe subir antes de tiempo */
    const need2 = (AP - pos) - Math.max(0, 6 - t.round);
    if (need2 > 0) {
      const o = ORANGE0 + t.flaps - (has(s, "wind") ? 2 : 0);
      if (o >= 11.5) r -= 45 * need2; else if (o >= 10.5) r -= 18 * need2; else if (o >= 9.5) r -= 6 * need2;
    }
    for (let i = pos; i <= AP; i++) if (t.planes[i]) r -= (i === pos ? 6 : 2) * t.planes[i] / Math.max(1, i - pos + 1);
    return r;
  };
  if (noEng(s)) v += 0;
  else if (enDone) v += posVal(t, s.pos);
  else {
    const mine = myEn != null ? myEn : s.sl[enMine] ? s.sl[enMine].v : null, theirs = s.sl[enTheirs] ? s.sl[enTheirs].v : null;
    if (mine != null && theirs != null) v += engRes(mine, theirs);
    else if (mine != null) { const u = [0]; for (let w = 1; w <= 6; w++) u.push(engRes(mine, w)); v += bestOfK(u, kq, cof); }
    else v += -6;
  }
  return v + restVal(t, s);
}
/* Todas las formas de repartir los dados de p en casillas libres (café incluido, como mucho 2 por ronda de cálculo) */
function bestAssign(s, p, fixed) {
  const D = s.dice[p].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const free = SLOT_IDS.filter(id => slotOn(s, id) && SLOTS[id].k !== "train" && !s.sl[id] && (SLOTS[id].who === p || SLOTS[id].who === -1));
  const mand = mandOf(s, p).filter(id => !s.sl[id]);
  const maxK = Math.min(2, s.coffee);
  let skips = s.dice[p].length - playsLeft(s, p);              // dados que no se van a jugar (Lajes)
  let best = null, bestV = -Infinity;
  const used = new Set(), cur = [];
  if (!D.length) return { asg: [], v: assignVal(s, p, []) };
  function dfs(j, budget) {
    if (j === D.length) {
      if (skips > 0) return;
      if (mand.some(id => !used.has(id))) return;
      const v = assignVal(s, p, cur);
      if (v > bestV) { bestV = v; best = cur.slice(); }
      return;
    }
    const prev = j > 0 && D[j - 1].v === D[j].v ? cur[j - 1] : null;
    for (const id of free) {
      if (used.has(id)) continue;
      const S = SLOTS[id];
      if (S.k === "conc" && free.some(o => SLOTS[o].k === "conc" && !used.has(o) && SLOT_IDS.indexOf(o) < SLOT_IDS.indexOf(id))) continue;
      if (id === "raC2" && free.includes("raC1") && !used.has("raC1")) continue;
      if (prev && SLOT_IDS.indexOf(id) < SLOT_IDS.indexOf(prev.s) && !prev.k) continue;
      const ks = S.k === "conc" || S.k === "kero" ? [0] : [0, 1, -1, 2, -2].filter(k => Math.abs(k) <= Math.min(budget, maxK));
      for (const k of ks) {
        const v = D[j].v + k;
        if (v < 1 || v > 6) continue;
        if (S.ok && !S.ok.includes(v)) continue;
        used.add(id); cur.push({ d: D[j].i, s: id, v, k });
        dfs(j + 1, budget - Math.abs(k));
        cur.pop(); used.delete(id);
      }
    }
    // sin casilla posible para este dado: se descartaría
    const anyFree = free.some(id => !used.has(id) && (!SLOTS[id].ok || SLOTS[id].ok.some(w => Math.abs(w - D[j].v) <= Math.min(budget, maxK))));
    if (skips > 0) { skips--; cur.push({ d: D[j].i, s: null, v: D[j].v, k: 0, skip: 1 }); dfs(j + 1, budget); cur.pop(); skips++; }
    else if (!anyFree) { cur.push({ d: D[j].i, s: null, v: D[j].v, k: 0, skip: 1 }); dfs(j + 1, budget); cur.pop(); }
  }
  dfs(0, s.coffee);
  if (best) best = best.filter(x => !x.skip);
  return { asg: best, v: bestV };
}
/* Valor de un estado para p (lo mejor que puede hacer con lo que le queda) */
function stateVal(s, p) {
  if (s.over) return s.over.win ? 2000 : -5000;
  const r = bestAssign(s, p);
  return r.asg ? r.v : -3000;
}
/* Piloto en prácticas: sacrificar uno de los dados del mejor reparto y poner la ficha en su lugar o en otra casilla libre */
function trainOption(s, p, asg) {
  const id = p === P ? "trP" : "trC";
  if (!asg || !s.tr || !s.tr.length || s.sl[id]) return null;
  const tv = nextTrainee(s, p), mand = mandOf(s, p).filter(m => !s.sl[m]);
  let best = null, bestV = -Infinity;
  for (const x of asg) {
    if (s.dice[p][x.d] === tv) continue;
    const rest = asg.filter(y => y !== x);
    const usedS = new Set(rest.map(y => y.s));
    for (const tt of SLOT_IDS) {
      if (usedS.has(tt) || slotWhy(s, p, tt, tv, { tok: 1 })) continue;
      if (mand.some(m => m !== tt && !usedS.has(m))) continue;
      const v = assignVal(s, p, rest.concat([{ d: -1, s: tt, v: tv, k: 0 }]));
      if (v > bestV) { bestV = v; best = { t: "place", d: x.d, s: id, k: 0, tt }; }
    }
  }
  if (best && check(s, p, best)) return null;
  return best ? { a: best, v: bestV } : null;
}
function plan(s, p) {
  if (s.over) return null;
  if (s.rrPend) return s.rrPend.need[p] ? { t: "rerollPick", idx: rerollChoice(s, p) } : null;
  if (s.syncPend) return p === C ? syncChoice(s) : null;
  if (s.wtPend) return p !== s.wtPend.p ? wtChoice(s, p) : null;
  if (s.turn !== p || !s.dice[p].length) return null;
  if (!canPlace(s, p)) return { t: "skip", d: 0 };
  const { asg, v } = bestAssign(s, p);
  const tro = trainOption(s, p, asg);
  if (tro && tro.v >= v - 4) return tro.a;
  if (!asg) return fallback(s, p);
  if (v < -600 && s.rr > 0) return { t: "reroll" };
  return pickFrom(s, p, asg);
}
function syncChoice(s) {
  const ts = syncTargets(s);
  if (!ts.length) return { t: "sync", s: null };
  let best = ts[0], bv = -Infinity;
  for (const id of ts) {
    const ns = apply(s, C, { t: "sync", s: id });
    const v = ns.over ? (ns.over.win ? 2000 : -5000) : ns.round !== s.round ? 0 : stateVal(ns, C);
    if (v > bv) { bv = v; best = id; }
  }
  return { t: "sync", s: best };
}
function wtChoice(s, p) {
  let best = 0, bv = -Infinity;
  for (let d = 0; d < s.dice[p].length; d++) {
    const ns = apply(s, p, { t: "wtPick", d });
    const v = stateVal(ns, p);
    if (v > bv) { bv = v; best = d; }
  }
  return { t: "wtPick", d: best };
}
function pickFrom(s, p, asg) {
  const rank = x => {
    const S = SLOTS[x.s];
    if (S.k === "radio") return 0;
    if (S.k === "gear" || S.k === "flap" || S.k === "brake" || S.k === "kero") return 1;
    if (S.k === "ice") return s.sl[(p === P ? "iC" : "iP") + S.i] ? 1 : 0.5;
    if (S.k === "axis") return s.sl[p === P ? "axC" : "axP"] ? 2 : 4;
    if (S.k === "eng") return s.sl[p === P ? "enC" : "enP"] ? 2 : 5;
    return 3;
  };
  const pick = asg.slice().sort((a, b) => rank(a) - rank(b))[0];
  if (!pick) return fallback(s, p);
  const a = { t: "place", d: pick.d, s: pick.s, k: pick.k };
  return check(s, p, a) ? fallback(s, p) : a;
}
function fallback(s, p) {
  for (let d = 0; d < s.dice[p].length; d++) for (const id of SLOT_IDS) { if (SLOTS[id].k === "train") continue; const a = { t: "place", d, s: id, k: 0 }; if (!check(s, p, a)) return a; }
  for (let d = 0; d < s.dice[p].length; d++) for (const id of SLOT_IDS) for (const k of [1, -1, 2, -2, 3, -3]) { if (SLOTS[id].k === "train") continue; const a = { t: "place", d, s: id, k }; if (!check(s, p, a)) return a; }
  return s.dice[p].length ? { t: "skip", d: 0 } : null;
}
function rerollChoice(s, p) {
  if (!s.dice[p].length) return [];
  const { asg, v } = bestAssign(s, p);
  if (!asg || v > -150) return [];
  const keep = new Set(asg.filter(x => { const S = SLOTS[x.s]; return (S.k === "gear" || S.k === "flap" || S.k === "brake") && x.k === 0; }).map(x => x.d));
  return s.dice[p].map((_, i) => i).filter(i => !keep.has(i));
}
/* Pista para un jugador humano: la jugada que haría la IA en su lugar */
function hint(s, p) {
  if (s.over || actor(s) !== p) return null;
  const a = plan(s, p);
  if (!a) return null;
  if (a.t === "reroll") { const { asg } = bestAssign(s, p); const b = asg ? pickFrom(s, p, asg) : fallback(s, p); return b ? { ...b, rr: true } : null; }
  return a;
}

const API = { GROUPS, noEng, mandOf, playN, playsLeft, PLANES, P, C, ROLE, ROUNDS, ALT, ROUTE, AIRPORT, REROLL_AT, BLUE0, ORANGE0, BRAKE, ICE, WIND, MAX_COFFEE, FUEL0, KERO_MISS, SLOTS, SLOT_IDS, MAND,
  SC, SC_BY, COLOR_NAME, MODS, CAPS, CAP_IDS,
  newGame, rematch, check, apply, slotWhy, describe, plan, hint, bestAssign, advFor, blue, orange, brakeVal, gearCount, mandLeft, final, placed,
  scen, airport, has, hasCap, rerollAt, traffic, turnAt, windVal, slotOn, actor, nextTrainee, canPlace, syncTargets, rrPool };
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Cabina = API;
})(typeof window !== "undefined" ? window : globalThis);
