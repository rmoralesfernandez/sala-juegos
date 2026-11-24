#!/usr/bin/env python3
"""Genera tienda/clave/www/ (la app de tienda, sin conexión) a partir de su copia propia del juego (tienda/clave/fuente/).
La Sala (clave/) va por separado: cambiarla no toca la app de tienda.

Uso, desde la raíz del repositorio:  python3 tienda/clave/tools/build-www.py
Después: cd tienda/clave && npx cap sync   (copia www/ dentro del proyecto Android/iOS)

La app de tienda no carga Firebase, ni claude-shim, ni nada de internet: solo juego en un móvil,
contra la máquina y reto del día. Si el script avisa de un trozo que no encuentra, es que fuente/index.html
ha cambiado y hay que ajustar aquí ese reemplazo.
"""
import pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
SRC = ROOT / "tienda" / "clave" / "fuente"
OUT = ROOT / "tienda" / "clave" / "www"
VERSION = "1.0.0"

html = (SRC / "index.html").read_text(encoding="utf-8")
fails = []


def rep(old, new, count=1):
    global html
    if old not in html:
        fails.append(old[:90])
        return
    html = html.replace(old, new, count)


def rep_re(pat, new):
    global html
    html2, n = re.subn(pat, new, html, count=1, flags=re.S)
    if not n:
        fails.append(pat[:90])
    html = html2


# ---------- cabecera: sin red, fuentes locales ----------
rep_re(r'<link rel="manifest".*?<script src="motor\.js"></script>', """<link rel="icon" href="img/icono-192.png">
<style>
@font-face{font-family:"Chakra Petch";font-weight:600;font-display:swap;src:url(fonts/chakra-600.woff2) format("woff2")}
@font-face{font-family:"Chakra Petch";font-weight:700;font-display:swap;src:url(fonts/chakra-700.woff2) format("woff2")}
@font-face{font-family:"Manrope";font-weight:200 800;font-display:swap;src:url(fonts/manrope.woff2) format("woff2")}
</style>
<script>window.APP_KEY="clave-app"</script>
<script src="turno.js"></script>
<script src="carga.js"></script>
<script src="motor.js"></script>""")
rep('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">')

# ---------- márgenes seguros (Capacitor inyecta --safe-area-inset-*) ----------
html = html.replace("env(safe-area-inset-top,0px)", "var(--safe-area-inset-top,env(safe-area-inset-top,0px))")
html = html.replace("env(safe-area-inset-bottom,0px)", "var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px))")
rep("#turno .st-franja{margin:0}", """#turno .st-franja{margin:0}
html,body{overscroll-behavior:none;user-select:none;-webkit-user-select:none}
input{user-select:text;-webkit-user-select:text}
.daily{display:flex;align-items:center;gap:12px;text-align:left}
.daily .dd{flex:1;min-width:0;display:grid;gap:2px}
.daily .dd b{font-family:var(--display);font-size:19px;color:var(--brass)}
.daily .dd span{font-size:13px;color:var(--muted)}
.daily .flame{font-family:var(--display);font-size:13px;font-weight:700;background:var(--panel2);border-radius:999px;padding:5px 10px;white-space:nowrap}
.foot{display:flex;justify-content:center;gap:18px;font-size:13px}
.foot a,.foot button{color:var(--muted);background:none;border:0;padding:6px;text-decoration:underline;font-weight:700}""")

# ---------- estado inicial: sin pestaña online ----------
rep('homeTab: ls.get("clave.tab") || "online"', 'homeTab: ls.get("clave.tab") === "ai" ? "ai" : "local"')

# ---------- arranque sin servidor + botón Atrás de Android ----------
rep_re(r"async function boot\(\) \{.*?\n\}\n", """async function boot() {
  S.offline = true; S.ready = true;
  const App = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App;
  if (App && App.addListener) App.addListener("backButton", () => {
    if (tourI >= 0) { endTour(); return; }
    if ($sheet.classList.contains("on")) { closeSheet(); return; }
    if (S.mode) { confirmSheet("¿Salir de la partida?", "Podrás seguirla luego desde el inicio.", "Salir", () => leave()); return; }
    App.exitApp();
  });
  render();
}

/* ================= reto del día =================
   El mismo reto para todo el mundo cada día (semilla = fecha). Se juega en modo Juntos, nivel Normal. */
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dayBefore = s => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
function dailyInfo() {
  const t = today(), done = ls.get("clave.diario") || {}, st = ls.get("clave.racha") || { last: "", n: 0 };
  const streak = st.last === t || st.last === dayBefore(t) ? st.n : 0;
  return { t, done: done.date === t ? done : null, streak };
}
function startDaily() {
  if (!saveName()) return;
  const t = today(), seed = K.mix(+t.replace(/-/g, ""), 0xC1A7E), pz = K.generate(seed, 2);
  const saved = ls.get("clave.partida");
  if (saved && saved.daily === t && saved.pz && saved.pz.seed === seed && !(saved.ps[0] && saved.ps[0].g)) { resumeLocal(); return; }
  S.mode = "local"; S.L = { kind: "juntos", daily: t, pz, gn: 1, names: [S.name], ps: [K.newPlayer()], bench: K.aiPlay(pz, 3, seed ^ 0x77) };
  S.endShown = ""; S.seen = {}; S.lastActive = null; saveLocal(); render();
}
function dailyDone(r, tests) {
  const t = S.L.daily, info = dailyInfo();
  if (info.done) return;
  ls.set("clave.diario", { date: t, r, tests });
  ls.set("clave.racha", { last: t, n: info.streak + 1 });
}
""")

