/* Casos escritos a mano para "Caso Abierto".
   Cada caso: 4 sospechosos (coartada + qué sabe), 6 lugares con una pista,
   2 informes iniciales (en online, uno para cada detective), 4 motivos y 4 métodos.
   sol.motivo y sol.metodo son índices de esas listas (el juego las baraja al mostrarlas). */
window.DETECTIVE_CASOS = [
  {
    id: "collar",
    titulo: "El collar de la condesa",
    sub: "Robo en una gala benéfica",
    intro: "La condesa de Altamira celebra su gala anual en el palacete familiar. A las 23:00 empiezan los fuegos artificiales y todo el mundo sale a mirar. A las 23:15 su secretaria descubre la caja fuerte del despacho abierta y vacía: el collar de esmeraldas de la familia ha desaparecido.",
    victima: "La condesa de Altamira (el collar de esmeraldas)",
    informes: [
      "Informe policial: la condesa vio los fuegos desde el balcón de su dormitorio, sola, porque está resfriada. Los fuegos duraron de 23:00 a 23:10.",
      "Informe de la escena: la caja fuerte no tiene ni un rasguño. Se abrió marcando la combinación correcta de seis cifras."
    ],
    sospechosos: [
      { id: "s1", nombre: "Álvaro Ruiz", rol: "Sobrino de la condesa", desc: "Encantador, trajeado y siempre con el móvil vibrando.",
        coartada: "\"Vi los fuegos en la terraza, al lado de mi tía. No me separé de ella ni un segundo.\"",
        sabe: "\"La única que sabe la combinación es Marta, la secretaria. Yo con los números soy un desastre.\"" },
      { id: "s2", nombre: "Marta Gil", rol: "Secretaria personal", desc: "Lleva quince años organizando la vida de la condesa.",
        coartada: "\"Estaba en la cocina peleándome con el catering: la tarta había llegado partida.\"",
        sabe: "\"La condesa apunta la combinación en un pósit dentro de su agenda, en el despacho. Lo sabe media casa.\"" },
      { id: "s3", nombre: "Héctor Vidal", rol: "Joyero tasador", desc: "Vino por la tarde a tasar el collar para el seguro.",
        coartada: "\"En la terraza, grabando los fuegos con el móvil. Tengo el vídeo entero, se me oye comentando.\"",
        sabe: "\"Esta tarde, mientras tasaba el collar, vi al sobrino hojeando la agenda de la condesa en el despacho.\"" },
      { id: "s4", nombre: "Lucía Pons", rol: "Camarera del catering", desc: "Primer trabajo de la temporada. Va y viene con bandejas.",
        coartada: "\"En la cocina, aguantando la bronca de la secretaria por la tarta.\"",
        sabe: "\"A las 23:05 subí una infusión al dormitorio de la condesa. Estaba sola en el balcón, nadie con ella.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Despacho", pista: "La agenda de la condesa está abierta sobre el escritorio, justo en la página donde estaba el pósit. El pósit ya no está." },
      { id: "l2", nombre: "Terraza", pista: "El vídeo de Héctor recorre la terraza entera durante los fuegos. Están casi todos los invitados, pero Álvaro no aparece en ningún momento." },
      { id: "l3", nombre: "Cocina", pista: "El jefe de cocina confirma que Marta y la camarera estuvieron discutiendo aquí desde las 22:55 hasta las 23:15." },
      { id: "l4", nombre: "Jardín", pista: "La ventana del despacho que da al jardín está cerrada por dentro y el barro de debajo no tiene ni una pisada." },
      { id: "l5", nombre: "Cuarto de Álvaro", pista: "Una carta del banco: \"Último aviso: deuda pendiente de 40.000 €\". En la papelera, un pósit arrugado con seis cifras." },
      { id: "l6", nombre: "Caja fuerte", pista: "En el fondo de la caja queda una esmeralda pequeña, suelta: alguien sacó el collar con prisas." }
    ],
    motivos: ["Pagar una deuda con el banco", "Vengarse de la condesa por un despido", "Cobrar el dinero del seguro", "Venderlo a un coleccionista que se lo encargó"],
    metodos: ["Abrió la caja con la combinación del pósit", "Forzó la caja con una palanca", "Lo cambió por una réplica al tasarlo", "Entró desde el jardín por la ventana"],
    sol: { culpable: "s1", motivo: 0, metodo: 0 },
    explicacion: "Álvaro dijo que vio los fuegos junto a su tía, pero la condesa estaba sola en su dormitorio (lo dicen el informe y la camarera) y el vídeo de la terraza demuestra que él no estaba allí. Héctor le vio hojear la agenda por la tarde, y en su cuarto estaban el pósit con la combinación y la carta del banco: tenía una deuda de 40.000 €. Marta y Lucía se cubren mutuamente y el cocinero lo confirma; Héctor sale en su propio vídeo. Nadie entró por el jardín."
  },
  {
    id: "teatro",
    titulo: "Última función",
    sub: "Envenenamiento en el teatro",
    intro: "Noche de estreno en el Teatro Olimpia. En mitad del segundo acto, el protagonista, Bruno Salas, bebe de su copa de atrezo, se tambalea y cae al suelo. El público aplaude pensando que es parte de la obra. No lo es: Bruno ha muerto envenenado.",
    victima: "Bruno Salas, actor protagonista",
    informes: [
      "Informe forense: el veneno es digitalina, extraída de la planta dedalera. Actúa en pocos minutos y estaba en la copa de atrezo. Bruno bebió a las 21:50.",
      "Informe policial: la utilera llenó la copa con zumo a las 20:50 y Bruno ya bebió de ella en el primer acto, a las 21:10, sin problema. El veneno se echó en el descanso, de 21:30 a 21:45."
    ],
    sospechosos: [
      { id: "s1", nombre: "Inés Molina", rol: "Actriz suplente", desc: "Se sabe el papel de Bruno de memoria. Lleva años esperando su oportunidad.",
        coartada: "\"Todo el descanso estuve sola en mi camerino, repasando texto.\"",
        sabe: "\"Ayer Ramón y Bruno discutieron a gritos. Bruno quería irse a otra compañía.\"" },
      { id: "s2", nombre: "Ramón Ortega", rol: "Director", desc: "Se juega la temporada con este estreno.",
        coartada: "\"En el vestíbulo, con el crítico del periódico, todo el descanso.\"",
        sabe: "\"Si Bruno no podía actuar, salía Inés. Ese papel lo quería más que nada.\"" },
      { id: "s3", nombre: "Clara Benet", rol: "Utilera", desc: "Prepara cada objeto que sale a escena, incluida la copa.",
        coartada: "\"En el descanso crucé al bar de enfrente a por hielo. El camarero me conoce.\"",
        sabe: "\"La mesa de atrezo está entre bastidores. Solo se llega desde el escenario o por el pasillo de los camerinos.\"" },
      { id: "s4", nombre: "Dani Soler", rol: "Técnico de luces", desc: "Bruno le debía dinero desde hacía meses.",
        coartada: "\"Arriba en la cabina, reprogramando las luces del segundo acto.\"",
        sabe: "\"Desde la cabina vi a alguien con una bata de flores cruzar entre bastidores en el descanso. No le vi la cara.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Mesa de atrezo", pista: "Junto a la copa hay un pétalo morado y seco con forma de campanita: una flor de dedalera." },
      { id: "l2", nombre: "Camerino de Inés", pista: "Una bata de flores colgada detrás de la puerta. En el cajón, un frasco de gotas sin etiqueta y un libro de botánica marcado en la página de la dedalera." },
      { id: "l3", nombre: "Vestíbulo", pista: "El crítico confirma que estuvo con Ramón todo el descanso. Grabó la entrevista en el móvil: dura de 21:31 a 21:46." },
      { id: "l4", nombre: "Bar de enfrente", pista: "El camarero recuerda a Clara: pidió hielo, se tomó un café y volvió corriendo al acabar el descanso." },
      { id: "l5", nombre: "Cabina de luces", pista: "La única escalera de la cabina baja al patio de butacas, lleno de público en el descanso. La mesa de luces registra cambios cada minuto de 21:32 a 21:44." },
      { id: "l6", nombre: "Despacho del director", pista: "Un contrato de Bruno con otra compañía, sin firmar, y una nota de Ramón: \"Si te vas a mitad de temporada, te demando\"." }
    ],
    motivos: ["Quedarse con el papel protagonista", "Evitar que Bruno se fuera a otra compañía", "Cobrar una deuda", "Celos por una historia de amor"],
    metodos: ["Echó el veneno en la copa durante el descanso", "Envenenó la copa al llenarla antes de la función", "Le dio un caramelo envenenado en el primer acto", "Cambió la copa en mitad del segundo acto"],
    sol: { culpable: "s1", motivo: 0, metodo: 0 },
    explicacion: "Bruno bebió sin problema en el primer acto, así que el veneno se echó en el descanso. Ramón estaba grabando una entrevista, Clara en el bar y Dani no podía bajar de la cabina sin cruzar el patio de butacas lleno de gente (y la mesa de luces le delata trabajando cada minuto). Inés no tiene coartada, la persona de la bata de flores que vio Dani cruzando entre bastidores era ella, y en su camerino estaban la bata, el frasco y el libro sobre la dedalera. Con Bruno fuera, el papel era suyo."
  },
  {
    id: "receta",
    titulo: "La receta perdida",
    sub: "Robo en una pastelería",
    intro: "Mañana es la final del concurso de pastelería de la tele y Sara Ferrer piensa ganarla con la tarta secreta de su abuela. Pero a las 7:00, al abrir La Dulce Vida, encuentra la ventana del despacho rota y el cajón del escritorio vacío: el cuaderno de recetas de la abuela ha desaparecido.",
    victima: "Sara Ferrer, pastelera (el cuaderno de recetas)",
    informes: [
      "Informe de la escena: la puerta del despacho estaba cerrada con llave y la ventana, rota. El cuaderno estaba en el cajón del escritorio, que también se cierra con llave.",
      "Informe policial: solo hay dos juegos de llaves del despacho, el de Sara y el de su hermana Julia, que es socia. Sara pasó la noche en casa de sus padres, en otra ciudad (confirmado)."
    ],
    sospechosos: [
      { id: "s1", nombre: "Pablo Serra", rol: "Oficial de pastelería", desc: "El mejor de la plantilla. Sueña con abrir su propio obrador.",
        coartada: "\"Cerré la tienda a las 21:00 y me fui a casa. Mi novia te lo confirma.\"",
        sabe: "\"Julia lleva semanas rara, saliendo a la calle a hablar por teléfono para que no la oigamos.\"" },
      { id: "s2", nombre: "Nerea Castro", rol: "Rival en el concurso", desc: "La otra finalista. Muy competitiva.",
        coartada: "\"Estaba en el hotel del concurso. Hay cámaras en los pasillos.\"",
        sabe: "\"Un señor de Dulcinea, la cadena de pastelerías, me ofreció dinero por recetas de otros concursantes. Le dije que no.\"" },
      { id: "s3", nombre: "Tomás Rey", rol: "Repartidor", desc: "Trae la harina y los huevos cada noche.",
        coartada: "\"Hice la última entrega a las 22:30 por la puerta de atrás y me fui.\"",
        sabe: "\"A las 22:30 había luz en el despacho y un coche rojo aparcado delante.\"" },
      { id: "s4", nombre: "Julia Ferrer", rol: "Hermana de Sara y socia", desc: "Lleva las cuentas del negocio, que no van nada bien.",
        coartada: "\"Toda la noche en casa, viendo una serie.\"",
        sabe: "\"Está claro que alguien rompió la ventana para entrar. Ese repartidor siempre está fisgando.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Ventana del despacho", pista: "Los cristales rotos están en la acera, fuera. La ventana se rompió desde dentro." },
      { id: "l2", nombre: "Despacho", pista: "La cerradura está intacta. El cajón tampoco está forzado: se abrió con su llavecita, que va colgada del mismo llavero que la llave del despacho." },
      { id: "l3", nombre: "Calle", pista: "La cámara de la farmacia de enfrente graba un coche rojo que aparca a las 22:20 y se va a las 22:40." },
      { id: "l4", nombre: "Casa de Julia", pista: "Su coche es rojo. En la entrada hay una tarjeta de visita de Dulcinea, la cadena de pastelerías, con una cifra escrita a mano: 30.000 €." },
      { id: "l5", nombre: "Hotel del concurso", pista: "Las cámaras muestran a Nerea entrando en su habitación a las 21:30. No vuelve a salir hasta las 8:00." },
      { id: "l6", nombre: "Obrador", pista: "La hoja de tareas está firmada por Pablo a las 20:58. Todo recogido y limpio, como siempre." }
    ],
    motivos: ["Vender las recetas a una cadena de pastelerías", "Ganar el concurso de la tele", "Montar su propia pastelería", "Vengarse por un despido"],
    metodos: ["Entró con su llave y rompió la ventana desde dentro para despistar", "Rompió la ventana desde la calle para entrar", "Se escondió dentro antes de que cerraran", "Le quitó las llaves a Sara"],
    sol: { culpable: "s4", motivo: 0, metodo: 0 },
    explicacion: "La ventana se rompió desde dentro, así que nadie entró por ella: fue un montaje. La puerta y el cajón se abrieron con llave, y solo Sara (en otra ciudad) y Julia tienen llaves. El coche rojo de la puerta a las 22:30 es el de Julia, que dijo estar en casa, y la tarjeta de Dulcinea con los 30.000 € explica las llamadas a escondidas. Nerea no salió del hotel, Pablo no tiene llave y Tomás solo vio lo que pasaba."
  },
  {
    id: "tren",
    titulo: "Muerte en el Expreso del Norte",
    sub: "Asesinato en un tren nocturno",
    intro: "El tren nocturno Madrid-Santander avanza entre montañas. A las 7:00 el revisor encuentra muerto en su compartimento al empresario Gerardo Llull. Todo está revuelto, como si hubieran querido robarle. En plena noche, el tren hizo una parada de quince minutos en la estación de Medina.",
    victima: "Gerardo Llull, empresario",
    informes: [
      "Informe forense: muerte entre las 0:30 y la 1:00 por un golpe en la cabeza con un objeto pesado de esquinas metálicas.",
      "Informe de la escena: el reloj de Llull está roto y parado a la 1:40. La cartera sigue en su chaqueta, con todo el dinero."
    ],
    sospechosos: [
      { id: "s1", nombre: "Elena Rius", rol: "Socia de Llull", desc: "Dirige con él la empresa. Fría y calculadora.",
        coartada: "\"De 0:00 a 1:15 estuve en el vagón restaurante jugando al mus con el revisor. A la 1:40 ya dormía.\"",
        sabe: "\"Gerardo me dijo anoche que en este tren iba a desenmascarar a alguien. No quiso decir a quién.\"" },
      { id: "s2", nombre: "Marcos Llull", rol: "Hijo de la víctima", desc: "Se llevaba fatal con su padre.",
        coartada: "\"Me acosté a las 0:20. En Medina bajé al andén a fumar, de 1:30 a 1:45.\"",
        sabe: "\"Papá iba a cambiar el testamento, pero yo me quedo igual con uno que con otro.\"" },
      { id: "s3", nombre: "Nicolás Ferrer", rol: "Revisor", desc: "Treinta años en los trenes nocturnos.",
        coartada: "\"Jugando al mus con la señora Rius hasta la 1:15. Luego, revisión de billetes en Medina.\"",
        sabe: "\"Hacia la 1:00 vi a la escritora salir del baño del fondo, lavándose las manos con mucha prisa.\"" },
      { id: "s4", nombre: "Valeria Costa", rol: "Escritora", desc: "Autora de una novela superventas. Viaja en el compartimento de al lado.",
        coartada: "\"A la 1:40 estaba en el andén de Medina, charlando con el hijo de Llull. Él me vio.\"",
        sabe: "\"Llull tenía muchos enemigos. Yo solo le conocía de vista.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Compartimento de Llull", pista: "En la papelera, el borrador de un artículo firmado por Llull: \"Valeria Costa copió su novela de un manuscrito de mi difunta esposa\"." },
      { id: "l2", nombre: "Vagón restaurante", pista: "El camarero recuerda la partida de mus: Elena y el revisor no se levantaron de la mesa desde las 0:00 hasta la 1:15." },
      { id: "l3", nombre: "Compartimento de Valeria", pista: "Su máquina de escribir portátil, pesada y con esquinas metálicas, tiene una mancha oscura limpiada a medias." },
      { id: "l4", nombre: "Andén de Medina", pista: "El maquinista vio a Marcos y a la escritora fumando juntos en el andén de 1:30 a 1:45." },
      { id: "l5", nombre: "Pasillo del coche-cama", pista: "La azafata de noche hizo su ronda a las 0:45: Marcos roncaba tanto que se oía desde el pasillo, y el compartimento de la escritora estaba vacío con la puerta abierta." },
      { id: "l6", nombre: "Compartimento de Marcos", pista: "Copias de los dos testamentos, el viejo y el nuevo sin firmar. En los dos, Marcos hereda exactamente lo mismo." }
    ],
    motivos: ["Evitar que revelara que su novela era un plagio", "Heredar su fortuna", "Quedarse con la empresa", "Robarle la cartera"],
    metodos: ["Le golpeó con la máquina de escribir y paró su reloj a la 1:40 para tener coartada", "Le envenenó durante la cena", "Subió al tren en la parada de Medina", "Le empujó contra la ventana al frenar el tren"],
    sol: { culpable: "s4", motivo: 0, metodo: 0 },
    explicacion: "El reloj parado a la 1:40 es una trampa: el forense sitúa la muerte entre las 0:30 y la 1:00. Valeria tiene coartada justo para la 1:40, pero no para la hora real: a las 0:45 su compartimento estaba vacío y a la 1:00 el revisor la vio lavándose las manos. Su máquina de escribir encaja con el arma y Llull iba a publicar que su novela era un plagio. Elena y el revisor jugaban al mus, Marcos roncaba en su litera y no ganaba nada con la muerte, y la cartera seguía ahí."
  },
  {
    id: "bodega",
    titulo: "Muerte en la bodega",
    sub: "Asesinato en plena vendimia",
    intro: "En plena vendimia, a las 10:00, encuentran a don Celestino Arrieta, dueño de Bodegas Arrieta, muerto en la sala de depósitos, donde fermenta el vino. Esa fermentación suelta un gas que, sin ventilación, puede matar. Alguien quería que pareciera un accidente.",
    victima: "Celestino Arrieta, bodeguero",
    informes: [
      "Informe forense: murió asfixiado por el gas de la fermentación entre las 7:00 y las 8:00. Solo tiene un golpe leve en la frente, de caerse.",
      "Informe de la escena: el extractor de la sala estaba apagado desde el cuadro eléctrico. La puerta se abre hacia fuera y tenía encajada una carretilla de barricas para que no se pudiera abrir."
    ],
    sospechosos: [
      { id: "s1", nombre: "Iñaki Arrieta", rol: "Hijo del bodeguero", desc: "Quiere vender la bodega a un fondo de inversión.",
        coartada: "\"De 6:30 a 8:30 estuve en el gimnasio del pueblo.\"",
        sabe: "\"Mi padre no habría vendido jamás. Eso lo sabíamos todos.\"" },
      { id: "s2", nombre: "Begoña Sáez", rol: "Enóloga", desc: "Veinte años haciendo los vinos de la casa.",
        coartada: "\"A esa hora estaba en la viña de arriba tomando muestras de uva. Sola.\"",
        sabe: "\"Celestino era un hombre difícil, pero yo le tenía cariño.\"" },
      { id: "s3", nombre: "Rubén Lago", rol: "Vecino", desc: "Lleva años en pleitos con Celestino por el agua de riego.",
        coartada: "\"Regando mi finca desde las 6:00. Pregunta a mi mujer.\"",
        sabe: "\"A las 7:20 vi el todoterreno de la enóloga aparcado junto a la puerta trasera de la bodega, no en la viña.\"" },
      { id: "s4", nombre: "Ayelén Ríos", rol: "Temporera", desc: "Primera vendimia en la casa.",
        coartada: "\"Desde las 7:00 en la nave de embotellado, con otras tres compañeras.\"",
        sabe: "\"La carretilla de barricas pesa muchísimo y tiene un truco con el freno. Aquí solo la sabe mover Begoña.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Cuadro eléctrico", pista: "El interruptor del extractor tiene restos de tierra roja de la viña de arriba. El cuadro está junto a la puerta trasera." },
      { id: "l2", nombre: "Gimnasio del pueblo", pista: "El torno de entrada registra a Iñaki a las 6:34 y su salida a las 8:41. Varias personas le vieron entrenar." },
      { id: "l3", nombre: "Viña de arriba", pista: "Las cajitas de muestras de Begoña llevan la hora apuntada: 6:45 y 8:15. Ninguna entre medias." },
      { id: "l4", nombre: "Nave de embotellado", pista: "Las tres compañeras de Ayelén confirman que no salió de la nave en toda la mañana." },
      { id: "l5", nombre: "Despacho de Celestino", pista: "Una carta firmada para un enólogo de Burdeos: \"Empezará usted el lunes, en sustitución de la señora Sáez\"." },
      { id: "l6", nombre: "Finca de Rubén", pista: "Huellas de botas de goma por toda la finca y la mujer de Rubén confirma que regó desde las 6:00. Además, el pleito del agua lo ganó él hace un mes." }
    ],
    motivos: ["Evitar que la sustituyeran después de veinte años", "Vender la bodega a un fondo", "Vengarse por el pleito del agua", "Cobrar la herencia"],
    metodos: ["Apagó el extractor y bloqueó la puerta con la carretilla", "Le golpeó en la cabeza", "Echó veneno en el vino de cata", "Abrió un depósito para inundar la sala"],
    sol: { culpable: "s2", motivo: 0, metodo: 0 },
    explicacion: "Celestino murió por el gas, no por el golpe: alguien apagó el extractor y le encerró con la carretilla. Iñaki estaba en el gimnasio y Ayelén con sus compañeras; Rubén regaba y ya había ganado el pleito. Begoña dice que estaba en la viña, pero sus muestras tienen un hueco de 6:45 a 8:15, Rubén vio su todoterreno en la bodega a las 7:20, el interruptor tiene tierra roja de su viña y es la única que sabe mover la carretilla. Celestino la iba a sustituir por un enólogo francés."
  },
  {
    id: "galeria",
    titulo: "El cuadro de la galería",
    sub: "Falsificación en una inauguración",
    intro: "Inauguración en la Galería Lumen. La joya de la noche es \"Marina al atardecer\", del pintor Elías Mora. A las 22:30, cuando ya se ha ido el público, la dueña se acerca a mirarlo y nota algo raro: la pintura aún huele. El cuadro de la pared es una copia.",
    victima: "Carmen Lago, dueña de la galería (el cuadro)",
    informes: [
      "Informe del seguro: el perito revisó el cuadro a las 19:00 y era el original. A las 22:30, el de la pared es una copia pintada hace muy pocos días.",
      "Informe de la escena: hubo un apagón de 21:10 a 21:14 y las cámaras estuvieron apagadas esos cuatro minutos. Los tornillos del marco son de seguridad y solo se quitan con una llave especial."
    ],
    sospechosos: [
      { id: "s1", nombre: "Óscar Bel", rol: "Pintor que expone", desc: "Joven promesa. Su primera exposición en la galería.",
        coartada: "\"Durante el apagón estaba en la sala 1, junto a mis cuadros, hablando con un periodista.\"",
        sabe: "\"Hace un mes, Teresa me pidió prestadas mis pinturas de secado rápido. No me dijo para qué.\"" },
      { id: "s2", nombre: "Teresa Nadal", rol: "Restauradora de la galería", desc: "Conoce cada cuadro de la casa centímetro a centímetro.",
        coartada: "\"Durante el apagón estaba en el almacén, buscando velas a tientas.\"",
        sabe: "\"La llave de los marcos la tiene el guarda, siempre colgada del cinturón.\"" },
      { id: "s3", nombre: "Iván Cruz", rol: "Guarda de seguridad", desc: "Era su primera inauguración en la galería.",
        coartada: "\"Bajé al sótano a cambiar el fusible. Tardé cuatro minutos.\"",
        sabe: "\"Hay dos llaves de los marcos: la mía, que no me quito nunca, y otra en el taller de restauración.\"" },
      { id: "s4", nombre: "Paula Esteve", rol: "Coleccionista", desc: "Quiso comprar el cuadro y la dueña le dijo que no.",
        coartada: "\"Estaba en la terraza fumando. Con el apagón no vi nada.\"",
        sabe: "\"Ofrecí 200.000 € por ese cuadro y no me lo vendieron. Yo no robo lo que puedo pagar.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Sala 2", pista: "Bajo el cuadro, en el suelo, una gota de pintura fresca del mismo azul que el mar del cuadro." },
      { id: "l2", nombre: "Cuadro eléctrico", pista: "El fusible no se fundió solo: alguien lo aflojó. En el suelo hay una linterna pequeña con las iniciales T.N. El periodista oyó al guarda maldecir aquí abajo durante todo el apagón." },
      { id: "l3", nombre: "Taller de restauración", pista: "El gancho de la llave de los marcos está vacío. En la papelera, varios bocetos a lápiz de \"Marina al atardecer\"." },
      { id: "l4", nombre: "Almacén", pista: "Las velas están en la primera estantería, junto a la puerta, a la vista. Imposible tardar en encontrarlas." },
      { id: "l5", nombre: "Terraza", pista: "El camarero de la terraza estuvo con Paula todo el apagón: ella le pidió fuego y estuvieron charlando." },
      { id: "l6", nombre: "Furgoneta de Teresa", pista: "Un tubo de cartón para llevar lienzos enrollados y un billete de avión a Ginebra para mañana. En la guantera, el teléfono de un comprador privado." }
    ],
    motivos: ["Vendérselo a un comprador privado en el extranjero", "Quedárselo para su colección", "Hacerse famoso con el escándalo", "Cobrar el seguro de la galería"],
    metodos: ["Provocó el apagón y cambió el original por una copia que había pintado", "Se lo llevó durante la limpieza de la mañana", "Pagó al guarda para que mirara a otro lado", "Lo cambió el perito del seguro a las 19:00"],
    sol: { culpable: "s2", motivo: 0, metodo: 0 },
    explicacion: "El cambio se hizo en los cuatro minutos de apagón, y el apagón fue provocado: el fusible estaba aflojado y al lado estaba la linterna de Teresa (T.N.). Ella dice que buscaba velas, pero estaban a la vista. Para soltar el marco hacía falta la llave especial: la del guarda no se movió de su cinturón (el periodista le oía en el sótano) y la del taller de Teresa ha desaparecido. Los bocetos, las pinturas de secado rápido que le pidió a Óscar y el billete a Ginebra con el comprador cierran el caso. Óscar estaba con el periodista y Paula con el camarero."
  }
];
