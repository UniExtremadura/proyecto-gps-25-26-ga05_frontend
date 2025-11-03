// src/models/artistaModel.js
// Datos de ejemplo (temporal) para la vista de perfil del artista

export async function obtenerArtistaPorId(id) {
	// Simulación temporal de datos
	const artistas = [
		{
			id: 1,
			nombre: "Yung Beef",
			bio: "Artista granadino pionero del trap español. Ampliamente reconocido por su estilo underground y su discografía diversa.",
			imagen: "/assets/img/yungbeef.jpg",
			oyentesMensuales: 420000,
			comunidadUrl: "https://community.example.com/yungbeef",
			enlaces: {
				instagram: "https://instagram.com/yungbeef",
				spotify: "https://open.spotify.com/artist/12345",
				twitter: "https://twitter.com/yungbeef",
				facebook: "https://facebook.com/yungbeef",
        tiktok:""
			},
			populares: [
				{ tipo: "cancion", titulo: "Canción más famosa", duracion: "3:12", portada: "/assets/img/song1.jpg" },
				{ tipo: "album", titulo: "Álbum más vendido", anio: 2021, portada: "/assets/img/album1.jpg" }
			],
			canciones: [
				{ id: 101, titulo: "Tema A", duracion: "3:12", portada: "/assets/img/song1.jpg", enlaces: { spotify: "#" } },
				{ id: 102, titulo: "Tema B", duracion: "2:58", portada: "/assets/img/song2.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
        { id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } },
				{ id: 103, titulo: "Tema C", duracion: "4:01", portada: "/assets/img/song3.jpg", enlaces: { spotify: "#" } }


			],
			albumes: [
				{ id: 201, titulo: "ADROMICFMS 5", anio: 2023, portada: "/assets/img/adromicfms5.jpg" },
				{ id: 202, titulo: "Perreo de la Muerte", anio: 2021, portada: "/assets/img/perreo.jpg" }
			],
			productos: [
				{ id: 301, nombre: "Camiseta tour", precio: 25, imagen: "/assets/img/camiseta.jpg", enlaceCompra: "#" },
				{ id: 302, nombre: "Vinilo edición limitada", precio: 40, imagen: "/assets/img/vinilo.jpg", enlaceCompra: "#" }
			]
		},
		{
			id: 2,
			nombre: "Artista Demo",
			bio: "Biografía corta del artista demo para pruebas.",
			imagen: "/assets/img/default-artist.jpg",
			oyentesMensuales: 12000,
			comunidadUrl: "#",
			enlaces: { instagram: "#", spotify: "#" },
			populares: [],
			canciones: [],
			albumes: [],
			productos: []
		}
	];

	return artistas.find(a => a.id === parseInt(id, 10)) ?? null;
}

// Export adicional: obtener todos (útil para listados o pruebas)
export async function obtenerTodosArtistas() {
	// En esta fase devolvemos un subset simple
	return [
		{ id: 1, nombre: "Yung Beef", imagen: "/assets/img/yungbeef.jpg" },
		{ id: 2, nombre: "Artista Demo", imagen: "/assets/img/default-artist.jpg" }
	];
}

