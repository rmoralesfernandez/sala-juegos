/* Doble Mando: motor de reglas puro (estilo Sky Team, aproximación de iniciación) + compañero IA.
   Sin DOM: se usa igual en el navegador (window.Cabina) y en node (module.exports).
   Asiento 0 = Piloto (dados azules), asiento 1 = Copiloto (dados naranjas).
   El estado es JSON plano; todo el azar sale de s.r (semilla), así los dos móviles calculan lo mismo. */
(function (root) {
"use strict";

const P = 0, C = 1;
const ROLE = ["Piloto", "Copiloto"];
const ROUNDS = 7;
const ALT = [6000, 5000, 4000, 3000, 2000, 1000, 0];
/* Aproximación de iniciación: 7 casillas (la 0 es la posición inicial, la 6 es la pista) */
const ROUTE = { code: "YUL", name: "Montreal", planes: [0, 0, 1, 2, 1, 2, 0] };
const AIRPORT = ROUTE.planes.length - 1;
const REROLL_AT = [0, 4];            // rondas (índice de altitud) con ficha de volver a tirar: 6000 y 2000 pies
const BLUE0 = 4.5, ORANGE0 = 8.5;    // marcadores de aerodinámica (entre 4|5 y entre 8|9)
const BRAKE = [0, 2, 4, 6];          // valor del freno según frenos desplegados (sin frenos no se puede parar)
const MAX_COFFEE = 3;

/* Casillas del panel */
const SLOTS = {
  axP: { who: P, k: "axis" }, axC: { who: C, k: "axis" },
  enP: { who: P, k: "eng" }, enC: { who: C, k: "eng" },
  raP: { who: P, k: "radio" }, raC1: { who: C, k: "radio" }, raC2: { who: C, k: "radio" },
  g1: { who: P, k: "gear", i: 0, ok: [1, 2] }, g2: { who: P, k: "gear", i: 1, ok: [3, 4] }, g3: { who: P, k: "gear", i: 2, ok: [5, 6] },
  b1: { who: P, k: "brake", i: 0, ok: [2] }, b2: { who: P, k: "brake", i: 1, ok: [4] }, b3: { who: P, k: "brake", i: 2, ok: [6] },
  f1: { who: C, k: "flap", i: 0, ok: [1, 2] }, f2: { who: C, k: "flap", i: 1, ok: [2, 3] }, f3: { who: C, k: "flap", i: 2, ok: [4, 5] }, f4: { who: C, k: "flap", i: 3, ok: [5, 6] },
  c1: { who: -1, k: "conc" }, c2: { who: -1, k: "conc" }, c3: { who: -1, k: "conc" }
};
const SLOT_IDS = Object.keys(SLOTS);
const MAND = [["axP", "enP"], ["axC", "enC"]];

/* ================= azar con semilla ================= */
function rnd(s) { let t = (s.r = (s.r + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const d6 = s => 1 + Math.floor(rnd(s) * 6);
const mix = (a, b) => (Math.imul((a ^ b) >>> 0, 2654435761) ^ (b * 40503)) >>> 0;
const clone = o => JSON.parse(JSON.stringify(o));

function newGame(seed, wins) {
  const s = {
    v: 1, seed: seed >>> 0, r: seed >>> 0, route: ROUTE.code,
    round: 1, pos: 0, planes: ROUTE.planes.slice(), axis: 0, gear: [0, 0, 0], flaps: 0, brakes: 0,
    coffee: 0, rr: 0, dice: [[], []], sl: {}, turn: P, first: P, speed: null, adv: null,
    rrPend: null, n: 0, last: null, hist: [], over: null, wins: wins || [0, 0], played: 0
  };
  startRound(s);
  return s;
}
function startRound(s) {
  s.sl = {}; s.speed = null; s.adv = null;
  if (REROLL_AT.includes(s.round - 1)) s.rr++;
  s.dice = [[0, 0, 0, 0].map(() => d6(s)).sort(), [0, 0, 0, 0].map(() => d6(s)).sort()];
  s.first = s.turn = (s.round - 1) % 2 === 0 ? P : C;
}
function rematch(s) {
  const w = s.wins.slice();
  const ns = newGame(mix(s.seed, 9001 + w[0] + w[1] + s.n), w);
  ns.played = (s.played || 0);
  return ns;
}

/* ================= consultas ================= */
const final = s => s.round === ROUNDS;
const gearCount = s => s.gear[0] + s.gear[1] + s.gear[2];
const blue = s => BLUE0 + gearCount(s);
const orange = s => ORANGE0 + s.flaps;
const brakeVal = s => BRAKE[s.brakes];
function advFor(s, speed) { return speed < blue(s) ? 0 : speed > orange(s) ? 2 : 1; }
const placed = s => Object.keys(s.sl).length;
function mandLeft(s, p, except) { return MAND[p].filter(id => !s.sl[id] && id !== except).length; }
/* ¿Puede el jugador p poner un dado de valor v en la casilla id? (sin contar el café) */
function slotWhy(s, p, id, v) {
  const S = SLOTS[id];
  if (!S) return "Esa casilla no existe.";
  if (s.sl[id]) return "Esa casilla ya está ocupada esta ronda.";
  if (S.who !== -1 && S.who !== p) return `Esa casilla es del ${ROLE[S.who].toLowerCase()}.`;
  if (S.ok && v != null && !S.ok.includes(v)) return `Ahí solo vale ${S.ok.join(" o ")}.`;
  if (S.k === "flap" && s.flaps < S.i) return "Los flaps se despliegan en orden, de arriba abajo.";
  if (S.k === "brake" && s.brakes < S.i) return "Los frenos se despliegan en orden: 2, luego 4, luego 6.";
  return "";
}
/* Comprobar una acción; devuelve texto de error o "" */
function check(s, p, a) {
  if (!a || typeof a !== "object") return "Acción no válida.";
  if (s.over) return "La partida ha terminado.";
  if (a.t === "reroll") {
    if (s.rrPend) return "Ya estáis volviendo a tirar.";
    if (s.rr < 1) return "No os quedan fichas para volver a tirar.";
    if (!s.dice[0].length && !s.dice[1].length) return "Ya no quedan dados por colocar.";
    return "";
  }
  if (a.t === "rerollPick") {
    if (!s.rrPend || !s.rrPend.need[p]) return "No tienes que elegir dados ahora.";
    if (!Array.isArray(a.idx) || a.idx.some(i => !Number.isInteger(i) || i < 0 || i >= s.dice[p].length) || new Set(a.idx).size !== a.idx.length) return "Dados no válidos.";
    return "";
  }
  if (a.t !== "place") return "Acción no válida.";
  if (s.rrPend) return "Espera a que los dos elijáis qué dados volver a tirar.";
  if (s.turn !== p) return "No es tu turno.";
  const v0 = s.dice[p][a.d];
  if (v0 == null) return "Ese dado no existe.";
  const k = a.k | 0;
  if (Math.abs(k) > s.coffee) return "No tenéis tanto café.";
  const v = v0 + k;
  if (v < 1 || v > 6) return "Con el café un dado no pasa de 6 ni baja de 1.";
  const why = slotWhy(s, p, a.s, v);
  if (why) return why;
  if (!MAND[p].includes(a.s) && s.dice[p].length - 1 < mandLeft(s, p)) return "Te quedan justo los dados para el eje y los motores: ponlos ahí.";
  return "";
}

/* ================= aplicar ================= */
function lose(s, why, txt) { s.over = { win: false, why, txt }; s.wins[1] = (s.wins[1] || 0) + 1; s.played = (s.played || 0) + 1; }
function apply(s0, p, a) {
  const s = clone(s0);
  s.n++;
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
  const k = a.k | 0, v0 = s.dice[p][a.d], v = v0 + k, S = SLOTS[a.s];
  s.dice[p].splice(a.d, 1);
  s.coffee -= Math.abs(k);
  s.sl[a.s] = { p, v };
  const L = { n: s.n, t: "place", p, s: a.s, v, k, r: s.round };
  if (S.k === "axis" && s.sl.axP && s.sl.axC) {
    const d = s.sl.axC.v - s.sl.axP.v;
    s.axis += d; L.ax = s.axis; L.d = d;
    if (Math.abs(s.axis) >= 3) lose(s, "spin", "El avión se ha inclinado demasiado y ha entrado en barrena.");
  } else if (S.k === "eng" && s.sl.enP && s.sl.enC) {
    const sp = s.sl.enP.v + s.sl.enC.v;
    s.speed = sp; L.sp = sp;
    if (final(s)) {
      L.brk = brakeVal(s);
      if (sp >= brakeVal(s)) lose(s, "brakes", `Velocidad ${sp} y frenos ${brakeVal(s)}: no frenáis a tiempo y os salís de la pista.`);
    } else {
      const adv = advFor(s, sp); s.adv = adv; L.adv = adv;
      for (let i = 0; i < adv && !s.over; i++) {
        if (s.pos === AIRPORT) lose(s, "overshoot", "Habéis pasado de largo el aeropuerto.");
        else if (s.planes[s.pos] > 0) lose(s, "crash", "Habéis chocado con un avión que seguía en vuestra posición.");
        else s.pos++;
      }
      L.pos = s.pos;
    }
  } else if (S.k === "radio") {
    const t = s.pos + v - 1; L.tg = t;
    if (t <= AIRPORT && s.planes[t] > 0) { s.planes[t]--; L.hit = 1; }
  } else if (S.k === "gear") { if (!s.gear[S.i]) { s.gear[S.i] = 1; L.on = 1; } }
  else if (S.k === "flap") { if (s.flaps === S.i) { s.flaps++; L.on = 1; } }
  else if (S.k === "brake") { if (s.brakes === S.i) { s.brakes++; L.on = 1; } }
  else if (S.k === "conc") { if (s.coffee < MAX_COFFEE) { s.coffee++; L.on = 1; } }
  s.last = L; s.hist.push(L);
  if (s.over) return s;
  if (placed(s) === 8) endRound(s);
  else s.turn = 1 - p;
  return s;
}
function endRound(s) {
  if (final(s)) {
    const bad = [];
    if (s.planes.some(x => x > 0)) bad.push("quedan aviones en la aproximación");
    if (gearCount(s) < 3) bad.push("el tren de aterrizaje no está desplegado entero");
    if (s.flaps < 4) bad.push("faltan flaps por desplegar");
    if (s.axis !== 0) bad.push("el avión no está recto");
    if (bad.length) { lose(s, "land", "Aterrizaje fallido: " + bad.join(", ") + "."); return; }
    s.over = { win: true, why: "land", txt: "¡Aterrizaje perfecto!" };
    s.wins[0] = (s.wins[0] || 0) + 1; s.played = (s.played || 0) + 1;
    return;
  }
  s.round++;
  if (final(s) && s.pos !== AIRPORT) { lose(s, "late", "Habéis llegado al suelo sin tener la pista delante."); return; }
  const L = { n: ++s.n, t: "round", r: s.round };
  s.hist.push(L);
  startRound(s);
}

/* ================= descripciones ================= */
const SLOT_NAME = { axis: "el eje", eng: "los motores", radio: "la radio", gear: "el tren de aterrizaje", flap: "los flaps", brake: "los frenos", conc: "concentración" };
function describe(L, who, you) {
  if (L.t === "reroll") return `${who} ${you ? "gastas" : "gasta"} una ficha: los dos podéis volver a tirar dados`;
  if (L.t === "pick") return L.c ? `${who} ${you ? "vuelves" : "vuelve"} a tirar ${L.c === 1 ? "1 dado" : L.c + " dados"}` : `${who} ${you ? "te quedas" : "se queda"} con sus dados`;
  if (L.t === "round") return `Empieza la ronda ${L.r} (${ALT[L.r - 1]} pies)`;
  const S = SLOTS[L.s], put = you ? "pones" : "pone";
  let t = `${who} ${put} un ${L.v}${L.k ? ` (con ${Math.abs(L.k)} café${Math.abs(L.k) > 1 ? "s" : ""})` : ""} en ${SLOT_NAME[S.k]}`;
  if (L.ax != null) t += L.d ? `: el avión se inclina ${Math.abs(L.d)} hacia el ${L.d > 0 ? "copiloto" : "piloto"}` : ": el avión no se mueve";
  if (L.sp != null) t += L.brk != null ? `: velocidad ${L.sp} con frenos ${L.brk}` : `: velocidad ${L.sp}, ${L.adv === 0 ? "no avanzáis" : `avanzáis ${L.adv}`}`;
  if (S.k === "radio") t += L.hit ? ": un avión despejado" : ": no había ningún avión ahí";
  if ((S.k === "gear" || S.k === "flap" || S.k === "brake") && L.on) t += ": desplegado";
  if (S.k === "conc") t += L.on ? ": +1 café" : "";
  return t;
}

/* ================= compañero IA =================
   Solo mira sus propios dados y la mesa. Reparte sus dados entre las casillas (todas las combinaciones),
   puntúa el resultado suponiendo que el compañero responderá lo mejor que pueda con los dados que le quedan,
   y juega primero lo que no depende del otro (radio, interruptores) y deja para el final lo que sí. */
const COFFEE_COST = 2.5;
function axisPen(a, s) {
  const A = Math.abs(a);
  if (A >= 3) return -1000;
  if (final(s)) return A ? -1000 : 0;
  const left = ROUNDS - s.round;           // rondas para corregir
  return -(A * 5 + (A === 2 ? 12 : 0)) * (left <= 1 ? 3 : 1);
}
/* Valor de la posición tras avanzar en esta ronda */
function posVal(s, pos) {
  const M = Math.max(0, 6 - s.round);     // rondas que aún pueden mover el avión después de esta
  const d = AIRPORT - pos;
  if (s.round >= 6 && d > 0) return -1000;
  if (d > 2 * M) return -400 - 100 * (d - 2 * M);
  let v = d > M ? -14 * (d - M) : -4 * (M - d);
  if (d > 0 && M > 0 && d / M > 1.5) v -= 10;
  return v;
}
/* Simular la ronda tras poner los dados elegidos (sin el eje y los motores) y valorar el resto */
function restVal(t, s) {
  let v = 0;
  const left = ROUNDS - t.round;               // rondas completas que quedan después de esta
  const gR = 3 - (t.gear[0] + t.gear[1] + t.gear[2]), fR = 4 - t.flaps, bR = Math.max(0, 2 - t.brakes);
  v -= 9 * gR + 9 * fR + 9 * bR + (t.brakes < 3 ? 4 : 0);
  const capP = 2 * left, capC = 2 * left;
  const plAhead = t.planes.reduce((a, x, i) => a + (i >= t.pos ? x : 0), 0);
  const needP = gR + bR + Math.ceil(plAhead / 3), needC = fR + Math.ceil(plAhead / 2);
  if (needP > capP) v -= 70 * (needP - capP);
  if (needC > capC) v -= 70 * (needC - capC);
  if (t.round === ROUNDS) { if (gR || fR || t.planes.some(x => x)) v -= 1000; }
  v -= 8 * plAhead;
  v += 3.5 * t.coffee;
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
  const q = 1 - p, t = { round: s.round, pos: s.pos, planes: s.planes.slice(), gear: s.gear.slice(), flaps: s.flaps, brakes: s.brakes, coffee: s.coffee };
  let v = 0, myAx = null, myEn = null;
  const ord = asg.slice().sort((a, b) => SLOT_IDS.indexOf(a.s) - SLOT_IDS.indexOf(b.s));
  for (const x of asg) { t.coffee -= Math.abs(x.k); v -= COFFEE_COST * Math.abs(x.k); }
  for (const x of ord) {
    const S = SLOTS[x.s];
    if (S.k === "gear") { if (!t.gear[S.i]) { t.gear[S.i] = 1; v += 2; } else v -= 1; }
    else if (S.k === "flap") { if (t.flaps < S.i) return -1e9; if (t.flaps === S.i) { t.flaps++; v += 2; } else v -= 1; }
    else if (S.k === "brake") { if (t.brakes < S.i) return -1e9; if (t.brakes === S.i) { t.brakes++; v += 2; } else v -= 1; }
    else if (S.k === "conc") { if (t.coffee < MAX_COFFEE) t.coffee++; else v -= 1; }
    else if (S.k === "radio") { const tg = t.pos + x.v - 1; if (tg <= AIRPORT && t.planes[tg] > 0) { t.planes[tg]--; v += 6 + (tg === t.pos ? 4 : 0); } else v -= 2; }
    else if (S.k === "axis") myAx = x.v;
    else if (S.k === "eng") myEn = x.v;
  }
  const kq = s.dice[q].length, cof = Math.max(0, t.coffee);
  /* eje */
  const axMine = p === P ? "axP" : "axC", axTheirs = p === P ? "axC" : "axP";
  const axRes = (vp, vc) => axisPen(s.axis + (vc - vp), t);
  if (s.sl.axP && s.sl.axC) v += axisPen(s.axis, t);
  else {
    const mine = myAx != null ? myAx : s.sl[axMine] ? s.sl[axMine].v : null, theirs = s.sl[axTheirs] ? s.sl[axTheirs].v : null;
    if (mine != null && theirs != null) v += p === P ? axRes(mine, theirs) : axRes(theirs, mine);
    else if (mine != null) { const u = [0]; for (let w = 1; w <= 6; w++) u.push(p === P ? axRes(mine, w) : axRes(w, mine)); v += bestOfK(u, kq, cof); }
    else v += -6; // todavía sin decidir (no debería pasar si faltan dados)
  }
  /* motores */
  const enMine = p === P ? "enP" : "enC", enTheirs = p === P ? "enC" : "enP";
  const engRes = sp => {
    if (t.round === ROUNDS) return sp < BRAKE[t.brakes] ? 0 : -1000;
    const adv = sp < BLUE0 + t.gear[0] + t.gear[1] + t.gear[2] ? 0 : sp > ORANGE0 + t.flaps ? 2 : 1;
    let pos = t.pos;
    for (let i = 0; i < adv; i++) { if (pos === AIRPORT || t.planes[pos] > 0) return -1000; pos++; }
    let r = posVal(t, pos);
    for (let i = pos; i <= AIRPORT; i++) if (t.planes[i]) r -= (i === pos ? 6 : 2) * t.planes[i] / Math.max(1, i - pos + 1);
    return r;
  };
  if (s.sl.enP && s.sl.enC) v += posVal(t, s.pos);
  else {
    const mine = myEn != null ? myEn : s.sl[enMine] ? s.sl[enMine].v : null, theirs = s.sl[enTheirs] ? s.sl[enTheirs].v : null;
    if (mine != null && theirs != null) v += engRes(mine + theirs);
    else if (mine != null) { const u = [0]; for (let w = 1; w <= 6; w++) u.push(engRes(mine + w)); v += bestOfK(u, kq, cof); }
    else v += -6;
  }
  return v + restVal(t, s);
}
/* Todas las formas de repartir los dados de p en casillas libres (café incluido, como mucho 2 por ronda de cálculo) */
function bestAssign(s, p) {
  const D = s.dice[p].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const free = SLOT_IDS.filter(id => !s.sl[id] && (SLOTS[id].who === p || SLOTS[id].who === -1));
  const mand = MAND[p].filter(id => !s.sl[id]);
  const maxK = Math.min(2, s.coffee);
  let best = null, bestV = -Infinity;
  const used = new Set(), cur = [];
  function dfs(j, budget) {
    if (j === D.length) {
      if (mand.some(id => !used.has(id))) return;
      const v = assignVal(s, p, cur);
      if (v > bestV) { bestV = v; best = cur.slice(); }
      return;
    }
    const prev = j > 0 && D[j - 1].v === D[j].v ? cur[j - 1] : null;
    for (const id of free) {
      if (used.has(id)) continue;
      const S = SLOTS[id];
      // casillas iguales (concentración, radios del copiloto): solo la primera libre
      if (S.k === "conc" && free.some(o => SLOTS[o].k === "conc" && !used.has(o) && SLOT_IDS.indexOf(o) < SLOT_IDS.indexOf(id))) continue;
      if (id === "raC2" && free.includes("raC1") && !used.has("raC1")) continue;
      if (prev && SLOT_IDS.indexOf(id) < SLOT_IDS.indexOf(prev.s) && !prev.k) continue;
      const ks = S.k === "conc" ? [0] : [0, 1, -1, 2, -2].filter(k => Math.abs(k) <= Math.min(budget, maxK));
      for (const k of ks) {
        const v = D[j].v + k;
        if (v < 1 || v > 6) continue;
        if (S.ok && !S.ok.includes(v)) continue;
        used.add(id); cur.push({ d: D[j].i, s: id, v, k });
        dfs(j + 1, budget - Math.abs(k));
        cur.pop(); used.delete(id);
      }
    }
  }
  dfs(0, s.coffee);
  return { asg: best, v: bestV };
}
function plan(s, p) {
  if (s.over) return null;
  if (s.rrPend && s.rrPend.need[p]) return { t: "rerollPick", idx: rerollChoice(s, p) };
  if (s.rrPend || s.turn !== p || !s.dice[p].length) return null;
  const { asg, v } = bestAssign(s, p);
  if (!asg) return fallback(s, p);
  if (v < -600 && s.rr > 0) return { t: "reroll" };
  return pickFrom(s, p, asg);
}
function pickFrom(s, p, asg) {
  const rank = x => {
    const S = SLOTS[x.s], q = 1 - p;
    if (S.k === "radio") return 0;
    if (S.k === "gear" || S.k === "flap" || S.k === "brake") return 1;
    if (S.k === "axis") return s.sl[p === P ? "axC" : "axP"] ? 2 : 4;
    if (S.k === "eng") {
      if (s.sl[p === P ? "enC" : "enP"]) return 2;
      // los motores al final si aún quedan aviones en nuestra casilla que el compañero puede despejar
      return 5;
    }
    return 3;
  };
  const pick = asg.slice().sort((a, b) => rank(a) - rank(b))[0];
  const a = { t: "place", d: pick.d, s: pick.s, k: pick.k };
  return check(s, p, a) ? fallback(s, p) : a;
}
function fallback(s, p) {
  for (let d = 0; d < s.dice[p].length; d++) for (const id of SLOT_IDS) { const a = { t: "place", d, s: id, k: 0 }; if (!check(s, p, a)) return a; }
  return null;
}
function rerollChoice(s, p) {
  if (!s.dice[p].length) return [];
  const { asg, v } = bestAssign(s, p);
  if (!asg || v > -150) return [];
  // vuelve a tirar los dados que no aportan nada útil
  const keep = new Set(asg.filter(x => { const S = SLOTS[x.s]; return (S.k === "gear" || S.k === "flap" || S.k === "brake") && x.k === 0; }).map(x => x.d));
  return s.dice[p].map((_, i) => i).filter(i => !keep.has(i));
}
/* Pista para un jugador humano: la jugada que haría la IA en su lugar */
function hint(s, p) {
  if (s.over || s.rrPend || s.turn !== p || !s.dice[p].length) return null;
  const { asg, v } = bestAssign(s, p);
  const a = asg ? pickFrom(s, p, asg) : fallback(s, p);
  return a ? { ...a, rr: v < -600 && s.rr > 0 } : null;
}

const API = { P, C, ROLE, ROUNDS, ALT, ROUTE, AIRPORT, REROLL_AT, BLUE0, ORANGE0, BRAKE, MAX_COFFEE, SLOTS, SLOT_IDS, MAND,
  newGame, rematch, check, apply, slotWhy, describe, plan, hint, bestAssign, advFor, blue, orange, brakeVal, gearCount, mandLeft, final, placed };
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Cabina = API;
})(typeof window !== "undefined" ? window : globalThis);
