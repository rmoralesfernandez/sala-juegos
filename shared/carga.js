/* Respuesta inmediata al pulsar en toda la Sala.
   - Al tocar un botón se hunde un poco al momento, para saber que se ha pulsado.
   - Si lo pulsado arranca algo lento (Firebase, IA de Gemini, crear o unirse a sala), el botón
     muestra un círculo girando y una barra arriba, y no admite un segundo toque hasta que termina.
   - Al ir a otra pantalla (enlaces, ⌂, menú de la Sala) aparece «Cargando…».
   shared/claude-shim.js avisa de cada operación con SalaCarga.seguir(promesa); un juego puede usar
   SalaCarga.con(boton, promesa) para marcar a mano cualquier espera propia. */
(() => {
  "use strict";
  if (window.SalaCarga) return;

  const SEL = 'button, a[href], [role="button"], input[type="button"], input[type="submit"], summary, label.btn, .btn';
  const VENTANA = 400;   // ms tras el toque en los que una operación nueva cuenta como suya
  const CADENA = 10000;  // mientras siga cargando, las operaciones encadenadas siguen contando (hasta este límite)
  const MOSTRAR = 80;    // ms antes de enseñar el círculo (lo instantáneo no parpadea)
  const MAX = 30000;     // por si algo nunca responde

  const css = `
.sala-pulsado{filter:brightness(.88) saturate(1.05)!important}
.sala-pulsado.sala-hunde{scale:.95}
.sala-cargando{cursor:progress!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}
.sala-cargando>:not(.sala-spin){visibility:hidden!important}
.sala-spin{position:absolute!important;left:50%;top:50%;translate:-50% -50%;width:1.2em;height:1.2em;min-width:16px;min-height:16px;max-width:30px;max-height:30px;box-sizing:border-box;border:2.5px solid var(--sala-c,currentColor);border-right-color:transparent;border-radius:50%;animation:sala-giro .7s linear infinite;pointer-events:none;visibility:visible!important;margin:0!important;padding:0!important}
@keyframes sala-giro{to{rotate:360deg}}
#sala-barra{position:fixed;left:0;right:0;top:0;height:3px;z-index:2147483646;pointer-events:none;overflow:hidden;opacity:0;transition:opacity .2s}
#sala-barra.on{opacity:1}
#sala-barra::before{content:"";position:absolute;top:0;bottom:0;width:40%;left:-40%;background:linear-gradient(90deg,transparent,#ffd166,#ff6b6b,transparent);animation:sala-barra 1s ease-in-out infinite}
@keyframes sala-barra{to{left:100%}}
#sala-velo{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(10,10,20,.55);color:#fff;font:600 16px/1.2 system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .15s;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
#sala-velo.on{opacity:1;pointer-events:auto}
#sala-velo i{width:42px;height:42px;border:4px solid #fff;border-right-color:transparent;border-radius:50%;animation:sala-giro .7s linear infinite}
@media (prefers-reduced-motion:reduce){.sala-spin,#sala-velo i{animation-duration:1.6s}.sala-pulsado.sala-hunde{scale:.98}}`;

  let barra = null, velo = null, veloT = 0;
  function montar() {
    if (barra) return;
    const st = document.createElement("style");
    st.id = "sala-carga-css"; st.textContent = css;
    document.head.appendChild(st);
    barra = document.createElement("div"); barra.id = "sala-barra"; barra.setAttribute("aria-hidden", "true");
    velo = document.createElement("div"); velo.id = "sala-velo"; velo.setAttribute("role", "status");
    velo.innerHTML = "<i></i><span>Cargando…</span>";
    document.body.append(barra, velo);
  }
  if (document.body) montar(); else document.addEventListener("DOMContentLoaded", montar);

  /* ---------- qué se ha tocado ---------- */
  const NO = 'input:not([type="button"]):not([type="submit"]), select, textarea, [contenteditable="true"], canvas';
  function objetivo(t) {
    if (!t || !t.closest) return null;
    if (t.closest(NO)) return null;
    let el = t.closest(SEL);
    if (!el) {  // fichas, cartas y casillas: cualquier cosa con cursor de mano, cerca del dedo
      for (let x = t, i = 0; x && x !== document.body && i < 5; x = x.parentElement, i++) {
        if (getComputedStyle(x).cursor === "pointer") { el = x; break; }
      }
    }
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return null;
    return el;
  }
  const firma = el => [el.tagName, el.id, String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || "").split(/\s+/).filter(k => k && !k.startsWith("sala-")).join(" "), (el.textContent || "").trim().slice(0, 40), JSON.stringify(el.dataset || {})].join("|");

  /* ---------- hundirse al pulsar ---------- */
  let pulsado = null, pulsadoT = 0;
  function soltar() {
    const el = pulsado; if (!el) return;
    pulsado = null;
    setTimeout(() => el.classList.remove("sala-pulsado", "sala-hunde"), Math.max(0, 110 - (performance.now() - pulsadoT)));
  }
  document.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    const el = objetivo(e.target); if (!el) return;
    soltar();
    const r = el.getBoundingClientRect();
    if (r.width * r.height > innerWidth * innerHeight * 0.3) return;  // un tablero entero no se hunde
    pulsado = el; pulsadoT = performance.now();
    el.classList.add("sala-pulsado");
    if (r.width < 420 && r.height < 200) el.classList.add("sala-hunde");
  }, { capture: true, passive: true });
  ["pointerup", "pointercancel", "dragstart"].forEach(t => document.addEventListener(t, soltar, { capture: true, passive: true }));
  addEventListener("blur", soltar);

  /* ---------- operaciones lentas ligadas al toque ---------- */
  let ctx = null;           // último toque
  const vivos = new Set();  // toques que aún esperan algo
  function nuevo(el) { return { el, sig: firma(el), t: performance.now(), n: 0, visto: false, fin: false, tm: 0, tmax: 0, pos: null }; }

  function poner(c) {
    const el = c.el;
    if (!el || !el.isConnected || el.classList.contains("sala-cargando")) return;
    const cs = getComputedStyle(el);
    el.style.setProperty("--sala-c", cs.color);
    if (cs.position === "static") { c.pos = el.style.position; el.style.position = "relative"; }
    el.classList.add("sala-cargando");
    el.setAttribute("aria-busy", "true");
    const s = document.createElement("span"); s.className = "sala-spin"; s.setAttribute("aria-hidden", "true");
    el.appendChild(s);
  }
  function quitar(c) {
    const el = c.el; if (!el) return;
    el.classList.remove("sala-cargando");
    el.removeAttribute("aria-busy");
    el.style.removeProperty("--sala-c");
    if (c.pos !== null) { el.style.position = c.pos; c.pos = null; }
    el.querySelectorAll(":scope > .sala-spin").forEach(s => s.remove());
  }
  /* Muchos juegos repintan la pantalla al empezar a cargar: el botón tocado se sustituye por uno igual. */
  function buscarGemelo(c) {
    const v = c.el;
    if (v && v.id) { const g = document.getElementById(v.id); if (g && g.tagName === v.tagName) return g; }
    for (const g of document.querySelectorAll(SEL)) if (firma(g) === c.sig) return g;
    return null;
  }
  function vigilar(c) {
    if (c.fin) return;
    if (!c.el || !c.el.isConnected) { const g = buscarGemelo(c); if (g) { c.el = g; c.pos = null; poner(c); } }
    c.rv = setTimeout(() => vigilar(c), 150);
  }
  function pintarBarra() { if (barra) barra.classList.toggle("on", [...vivos].some(c => c.visto)); }

  function terminar(c) {
    if (c.fin) return;
    c.fin = true; clearTimeout(c.tm); clearTimeout(c.tmax); clearTimeout(c.rv);
    vivos.delete(c); quitar(c); pintarBarra();
  }
  function seguir(p, c) {
    if (!p || typeof p.then !== "function") return p;
    c = c || ctx;
    const ahora = performance.now();
    if (!c || c.fin || !(ahora - c.t < VENTANA || (c.n > 0 && ahora - c.t < CADENA))) return p;
    c.n++; vivos.add(c);
    if (!c.visto && !c.tm) c.tm = setTimeout(() => { c.tm = 0; if (c.n > 0 && !c.fin) { c.visto = true; poner(c); vigilar(c); pintarBarra(); } }, MOSTRAR);
    if (!c.tmax) c.tmax = setTimeout(() => terminar(c), MAX);
    const listo = () => { if (--c.n <= 0) setTimeout(() => { if (c.n <= 0) terminar(c); }, 30); };
    p.then(listo, listo);
    return p;
  }
  /* Uso a mano desde un juego: SalaCarga.con(boton, promesa) */
  function con(el, p) {
    const c = nuevo(el); c.t = performance.now();
    return seguir(p, c);
  }

  document.addEventListener("click", e => {
    const el = objetivo(e.target); if (!el) return;
    const ocupado = el.classList.contains("sala-cargando") || el.closest(".sala-cargando")
      || [...vivos].some(c => c.n > 0 && (c.el === el || c.sig === firma(el)));
    if (ocupado) { e.preventDefault(); e.stopImmediatePropagation(); return; }  // doble toque
    ctx = nuevo(el);
  }, true);

  /* ---------- cambiar de pantalla ---------- */
  function cargando() {
    montar();
    clearTimeout(veloT);
    velo.classList.add("on");
    veloT = setTimeout(() => velo.classList.remove("on"), 8000);  // por si la salida se cancela
  }
  function limpiarTodo() {
    clearTimeout(veloT); if (velo) velo.classList.remove("on");
    [...vivos].forEach(terminar);
    document.querySelectorAll(".sala-cargando").forEach(el => quitar({ el, pos: null }));
  }
  addEventListener("click", e => {  // fase de burbuja: aquí ya sabemos si alguien canceló el enlace
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    let u; try { u = new URL(a.href, location.href); } catch { return; }
    if (!/^https?:$/.test(u.protocol)) return;
    if (u.origin === location.origin && u.pathname === location.pathname && u.search === location.search) return;  // solo cambia el #
    const c = nuevo(a); c.visto = true; poner(c); vivos.add(c);
    setTimeout(cargando, 150);
  });
  addEventListener("pageshow", e => { if (e.persisted) limpiarTodo(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && velo && velo.classList.contains("on")) setTimeout(() => { if (!document.hidden) limpiarTodo(); }, 1500); });

  window.SalaCarga = Object.freeze({ seguir: p => seguir(p), con, cargando, listo: limpiarTodo });
})();
