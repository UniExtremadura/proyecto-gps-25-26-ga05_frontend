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

