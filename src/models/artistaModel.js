// src/models/artistaModel.js
// Consumo del microservicio de usuarios
// Los usuarios con tipo=2 son artistas

import ApiClient from '../services/ApiClient.js'

/**
 * Obtiene los detalles completos de un usuario por su ID
 * Consume el endpoint del microservicio de usuarios
 * @param {number|string} id - ID del usuario
 * @returns {Promise<Object|null>} Datos del usuario o null si no se encuentra
 */
export async function obtenerUsuarioPorId(id) {
	try {
		const data = await ApiClient.getUsuario(id)
		// Si el usuario existe y es artista, intentar obtener información pública adicional
		// desde el endpoint /artistas/:idArtista (contendrá discografía, enlaces, imagen, biografía pública)
		if (data && data.tipo === 2) {
			try {
				const artistPublic = await ApiClient.getArtist(id)
				// El backend devuelve 'discografia' (según contrato). Normalizamos a 'albumes'
				if (artistPublic) {
					// Normalizar posible id de comunidad en los datos de usuario
					if (!data.comunidadId) {
						data.comunidadId = artistPublic.comunidadId ?? artistPublic.idComunidad ?? artistPublic.communityId ?? artistPublic.idCommunity ?? null
						// Si sigue sin comunidadId, tal vez la comunidad usa el mismo id que el artista
						if (!data.comunidadId && (artistPublic.id || artistPublic.Id)) data.comunidadId = artistPublic.id || artistPublic.Id
					}
					if (Array.isArray(artistPublic.discografia)) {
						data.albumes = artistPublic.discografia
					} else if (Array.isArray(artistPublic.albums)) {
						data.albumes = artistPublic.albums
					}
					// Evitar cargar imágenes embebidas (byte[]/base64) dentro del objeto del usuario
					// En su lugar, construir una URL que apunte al endpoint de contenido que sirve
					// la imagen: ApiClient.getAlbumImageUrl(album.id)
					if (Array.isArray(data.albumes)) {
						try {
							// Usar ApiClient importado arriba para construir las URLs de portada
							data.albumes = data.albumes.map(album => {
								if (!album) return album
								const albId = album.id !== undefined ? album.id : (album.Id !== undefined ? album.Id : null)
								if (albId !== null) {
									// Evitar mantener campo grande `imagen` en memoria
									if (album.imagen) delete album.imagen
									album.portada = ApiClient.getAlbumImageUrl(albId)
								}
								return album
							})

							// Además, obtener canciones de cada álbum y agruparlas en data.canciones
							try {
								const detalles = await Promise.all(data.albumes.map(async a => {
									const id = a && (a.id !== undefined ? a.id : (a.Id !== undefined ? a.Id : null))
									if (id == null) return null
									try {
										const detalle = await ApiClient.getAlbumDetalle(id)
										return { album: a, detalle }
									} catch (err) {
										console.warn('Error al obtener detalle de album', id, err)
										return null
									}
								}))

								// Flatten canciones y mapear al formato esperado por la vista
								const canciones = []
								detalles.forEach(d => {
									if (!d || !d.detalle) return
									const albumObj = d.album || {}
									const det = d.detalle
									const list = Array.isArray(det.canciones) ? det.canciones : (Array.isArray(det.Canciones) ? det.Canciones : [])
									list.forEach(c => {
										const cid = c.id !== undefined ? c.id : (c.Id !== undefined ? c.Id : null)
										const nombre = c.nombre || c.Nombre || c.titulo || c.Titulo || ''
										const dur = c.duracion || c.Duracion || c.Duracion || ''
										canciones.push({
											id: cid,
											titulo: nombre,
											duracion: dur,
											portada: albumObj.portada || ApiClient.getAlbumImageUrl(albumObj.id || albumObj.Id)
										})
									})
								})

								if (canciones.length) {
									// Si no existen canciones ya en el usuario, asignarlas; si existen, mantener las existentes
									if (!Array.isArray(data.canciones) || data.canciones.length === 0) {
										data.canciones = canciones
									} else {
										// Merge simple: anteponer nuevas canciones
										data.canciones = [...canciones, ...data.canciones]
									}
								}
							} catch (err) {
								console.warn('Error agrupando canciones de álbumes:', err)
							}
						} catch (e) {
							console.warn('No se pudo construir URL de portada para álbumes:', e)
						}
					}
					// Mezclar campos públicos si no están presentes en el objeto usuario
					if (!data.descripcion && artistPublic.biografia) data.descripcion = artistPublic.biografia
					if (!data.urlImagen && artistPublic.imagen) data.urlImagen = artistPublic.imagen
					if (artistPublic.enlaces) data.enlaces = artistPublic.enlaces

					// Obtener merchandising asociado al artista (filtrado por campo 'artista' o 'artistaId')
					try {
						const allMerchs = await ApiClient.getMerchs()
						if (Array.isArray(allMerchs)) {
							const merchsForArtist = allMerchs.filter(m => {
								if (!m) return false
								const a = m.artista ?? m.artistaId ?? m.idArtista ?? m.ownerId ?? m.owner ?? null
								// comparar como número o string
								return a != null && String(a) === String(id)
							})
							// Normalizar y construir `portada` o `imagenUrl` similar a MerchModel
							const procesados = merchsForArtist.map(m => {
								let imagenUrl = ''
								try {
									if (m && m.imagen) {
										if (typeof m.imagen === 'string' && m.imagen.startsWith('data:')) {
											imagenUrl = m.imagen
										} else if (typeof m.imagen === 'string') {
											imagenUrl = 'data:image/png;base64,' + m.imagen
										} else if (Array.isArray(m.imagen) || (m.imagen && typeof m.imagen === 'object' && typeof m.imagen.length === 'number')) {
										const bytes = Uint8Array.from(m.imagen)
										let binary = ''
										const chunkSize = 0x8000
										for (let i = 0; i < bytes.length; i += chunkSize) {
											binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
										}
										imagenUrl = 'data:image/png;base64,' + btoa(binary)
										}
									}
								} catch (err) {
									console.warn('Error procesando imagen de merch para artista:', err)
								}
								return {
									...m,
									portada: imagenUrl || m.portada || m.urlImagen || '',
									nombre: m.nombre || m.titulo || m.title || '',
									precio: m.precio,
									id: m.id || m.Id || m.merchId || null
								}
							})
							if (procesados.length) {
								data.productos = procesados
							}
						}
					} catch (err) {
						console.warn('No se pudieron obtener productos de merchandising:', err)
					}
				}
			} catch (err) {
				console.warn('No se pudo obtener info pública de artista:', err)
			}
		}
		return data
	} catch (error) {
		console.error('Error al obtener usuario:', error)
		return null
	}
}

/**
 * Obtiene todos los artistas (usuarios con tipo=2)
 * @returns {Promise<Array>} Lista de artistas
 */
export async function obtenerTodosArtistas() {
	try {
		const data = await ApiClient.getArtistas()
		return data
	} catch (error) {
		console.error('Error al obtener artistas:', error)
		return []
	}
}

/**
 * Verifica si un usuario es artista (tipo=2)
 * @param {Object} usuario - Objeto usuario
 * @returns {boolean} true si el usuario es artista
 */
export function esArtista(usuario) {
	return usuario && usuario.tipo === 2
}

