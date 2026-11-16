/* Indicador de turno común a todos los juegos de la Sala.
   SalaTurno.html(o)     → franja de turno para pintar dentro del layout del juego.
   SalaTurno.marcar(o)   → efectos globales: borde de pantalla del color del jugador,
                           aviso grande al cambiar de turno y vibración si te toca.
   SalaTurno.limpiar()   → quita los efectos (fin de partida, menú…).
   o = { quien, color, tuyo, accion, clave }
     quien  nombre del jugador al que le toca
     color  color del jugador (cualquier color CSS)
     tuyo   true = te toca (online / contra la IA), false = le toca a otro, null = mismo móvil
     accion qué tiene que hacer ahora («Tira el dado», «Elige carta»…)
     clave  opcional; si cambia se repite el aviso aunque el jugador sea el mismo
     titulo opcional; sustituye a «¡Te toca!» / «Turno de X» (juegos simultáneos: «Falta por responder: X»)
     aviso  false = sin aviso central (útil con preguntas cronometradas); el borde y la franja siguen
   Con colores claros (amarillo, blanco, pastel) el texto pasa a oscuro solo. */
(() => {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const css = `
.st-franja{--st-c:#6d5dfc;display:flex;align-items:center;gap:10px;margin:0 0 10px;padding:10px 14px;border-radius:14px;
  background:color-mix(in srgb,var(--st-c) 22%,#14121c);border:2px solid var(--st-c);color:#fff;
  font:600 15px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 4px 18px color-mix(in srgb,var(--st-c) 35%,transparent);text-align:left}
.st-franja .st-punto{flex:none;width:16px;height:16px;border-radius:50%;background:var(--st-c);box-shadow:0 0 0 3px color-mix(in srgb,var(--st-c) 35%,transparent)}
.st-franja .st-txt{flex:1;min-width:0}
.st-franja .st-quien{display:block;font-size:18px;font-weight:800;letter-spacing:.01em;overflow-wrap:anywhere}
.st-franja .st-acc{display:block;font-size:13px;font-weight:500;opacity:.85;margin-top:1px}
.st-franja.st-tuyo{background:var(--st-c);animation:st-late 1.6s ease-in-out infinite}
.st-franja.st-tuyo .st-punto{background:currentColor;box-shadow:0 0 0 3px color-mix(in srgb,currentColor 35%,transparent)}
.st-franja.st-espera{opacity:.92}
.st-franja.st-espera .st-quien{font-size:16px}
.st-franja.st-compacta{padding:7px 12px;margin-bottom:8px}
.st-franja.st-compacta .st-quien{font-size:16px}
@keyframes st-late{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--st-c) 55%,transparent)}50%{box-shadow:0 0 0 6px color-mix(in srgb,var(--st-c) 0%,transparent)}}
#st-borde{position:fixed;inset:0;pointer-events:none;z-index:2147483000;border:4px solid var(--st-c,#6d5dfc);opacity:0;transition:opacity .3s,border-color .3s}
#st-borde.on{opacity:.9}
#st-borde.espera{border-width:2px;opacity:.45}
#st-borde.tuyo{border-width:6px;animation:st-borde 1.6s ease-in-out infinite}
@keyframes st-borde{0%,100%{opacity:.95}50%{opacity:.45}}
#st-aviso{position:fixed;left:50%;top:38%;z-index:2147483001;pointer-events:none;transform:translate(-50%,-50%) scale(.85);opacity:0;
  padding:18px 26px;border-radius:22px;background:var(--st-c,#6d5dfc);color:#fff;text-align:center;max-width:86vw;
  font:800 26px/1.15 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45);transition:opacity .25s,transform .25s}
#st-aviso small{display:block;font-size:14px;font-weight:600;opacity:.9;margin-top:6px}
#st-aviso.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
@media (prefers-reduced-motion:reduce){.st-franja.st-tuyo,#st-borde.tuyo{animation:none}}`;

  let estilos = false;
  function ponEstilos() {
    if (estilos || !document.head) return;
    estilos = true;
    const s = document.createElement("style");
    s.id = "st-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ¿Es un color claro? Entonces el texto sobre él va oscuro.
  const claros = new Map();
  let lienzo = null;
  function claro(color) {
    if (claros.has(color)) return claros.get(color);
    let r = 0;
    try {
      lienzo = lienzo || document.createElement("canvas").getContext("2d");
      lienzo.fillStyle = "#000"; lienzo.fillStyle = color;
      const m = lienzo.fillStyle.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i)
        || lienzo.fillStyle.match(/(\d+)\D+(\d+)\D+(\d+)/);
      if (m) {
        const v = m.slice(1, 4).map(x => (m[0][0] === "#" ? parseInt(x, 16) : +x) / 255)
          .map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
        r = .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
      }
    } catch {}
    const res = r > .45;
    claros.set(color, res);
    return res;
  }
  const tinta = color => claro(color) ? "#16131f" : "#fff";

  function titulo(o) {
    if (o.titulo) return o.titulo;
    return o.tuyo === true ? "¡Te toca!" : `Turno de ${o.quien}`;
  }

  function html(o = {}) {
    ponEstilos();
    const cls = o.tuyo === true ? "st-tuyo" : o.tuyo === false ? "st-espera" : "st-tuyo";
    const quien = o.titulo ? esc(o.titulo) : o.tuyo === true
      ? (o.quien ? `¡Te toca, ${esc(o.quien)}!` : "¡Te toca!")
      : `Turno de ${esc(o.quien)}`;
    const color = o.color || "#6d5dfc";
    const lleno = o.tuyo !== false;
    const acc = o.tuyo === false ? (o.accion ? `${esc(o.accion)}` : "Espera a que juegue…") : esc(o.accion || "");
    return `<div class="st-franja ${cls}${o.compacta ? " st-compacta" : ""}" style="--st-c:${esc(color)}${lleno ? `;color:${tinta(color)}` : ""}" role="status" aria-live="polite">`
      + `<span class="st-punto"></span><span class="st-txt"><span class="st-quien">${quien}</span>`
      + (acc ? `<span class="st-acc">${acc}</span>` : "") + `</span></div>`;
  }

  let borde = null, aviso = null, avisoT = 0, ultima = null;
  function nodos() {
    ponEstilos();
    if (!borde) { borde = document.createElement("div"); borde.id = "st-borde"; document.body.appendChild(borde); }
    if (!aviso) { aviso = document.createElement("div"); aviso.id = "st-aviso"; aviso.setAttribute("aria-hidden", "true"); document.body.appendChild(aviso); }
  }

  function marcar(o = {}) {
    if (!document.body) return;
    nodos();
    const color = o.color || "#6d5dfc";
    borde.style.setProperty("--st-c", color);
    // Borde del color de quien juega: grueso y latiendo si te toca, fino si esperas.
    borde.className = o.tuyo === false ? "on espera" : o.tuyo === true ? "on tuyo" : "on";
    apunta(o);
    const k = `${o.quien}|${o.tuyo}|${o.clave ?? ""}`;
    if (k === ultima) return;
    const primera = ultima === null;
    ultima = k;
    if (o.tuyo === false || o.aviso === false) { clearTimeout(avisoT); aviso.classList.remove("on"); return; }
    aviso.style.setProperty("--st-c", color);
    aviso.style.color = tinta(color);
    aviso.innerHTML = esc(titulo(o)) + (o.accion ? `<small>${esc(o.accion)}</small>` : "");
    aviso.classList.add("on");
    clearTimeout(avisoT);
    avisoT = setTimeout(() => aviso.classList.remove("on"), primera ? 1100 : 1500);
    if (o.tuyo === true && navigator.vibrate) try { navigator.vibrate([80, 60, 80]); } catch {}
  }

  function limpiar() {
    dejaPartida();
    ultima = null;
    clearTimeout(avisoT);
    if (borde) borde.className = "";
    if (aviso) aviso.classList.remove("on");
  }

  /* Partidas a medias: cada juego online que está en marcha queda apuntado en este móvil
     (localStorage "sala.partidas", por carpeta del juego). La Sala las lista y, al recargar
     o reabrir, el juego vuelve solo a la partida (pendiente()). */
  const REG = "sala.partidas", VIDA = 12 * 3600e3;
  const DIR = (location.pathname.match(/([^/]+)\/(?:index\.html)?$/) || [])[1] || "";
  const hashCode = () => { const c = (location.hash || "").replace("#", "").toUpperCase(); return /^[A-Z0-9]{4}$/.test(c) ? c : ""; };
  const leeReg = () => { try { return JSON.parse(localStorage.getItem(REG)) || {}; } catch { return {}; } };
  const guardaReg = r => { try { localStorage.setItem(REG, JSON.stringify(r)); } catch {} };
  let activa = "", apuntadaT = 0, apuntadaK = "";
  function apunta(o) {
    const c = (o.codigo && String(o.codigo).toUpperCase()) || hashCode();
    if (!DIR || !/^[A-Z0-9]{4}$/.test(c)) return;
    activa = c;
    const k = c + "|" + (o.tuyo === true);
    if (k === apuntadaK && Date.now() - apuntadaT < 60000) return;
    apuntadaK = k; apuntadaT = Date.now();
    const r = leeReg();
    r[DIR] = { code: c, t: Date.now(), tuyo: o.tuyo === true, estado: "juego", hash: !o.codigo || c === hashCode() };
    guardaReg(r);
  }
  /* Fin de la partida o salida al menú. Si la página sigue con el código en la dirección es que
     la partida terminó y se borra; si no, el jugador salió a medias y queda en la lista. */
  function dejaPartida(fin) {
    if (!activa) return;
    const c = activa; activa = ""; apuntadaK = "";
    setTimeout(() => {
      const r = leeReg(), e = r[DIR];
      if (!e || e.code !== c) return;
      if (fin || (e.hash && hashCode() === c)) delete r[DIR]; else { e.estado = "fuera"; e.t = Date.now(); }
      guardaReg(r);
    });
  }
  function fin() { if (activa) dejaPartida(true); else { const r = leeReg(); if (r[DIR]) { delete r[DIR]; guardaReg(r); } } }
  /* Código de la partida a la que volver solo: la que estaba en juego al cerrar o recargar,
     o la que se abre desde la lista de la Sala (con su código en la dirección). */
  function pendiente() {
    const e = leeReg()[DIR], h = hashCode();
    if (!e || Date.now() - e.t > VIDA) return "";
    if (h) return h === e.code ? e.code : "";
    return e.estado === "juego" ? e.code : "";
  }
  /* Para juegos sin turnos (todos a la vez): solo apunta la partida para la lista de la Sala. */
  function enPartida(code) {
    code = String(code || "").toUpperCase();
    if (!DIR || !/^[A-Z0-9]{4}$/.test(code)) return;
    const r = leeReg(), e = r[DIR];
    if (e && e.code === code && Date.now() - e.t < 60000) return;
    r[DIR] = { code, t: Date.now(), estado: "juego", sinHash: true };
    guardaReg(r);
  }
  function olvidar() { const r = leeReg(); if (r[DIR]) { delete r[DIR]; guardaReg(r); } activa = ""; apuntadaK = ""; }

  /* Pestaña ⌂ de vuelta a la Sala: si hay una partida en juego, pide confirmación. */
  document.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest("a.sala-back");
    if (!a || !borde || !borde.className) return;
    if (!confirm("¿Salir de la partida?\nPodrás volver a ella desde la Sala.")) { e.preventDefault(); return; }
    if (activa) { const r = leeReg(); if (r[DIR] && r[DIR].code === activa) { r[DIR].estado = "fuera"; r[DIR].t = Date.now(); guardaReg(r); } activa = ""; }
  }, true);

  window.SalaTurno = { html, marcar, limpiar, titulo, pendiente, fin, olvidar, enPartida };
})();
