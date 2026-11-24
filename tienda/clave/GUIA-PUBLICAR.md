# Clave Mecánica en Google Play · guía paso a paso

Todo lo de la app está en el repositorio, carpeta `tienda/clave/`. La web de la Sala no cambia: esta carpeta es un proyecto aparte.

| Qué | Dónde |
|---|---|
| La app (HTML del juego, sin conexión) | `tienda/clave/www/` |
| Proyecto Android (Android Studio) | `tienda/clave/android/` |
| Proyecto iOS (para cuando tengas Mac) | `tienda/clave/ios/` |
| Icono, gráfico destacado, capturas y textos de la ficha | `tienda/clave/play-store/` |
| Política de privacidad (URL pública) | https://rmoralesfernandez.github.io/sala-juegos/tienda/clave/www/privacidad.html |
| APK de prueba que se compila solo | GitHub → pestaña **Actions** → «Clave Mecánica · APK de prueba» → artefacto |

**Datos fijos de la app**
- Nombre del paquete: `com.salajuegos.clavemecanica` (no se puede cambiar una vez subida la primera versión; si quieres otro, dímelo antes de subirla).
- Versión: 1.0.0 (versionCode 1).

---

## 0. Antes de nada (2 minutos)
1. Abre `tienda/clave/www/privacidad.html` y cambia `CORREO_DE_CONTACTO` por tu correo de contacto (o pásamelo y lo pongo yo).

## 1. Probar la app en tu móvil sin instalar nada
1. En GitHub, abre el repositorio → pestaña **Actions** → **Clave Mecánica · APK de prueba** → la ejecución más reciente con ✓ verde.
2. Abajo, en **Artifacts**, descarga `clave-mecanica-apk-prueba` (es un .zip con `app-debug.apk`).
3. Pásalo al móvil Android, ábrelo y acepta «instalar apps de origen desconocido».
4. Juega un rato. Si ves algo raro, me lo dices antes de seguir.

## 2. Preparar el ordenador (una sola vez)
1. Instala **Node.js LTS**: https://nodejs.org → botón LTS → siguiente, siguiente.
2. Instala **Android Studio**: https://developer.android.com/studio → instalación estándar (descarga el SDK solo, tarda un rato).
3. Descarga el proyecto: en GitHub → botón verde **Code** → **Download ZIP**. Descomprímelo, por ejemplo en `Documentos\sala-juegos`.

## 3. Preparar el proyecto Android (cada vez que haya una versión nueva)
1. Abre la carpeta `Documentos\sala-juegos\tienda\clave` en el Explorador de Windows.
2. Haz clic en la barra de dirección, escribe `cmd` y pulsa Intro. Se abre una ventana negra ya en esa carpeta.
3. Escribe estas dos órdenes (una y luego la otra, pulsando Intro):
   ```
   npm install
   npx cap sync android
   ```
4. Cierra la ventana negra.

## 4. Crear tu clave de firma y el archivo para Google Play (.aab)
1. Abre Android Studio → **Open** → elige la carpeta `tienda\clave\android`. Espera a que termine «Gradle sync» (barra de abajo; la primera vez varios minutos).
2. Menú **Build → Generate Signed App Bundle or APK…** → marca **Android App Bundle** → **Next**.
3. En «Key store path» pulsa **Create new…** y rellena:
   - **Key store path**: una carpeta FUERA del proyecto, por ejemplo `Documentos\claves\clave-mecanica-subida.jks`
   - **Password** (y repetir): una contraseña fuerte
   - **Alias**: `subida` · **Password** del alias: puede ser la misma
   - **Validity (years)**: 30
   - **First and Last Name**: tu nombre (el resto puedes dejarlo vacío) → **OK**
4. **Next** → elige **release** → **Create**.
5. Cuando termine, pulsa **locate** en el aviso. El archivo es `android\app\release\app-release.aab`. Ese es el que se sube a Google Play.

**Muy importante:** guarda el archivo `.jks` y sus contraseñas en dos sitios (gestor de contraseñas + un USB o tu Drive). Lo necesitas para todas las actualizaciones. Nunca lo subas a GitHub (el proyecto ya lo ignora). Si algún día lo pierdes, como Google firma la app final por ti (Play App Signing), se puede pedir a Google que te cambie la clave de subida; no pierdes la app.

## 5. Cuenta de desarrollador de Google Play (25 $, pago único)
1. Entra en https://play.google.com/console/signup con la cuenta de Google que quieras usar para publicar.
2. Tipo de cuenta: **Personal** (si algún día lo publicas como empresa/agencia, elige Organización y te pedirán el número D-U-N-S).
3. Rellena tus datos, paga los 25 $ y verifica tu identidad (DNI) y tu móvil Android (te piden instalar la app Play Console). La verificación puede tardar unos días.

