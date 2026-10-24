/* Casos escritos a mano para "Caso Abierto".
   Cada caso: 4 sospechosos (coartada + qué sabe), 6 lugares con una pista,
   2 informes iniciales (en online, uno para cada detective), 4 motivos y 4 métodos.
   sol.motivo y sol.metodo son índices de esas listas (el juego las baraja al mostrarlas).
   Para que no sean obvios: todos los sospechosos tienen motivo y algo raro, algún inocente
   miente por otra razón y ninguna pista sola señala al culpable; hay que cruzar varias. */
window.DETECTIVE_CASOS = [
  {
    id: "collar2",
    titulo: "El collar de la condesa",
    sub: "Robo en una gala benéfica",
    intro: "La condesa de Altamira celebra su gala anual en el palacete familiar. A las 23:00 empiezan los fuegos artificiales y casi todo el mundo sale a la terraza. A las 23:15 su secretaria da la voz de alarma: la caja fuerte del despacho está abierta y el collar de esmeraldas de la familia ha desaparecido.",
    victima: "La condesa de Altamira (el collar de esmeraldas)",
    informes: [
      "Informe policial: la condesa llevó el collar puesto hasta las 22:30. Su secretaria le dijo que el cierre estaba flojo y se ofreció a guardarlo en la caja fuerte del despacho. Ella vio los fuegos desde el balcón de su dormitorio, sola, porque está resfriada.",
      "Informe de la escena: la caja no está forzada. Su combinación es la fecha de boda de la condesa, que viene grabada en el marco del retrato del salón: cualquiera que se fije puede adivinarla."
    ],
    sospechosos: [
      { id: "s1", nombre: "Álvaro Ruiz", rol: "Sobrino de la condesa", desc: "Encantador y trajeado. Se le ve más por el casino que por casa.",
        coartada: "\"Vi los fuegos en la terraza, al lado de mi tía. No me separé de ella.\"",
        sabe: "\"Héctor lleva una copia del collar en el maletín. ¿Para qué quiere un joyero una copia exacta?\"" },
      { id: "s2", nombre: "Marta Gil", rol: "Secretaria personal", desc: "Lleva quince años organizando la vida de la condesa.",
        coartada: "\"A las 22:30 guardé el collar. Luego estuve en la cocina con el lío de la tarta hasta que fui a avisar a la condesa, y al pasar por el despacho vi la caja abierta.\"",
        sabe: "\"La camarera ya robó en otro catering, lo sé de buena tinta. Yo de ella no me fiaría.\"" },
      { id: "s3", nombre: "Héctor Vidal", rol: "Joyero", desc: "Vino por la tarde a revisar el collar para el seguro. Su joyería no pasa por su mejor momento.",
        coartada: "\"Grabé los fuegos con el móvil y seguí grabando la fiesta un buen rato. Se me oye comentando todo.\"",
        sabe: "\"Por la tarde revisé el cierre del collar y estaba perfecto. Me extrañó que luego dijeran que le hacía daño a la condesa.\"" },
      { id: "s4", nombre: "Lucía Pons", rol: "Camarera del catering", desc: "Nueva en la empresa. No para de ir y venir con bandejas.",
        coartada: "\"Sirviendo cava en la terraza durante los fuegos y después.\"",
        sabe: "\"A las 23:05 subí una infusión a la condesa y estaba sola en su balcón. El sobrino no estaba con ella, que no os engañe.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Despacho", pista: "No hay nada revuelto y la ventana está cerrada por dentro. El estuche del collar sigue dentro de la caja, vacío y bien cerrado." },
      { id: "l2", nombre: "Caja fuerte", pista: "La caja guarda un registro de aperturas con la combinación correcta: una a las 22:31 y otra a las 23:13. Ninguna más en toda la noche." },
      { id: "l3", nombre: "Terraza", pista: "El vídeo de Héctor dura de 22:58 a 23:20, con su voz de fondo todo el rato. Salen Lucía sirviendo cava sin parar y Álvaro, muy lejos de su tía, coqueteando con una invitada." },
      { id: "l4", nombre: "Cocina", pista: "El jefe de cocina cuenta que la bronca de la tarta duró de 22:50 a 23:12. Entonces Marta se marchó a toda prisa, diciendo que iba a avisar a la condesa." },
      { id: "l5", nombre: "Maletín de Héctor", pista: "Una réplica del collar en cristal, con una factura a nombre de la propia condesa: la encargó ella para lucirla en los viajes." },
      { id: "l6", nombre: "Taquillas del servicio", pista: "En la de Lucía, una carta de despido de otro catering por \"faltas de material\". En la de Marta, el presupuesto de una clínica privada: tratamiento para su madre, 38.000 €." }
    ],
    motivos: ["Pagar un tratamiento médico muy caro", "Pagar sus deudas de juego", "Salvar su joyería de la quiebra", "Vengarse de los ricos tras su despido"],
    metodos: ["Abrió la caja a las 23:13, justo antes de dar la alarma", "Lo robó durante los fuegos artificiales", "Lo cambió por la réplica de cristal", "Entró por la ventana del despacho"],
    sol: { culpable: "s2", motivo: 0, metodo: 0 },
    explicacion: "Los fuegos son una distracción: el registro de la caja demuestra que nadie la abrió entre las 23:00 y las 23:10. Solo hubo dos aperturas: las 22:31 (Marta guardando el collar) y las 23:13. A esa hora Lucía y Álvaro salían en el vídeo de Héctor, y Héctor lo estaba narrando. Marta había salido de la cocina a las 23:12 y fue ella quien 'descubrió' la caja abierta a las 23:15. Además, el cierre del collar estaba perfecto: la excusa para quitárselo a la condesa fue suya. El presupuesto de la clínica explica por qué. Álvaro mintió, sí, pero solo para tapar su ligue, y la réplica es de la propia condesa."
  },
  {
    id: "teatro2",
    titulo: "Última función",
    sub: "Envenenamiento en el teatro",
    intro: "Noche de estreno en el Teatro Olimpia. En mitad del segundo acto, el protagonista, Bruno Salas, bebe de su copa de atrezo, se tambalea y cae al suelo. El público aplaude pensando que es parte de la obra. No lo es: Bruno ha muerto envenenado.",
    victima: "Bruno Salas, actor protagonista",
    informes: [
      "Informe forense: el veneno es digitalina, que se saca de la planta dedalera o de algunas medicinas para el corazón. Actúa en pocos minutos y estaba en la copa de atrezo. Bruno bebió a las 21:50.",
      "Informe policial: la copa se llenó con zumo a las 20:50 y Bruno bebió de ella en el primer acto, a las 21:10, sin problema. El descanso fue de 21:30 a 21:45."
    ],
    sospechosos: [
      { id: "s1", nombre: "Inés Molina", rol: "Actriz suplente", desc: "Se sabe el papel de Bruno de memoria. Desde esta noche, el papel es suyo.",
        coartada: "\"Todo el descanso estuve sola en mi camerino, repasando texto.\"",
        sabe: "\"Bruno dejó a Clara hace un mes, por un mensaje, y ya sale con otra de la compañía.\"" },
      { id: "s2", nombre: "Ramón Ortega", rol: "Director", desc: "Bruno había firmado con otra compañía y le dejaba tirado a mitad de temporada.",
        coartada: "\"En el vestíbulo, con el crítico del periódico, todo el descanso.\"",
        sabe: "\"Aquí la utilera rellena la copa en cada descanso. Con los focos, el zumo se calienta.\"" },
      { id: "s3", nombre: "Clara Benet", rol: "Utilera", desc: "Prepara cada objeto que sale a escena, incluida la copa.",
        coartada: "\"En el descanso crucé al bar de enfrente a por hielo y volví cuando ya empezaba el segundo acto. Ni me acerqué a la copa.\"",
        sabe: "\"Inés tiene un libro de plantas venenosas en el camerino. Y mira tú por dónde, ahora es la protagonista.\"" },
      { id: "s4", nombre: "Dani Soler", rol: "Técnico de luces", desc: "Bruno le debía 3.000 euros desde hacía meses.",
        coartada: "\"No me moví de la cabina en todo el descanso.\"",
        sabe: "\"Desde la cabina se ve la mesa de atrezo. Hacia las 21:43 alguien rellenó la copa con una jarra. A contraluz no vi quién.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Mesa de atrezo", pista: "La jarra de zumo está casi vacía. Lo poco que queda en el fondo tiene un regusto amargo muy raro." },
      { id: "l2", nombre: "Camerino de Inés", pista: "El libro de plantas venenosas es de la biblioteca: lo sacó para su próximo papel de bruja. La regidora pasó a las 21:42 a dar el aviso de cinco minutos y encontró a Inés en bata, a medio maquillar." },
      { id: "l3", nombre: "Bar de enfrente", pista: "El camarero recuerda a Clara: pidió hielo y se fue enseguida, a las 21:38 como muy tarde. El teatro está a un minuto andando." },
      { id: "l4", nombre: "Cabina de luces", pista: "La mesa de luces registra cambios hasta las 21:34 y otra vez desde las 21:41. Entre medias, nada." },
      { id: "l5", nombre: "Puerta de artistas", pista: "El portero vio a Dani bajar a las 21:35 y discutir con Bruno: \"¡Me debes 3.000 euros!\". A las 21:40 Dani volvió a subir. Ramón y el crítico pasaron hacia el vestíbulo a las 21:30 y no volvieron hasta las 21:47." },
      { id: "l6", nombre: "Almacén de atrezo", pista: "En la papelera, un frasco vacío de gotas para el corazón, con la etiqueta arrancada." }
    ],
    motivos: ["Despecho porque Bruno la dejó", "Quedarse con el papel protagonista", "Evitar que se fuera a otra compañía", "Cobrar una deuda"],
    metodos: ["Echó el veneno en la jarra y rellenó la copa al final del descanso", "Envenenó la copa al llenarla antes de la función", "Echó el veneno en la copa durante el primer acto", "Le dio el veneno durante la discusión en la puerta de artistas"],
    sol: { culpable: "s3", motivo: 0, metodo: 0 },
    explicacion: "Bruno bebió sin problema a las 21:10, así que el veneno llegó después, cuando alguien rellenó la copa con la jarra hacia las 21:43. A esa hora Dani ya estaba otra vez en la cabina (la mesa de luces trabaja desde las 21:41) y Ramón seguía en el vestíbulo hasta las 21:47. Inés estaba en bata a medio maquillar a las 21:42, y su libro era para un papel. Clara dijo que volvió al empezar el segundo acto, pero salió del bar a las 21:38 y el teatro está a un minuto. Rellenar la copa en el descanso era precisamente su trabajo, y Bruno la había dejado por un mensaje."
  },
  {
    id: "receta2",
    titulo: "La receta perdida",
    sub: "Robo en una pastelería",
    intro: "Mañana es la final del concurso de pastelería de la tele y Sara Ferrer piensa ganarla con la tarta secreta de su abuela. Pero a las 7:00, al abrir La Dulce Vida, encuentra la ventana del despacho rota y el cajón del escritorio vacío: el cuaderno de recetas de la abuela ha desaparecido.",
    victima: "Sara Ferrer, pastelera (el cuaderno de recetas)",
    informes: [
      "Informe de la escena: la puerta del despacho estaba cerrada con llave y la ventana, rota. Ni la puerta ni el cajón del cuaderno están forzados: se abrieron con sus llaves. Sara pasó la noche en otra ciudad (confirmado).",
      "Informe de la alarma: se desactivó a las 23:47 con el código del repartidor y se volvió a activar a las 23:58. Cada empleado tiene su propio código."
    ],
    sospechosos: [
      { id: "s1", nombre: "Pablo Serra", rol: "Oficial de pastelería", desc: "El mejor de la plantilla. Lleva años diciendo que algún día tendrá su propio obrador.",
        coartada: "\"Cerré a las 21:00 y me fui a casa. Mi novia te lo confirma.\"",
        sabe: "\"Julia lleva semanas rara, saliendo a la calle a hablar por teléfono para que no la oigamos.\"" },
      { id: "s2", nombre: "Nerea Castro", rol: "Rival en el concurso", desc: "La otra finalista. Muy competitiva.",
        coartada: "\"Toda la noche en el hotel del concurso. Hay cámaras en los pasillos.\"",
        sabe: "\"Hace una semana alguien me escribió desde un número oculto ofreciéndome 'el secreto de la abuela'. No contesté.\"" },
      { id: "s3", nombre: "Tomás Rey", rol: "Repartidor", desc: "Trae la harina y los huevos por la puerta de atrás. Siempre pregunta por la tarta de la abuela.",
        coartada: "\"A esa hora estaba repartiendo en el polígono, a veinte kilómetros.\"",
        sabe: "\"Mi código de la alarma lo tengo apuntado en un pósit en la puerta de atrás, que siempre se me olvida. Lo ha visto toda la tienda.\"" },
      { id: "s4", nombre: "Julia Ferrer", rol: "Hermana de Sara y socia", desc: "Lleva las cuentas del negocio, que no van nada bien. Tiene su propia llave del despacho.",
        coartada: "\"Toda la noche en casa, viendo una serie.\"",
        sabe: "\"Hay una llave de repuesto del despacho colgada en el obrador, detrás del calendario. Solo la conocemos los de dentro.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Ventana del despacho", pista: "Los cristales rotos están en la acera, fuera. La ventana se rompió desde dentro." },
      { id: "l2", nombre: "Obrador", pista: "El pósit con el código de Tomás sigue pegado en la puerta de atrás. La llave de repuesto cuelga detrás del calendario, en su sitio, junto a la llavecita del cajón." },
      { id: "l3", nombre: "Furgoneta de Tomás", pista: "El GPS de la furgoneta la sitúa en el polígono de 23:30 a 0:15, con paradas en tres naves distintas." },
      { id: "l4", nombre: "Hotel del concurso", pista: "Las cámaras graban a Nerea entrando en su habitación a las 21:30. No vuelve a salir hasta las 8:00." },
      { id: "l5", nombre: "Casa de Julia", pista: "No estaba en casa: en la entrada hay el tique de un restaurante caro, cena para dos de 22:00 a 0:30, pagada con una tarjeta de Dulcinea, la gran cadena de pastelerías." },
      { id: "l6", nombre: "Casa de Pablo", pista: "Su novia confirma que Pablo llegó a las 21:20 \"y luego salió a correr, como siempre, de 23:30 a 0:15\". Sobre la mesa, el contrato de alquiler de un local sin firmar." }
    ],
    motivos: ["Montar su propio obrador con las recetas", "Vender las recetas a la cadena Dulcinea", "Ganar el concurso de la tele", "Descubrir el secreto de la tarta por pura curiosidad"],
    metodos: ["Entró con el código del repartidor y la llave de repuesto, y rompió la ventana desde dentro", "Entró con su propia llave del despacho", "Rompió la ventana desde la calle para entrar", "Se escondió dentro antes del cierre"],
    sol: { culpable: "s1", motivo: 0, metodo: 0 },
    explicacion: "La ventana se rompió desde dentro: fue un montaje. El ladrón entró a las 23:47 con el código de Tomás, que cualquiera de la tienda podía leer en el pósit, y abrió con la llave de repuesto del obrador. Tomás estaba en el polígono, Nerea no salió del hotel y Julia, aunque mintió para ocultar su cena con Dulcinea, estuvo en el restaurante hasta las 0:30. Pablo dijo que estaba en casa, pero su novia contó que salió 'a correr' justo de 23:30 a 0:15. El local sin firmar es el obrador que lleva años soñando abrir."
  },
  {
    id: "tren2",
    titulo: "Muerte en el Expreso del Norte",
    sub: "Asesinato en un tren nocturno",
    intro: "El tren nocturno Madrid-Santander avanza entre montañas. A las 7:00 el revisor encuentra muerto en su compartimento al empresario Gerardo Llull. Todo está revuelto, como si hubieran querido robarle. En plena noche, el tren hizo una parada de quince minutos en la estación de Medina.",
    victima: "Gerardo Llull, empresario",
    informes: [
      "Informe forense: muerte entre las 0:30 y la 1:00 por un golpe en la cabeza. El arma, un pisapapeles de bronce de Llull, apareció limpio en la papelera del pasillo.",
      "Informe de la escena: el reloj de Llull está roto y parado a la 1:40. Compartimentos del coche-cama: el 2 es de Marcos Llull, el 3 de Gerardo Llull, el 4 de Valeria Costa y el 5 de Elena Rius."
    ],
    sospechosos: [
      { id: "s1", nombre: "Elena Rius", rol: "Socia de Llull", desc: "Llull pensaba sacarla de la empresa este mismo mes.",
        coartada: "\"De 0:00 a 1:15 estuve en el vagón restaurante jugando al mus con el revisor.\"",
        sabe: "\"Gerardo me dijo que en este tren viajaba alguien a quien iba a 'arruinar mañana mismo'.\"" },
      { id: "s2", nombre: "Marcos Llull", rol: "Hijo de la víctima", desc: "Siempre pidiéndole dinero a su padre. Siempre sin conseguirlo.",
        coartada: "\"Me acosté a las 0:20 y no salí hasta Medina, a la 1:30, para fumar en el andén.\"",
        sabe: "\"A la 1:40 estaba en el andén con la escritora del compartimento de al lado. Ella no se separó de mí.\"" },
      { id: "s3", nombre: "Nicolás Ferrer", rol: "Revisor", desc: "Treinta años en los trenes nocturnos. Llull le denunció el año pasado por un billete mal cobrado.",
        coartada: "\"Jugando al mus con la señora Rius hasta la 1:15. Luego, revisión de billetes en Medina.\"",
        sabe: "\"Al subir, Llull me pidió que nadie le molestara en toda la noche. Le noté muy nervioso, como si esperara a alguien.\"" },
      { id: "s4", nombre: "Valeria Costa", rol: "Escritora", desc: "Viaja a Santander a recoger un premio literario.",
        coartada: "\"A la 1:40 estaba en el andén de Medina, charlando con el hijo de Llull.\"",
        sabe: "\"Llull y su hijo se llevaban a matar. A eso de las 0:35 le oí gritarle a través de la pared: '¡Ni un euro más!'.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Compartimento 3", pista: "En el maletín de Llull, el borrador de un artículo: \"La novela que ha ganado el premio de este año es un plagio del manuscrito de mi difunta esposa. Mañana daré el nombre\". La cartera sigue en la chaqueta, con todo el dinero." },
      { id: "l2", nombre: "Vagón restaurante", pista: "El camarero recuerda la partida de mus: Elena y el revisor no se levantaron de la mesa desde las 0:00 hasta la 1:15." },
      { id: "l3", nombre: "Compartimento 2", pista: "Un pagaré de 5.000 € roto en pedazos: Llull se negó a firmárselo a su hijo. En la mesita, pastillas para dormir y una botella de whisky casi vacía." },
      { id: "l4", nombre: "Andén de Medina", pista: "El maquinista vio a Marcos y a la escritora fumando juntos en el andén de 1:30 a 1:45." },
      { id: "l5", nombre: "Pasillo del coche-cama", pista: "A las 0:52 la azafata llevó un vaso de agua al compartimento 3: Llull estaba vivo y solo. Al volver, del 2 salían unos ronquidos tremendos y la puerta del 4 estaba abierta, sin nadie dentro." },
      { id: "l6", nombre: "Compartimento 4", pista: "Una maleta con varios ejemplares de \"La casa del faro\", con la faja \"Premio Novela del Año\". La toalla del lavabo está húmeda." }
    ],
    motivos: ["Evitar que la acusara de plagio", "Conseguir el dinero que le negaba", "Que no la echara de la empresa", "Vengarse de una denuncia"],
    metodos: ["Le golpeó con el pisapapeles y paró su reloj a la 1:40 para tener coartada", "Le golpeó durante la discusión de las 0:35", "Subió al tren durante la parada de Medina", "Le golpeó durante la parada de Medina, a la 1:40"],
    sol: { culpable: "s4", motivo: 0, metodo: 0 },
    explicacion: "El reloj parado a la 1:40 es una trampa: el forense sitúa la muerte antes de la 1:00, y a las 0:52 Llull seguía vivo. Así que murió entre las 0:52 y la 1:00. La discusión de las 0:35 con Marcos no le mató, y a las 0:52 Marcos roncaba en el 2, con pastillas y whisky. Elena y el revisor jugaban al mus. A esa hora la puerta del 4, el de Valeria, estaba abierta y vacía, y su única coartada es justo para la hora falsa del reloj. La novela premiada de su maleta es la que Llull iba a denunciar como plagio."
  },
  {
    id: "bodega2",
    titulo: "Muerte en la bodega",
    sub: "Asesinato en plena vendimia",
    intro: "En plena vendimia, a las 10:00, encuentran a don Celestino Arrieta, dueño de Bodegas Arrieta, muerto en la sala de depósitos, donde fermenta el vino. Esa fermentación suelta un gas que, sin ventilación, puede matar. Alguien quería que pareciera un accidente.",
    victima: "Celestino Arrieta, bodeguero",
    informes: [
      "Informe forense: murió asfixiado por el gas de la fermentación entre las 7:00 y las 8:00. Solo tiene un golpe leve en la frente, de caerse.",
      "Informe de la escena: el extractor de la sala estaba apagado desde el cuadro eléctrico, junto a la puerta trasera. La puerta se abre hacia fuera y tenía una carretilla de barricas encajada para que no se pudiera abrir."
    ],
    sospechosos: [
      { id: "s1", nombre: "Iñaki Arrieta", rol: "Hijo del bodeguero", desc: "Quiere vender la bodega a un fondo de inversión. Su padre se negaba en redondo.",
        coartada: "\"De 6:30 a 8:30 estuve en el gimnasio del pueblo.\"",
        sabe: "\"Begoña y mi padre llevaban días sin hablarse. Algo pasaba.\"" },
      { id: "s2", nombre: "Begoña Sáez", rol: "Enóloga", desc: "Veinte años haciendo los vinos de la casa.",
        coartada: "\"A esa hora estaba en la viña de arriba tomando muestras de uva. Sola.\"",
        sabe: "\"Iñaki tiene prisa por vender. Mucha prisa. Pregúntale por los mensajes del fondo.\"" },
      { id: "s3", nombre: "Rubén Lago", rol: "Vecino", desc: "Lleva años en pleitos con Celestino por el agua de riego.",
        coartada: "\"Regando mi finca desde las 6:00. Pregunta a mi mujer.\"",
        sabe: "\"Ese hombre tenía enemigos dentro de su propia casa. Yo de vosotros preguntaría por el francés.\"" },
      { id: "s4", nombre: "Ayelén Ríos", rol: "Temporera", desc: "Primera vendimia en la casa. Celestino le gritó delante de todos ayer.",
        coartada: "\"Desde las 7:00 en la nave de embotellado, con otras tres compañeras.\"",
        sabe: "\"Desde la ventana de la nave, sobre las 7:15, vi un todoterreno verde meterse por el camino de atrás de la bodega.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Cuadro eléctrico", pista: "El interruptor del extractor tiene restos de tierra roja y pegajosa, como de barro reciente." },
      { id: "l2", nombre: "Viña de arriba", pista: "Es la única viña de tierra roja de la finca. Las cajitas de muestras de Begoña llevan la hora apuntada: 6:45 y 8:15. Ninguna entre medias." },
      { id: "l3", nombre: "Gimnasio del pueblo", pista: "Iñaki tuvo clase privada con su entrenador de 6:45 a 8:15. El entrenador no se separó de él." },
      { id: "l4", nombre: "Aparcamiento", pista: "Coches de la casa: el todoterreno verde de Begoña, la moto de Iñaki y la furgoneta blanca de las temporeras. Rubén tiene un tractor rojo." },
      { id: "l5", nombre: "Despacho de Celestino", pista: "Una carta firmada a un enólogo de Burdeos: \"Empezará usted el lunes, en sustitución de la señora Sáez\". Debajo, un mensaje impreso del fondo para Iñaki: \"Cuando tu padre no esté, firmamos\"." },
      { id: "l6", nombre: "Finca de Rubén", pista: "Tierra parda y arenosa. La mujer de Rubén confirma que regó desde las 6:00, y los vecinos oyeron el tractor toda la mañana." }
    ],
    motivos: ["Evitar que la sustituyeran tras veinte años", "Vender la bodega al fondo", "Vengarse por el pleito del agua", "Vengarse por una humillación en público"],
    metodos: ["Apagó el extractor y bloqueó la puerta con la carretilla", "Le golpeó en la cabeza y lo dejó en la sala", "Abrió un depósito para inundar la sala de gas", "Le encerró sin saber que el extractor estaba apagado"],
    sol: { culpable: "s2", motivo: 0, metodo: 0 },
    explicacion: "Celestino murió por el gas, no por el golpe: alguien apagó el extractor y le encerró con la carretilla. Iñaki tuvo un buen motivo, pero estaba con su entrenador. Ayelén no salió de la nave y Rubén regaba con el tractor en su finca de tierra parda. El interruptor tenía tierra roja, que solo hay en la viña de arriba, la de Begoña. Sus muestras tienen un hueco de 6:45 a 8:15, y el todoterreno verde que Ayelén vio entrar por detrás a las 7:15 es el suyo. Celestino ya había contratado a un enólogo francés para sustituirla."
  },
  {
    id: "galeria2",
    titulo: "El cuadro de la galería",
    sub: "Falsificación en una inauguración",
    intro: "Inauguración en la Galería Lumen. La joya de la noche es \"Marina al atardecer\", del pintor Elías Mora. A las 22:30, cuando ya se ha ido el público, la dueña se acerca a mirarlo y nota algo raro: la pintura aún huele. El cuadro de la pared es una copia.",
    victima: "Carmen Lago, dueña de la galería (el cuadro)",
    informes: [
      "Informe del seguro: el perito revisó el cuadro a las 19:00 y era el original. El de las 22:30 es una copia pintada hace pocos días con óleo de secado rápido.",
      "Informe de la escena: hubo un apagón de 21:10 a 21:14 y las cámaras estuvieron apagadas esos cuatro minutos. Los tornillos del marco solo se quitan con una llave especial; hay dos: la del guarda y la del taller de restauración."
    ],
    sospechosos: [
      { id: "s1", nombre: "Óscar Bel", rol: "Pintor que expone", desc: "Joven promesa, primera exposición en la galería. Firma solo como \"Óscar Bel\".",
        coartada: "\"Durante el apagón estaba en la sala 1, junto a mis cuadros, hablando con una periodista.\"",
        sabe: "\"Hace un mes, Teresa me pidió mis óleos de secado rápido. No me dijo para qué.\"" },
      { id: "s2", nombre: "Teresa Nadal", rol: "Restauradora de la galería", desc: "Conoce cada cuadro de la casa centímetro a centímetro. Se queja de que cobra una miseria.",
        coartada: "\"Durante el apagón estaba en el almacén, buscando velas.\"",
        sabe: "\"La llave de los marcos del taller la usé esta tarde y la dejé en su gancho. Estoy segura.\"" },
      { id: "s3", nombre: "Iván Cruz", rol: "Guarda de seguridad", desc: "Era su primera semana en la galería.",
        coartada: "\"Bajé al sótano a por un fusible de repuesto y lo cambié. Tardé los cuatro minutos.\"",
        sabe: "\"Esta tarde vi al pintor salir del taller de restauración con una llave rara en la mano. Dijo que era para colgar sus cuadros.\"" },
      { id: "s4", nombre: "Paula Esteve", rol: "Coleccionista", desc: "Quiso comprar el cuadro y la dueña le dijo que no.",
        coartada: "\"Estaba en la terraza fumando. Con el apagón no vi nada.\"",
        sabe: "\"Carmen compró ese cuadro por cuatro duros a la familia del pintor cuando estaban arruinados. La familia nunca se lo perdonó.\"" }
    ],
    lugares: [
      { id: "l1", nombre: "Sala 2", pista: "Bajo el cuadro, en el suelo, una gota de pintura azul todavía blanda." },
      { id: "l2", nombre: "Sala 1", pista: "La periodista cuenta que, al irse la luz, Óscar dijo \"voy a por la linterna del móvil\" y desapareció. Volvió justo cuando volvió la luz." },
      { id: "l3", nombre: "Taller de restauración", pista: "El gancho de la llave de los marcos está vacío. En la mesa, los óleos de secado rápido que Teresa le pidió a Óscar, casi sin usar." },
      { id: "l4", nombre: "Cuadro eléctrico", pista: "El fusible no se fundió: alguien lo aflojó a mano. El camarero vio a Iván subir del sótano con un fusible nuevo a las 21:13." },
      { id: "l5", nombre: "Terraza", pista: "El camarero de la terraza estuvo con Paula todo el apagón: ella le pidió fuego y se pusieron a charlar." },
      { id: "l6", nombre: "Catálogo de la exposición", pista: "Biografía de los artistas: \"Óscar Bel Mora (Cádiz, 1998). Nieto del pintor Elías Mora, aprendió a pintar copiando sus marinas\"." }
    ],
    motivos: ["Recuperar el cuadro de su abuelo", "Vendérselo a un coleccionista", "Sacarse un dinero extra por lo poco que cobra", "Quedárselo para su colección"],
    metodos: ["Aprovechó el apagón para cambiarlo por una copia que había pintado", "Lo cambió el perito del seguro a las 19:00", "Lo cambió por la mañana, antes de abrir", "Lo cambió el guarda mientras fingía arreglar el fusible"],
    sol: { culpable: "s1", motivo: 0, metodo: 0 },
    explicacion: "El original estaba a las 19:00, así que el cambio se hizo en los cuatro minutos de apagón, que alguien provocó aflojando el fusible. Paula estaba con el camarero e Iván subía del sótano con el fusible. Teresa parece sospechosa, pero sus óleos están casi sin usar. Óscar dijo que estaba con la periodista, pero ella cuenta que desapareció justo durante el apagón. Iván le vio con la llave de los marcos por la tarde, sabe copiar las marinas de Elías Mora y el catálogo revela que es su nieto, de la familia que vendió el cuadro arruinada."
  }
];