# ---------- portada ----------
rep('<div class="seg" id="tabs"><button data-t="online" aria-pressed="${S.homeTab === "online"}">Online</button><button data-t="local" aria-pressed="${S.homeTab === "local"}">Un móvil</button><button data-t="ai" aria-pressed="${S.homeTab === "ai"}">Máquina</button></div>',
    '<div class="seg" id="tabs"><button data-t="local" aria-pressed="${S.homeTab === "local"}">Un móvil</button><button data-t="ai" aria-pressed="${S.homeTab === "ai"}">Contra la máquina</button></div>')
rep('<a class="btn ghost sm" href="../" style="text-decoration:none">← Sala</a>', '')
rep('<button data-k="juntos" aria-pressed="${S.localKind === "juntos"}">Juntos</button>',
    '<button data-k="juntos" aria-pressed="${S.localKind === "juntos"}">Solo o juntos</button>')
rep('"Resolvéis el reto entre los dos mirando la misma pantalla. Al final veréis cómo lo habría hecho la máquina."',
    '"Sin prisas: tú solo o en compañía, mirando la misma pantalla. Al final verás cómo lo habría hecho la máquina."')
rep('''    <div class="card">
      <label class="lbl">Tu nombre''', '''    ${(() => { const d = dailyInfo(); return `<div class="card daily"><div class="dd"><b>Reto del día</b><span>${d.done ? `Hecho en ${d.done.r} ronda${d.done.r > 1 ? "s" : ""} y ${d.done.tests} pruebas. Mañana, otro.` : "El mismo código para todo el mundo. Nivel Normal."}</span></div>${d.streak ? `<span class="flame">Racha ${d.streak}</span>` : ""}<button class="btn ${d.done ? "ghost" : "gold"} sm" id="daily" ${d.done ? "disabled" : ""}>${d.done ? "Hecho" : "Jugar"}</button></div>`; })()}
    <div class="card">
      <label class="lbl">Tu nombre''')
rep('''    <button class="btn ghost wide" id="rules">Cómo se juega</button>`;
  const keepName''', '''    <button class="btn ghost wide" id="rules">Cómo se juega</button>
    <div class="foot"><button id="about">Acerca de</button><a href="privacidad.html">Privacidad</a></div>`;
  const keepName''')
rep('  on("#rules", "click", showRules);\n  on("#help", "click", showRules);\n}',
    '  on("#rules", "click", showRules);\n  on("#help", "click", showRules);\n  on("#daily", "click", startDaily);\n  on("#about", "click", showAbout);\n}')
rep('function confirmSheet(', f'''function showAbout() {{
  openSheet(`<h2>Clave Mecánica</h2>
    <p class="muted">Versión {VERSION}</p>
    <p>Un juego de deducción: descubre el código secreto de tres cifras haciendo pruebas en los sensores. Funciona sin conexión y no recoge ningún dato.</p>
    <p class="small muted">Tipografías Chakra Petch y Manrope, con licencia SIL Open Font License 1.1.</p>
    <div class="row"><a class="btn ghost" href="privacidad.html" style="text-decoration:none">Privacidad</a><button class="btn gold" id="cx">Cerrar</button></div>`);
  on("#cx", "click", closeSheet, $sheet);
}}
function confirmSheet(''')

# ---------- reto del día: apuntar el resultado ----------
rep("if (code === m.pz.sol) { P.g = { r, c: code }; P.end = r; SFX.win(); }",
    "if (code === m.pz.sol) { P.g = { r, c: code }; P.end = r; SFX.win(); if (S.L && S.L.daily) dailyDone(r, P.tests.length); }")
rep("  const L = S.L, seed = newSeed(), pz = K.generate(seed, L.pz.level);",
    "  const L = S.L, seed = newSeed(), pz = K.generate(seed, L.pz.level);\n  L.daily = null;")
rep('head = "¡Código descifrado!";', 'head = S.L.daily ? "¡Reto del día resuelto!" : "¡Código descifrado!";')
rep('if (S.mode && document.getElementById("verifs")) startTour();', 'if (S.mode && document.getElementById("verifs")) startTour();')

if fails:
    print("No encontrado en clave/index.html (revisa build-www.py):")
    for f in fails:
        print("  -", f)
    sys.exit(1)

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "index.html").write_text(html, encoding="utf-8")
shutil.copy(SRC / "motor.js", OUT / "motor.js")
shutil.copy(ROOT / "shared" / "turno.js", OUT / "turno.js")
shutil.copy(ROOT / "shared" / "carga.js", OUT / "carga.js")
print("www/ generado:", OUT)