## 6. Crear la app en Play Console
1. **Crear aplicación** → Nombre: `Clave Mecánica` · Idioma: Español (España) · **Juego** · **Gratis** → acepta las declaraciones.
2. En el **Panel**, completa «Configura tu aplicación». Todas las respuestas están en `play-store/ficha-play-store.md`:
   - Política de privacidad (la URL de arriba)
   - Acceso a la app, Anuncios, Clasificación de contenido, Público objetivo, Seguridad de los datos
   - Ficha de la tienda: textos, icono, gráfico destacado y capturas de `play-store/`

## 7. Prueba cerrada obligatoria (cuentas personales nuevas)
Google exige a las cuentas personales nuevas una **prueba cerrada con al menos 12 testers durante 14 días seguidos** antes de dejarte publicar para todo el mundo.
1. **Probar → Prueba cerrada → Crear canal** (o usa «Alpha»).
2. **Testers**: crea una lista con los correos Gmail de 12 o más personas (familia, amigos, compañeros de la agencia).
3. **Crear versión** → sube `app-release.aab` → Notas: «Primera versión» → **Revisar y publicar**.
4. Copia el **enlace para unirse a la prueba** y mándaselo a los testers: tienen que aceptarlo e instalar la app desde ese enlace. Que no la desinstalen en 14 días.
5. Pasados los 14 días, en el **Panel** aparece **Solicitar acceso a producción**. Responde el cuestionario (qué probaron, qué cambiaste) y, cuando te lo aprueben, crea una versión en **Producción** con el mismo .aab (o uno nuevo).

## 8. Publicar actualizaciones
1. Avísame del cambio y lo hago en la app (`tienda/clave/fuente/`, su copia propia del juego).
2. En `tienda/clave/android/app/build.gradle` sube `versionCode` (2, 3, 4…) y `versionName` ("1.0.1"…). Si quieres, lo hago yo.
3. Repite los pasos 3 y 4 con **la misma clave** `.jks` (elige «Choose existing…» en vez de crear una).
4. Play Console → la pista que toque → **Crear versión** → sube el nuevo .aab.

---

## iOS (App Store) · para más adelante
- Hace falta un **Mac con Xcode** (o un Mac en la nube) y la cuenta **Apple Developer: 99 $/año**.
- El proyecto ya está creado en `tienda/clave/ios/`. En el Mac: `npm install`, `npx cap sync ios`, `npx cap open ios` → en Xcode, **Signing & Capabilities** → elige tu Team → **Product → Archive → Distribute App**.
- En App Store Connect, en privacidad marca **«Datos no recopilados»**. Icono y pantalla de inicio ya están generados.
- Sin Mac propio: servicios como Codemagic compilan y suben la app de iOS desde la nube. Cuando llegue el momento lo vemos.

## Partidas online (no incluidas en la versión 1)
La app de tienda funciona solo sin conexión (un móvil, contra la máquina y reto del día). Así no lleva claves ni datos de nadie, y la política de privacidad es sencilla. Para añadir online haría falta un proyecto de Firebase propio para la app, con reglas de seguridad cerradas y App Check, y actualizar la política y la sección de seguridad de datos. Se puede hacer en una versión 1.1.

## Derechos: qué se cambió para que sea original
El juego estaba inspirado en Turing Machine (Le Scorpion Masqué). Las mecánicas de un juego no tienen copyright, pero sí sus textos, su arte y su presentación, así que:
- Se ha sustituido el banco de 48 tarjetas, que seguía casi una a una las del juego original, por **36 paneles de sensores propios** (zonas, primos, distancias, pico/valle, separación, restos, parejas que suman 5 o 7…).
- Los símbolos triángulo azul / cuadrado amarillo / círculo morado pasan a ser **engranaje naranja, rayo cian y estrella rosa**.
- «Verificadores» y «tarjetas de criterio» pasan a ser **sensores** y **paneles**. Las reglas, el tutorial y los textos están escritos de nuevo.
- Se ha quitado «Estilo Turing Machine» del menú y de la búsqueda de la Sala. No menciones Turing Machine en la ficha de la tienda.
- Nombre, icono y gráficos son originales. Las tipografías (Chakra Petch y Manrope) tienen licencia libre OFL y van incluidas en la app.

## Si cambias el juego de la Sala
`www/` se genera a partir de `clave/` con `python tools/build-www.py` (lo hace también GitHub Actions al compilar el APK de prueba). Después, `npx cap sync android` y vuelves a generar el .aab.
