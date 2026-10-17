/* Baraja de Trazos y Tragos: personaje + acción + lugar.
   p/a/l = baraja normal; pp/ap/lp = cartas picantes (+18), se añaden si se activan. */
window.DIBUJES_CARTAS = {
  p: [
    "Drácula", "Frankenstein", "Una momia", "Un zombi", "Un fantasma", "Una bruja", "Un hombre lobo", "Un esqueleto",
    "Un pirata", "Un ninja", "Un vikingo", "Un astronauta", "Un extraterrestre", "Un robot", "Un dinosaurio", "Un tiburón",
    "Un pulpo", "Una jirafa", "Un pingüino", "Un gato", "Un perro salchicha", "Una gallina", "Una vaca", "Un caracol",
    "Un unicornio", "Un dragón", "Una sirena", "Papá Noel", "Los Reyes Magos", "El Ratoncito Pérez", "Un torero", "Una flamenca",
    "Un cura", "Una monja", "Un policía", "Un bombero", "Un médico", "Un payaso", "Un mimo", "Un mago",
    "Un rey", "Una reina", "Un caballero medieval", "Un cavernícola", "Un faraón", "Un abuelo", "Una abuela", "Un bebé",
    "Un culturista", "Una bailarina de ballet", "Un futbolista", "Un árbitro", "Un DJ", "Un rapero", "Un influencer", "Un camarero",
    "Un cocinero", "Un fontanero", "Un profesor", "Un superhéroe", "Un espantapájaros", "Un muñeco de nieve", "Un vaquero", "Un plátano con piernas",
    "Un cocodrilo", "Un mono", "Un oso panda", "Una abeja", "Un caballo", "Un cerdo", "Un búho", "Un murciélago"
  ],
  a: [
    "bailando reguetón", "haciendo yoga", "tuiteando", "haciéndose un selfi", "dando a luz", "cantando en un karaoke", "comiendo espaguetis", "jugando al pádel",
    "montando en bici", "haciendo surf", "esquiando", "pescando", "durmiendo la siesta", "roncando", "estornudando", "llorando a moco tendido",
    "tirándose un pedo", "haciendo una barbacoa", "cortándose el pelo", "depilándose", "lavándose los dientes", "duchándose", "tendiendo la ropa", "planchando",
    "cocinando una paella", "mojando churros", "brindando", "pidiendo matrimonio", "haciendo puenting", "saltando en paracaídas", "tocando la guitarra", "tocando la batería",
    "pintando un cuadro", "leyendo el periódico", "viendo una peli de miedo", "jugando a la consola", "haciendo malabares", "montando un mueble", "arreglando un coche", "conduciendo un tractor",
    "persiguiendo un autobús", "buscando las llaves", "haciendo la compra", "paseando al perro", "ordeñando una vaca", "plantando un árbol", "haciendo un castillo de arena", "tomando el sol",
    "nadando", "haciendo flexiones", "levantando pesas", "corriendo una maratón", "dando un discurso", "firmando autógrafos", "atracando un banco", "escapando de la cárcel",
    "haciendo un examen", "buscando cobertura", "grabando un TikTok", "en una pelea de almohadas", "lanzando confeti", "inflando un globo", "comiendo una pizza gigante", "montando a caballo",
    "haciendo el pino", "patinando", "tocando la gaita", "pescando con la mano", "jugando al ajedrez", "haciendo la croqueta"
  ],
  l: [
    "en un volcán", "en el circo", "en la Luna", "en una isla desierta", "en el metro", "en un ascensor", "en la playa", "en la piscina",
    "en el desierto", "en el Polo Norte", "en la selva", "en el fondo del mar", "en una nave espacial", "en un castillo", "en una cueva", "en un iglú",
    "en un barco pirata", "en el Titanic", "en un avión", "en un globo aerostático", "en la Torre Eiffel", "en las pirámides de Egipto", "en un campo de fútbol", "en una plaza de toros",
    "en un hospital", "en un quirófano", "en la cárcel", "en un colegio", "en una biblioteca", "en el supermercado", "en una tienda de muebles", "en la peluquería",
    "en el dentista", "en una boda", "en un entierro", "en una discoteca", "en un festival de música", "en la feria", "en una montaña rusa", "en un tren",
    "en un taxi", "en una gasolinera", "en un baño público", "en la bañera", "en la cama", "en la cocina", "en un tejado", "en lo alto de un árbol",
    "en una granja", "en el zoo", "en un acuario", "en un cementerio", "en una casa encantada", "en un museo", "en el gimnasio", "en una sauna",
    "en la nieve", "en un atasco", "en un camping", "en el Congreso", "en un casino", "en una tienda de campaña", "en una romería", "en un submarino",
    "en una isla flotante", "en el Lejano Oeste", "en un rascacielos", "en un tobogán acuático"
  ],
  pp: [
    "Tu ex", "Tu jefe", "Tu suegra", "Un borracho", "Un novio en su despedida", "Unos recién casados", "Un ligón de bar", "Una drag queen",
    "Un nudista", "Un stripper", "Un sugar daddy", "Una pareja de Tinder", "Un portero de discoteca", "Un cupido con resaca", "Un vecino cotilla", "Una madre pillando a su hijo"
  ],
  ap: [
    "ligando", "tirando los tejos", "haciendo twerking", "dándose un morreo", "haciendo un estriptis", "con una resaca horrible", "vomitando", "haciendo pis",
    "haciendo un baile sexi", "pidiendo otra ronda", "mandando un audio borracho", "bebiendo de un embudo", "despertando sin saber dónde está", "enseñando el culo", "huyendo por la ventana", "haciendo un chupito de tequila"
  ],
  lp: [
    "en una despedida de soltero", "en un motel", "en un probador", "en el baño de una discoteca", "en una playa nudista", "en un jacuzzi", "en el asiento de atrás de un coche", "en un after",
    "en un sex shop", "en una fiesta de la espuma", "en el portal de casa", "en el balcón del vecino", "en una bacanal romana", "en un crucero de solteros", "en la cama de tus padres", "en un botellón"
  ]
};
