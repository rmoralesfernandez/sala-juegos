/* Banco de preguntas de Quesito Show.
   mc: test (a = índice de la correcta) · tf: verdad o trola · num: calcula (a = número) · ord: ordena (i ya en el orden correcto) */
window.BANCO = {
  geo: {
    mc: [
      { q: "¿Cuál es el río más largo de la península ibérica?", o: ["Tajo", "Ebro", "Duero", "Guadalquivir"], a: 0 },
      { q: "¿Cuál es la capital de Australia?", o: ["Canberra", "Sídney", "Melbourne", "Perth"], a: 0 },
      { q: "¿En qué país está el Machu Picchu?", o: ["Perú", "Bolivia", "México", "Chile"], a: 0 },
      { q: "¿Cuál es el país más grande del mundo por superficie?", o: ["Rusia", "Canadá", "China", "Estados Unidos"], a: 0 },
      { q: "¿Qué océano baña las costas de Galicia?", o: ["Atlántico", "Cantábrico", "Índico", "Pacífico"], a: 0 },
      { q: "¿Cuál es la capital de Canadá?", o: ["Ottawa", "Toronto", "Montreal", "Vancouver"], a: 0 },
      { q: "¿En qué provincia está la Alhambra?", o: ["Granada", "Sevilla", "Córdoba", "Málaga"], a: 0 },
      { q: "¿Qué país tiene forma de bota?", o: ["Italia", "Grecia", "Portugal", "Croacia"], a: 0 },
      { q: "¿Cuál es el pico más alto de España?", o: ["Teide", "Mulhacén", "Aneto", "Veleta"], a: 0 },
      { q: "¿Qué desierto es el más grande de los cálidos?", o: ["Sáhara", "Gobi", "Kalahari", "Atacama"], a: 0 },
      { q: "¿Cuál es la capital de Marruecos?", o: ["Rabat", "Casablanca", "Marrakech", "Fez"], a: 0 },
      { q: "¿Cuántas comunidades autónomas tiene España?", o: ["17", "15", "19", "16"], a: 0 },
      { q: "¿Por qué ciudad pasa el río Sena?", o: ["París", "Londres", "Bruselas", "Ámsterdam"], a: 0 },
      { q: "¿En qué continente está Mongolia?", o: ["Asia", "Europa", "África", "Oceanía"], a: 0 },
      { q: "¿Qué isla canaria es la más grande?", o: ["Tenerife", "Gran Canaria", "Fuerteventura", "Lanzarote"], a: 0 }
    ],
    tf: [
      { q: "Nueva Zelanda tiene más ovejas que habitantes.", a: true },
      { q: "La capital de Suiza es Ginebra.", a: false },
      { q: "Andorra no tiene aeropuerto propio con vuelos comerciales.", a: true },
      { q: "El Amazonas desemboca en el océano Pacífico.", a: false },
      { q: "Rusia ocupa territorio en Europa y en Asia.", a: true },
      { q: "Portugal tiene frontera con Francia.", a: false },
      { q: "El monte Everest está en la frontera entre Nepal y China.", a: true },
      { q: "Madrid es la capital europea situada a mayor altitud.", a: false },
      { q: "El mar Muerto está por debajo del nivel del mar.", a: true },
      { q: "Brasil tiene costa en el océano Pacífico.", a: false }
    ],
    num: [
      { q: "¿Cuántos metros mide el Everest?", a: 8849, u: "m" },
      { q: "¿Cuántos países forman la Unión Europea?", a: 27, u: "países" },
      { q: "¿Cuántos kilómetros hay en línea recta de Madrid a Barcelona?", a: 505, u: "km" },
      { q: "¿Cuántos habitantes tiene España, en millones?", a: 48, u: "millones" },
      { q: "¿Cuántos países hay en África?", a: 54, u: "países" }
    ],
    ord: [
      { q: "Ordena de más al norte a más al sur", i: ["Oslo", "París", "Madrid", "El Cairo"] },
      { q: "Ordena de más grande a más pequeño", i: ["Rusia", "Brasil", "España", "Portugal"] },
      { q: "Ordena de más alto a más bajo", i: ["Everest", "Mont Blanc", "Teide", "Mulhacén"] },
      { q: "Ordena de más poblada a menos poblada", i: ["Madrid", "Barcelona", "Valencia", "Zaragoza"] }
    ]
  },
  ocio: {
    mc: [
      { q: "¿Cómo se llama el muñeco vaquero de Toy Story?", o: ["Woody", "Buzz", "Jessie", "Slinky"], a: 0 },
      { q: "¿Qué serie española trata de un atraco a la Fábrica de Moneda y Timbre?", o: ["La casa de papel", "Élite", "Vis a vis", "Las chicas del cable"], a: 0 },
      { q: "¿Qué fontanero es la mascota de Nintendo?", o: ["Mario", "Luigi", "Wario", "Link"], a: 0 },
      { q: "¿En qué ciudad viven los Simpson?", o: ["Springfield", "Shelbyville", "Quahog", "South Park"], a: 0 },
      { q: "¿Quién canta «Despacito» junto a Daddy Yankee?", o: ["Luis Fonsi", "Enrique Iglesias", "J Balvin", "Maluma"], a: 0 },
      { q: "¿Cómo se llama el mago protagonista de la saga de J. K. Rowling?", o: ["Harry Potter", "Ron Weasley", "Merlín", "Gandalf"], a: 0 },
      { q: "¿Qué grupo cantaba «Bohemian Rhapsody»?", o: ["Queen", "The Beatles", "ABBA", "The Rolling Stones"], a: 0 },
      { q: "¿Qué actor interpreta a Jack en «Titanic»?", o: ["Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Matt Damon"], a: 0 },
      { q: "¿Qué color tiene Pikachu?", o: ["Amarillo", "Naranja", "Rojo", "Verde"], a: 0 },
      { q: "¿Qué cantante española publicó el disco «Motomami»?", o: ["Rosalía", "Aitana", "Lola Índigo", "Bad Gyal"], a: 0 },
      { q: "¿Qué ogro verde vive en una ciénaga?", o: ["Shrek", "Fiona", "Asno", "Grinch"], a: 0 },
      { q: "¿Qué famoso concurso presentó durante décadas Chicho Ibáñez Serrador?", o: ["Un, dos, tres", "Pasapalabra", "Saber y ganar", "El precio justo"], a: 0 },
      { q: "¿Cómo se llama el villano de «El Rey León»?", o: ["Scar", "Jafar", "Úrsula", "Hades"], a: 0 },
      { q: "¿En qué videojuego se construye con bloques en un mundo cúbico?", o: ["Minecraft", "Fortnite", "Tetris", "Roblox"], a: 0 },
      { q: "¿Qué superhéroe es Peter Parker?", o: ["Spider-Man", "Batman", "Iron Man", "Superman"], a: 0 }
    ],
    tf: [
      { q: "Mickey Mouse tiene cuatro dedos en cada mano.", a: true },
      { q: "«Friends» transcurre en Los Ángeles.", a: false },
      { q: "Homer Simpson trabaja en una central nuclear.", a: true },
      { q: "Darth Vader es el padre de Luke Skywalker.", a: true },
      { q: "Eurovisión se celebró por primera vez en los años 70.", a: false },
      { q: "Tetris fue creado en la Unión Soviética.", a: true },
      { q: "Bob Esponja vive dentro de una piña bajo el mar.", a: true },
      { q: "«Torrente» está protagonizada por Antonio Banderas.", a: false },
      { q: "Los Beatles eran de Liverpool.", a: true },
      { q: "Sonic es un zorro azul.", a: false }
    ],
    num: [
      { q: "¿En qué año se estrenó la primera película de «Star Wars»?", a: 1977, u: "año" },
      { q: "¿Cuántas películas principales tiene la saga de Harry Potter?", a: 8, u: "películas" },
      { q: "¿En qué año ganó España su primer Eurovisión, con «La, la, la»?", a: 1968, u: "año" },
      { q: "¿Cuántos jugadores pueden caer en una partida estándar de Fortnite Battle Royale?", a: 100, u: "jugadores" },
      { q: "¿En qué año salió a la venta la primera PlayStation en Japón?", a: 1994, u: "año" }
    ],
    ord: [
      { q: "Ordena de más antigua a más moderna", i: ["Blancanieves", "El Rey León", "Frozen", "Encanto"] },
      { q: "Ordena de más antigua a más moderna", i: ["Game Boy", "PlayStation 2", "Wii", "Nintendo Switch"] },
      { q: "Ordena por orden de estreno", i: ["Tiburón", "Titanic", "Avatar", "Oppenheimer"] }
    ]
  },
  hist: {
    mc: [
      { q: "¿En qué año llegó Colón a América?", o: ["1492", "1500", "1478", "1512"], a: 0 },
      { q: "¿Quién fue el primer emperador romano?", o: ["Augusto", "Julio César", "Nerón", "Trajano"], a: 0 },
      { q: "¿En qué año cayó el muro de Berlín?", o: ["1989", "1991", "1985", "1961"], a: 0 },
      { q: "¿Qué reyes son conocidos como los Reyes Católicos?", o: ["Isabel y Fernando", "Felipe y Juana", "Carlos y Felipe", "Alfonso y Leonor"], a: 0 },
      { q: "¿Quién fue el primer hombre en pisar la Luna?", o: ["Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "Michael Collins"], a: 0 },
      { q: "¿En qué año se aprobó la Constitución española actual?", o: ["1978", "1975", "1982", "1977"], a: 0 },
      { q: "¿Qué civilización construyó Chichén Itzá?", o: ["Maya", "Azteca", "Inca", "Olmeca"], a: 0 },
      { q: "¿Qué barco se hundió en 1912 tras chocar con un iceberg?", o: ["Titanic", "Lusitania", "Britannic", "Olympic"], a: 0 },
      { q: "¿Qué faraón tenía la tumba casi intacta que se descubrió en 1922?", o: ["Tutankamón", "Ramsés II", "Keops", "Akenatón"], a: 0 },
      { q: "¿En qué ciudad fue asesinado John F. Kennedy?", o: ["Dallas", "Washington", "Nueva York", "Chicago"], a: 0 },
      { q: "¿Qué batalla de 1805 enfrentó a británicos contra franceses y españoles?", o: ["Trafalgar", "Waterloo", "Lepanto", "Bailén"], a: 0 },
      { q: "¿Qué pueblo llegó a la península en el año 711?", o: ["Musulmanes", "Visigodos", "Vikingos", "Romanos"], a: 0 },
      { q: "¿Quién pintó la Capilla Sixtina en tiempos del papa Julio II?", o: ["Miguel Ángel", "Rafael", "Leonardo da Vinci", "Botticelli"], a: 0 },
      { q: "¿Qué país lanzó el primer satélite artificial, el Sputnik?", o: ["Unión Soviética", "Estados Unidos", "China", "Alemania"], a: 0 },
      { q: "¿En qué año empezó la Primera Guerra Mundial?", o: ["1914", "1918", "1939", "1905"], a: 0 }
    ],
    tf: [
      { q: "Napoleón era bajísimo para su época.", a: false },
      { q: "Cleopatra vivió más cerca en el tiempo de la llegada a la Luna que de la construcción de la Gran Pirámide.", a: true },
      { q: "Los vikingos llevaban cascos con cuernos en batalla.", a: false },
      { q: "La Guerra de los Cien Años duró exactamente cien años.", a: false },
      { q: "Julio César fue asesinado en los idus de marzo.", a: true },
      { q: "Alfonso XIII fue rey de España.", a: true },
      { q: "La Revolución francesa empezó en 1789.", a: true },
      { q: "Hernán Cortés conquistó el Imperio inca.", a: false },
      { q: "Los Juegos Olímpicos de Barcelona se celebraron en 1992.", a: true },
      { q: "La imprenta de Gutenberg es del siglo XVIII.", a: false }
    ],
    num: [
      { q: "¿En qué año empezó la Guerra Civil española?", a: 1936, u: "año" },
      { q: "¿En qué año llegó el ser humano a la Luna?", a: 1969, u: "año" },
      { q: "¿En qué año entró España en la Comunidad Económica Europea?", a: 1986, u: "año" },
      { q: "¿En qué año terminó la Segunda Guerra Mundial?", a: 1945, u: "año" },
      { q: "¿En qué año entró en circulación el euro en billetes y monedas?", a: 2002, u: "año" }
    ],
    ord: [
      { q: "Ordena de más antiguo a más reciente", i: ["Pirámides de Guiza", "Imperio romano", "Descubrimiento de América", "Revolución francesa"] },
      { q: "Ordena de más antiguo a más reciente", i: ["Caída del muro de Berlín", "Atentados del 11-S", "Crisis de 2008", "Pandemia de covid"] },
      { q: "Ordena de más antiguo a más reciente", i: ["Felipe II", "Carlos III", "Isabel II", "Juan Carlos I"] }
    ]
  },
  arte: {
    mc: [
      { q: "¿Quién escribió «Don Quijote de la Mancha»?", o: ["Cervantes", "Lope de Vega", "Quevedo", "Góngora"], a: 0 },
      { q: "¿Quién pintó «Las meninas»?", o: ["Velázquez", "Goya", "El Greco", "Murillo"], a: 0 },
      { q: "¿En qué museo está la Mona Lisa?", o: ["Louvre", "Prado", "Uffizi", "British Museum"], a: 0 },
      { q: "¿Quién pintó el «Guernica»?", o: ["Picasso", "Dalí", "Miró", "Sorolla"], a: 0 },
      { q: "¿Quién escribió «Cien años de soledad»?", o: ["García Márquez", "Vargas Llosa", "Borges", "Cortázar"], a: 0 },
      { q: "¿Qué arquitecto diseñó la Sagrada Familia?", o: ["Gaudí", "Calatrava", "Domènech i Montaner", "Gehry"], a: 0 },
      { q: "¿Quién escribió «Romeo y Julieta»?", o: ["Shakespeare", "Dickens", "Molière", "Goethe"], a: 0 },
      { q: "¿Qué pintor se cortó parte de una oreja?", o: ["Van Gogh", "Monet", "Gauguin", "Cézanne"], a: 0 },
      { q: "¿Quién compuso «Las cuatro estaciones»?", o: ["Vivaldi", "Mozart", "Bach", "Beethoven"], a: 0 },
      { q: "¿Qué pintor es famoso por sus relojes blandos?", o: ["Dalí", "Magritte", "Miró", "Kandinsky"], a: 0 },
      { q: "¿Quién escribió «La casa de Bernarda Alba»?", o: ["Lorca", "Machado", "Valle-Inclán", "Unamuno"], a: 0 },
      { q: "¿Qué museo de Bilbao está recubierto de titanio?", o: ["Guggenheim", "Bellas Artes", "Reina Sofía", "Thyssen"], a: 0 },
      { q: "¿Quién escribió «1984»?", o: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H. G. Wells"], a: 0 },
      { q: "¿Quién pintó «La noche estrellada»?", o: ["Van Gogh", "Munch", "Renoir", "Klimt"], a: 0 },
      { q: "¿Qué compositor siguió componiendo pese a quedarse sordo?", o: ["Beethoven", "Chopin", "Mozart", "Verdi"], a: 0 }
    ],
    tf: [
      { q: "«El Lazarillo de Tormes» es de autor anónimo.", a: true },
      { q: "Picasso nació en Barcelona.", a: false },
      { q: "«El grito» lo pintó Edvard Munch.", a: true },
      { q: "Goya pintó «La maja desnuda».", a: true },
      { q: "Mozart murió con más de 60 años.", a: false },
      { q: "«La Odisea» se atribuye a Homero.", a: true },
      { q: "El Museo del Prado está en Barcelona.", a: false },
      { q: "Cervantes perdió la movilidad de una mano en la batalla de Lepanto.", a: true },
      { q: "«El principito» lo escribió Julio Verne.", a: false },
      { q: "Frida Kahlo era mexicana.", a: true }
    ],
    num: [
      { q: "¿En qué año se publicó la primera parte del Quijote?", a: 1605, u: "año" },
      { q: "¿Cuántas sinfonías completó Beethoven?", a: 9, u: "sinfonías" },
      { q: "¿En qué año pintó Picasso el «Guernica»?", a: 1937, u: "año" },
      { q: "¿En qué año empezaron las obras de la Sagrada Familia?", a: 1882, u: "año" }
    ],
    ord: [
      { q: "Ordena de más antiguo a más moderno", i: ["Velázquez", "Goya", "Picasso", "Banksy"] },
      { q: "Ordena de más antigua a más moderna", i: ["La Odisea", "Don Quijote", "Cien años de soledad", "Harry Potter"] },
      { q: "Ordena de más antiguo a más moderno", i: ["Bach", "Mozart", "Beethoven", "Debussy"] }
    ]
  },
  cien: {
    mc: [
      { q: "¿Cuál es el símbolo químico del oro?", o: ["Au", "Ag", "Or", "Go"], a: 0 },
      { q: "¿Cuál es el planeta más grande del sistema solar?", o: ["Júpiter", "Saturno", "Neptuno", "Tierra"], a: 0 },
      { q: "¿Cuántos huesos tiene un adulto aproximadamente?", o: ["206", "180", "250", "312"], a: 0 },
      { q: "¿Qué gas absorben las plantas para hacer la fotosíntesis?", o: ["Dióxido de carbono", "Oxígeno", "Nitrógeno", "Hidrógeno"], a: 0 },
      { q: "¿Cuál es el animal terrestre más rápido?", o: ["Guepardo", "León", "Gacela", "Caballo"], a: 0 },
      { q: "¿Cuál es el órgano más grande del cuerpo humano?", o: ["La piel", "El hígado", "Los pulmones", "El intestino"], a: 0 },
      { q: "¿Qué planeta es conocido como el planeta rojo?", o: ["Marte", "Venus", "Mercurio", "Júpiter"], a: 0 },
      { q: "¿Cuántas patas tiene una araña?", o: ["8", "6", "10", "12"], a: 0 },
      { q: "¿A qué temperatura hierve el agua a nivel del mar?", o: ["100 °C", "90 °C", "120 °C", "80 °C"], a: 0 },
      { q: "¿Quién formuló la teoría de la relatividad?", o: ["Einstein", "Newton", "Galileo", "Hawking"], a: 0 },
      { q: "¿Qué mamífero puede volar?", o: ["El murciélago", "La ardilla voladora", "El pingüino", "El colibrí"], a: 0 },
      { q: "¿Cuál es el elemento más abundante en el universo?", o: ["Hidrógeno", "Oxígeno", "Carbono", "Helio"], a: 0 },
      { q: "¿Qué científica ganó dos premios Nobel en ciencias distintas?", o: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Jane Goodall"], a: 0 },
      { q: "¿Cuántos corazones tiene un pulpo?", o: ["3", "1", "2", "4"], a: 0 },
      { q: "¿Qué tipo de sangre se considera donante universal?", o: ["0 negativo", "AB positivo", "A positivo", "B negativo"], a: 0 }
    ],
    tf: [
      { q: "Los tiburones son mamíferos.", a: false },
      { q: "La luz del Sol tarda unos 8 minutos en llegar a la Tierra.", a: true },
      { q: "Los plátanos son ligeramente radiactivos.", a: true },
      { q: "La Gran Muralla china se ve a simple vista desde la Luna.", a: false },
      { q: "Venus gira en sentido contrario a la mayoría de planetas.", a: true },
      { q: "Los humanos solo usamos el 10 % del cerebro.", a: false },
      { q: "El diamante y el grafito están hechos del mismo elemento.", a: true },
      { q: "Los murciélagos son ciegos.", a: false },
      { q: "Los pulpos tienen sangre azul.", a: true },
      { q: "El sonido viaja más rápido en el aire que en el agua.", a: false }
    ],
    num: [
      { q: "¿Cuántos elementos tiene la tabla periódica?", a: 118, u: "elementos" },
      { q: "¿A cuántos grados bajo cero está el cero absoluto, en °C (sin el signo)?", a: 273, u: "°C" },
      { q: "¿Cuántos dientes tiene un adulto con la dentición completa?", a: 32, u: "dientes" },
      { q: "¿A cuántos kilómetros por segundo viaja la luz, aproximadamente?", a: 300000, u: "km/s" },
      { q: "¿Cuántos kilómetros mide el radio de la Tierra, aproximadamente?", a: 6371, u: "km" }
    ],
    ord: [
      { q: "Ordena de más cerca a más lejos del Sol", i: ["Mercurio", "Tierra", "Júpiter", "Neptuno"] },
      { q: "Ordena de más pequeño a más grande", i: ["Átomo", "Célula", "Hormiga", "Ballena azul"] },
      { q: "Ordena de más ligero a más pesado (por átomo)", i: ["Hidrógeno", "Carbono", "Hierro", "Oro"] }
    ]
  },
  dep: {
    mc: [
      { q: "¿Cuántos jugadores tiene un equipo de fútbol en el campo?", o: ["11", "10", "9", "12"], a: 0 },
      { q: "¿En qué deporte destaca Rafa Nadal?", o: ["Tenis", "Pádel", "Golf", "Baloncesto"], a: 0 },
      { q: "¿Qué país ganó el Mundial de fútbol de 2010?", o: ["España", "Países Bajos", "Alemania", "Brasil"], a: 0 },
      { q: "¿Cada cuántos años se celebran los Juegos Olímpicos de verano?", o: ["4", "2", "3", "5"], a: 0 },
      { q: "¿En qué deporte se usa un «puck»?", o: ["Hockey sobre hielo", "Curling", "Polo", "Críquet"], a: 0 },
      { q: "¿Cuántos puntos vale un triple en baloncesto?", o: ["3", "2", "4", "1"], a: 0 },
      { q: "¿Qué piloto español fue campeón de Fórmula 1 en 2005 y 2006?", o: ["Fernando Alonso", "Carlos Sainz", "Pedro de la Rosa", "Marc Gené"], a: 0 },
      { q: "¿En qué torneo de tenis se juega sobre hierba en Londres?", o: ["Wimbledon", "Roland Garros", "US Open", "Open de Australia"], a: 0 },
      { q: "¿Cuántos anillos tiene la bandera olímpica?", o: ["5", "4", "6", "7"], a: 0 },
      { q: "¿Qué ciclista español ganó cinco Tours de Francia seguidos?", o: ["Miguel Induráin", "Alberto Contador", "Pedro Delgado", "Carlos Sastre"], a: 0 },
      { q: "¿En qué país nació el judo?", o: ["Japón", "China", "Corea del Sur", "Tailandia"], a: 0 },
      { q: "¿Cuánto dura un partido de fútbol sin prórroga?", o: ["90 minutos", "80 minutos", "100 minutos", "120 minutos"], a: 0 },
      { q: "¿Qué jugador es conocido como «La Pulga»?", o: ["Messi", "Iniesta", "Neymar", "Maradona"], a: 0 },
      { q: "¿En qué deporte se hace un «strike»?", o: ["Bolos", "Golf", "Billar", "Dardos"], a: 0 },
      { q: "¿Qué selección ha ganado más Mundiales de fútbol?", o: ["Brasil", "Alemania", "Italia", "Argentina"], a: 0 }
    ],
    tf: [
      { q: "Un partido de tenis puede terminar en empate.", a: false },
      { q: "El maratón olímpico mide algo más de 42 km.", a: true },
      { q: "En el voleibol cada equipo tiene 6 jugadores en pista.", a: true },
      { q: "Se ha jugado al golf en la Luna.", a: true },
      { q: "Michael Jordan jugó al béisbol profesional.", a: true },
      { q: "En el rugby se puede pasar el balón con la mano hacia delante.", a: false },
      { q: "Pau Gasol ganó anillos de la NBA con los Lakers.", a: true },
      { q: "El ajedrez es deporte olímpico.", a: false },
      { q: "El Real Madrid ha ganado más de 10 Copas de Europa.", a: true },
      { q: "Una portería de fútbol mide 10 metros de ancho.", a: false }
    ],
    num: [
      { q: "¿Cuántos Grand Slam ganó Rafa Nadal en Roland Garros?", a: 14, u: "títulos" },
      { q: "¿Cuántos metros mide una piscina olímpica?", a: 50, u: "m" },
      { q: "¿Cuántos segundos tardó Usain Bolt en su récord de 100 m? (con decimales)", a: 9.58, u: "s" },
      { q: "¿En qué año se celebró el Mundial de fútbol en España?", a: 1982, u: "año" },
      { q: "¿Cuántos kilómetros mide un maratón? (con decimales)", a: 42.195, u: "km" }
    ],
    ord: [
      { q: "Ordena de menos a más jugadores por equipo en el campo", i: ["Tenis (individual)", "Baloncesto", "Voleibol", "Fútbol"] },
      { q: "Ordena por año del Mundial, del más antiguo al más reciente", i: ["España 82", "Francia 98", "Sudáfrica 2010", "Catar 2022"] },
      { q: "Ordena de distancia más corta a más larga", i: ["100 metros", "1 milla", "10 000 metros", "Maratón"] }
    ]
  }
};
