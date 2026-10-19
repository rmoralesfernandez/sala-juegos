/* Temario de la Escuela del Ajedrez Mágico: de saber mover las piezas a nivel de club.
   Tipos de paso:
   txt  explicación (con tablero opcional, flechas y casillas marcadas)
   quiz pregunta con opciones (a = índice correcto)
   pz   ejercicio: encuentra la jugada (sol alterna tu jugada y la respuesta del rival; alts = otras jugadas válidas; mate = vale cualquier mate)
   line jugadas comentadas que se ven paso a paso
   rep  practicar el repertorio: juegas tus jugadas de memoria
   play jugar una posición contra la máquina hasta cumplir el objetivo (mate o coronar)
   pool ejercicios de la colección de problemas con ese tema */
window.LECCIONES = [
{ id: "u1", t: "Primeros pasos", d: "Cómo leer el tablero, el valor de las piezas, jaque mate y no dejar nada colgado.", lessons: [
  { id: "leer", t: "Cómo leer el tablero y las jugadas", steps: [
    { k: "txt", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", marks: { g1: "g" }, txt: "Antes de nada, el idioma del ajedrez. Las <b>columnas</b> tienen letras, de la <b>a</b> a la <b>h</b> (míralas abajo del tablero). Las <b>filas</b> tienen números, del <b>1</b> al <b>8</b> (a la izquierda). Cada casilla se nombra con su letra y su número. La casilla verde es <b>g1</b>: columna g, fila 1. Ahí empieza un caballo blanco." },
    { k: "quiz", fen: "7k/8/8/8/8/8/8/K7 w - - 0 1", marks: { e4: "g" }, q: "¿Cómo se llama la casilla verde?", opts: ["e4", "d4", "e5"], a: 0, exp: "Columna e (la quinta letra) y fila 4. Es una de las cuatro casillas del centro." },
    { k: "quiz", fen: "7k/8/8/8/8/8/8/K7 w - - 0 1", marks: { b7: "g" }, q: "¿Y esta?", opts: ["g2", "b7", "b2"], a: 1, exp: "Columna b, fila 7. Las blancas empiezan abajo (filas 1 y 2) y las negras arriba (filas 7 y 8)." },
    { k: "txt", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", arrows: [["g1", "f3", "g"], ["e2", "e4", "g"]], txt: "Las jugadas se escriben con la <b>letra de la pieza</b> y la <b>casilla a la que va</b>:<br><b>R</b> rey · <b>D</b> dama · <b>T</b> torre · <b>A</b> alfil · <b>C</b> caballo. El <b>peón no lleva letra</b>.<br><b>Cf3</b> = el caballo va a f3. <b>e4</b> = un peón va a e4 (las dos flechas verdes)." },
    { k: "txt", txt: "Y unos símbolos que verás todo el rato:<br><b>x</b> = come. <b>Axf7</b>: el alfil come lo que hay en f7.<br><b>+</b> = jaque. <b>Dh5+</b>: la dama va a h5 y da jaque.<br><b>#</b> = jaque mate, se acaba la partida.<br><b>O-O</b> = enroque corto (el rey hacia la derecha) y <b>O-O-O</b> = enroque largo." },
    { k: "quiz", q: "¿Qué significa Dxe5+?", opts: ["La dama va a e5", "La dama come en e5 y da jaque", "Un peón come en e5"], a: 1, exp: "D = dama, x = come, e5 = la casilla, + = jaque." },
    { k: "txt", txt: "Ahora lo más importante: <b>en esta escuela, cada vez que se mueve una pieza te explico debajo del tablero qué ha pasado</b>: qué pieza se ha movido, qué ataca y qué amenaza.<br>Las <b>flechas rojas</b> son amenazas (lo que se puede comer) y las <b>azules</b>, piezas que defienden.<br>Léelo siempre, sobre todo cuando mueve el rival: así aprendes a ver el tablero como un jugador fuerte." },
    { k: "line", moves: ["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"], txt: "Vamos a verlo con la partida más corta y famosa, el <b>mate del pastor</b>. Pulsa <b>Adelante</b> y lee la explicación de cada jugada.",
      notes: ["Las blancas adelantan el peón del rey dos casillas. Ocupa el centro y deja salir al alfil y a la dama.", "Las negras hacen lo mismo.", "El alfil sale y apunta a f7. f7 es el punto débil de las negras: solo lo defiende el rey.", "Las negras sacan un caballo. Bien, pero no se fijan en lo que preparan las blancas.", "La dama también apunta a f7. Ya son dos piezas atacando f7 y solo el rey lo defiende.", "¡Error! El caballo ataca a la dama, pero no defiende f7.", "La dama come en f7, protegida por el alfil. El rey no puede comerla y no tiene adónde ir: jaque mate."] },
    { k: "quiz", q: "En el mate del pastor, ¿por qué el rey negro no puede comer la dama en f7?", opts: ["Porque el rey no puede comer", "Porque la dama está defendida por el alfil de c4: el rey se pondría en jaque", "Porque es el turno de las blancas"], a: 1, exp: "El rey nunca puede ir a una casilla atacada. Por eso una pieza defendida al lado del rey es tan peligrosa." }
  ]},
  { id: "valor", t: "Lo que vale cada pieza", steps: [
    { k: "txt", fen: "8/8/8/8/1PNBRQ2/8/8/8 w - - 0 1", txt: "Cada pieza vale lo que puede hacer. Apréndete esta tabla, la usarás en <b>cada</b> jugada:<br><b>Peón 1 · Caballo 3 · Alfil 3 · Torre 5 · Dama 9</b>.<br>El rey no tiene precio: si lo pierdes, pierdes la partida." },
    { k: "txt", txt: "Cuando cambias piezas, suma y resta. Dar un caballo (3) por una torre (5) es <b>ganar 2</b>. Dar una dama (9) por una torre (5) es <b>perder 4</b>, aunque te parezca un cambio." },
    { k: "quiz", q: "¿Qué vale más?", opts: ["Una torre", "Un alfil y un peón", "Valen lo mismo"], a: 0, exp: "La torre vale 5; alfil y peón suman 4." },
    { k: "quiz", q: "Tu caballo captura una torre y después te comen el caballo. ¿Cómo quedas?", opts: ["Pierdo 2", "Gano 2", "Igual"], a: 1, exp: "Ganas una torre (5) y pierdes un caballo (3): +2. A esto se le llama ganar la calidad." },
    { k: "pz", fen: "2r3k1/5ppp/8/3qp3/8/5N1P/5PP1/3R2K1 w - - 0 1", sol: ["d1d5"], txt: "Juegas con blancas. Captura lo que más vale sin que te lo devuelvan.", ok: "La dama estaba sola en d5 y nadie la defendía. Antes de mover, mira siempre qué piezas del rival están sin defender." }
  ]},
  { id: "mate", t: "Jaque, mate y ahogado", steps: [
    { k: "txt", txt: "<b>Jaque</b>: el rey está atacado. Hay tres formas de salir: <b>moverlo</b>, <b>comer</b> la pieza que da jaque o <b>tapar</b> poniendo una pieza en medio.<br><b>Jaque mate</b>: no hay ninguna de las tres. Se acaba la partida." },
    { k: "pz", fen: "6k1/5ppp/8/8/8/8/q4PPP/4R1K1 w - - 0 1", sol: ["e1e8"], mate: true, txt: "Mate en una jugada. Fíjate en los peones que encierran al rey negro.", ok: "Te8#. El rey no puede salir porque sus propios peones le tapan la salida. Es el famoso <b>mate del pasillo</b>." },
    { k: "pz", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4", sol: ["f3f7"], mate: true, txt: "Mate en una jugada. El punto débil del principio es f7.", ok: "Dxf7#. La dama come en f7 protegida por el alfil de c4 y el rey no la puede comer. Así es el mate del pastor: con negras tendrás que saber pararlo." },
    { k: "txt", fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1", marks: { h8: "x" }, txt: "<b>Ahogado</b>: el rey no está en jaque pero su bando no tiene ninguna jugada legal. ¡Es <b>tablas</b>! Aquí juegan negras: el rey de h8 no puede moverse y no está en jaque. Con una dama de ventaja, las blancas han regalado medio punto." },
    { k: "quiz", fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1", q: "Juegan negras. ¿Qué pasa en esta posición?", opts: ["Jaque mate, ganan blancas", "Ahogado: tablas", "Las negras pueden mover el rey"], a: 1, exp: "El rey negro no está atacado y no tiene casillas: ahogado." },
    { k: "pz", fen: "7k/8/5QK1/8/8/8/8/8 w - - 0 1", sol: ["f6f8"], mate: true, txt: "Da mate en una jugada. Cuidado: hay una jugada que parece buena y es ahogado.", ok: "Df8# (o Dd8#). Si hubieras jugado Df7, el rey negro no tendría jugadas y sería tablas." }
  ]},
  { id: "colgadas", t: "Piezas colgadas", steps: [
    { k: "txt", txt: "La mitad de las partidas de principiantes se deciden por una pieza que se queda <b>colgada</b>: atacada y sin defensa.<br>Antes de cada jugada hazte dos preguntas:<br>1. <b>¿Qué ha cambiado con la última jugada del rival?</b> ¿Qué ataca ahora?<br>2. <b>¿Dejo algo sin defender</b> con mi jugada?" },
    { k: "pz", fen: "r1b1kbnr/pppp1ppp/2n5/4p1q1/4P3/2NP4/PPP2PPP/R1BQKBNR w KQkq - 1 4", sol: ["c1g5"], txt: "Las negras han sacado la dama demasiado pronto. ¿Qué haces?", ok: "Axg5. El alfil de c1 apuntaba a g5 por la diagonal. Una dama gratis." },
    { k: "pz", fen: "rnbqkb1r/pppp1ppp/8/4p3/2B1P1n1/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4", sol: ["d1g4"], alts: { 0: ["c4f7"] }, txt: "El caballo negro se ha ido de paseo. ¿Quién lo defiende?", ok: "Dxg4. Nadie defendía el caballo de g4: el alfil de c8 tiene el peón de d7 delante." },
    { k: "pool", th: "colgada", n: 3, hi: 900, txt: "Ahora tres de la colección: en todos hay algo que se puede comer." }
  ]}
]},
{ id: "u2", t: "Mates que tienes que saber", d: "El pasillo, dama y torre contra rey y los patrones clásicos.", lessons: [
  { id: "pasillo", t: "El mate del pasillo", steps: [
    { k: "txt", fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", arrows: [["d1", "d8", "r"]], txt: "Cuando el rey se queda detrás de sus peones sin salida, una torre o la dama en la última fila da mate. Le pasa hasta a jugadores buenos." },
    { k: "pz", fen: "6k1/5ppp/8/8/8/8/q4PPP/4R1K1 w - - 0 1", sol: ["e1e8"], mate: true, txt: "Mate en una.", ok: "Te8#." },
    { k: "quiz", q: "¿Cómo evitas que te den mate del pasillo a ti?", opts: ["Abriendo una salida al rey (h3 o g3) cuando tengas tiempo", "Moviendo el rey al centro", "Cambiando la dama"], a: 0, exp: "Una jugada tranquila como h3 da al rey una casilla de escape: se llama hacer 'luft'." },
    { k: "pool", th: "pasillo", n: 3, txt: "Practica el patrón con problemas de partidas reales." }
  ]},
  { id: "dama", t: "Mate con dama y rey", steps: [
    { k: "txt", fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1", txt: "Con dama y rey contra rey se gana siempre, pero hay que saber cómo. El método:<br>1. Pon la dama a <b>salto de caballo</b> del rey rival: le encierras en una caja.<br>2. Ve haciendo la caja más pequeña hasta llevarlo al borde.<br>3. Trae tu rey y da mate. <b>Cuidado con el ahogado</b>: cada vez que muevas la dama, comprueba que el rey rival tiene alguna jugada." },
    { k: "play", fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1", goal: "mate", max: 15, txt: "Dale mate en 15 jugadas o menos. La máquina defiende lo mejor posible." }
  ]},
  { id: "torre", t: "Mate con torre y rey", steps: [
    { k: "txt", fen: "8/8/8/3k4/8/8/8/R3K3 w - - 0 1", txt: "Con torre es más largo. La torre corta al rey por una fila o columna y tu rey se coloca enfrente (en <b>oposición</b>). Cuando los reyes están cara a cara, la torre da jaque y el rival pierde una fila. Si el rey rival no se pone enfrente, haz una jugada de espera con la torre." },
    { k: "play", fen: "8/8/8/3k4/8/8/8/R3K3 w - - 0 1", goal: "mate", max: 30, txt: "Dale mate en 30 jugadas o menos." }
  ]},
  { id: "patrones", t: "Patrones de mate", steps: [
    { k: "pz", fen: "r1bq1rk1/pppp1ppp/2n5/2b1p2Q/8/3BP3/PPPP1PPP/RNB1K1NR w KQ - 0 1", sol: ["h5h7"], mate: true, txt: "Dama y alfil apuntan al mismo sitio. Mate en una.", ok: "Dxh7#. La dama come en h7 protegida por el alfil. Este patrón (h7 o h2) sale muchísimo cuando el caballo de f6 se ha ido." },
    { k: "pz", fen: "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1", sol: ["b3g8", "a8g8", "h6f7"], mate: true, txt: "El mate de la coz: el caballo da mate a un rey rodeado de sus propias piezas. Mate en dos.", ok: "Dg8+! Txg8 obligado y Cf7#. El rey se ahoga entre sus piezas." },
    { k: "pool", th: "mate", n: 4, hi: 1300, txt: "Cuatro mates de partidas reales." }
  ]}
]},
{ id: "u3", t: "Aperturas", d: "Cómo empezar bien y un repertorio sencillo para blancas y negras.", lessons: [
  { id: "principios", t: "Los principios de la apertura", steps: [
    { k: "txt", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5", txt: "Las primeras 10 jugadas tienen tres objetivos:<br>1. <b>Centro</b>: peones en e4/d4 (o e5/d5).<br>2. <b>Desarrollo</b>: saca caballos y alfiles, mejor los caballos primero, y no muevas la misma pieza dos veces sin motivo.<br>3. <b>Enroque</b>: pon el rey a salvo y conecta las torres." },
    { k: "txt", txt: "Errores típicos que tu hermano te castigará:<br>• Sacar la <b>dama</b> pronto: te la atacan y pierdes tiempo.<br>• Mover muchos <b>peones</b> de los lados.<br>• Dejar el rey en el centro con columnas abiertas.<br>• Comer peones 'gratis' sin desarrollar." },
    { k: "quiz", q: "Llevas 6 jugadas. ¿Qué es lo más importante ahora?", opts: ["Atacar con la dama", "Terminar de desarrollar y enrocar", "Avanzar los peones de a y h"], a: 1, exp: "Primero piezas fuera y rey a salvo. Los ataques vienen después." },
    { k: "quiz", q: "¿Por qué no conviene sacar la dama pronto?", opts: ["Porque vale poco", "Porque el rival la ataca con sus piezas mientras se desarrolla", "Porque no puede volver"], a: 1, exp: "Cada ataque a tu dama es una pieza más que saca el rival 'gratis'." }
  ]},
  { id: "italiana", t: "Con blancas: la Italiana", steps: [
    { k: "txt", txt: "Tu repertorio con blancas: <b>1.e4</b> y, si responden 1...e5, la <b>Italiana</b>. Es sólida, fácil de entender y la juegan campeones del mundo." },
    { k: "line", moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d3", "d7d6", "e1g1", "e8g8", "f1e1", "a7a6", "c4b3"],
      notes: ["Ocupas el centro y abres paso a la dama y al alfil.", "Las negras hacen lo mismo.", "Desarrollas y atacas el peón de e5.", "Lo defiende con el caballo.", "El alfil apunta a f7, el punto débil.", "El clásico 'Giuoco Piano'.", "Preparas d4 para ganar centro.", "Atacan tu peón de e4.", "Lo defiendes. Plan lento y seguro.", "Las negras también juegan sólido.", "Rey a salvo.", "Igual las negras.", "La torre defiende e4 y prepara d4 o Cbd2-f1-g3.", "Si el alfil puede ser atacado con ...b5 o ...d5, retíralo antes.", "Ahora el alfil sigue apuntando a f7 desde b3. Siguen Cbd2, Cf1 y Cg3: ¡todas tus piezas en juego!"] },
    { k: "rep", side: "w", moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d3", "d7d6", "e1g1", "e8g8", "f1e1"], txt: "Ahora juégala tú de memoria." },
    { k: "txt", txt: "¿Y si no juegan 1...e5? Plan sencillo para no estudiar mucho:<br>• <b>1...c5</b> (Siciliana): 2.c3 y luego d4.<br>• <b>1...e6</b> (Francesa) y <b>1...c6</b> (Caro-Kann): 2.d4 d5 3.e5, ganas espacio.<br>• Cualquier otra: centro con d4, desarrollo y enroque." },
    { k: "rep", side: "w", moves: ["e2e4", "c7c5", "c2c3", "g8f6", "e4e5", "f6d5", "d2d4", "c5d4", "g1f3"], txt: "Practica contra la Siciliana." },
    { k: "rep", side: "w", moves: ["e2e4", "e7e6", "d2d4", "d7d5", "e4e5", "c7c5", "c2c3", "b8c6", "g1f3"], txt: "Y contra la Francesa." }
  ]},
  { id: "negras-e4", t: "Con negras contra 1.e4", steps: [
    { k: "txt", txt: "Con negras contestas a 1.e4 con <b>1...e5</b> y sacas piezas igual que las blancas. Hay una trampa que tienes que saber parar: el mate del pastor." },
    { k: "pz", fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3", sol: ["g7g6"], alts: { 0: ["d8e7", "d8f6"] }, txt: "Las blancas amenazan Dxf7 mate. ¿Cómo lo paras?", ok: "...g6 (o ...De7) para el mate. Después ...Cf6 ataca la dama y ganas tiempo. Nunca ...Cf6?? ahora: Dxf7 es mate." },
    { k: "line", moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4", "g8f6", "e1g1", "f8e7", "f1e1", "b7b5", "a4b3", "d7d6", "c2c3", "e8g8"],
      notes: ["", "", "", "", "La Española, la apertura favorita de los grandes maestros.", "Preguntas al alfil.", "Se retira manteniendo la presión.", "Desarrollas y atacas e4.", "", "Desarrollo sólido: el alfil defiende y prepara el enroque.", "", "Echas el alfil de la diagonal.", "", "Refuerzas e5.", "", "Rey a salvo. Posición sana para las negras."] },
    { k: "rep", side: "b", moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d3", "d7d6", "e1g1", "e8g8"], txt: "Practica tus jugadas contra la Italiana." },
    { k: "rep", side: "b", moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4", "g8f6", "e1g1", "f8e7"], txt: "Y contra la Española." }
  ]},
  { id: "negras-d4", t: "Con negras contra 1.d4", steps: [
    { k: "txt", txt: "Contra <b>1.d4</b> juega <b>1...d5</b> y, si viene 2.c4 (Gambito de dama), <b>2...e6</b>: el Gambito de dama rehusado. Sólido como una roca: no regalas nada y desarrollas con calma." },
    { k: "line", moves: ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "f8e7", "e2e3", "e8g8", "g1f3", "b8d7"],
      notes: ["", "Plantas un peón en el centro.", "Las blancas ofrecen un peón.", "No lo coges: defiendes d5 y abres el alfil.", "", "", "Clavan tu caballo.", "Lo desclavas.", "", "Rey a salvo.", "", "El caballo va a d7 para apoyar ...c5 o ...e5 más tarde."] },
    { k: "rep", side: "b", moves: ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "f8e7", "e2e3", "e8g8", "g1f3", "b8d7"], txt: "Practícala." },
    { k: "rep", side: "b", moves: ["d2d4", "d7d5", "c1f4", "g8f6", "e2e3", "e7e6", "g1f3", "c7c5", "c2c3", "b8c6"], txt: "Si juegan el Sistema Londres (2.Af4): ...Cf6, ...e6 y ...c5." }
  ]},
  { id: "trampas", t: "Trampas de apertura", steps: [
    { k: "line", moves: ["e2e4", "e7e5", "g1f3", "d7d6", "f1c4", "c8g4", "b1c3", "g7g6", "f3e5", "g4d1", "c4f7", "e8e7", "c3d5"],
      notes: ["", "", "", "", "", "Clavan tu caballo contra la dama.", "", "Las negras pierden tiempo.", "¡Sacrificio de dama!", "Las negras se la comen...", "Jaque.", "Obligado.", "¡Mate de Legal! Tres piezas menores contra una dama."] },
    { k: "pz", fen: "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6", sol: ["c4f7", "e8e7", "c3d5"], mate: true, txt: "Te han comido la dama. Mate en dos.", ok: "Axf7+ Re7 Cd5#." },
    { k: "pool", th: "apertura", n: 2, hi: 1400, txt: "Dos castigos a errores en la apertura." }
  ]}
]},
{ id: "u4", t: "Táctica", d: "Horquillas, clavadas, enfiladas, descubiertas y sacrificios. Aquí se ganan las partidas.", lessons: [
  { id: "horquilla", t: "Ataque doble y horquilla", steps: [
    { k: "txt", fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1", arrows: [["e4", "d6", "g"], ["d6", "e8", "r"], ["d6", "b5", "r"]], txt: "Una <b>horquilla</b> es atacar dos cosas a la vez. El rival solo puede salvar una. El caballo es el rey de las horquillas porque salta y nadie lo ve venir." },
    { k: "pz", fen: "4k3/8/8/1q6/4N3/8/8/4K3 w - - 0 1", sol: ["e4d6"], txt: "Gana la dama.", ok: "Cd6+ y después Cxb5." },
    { k: "pz", fen: "r3k3/ppp5/8/1N6/8/8/5PPP/6K1 w - - 0 1", sol: ["b5c7"], txt: "Busca la horquilla.", ok: "Cxc7+ ataca al rey y a la torre de a8." },
    { k: "pool", th: "horquilla", n: 4, txt: "Horquillas de partidas reales (de caballo, de dama, de peón…)." }
  ]},
  { id: "clavada", t: "La clavada", steps: [
    { k: "txt", fen: "6k1/6pp/8/3r4/2B5/8/5PPP/6K1 b - - 0 1", arrows: [["c4", "g8", "r"]], txt: "Una pieza está <b>clavada</b> cuando no puede moverse porque dejaría al descubierto algo más valioso detrás. Si detrás está el rey, ni siquiera es legal moverla. Las piezas clavadas se atacan." },
    { k: "pz", fen: "6k1/6pp/8/3r4/8/8/4BPPP/6K1 w - - 0 1", sol: ["e2c4"], txt: "La torre de d5 y el rey de g8 están en la misma diagonal. Aprovéchalo.", ok: "Ac4: la torre está clavada y no puede apartarse. Gana una torre entera." },
    { k: "pz", fen: "6k1/6pp/8/3q4/8/1P6/4BPPP/6K1 w - - 0 1", sol: ["e2c4"], txt: "Clava la dama contra el rey.", ok: "Ac4: la dama no puede apartarse. Si la cambia por el alfil, pierde 6 puntos." },
    { k: "pool", th: "clavada", n: 3, txt: "Más clavadas." }
  ]},
  { id: "enfilada", t: "La enfilada", steps: [
    { k: "txt", fen: "8/8/8/3k3q/8/8/8/R5K1 w - - 0 1", arrows: [["a1", "a5", "g"], ["a5", "h5", "r"]], txt: "La <b>enfilada</b> es una clavada al revés: atacas la pieza valiosa (a menudo con jaque), se aparta y te comes la de detrás." },
    { k: "pz", fen: "8/8/8/3k3q/8/8/8/R5K1 w - - 0 1", sol: ["a1a5"], txt: "Gana la dama.", ok: "Ta5+ y cuando el rey se aparte, Txh5." },
    { k: "pool", th: "enfilada", n: 3, txt: "Practica." }
  ]},
  { id: "descubierta", t: "Ataque a la descubierta", steps: [
    { k: "txt", fen: "3q4/5pkp/6p1/8/3N4/8/5PPP/3R2K1 w - - 0 1", arrows: [["d1", "d8", "r"]], txt: "Si una pieza tuya tapa la línea de otra, al moverla <b>descubres</b> un ataque. Si además la pieza que mueves ataca algo, son dos amenazas a la vez. Y si da jaque, el rival no tiene tiempo de nada." },
    { k: "pz", fen: "3q4/5pkp/6p1/8/3N4/8/5PPP/3R2K1 w - - 0 1", sol: ["d4f5"], alts: { 0: ["d4e6"] }, txt: "Gana la dama.", ok: "El caballo da jaque y la torre ataca la dama: después Txd8." },
    { k: "pool", th: "descubierta", n: 3, txt: "Más descubiertas." }
  ]},
  { id: "defensor", t: "Eliminar al defensor", steps: [
    { k: "txt", txt: "Si una pieza rival solo está defendida por otra, <b>come o desvía al defensor</b> y la primera se queda colgada. Pregúntate siempre: ¿quién defiende esto? ¿puedo quitarlo de en medio?" },
    { k: "pz", fen: "4k3/1p6/2n5/1B6/3r4/8/8/3RK3 w - - 0 1", sol: ["b5c6", "b7c6", "d1d4"], txt: "La torre de d4 solo la defiende el caballo.", ok: "Axc6+ elimina al defensor y luego Txd4." },
    { k: "pool", th: "sacrificio", n: 3, hi: 1600, txt: "A veces hay que entregar material para quitar un defensor." }
  ]},
  { id: "metodo", t: "El método para no fallar", steps: [
    { k: "txt", txt: "Los buenos jugadores no 'ven' más: <b>miran con orden</b>. En cada jugada, en este orden:<br>1. <b>Jaques</b>: todos los tuyos, aunque parezcan malos.<br>2. <b>Capturas</b>: todas.<br>3. <b>Amenazas</b>: qué puedes atacar.<br>Y antes de tocar la pieza, la <b>prueba del error</b>: ¿qué me puede hacer el rival después de mi jugada?" },
    { k: "quiz", q: "Has encontrado una jugada buena. ¿Qué haces antes de jugarla?", opts: ["La juego rápido para que no se dé cuenta", "Miro qué jaques, capturas y amenazas tiene el rival después", "Nada, si es buena es buena"], a: 1, exp: "La mayoría de las partidas se pierden por no hacer esta comprobación de 5 segundos." },
    { k: "pool", n: 6, lo: 900, hi: 1500, txt: "Seis problemas mezclados: aplica el método en cada uno." }
  ]}
]},
{ id: "u5", t: "Finales", d: "Rey activo, oposición, peones pasados y finales de torre.", lessons: [
  { id: "oposicion", t: "Rey y peón: la oposición", steps: [
    { k: "txt", fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", txt: "En el final <b>el rey es una pieza de ataque</b>: sácalo. Con rey y peón contra rey, la clave es la <b>oposición</b>: los reyes enfrente con una casilla en medio; quien NO tiene que mover gana la pelea. Si tu rey llega a la sexta fila delante de su peón, gana siempre." },
    { k: "play", fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", goal: "promote", max: 12, txt: "Corona el peón. La máquina defiende con todo." },
    { k: "quiz", fen: "8/8/8/4k3/8/8/4P3/4K3 b - - 0 1", q: "Juegan negras. Con buena defensa, ¿qué resultado es?", opts: ["Ganan blancas", "Tablas"], a: 1, exp: "El rey negro está delante del peón y llega a tiempo: con buena defensa son tablas." }
  ]},
  { id: "cuadrado", t: "La regla del cuadrado", steps: [
    { k: "txt", fen: "8/8/8/P7/8/8/5k2/7K b - - 0 1", marks: { a5: "g", a8: "g", d8: "g", d5: "g" }, txt: "¿Atrapa el rey al peón? Dibuja un cuadrado desde el peón hasta la casilla de coronación. Si el rey rival entra en el cuadrado (con su turno), lo alcanza. Si no, el peón corona solo." },
    { k: "quiz", fen: "8/8/8/P7/8/8/5k2/7K b - - 0 1", q: "Juegan negras. ¿Llega el rey a parar el peón?", opts: ["Sí", "No"], a: 1, exp: "El rey de f2 no puede entrar en el cuadrado a5-d8 en una jugada." },
    { k: "quiz", fen: "8/8/8/P7/4k3/8/8/7K b - - 0 1", q: "¿Y ahora, con el rey en e4?", opts: ["Sí", "No"], a: 0, exp: "Rd5 entra en el cuadrado y lo alcanza." },
    { k: "pool", th: "coronacion", n: 3, txt: "Coronaciones de partidas reales." }
  ]},
  { id: "torres", t: "Finales de torre", steps: [
    { k: "txt", fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1", txt: "Los finales más frecuentes son de torres. Dos posiciones clave:<br>• <b>Lucena</b> (ganas): tu rey está delante de tu peón en la séptima. Truco: <b>hacer un puente</b> con la torre en la cuarta fila para tapar los jaques.<br>• <b>Philidor</b> (empatas): si defiendes, deja tu torre en tu tercera fila hasta que avance el peón, y entonces da jaques desde atrás." },
    { k: "play", fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1", goal: "promote", max: 20, txt: "Gana la Lucena. Pista: Td1+, luego Td4 y saca el rey." },
    { k: "txt", txt: "Reglas de oro de los finales de torre: <b>torre activa</b> aunque cueste un peón, las torres van <b>detrás de los peones pasados</b>, y el rey adelante." }
  ]}
]},
{ id: "u6", t: "Estrategia", d: "Qué hacer cuando no hay táctica: planes, piezas y peones.", lessons: [
  { id: "piezas", t: "Piezas activas", steps: [
    { k: "txt", fen: "r4rk1/pp3ppp/2n5/3N4/8/8/PP3PPP/2R2RK1 w - - 0 1", txt: "Si no hay táctica, <b>mejora tu peor pieza</b>. Pautas:<br>• Torres en <b>columnas abiertas</b> y, si puedes, en la <b>séptima fila</b>.<br>• Caballos en el centro, en casillas donde ningún peón los pueda echar (<b>puestos avanzados</b>).<br>• Alfiles en diagonales largas y libres." },
    { k: "quiz", fen: "r4rk1/pp3ppp/2n5/3N4/8/8/PP3PPP/2R2RK1 w - - 0 1", q: "¿Cuál es la mejor jugada de plan para las blancas?", opts: ["Tc7: torre a la séptima", "a3: peón de la banda", "Rh1: rey a la esquina"], a: 0, exp: "La torre en séptima ataca los peones y encierra al rey." },
    { k: "txt", txt: "El caballo de d5 es fortísimo: ningún peón negro puede echarlo. Eso es un puesto avanzado. Busca casillas así para tus caballos." }
  ]},
  { id: "peones", t: "Estructura de peones", steps: [
    { k: "txt", txt: "Los peones no vuelven atrás: cada avance es para siempre. Debilidades típicas:<br>• <b>Aislado</b>: sin peones vecinos, hay que defenderlo con piezas.<br>• <b>Doblado</b>: dos en la misma columna, se defienden mal.<br>• <b>Retrasado</b>: se ha quedado atrás y no puede avanzar.<br>Y la fuerza: el <b>peón pasado</b>, sin peones rivales delante ni al lado. Los peones pasados <b>hay que empujarlos</b>." },
    { k: "quiz", fen: "6k1/5ppp/8/1P6/8/8/5PPP/6K1 w - - 0 1", q: "¿Qué tiene de especial el peón de b5?", opts: ["Es un peón pasado: nadie le impide coronar", "Está aislado y es débil", "Nada"], a: 0, exp: "En un final, un peón pasado vale casi como una pieza." },
    { k: "quiz", q: "Tienes más peones en el flanco de dama que tu rival. ¿Qué haces?", opts: ["Avanzarlos para crear un peón pasado", "Dejarlos quietos", "Cambiarlos por piezas"], a: 0, exp: "La mayoría de peones en un flanco sirve para fabricar un peón pasado." }
  ]},
  { id: "ataque", t: "Atacar al rey", steps: [
    { k: "txt", txt: "Para atacar al rey necesitas <b>más piezas cerca de él que las que lo defienden</b>. Señales de que es momento: el rey rival tiene pocos defensores, sus peones están avanzados o el caballo de f6 se ha ido. Con enroques opuestos, avanza los peones contra su rey sin miedo." },
    { k: "pool", th: "mate", n: 4, lo: 1300, hi: 2000, txt: "Ataques de partidas reales que terminan en mate." }
  ]}
]},
{ id: "u7", t: "Hacia el nivel de campeón", d: "Cómo entrenar cada día y el examen final.", lessons: [
  { id: "entrenar", t: "Tu plan de entrenamiento", steps: [
    { k: "txt", txt: "Para ganar a un jugador fuerte no basta con leer: hay que <b>jugar, revisar y repetir</b>. Plan diario (30–40 minutos):<br>1. <b>10 problemas de táctica</b> en Entrenamiento.<br>2. <b>Una partida</b> contra la máquina con el entrenador activado, en el nivel de la escalera que te toque.<br>3. <b>Revisa la partida</b>: mira tus errores y la jugada buena.<br>Una vez a la semana, juega con un amigo online y revisa también esa partida." },
    { k: "txt", txt: "<b>La escalera</b>: la máquina tiene 10 niveles. Cuando ganes dos partidas a un nivel, pasa al siguiente. El nivel 8 ya es un jugador de club fuerte; el 10 juega como un maestro. Si ganas al 9 con negras y con blancas, tu hermano lo va a pasar mal." },
    { k: "quiz", q: "¿Qué es lo que más mejora tu nivel?", opts: ["Memorizar muchas aperturas", "Táctica diaria y revisar tus propias partidas", "Jugar muchas partidas rápidas sin pensar"], a: 1, exp: "Hasta nivel de club, el 80% de las partidas se deciden por táctica." }
  ]},
  { id: "examen", t: "Examen final", steps: [
    { k: "txt", txt: "Ocho problemas mezclados de nivel de club. Si resuelves seis o más a la primera, has completado la escuela." },
    { k: "pool", n: 8, lo: 1300, hi: 1900, exam: true, txt: "Examen." }
  ]}
]}
];
