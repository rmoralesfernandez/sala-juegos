/* Banco de palabras del Impostor: "palabra|parecida". La parecida es la que recibe
   el impostor en el modo «palabra parecida». */
window.IMPOSTOR_PALABRAS = {
  comida: { n: "Comida", e: "🍕", w: [
    "Pizza|Lasaña", "Paella|Risotto", "Tortilla de patatas|Revuelto", "Croqueta|Empanadilla", "Churros|Buñuelos",
    "Gazpacho|Salmorejo", "Hamburguesa|Sándwich", "Sushi|Ceviche", "Helado|Granizado", "Chocolate|Turrón",
    "Jamón|Chorizo", "Queso|Mantequilla", "Patatas fritas|Nachos", "Palomitas|Pipas", "Fresa|Frambuesa",
    "Plátano|Mango", "Café|Té", "Cerveza|Sidra", "Tarta|Bizcocho", "Kebab|Burrito", "Huevo frito|Tortilla francesa",
    "Sopa|Puré", "Macarrones|Espaguetis", "Pulpo a la gallega|Calamares"
  ] },
  animales: { n: "Animales", e: "🦁", w: [
    "Perro|Lobo", "Gato|Lince", "Caballo|Burro", "Vaca|Toro", "Delfín|Tiburón", "Ballena|Orca", "Águila|Halcón",
    "Pingüino|Foca", "Elefante|Rinoceronte", "Jirafa|Cebra", "Mono|Gorila", "Serpiente|Lagarto", "Rana|Sapo",
    "Abeja|Avispa", "Mariposa|Polilla", "Pulpo|Calamar", "Conejo|Hámster", "Oveja|Cabra", "Cocodrilo|Caimán",
    "Búho|Murciélago", "Loro|Canario", "Tortuga|Caracol", "Oso|Mapache", "Hormiga|Cucaracha"
  ] },
  lugares: { n: "Lugares", e: "📍", w: [
    "Playa|Piscina", "Hospital|Farmacia", "Aeropuerto|Estación de tren", "Biblioteca|Librería", "Cine|Teatro",
    "Gimnasio|Polideportivo", "Discoteca|Bar", "Iglesia|Catedral", "Supermercado|Mercado", "Colegio|Universidad",
    "Zoo|Acuario", "Museo|Galería de arte", "Restaurante|Cafetería", "Castillo|Palacio", "Parque de atracciones|Feria",
    "Peluquería|Barbería", "Camping|Albergue", "Oficina|Banco", "Cárcel|Comisaría", "Estadio|Plaza de toros",
    "Spa|Sauna", "Hotel|Casa rural", "Faro|Puerto", "Ascensor|Escalera mecánica"
  ] },
  profesiones: { n: "Profesiones", e: "👩‍🚒", w: [
    "Médico|Enfermero", "Bombero|Policía", "Profesor|Entrenador", "Cocinero|Camarero", "Piloto|Azafato",
    "Abogado|Juez", "Fontanero|Electricista", "Peluquero|Maquillador", "Dentista|Veterinario", "Periodista|Presentador",
    "Arquitecto|Albañil", "Panadero|Pastelero", "Taxista|Conductor de autobús", "Actor|Cantante", "Futbolista|Árbitro",
    "Mecánico|Carpintero", "Granjero|Jardinero", "Astronauta|Científico", "Cartero|Repartidor", "Socorrista|Buzo",
    "Programador|Diseñador", "Payaso|Mago", "Detective|Espía", "Pirata|Marinero"
  ] },
  objetos: { n: "Objetos", e: "🔑", w: [
    "Tenedor|Cuchara", "Paraguas|Chubasquero", "Móvil|Tablet", "Gafas|Lentillas", "Reloj|Pulsera", "Llave|Candado",
    "Almohada|Cojín", "Cepillo de dientes|Peine", "Lámpara|Vela", "Sofá|Sillón", "Espejo|Ventana", "Mochila|Maleta",
    "Tijeras|Cuchillo", "Bolígrafo|Lápiz", "Televisión|Ordenador", "Nevera|Congelador", "Microondas|Horno",
    "Toalla|Sábana", "Cartera|Monedero", "Martillo|Destornillador", "Mando de la tele|Teclado", "Secador|Plancha",
    "Cama|Hamaca", "Taza|Vaso"
  ] },
  deportes: { n: "Deportes", e: "⚽", w: [
    "Fútbol|Rugby", "Baloncesto|Balonmano", "Tenis|Pádel", "Natación|Waterpolo", "Ciclismo|Motociclismo",
    "Boxeo|Kárate", "Golf|Minigolf", "Esquí|Snowboard", "Surf|Windsurf", "Voleibol|Vóley playa", "Ajedrez|Damas",
    "Bolos|Petanca", "Escalada|Senderismo", "Fórmula 1|Rally", "Yoga|Pilates", "Patinaje|Skate", "Béisbol|Críquet",
    "Hockey|Curling", "Maratón|Triatlón", "Billar|Dardos", "Equitación|Polo", "Remo|Piragüismo", "Judo|Lucha libre",
    "Gimnasia|Ballet"
  ] },
  transporte: { n: "Transporte", e: "🚗", w: [
    "Coche|Furgoneta", "Moto|Bicicleta", "Avión|Helicóptero", "Barco|Submarino", "Tren|Metro", "Autobús|Tranvía",
    "Taxi|Limusina", "Patinete|Monopatín", "Globo aerostático|Parapente", "Camión|Tractor",
    "Ambulancia|Coche de bomberos", "Cohete|Ovni", "Velero|Yate", "Teleférico|Telesilla", "Canoa|Kayak",
    "Crucero|Ferry", "Quad|Buggy", "Moto de agua|Lancha", "Caballo|Camello", "Carroza|Trineo"
  ] },
  ropa: { n: "Ropa", e: "👕", w: [
    "Camiseta|Camisa", "Pantalón|Falda", "Zapatillas|Botas", "Sombrero|Gorra", "Bufanda|Corbata", "Calcetines|Medias",
    "Abrigo|Chaqueta", "Pijama|Bata", "Bañador|Bikini", "Vestido|Mono", "Guantes|Manoplas", "Cinturón|Tirantes",
    "Sandalias|Chanclas", "Jersey|Sudadera", "Vaqueros|Mallas", "Traje|Esmoquin", "Gafas de sol|Gafas de bucear",
    "Riñonera|Bolso", "Pendientes|Collar", "Anillo|Pulsera"
  ] },
  fiesta: { n: "Ocio y fiesta", e: "🎉", w: [
    "Boda|Bautizo", "Cumpleaños|Aniversario", "Nochevieja|Navidad", "Carnaval|Halloween", "Karaoke|Concierto",
    "Feria|Verbena", "Despedida de soltero|Fiesta sorpresa", "Barbacoa|Picnic", "Videojuegos|Juegos de mesa",
    "Escape room|Gymkana", "Festival|Discoteca", "Romería|Procesión", "San Fermín|Tomatina", "Fallas|Hogueras de San Juan",
    "Botellón|Terraza", "Reyes Magos|Papá Noel", "Piñata|Globos", "Brindis|Discurso", "Disfraz|Máscara",
    "Bingo|Lotería", "Casino|Tragaperras", "Fuegos artificiales|Petardos"
  ] },
  naturaleza: { n: "Naturaleza", e: "🌋", w: [
    "Río|Lago", "Montaña|Colina", "Bosque|Selva", "Volcán|Géiser", "Cascada|Fuente", "Arcoíris|Aurora boreal",
    "Tormenta|Huracán", "Nieve|Granizo", "Luna|Sol", "Estrella|Planeta", "Cueva|Túnel", "Árbol|Arbusto",
    "Rosa|Tulipán", "Margarita|Girasol", "Playa|Acantilado", "Isla|Península", "Desierto|Oasis", "Niebla|Nube",
    "Rayo|Trueno", "Terremoto|Tsunami", "Piedra|Arena", "Hoja|Flor"
  ] }
};
