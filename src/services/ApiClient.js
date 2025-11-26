// Cliente de API sencillo para microservicios "Contenido" y "Usuarios".
const CONTENIDO_BASE = 'http://localhost:8081'
const USUARIOS_BASE = 'http://localhost:8082'
const ESTADISTICAS_BASE = 'http://localhost:8083'

function getAuthToken() {
  try {
    return localStorage.getItem('authToken') || ''
  } catch {
    return ''
  }
}

function withAuth(opts = {}) {
  const token = getAuthToken()
  if (!token) return opts
  const headers = new Headers(opts.headers || {})
  if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  return { ...opts, headers }
}

async function http(base, url, opts = {}) {
  const res = await fetch(base + url, opts)
  const contentType = res.headers.get('content-type') || ''
  let data = null
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null)
  } else {
    data = await res.text().catch(() => null)
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || res.statusText || 'Error de red'
    throw new Error(message)
  }
  return data
}

export default {
  async getUserTypes() {
    // Tipos soportados por el microservicio de usuarios
    // 2 => Artista, 4 => Usuario básico
    return [
      { id: 4, name: 'Usuario' },
      { id: 2, name: 'Artista' },
    ]
  },

  async registerUser(formData) {
    // formData: instancia de FormData con campos del formulario de registro
    // Mapear a contrato del microservicio (JSON, no multipart)
    const nombre = (formData.get('name') || '').toString().trim()
    const correo = (formData.get('email') || '').toString().trim()
    const contrasena = (formData.get('password') || '').toString()
    const direccion = (formData.get('address') || '').toString().trim()
    const telefono = (formData.get('phone') || '').toString().trim()
    const descripcion = (formData.get('description') || '').toString()
    // El backend espera una URL de imagen, por ahora enviamos vacío si subieron archivo local
    const urlImagen = ''
    let tipo = parseInt((formData.get('userTypeId') || '4').toString(), 10)
    if (tipo !== 2 && tipo !== 4) tipo = 4

    const body = {
      nombre,
      correo,
      contrasena,
      direccion,
      telefono,
      descripcion,
      urlImagen,
      tipo,
    }

    return http(USUARIOS_BASE, '/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },

  async loginUser(credentials) {
    // credentials: { email, password, remember?: boolean }
    const body = {
      correo: credentials.email,
      contrasena: credentials.password,
    }
    // El microservicio usa POST /usuarios para login si solo hay correo y contrasena
    return http(USUARIOS_BASE, '/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },

  async getNoticias() {
    return http(CONTENIDO_BASE, '/noticias')
  },

  async getNoticia(id) {
    return http(CONTENIDO_BASE, '/noticias/' + id)
  },

  async getUsuario(id) {
    return http(USUARIOS_BASE, '/usuarios/' + id, withAuth())
  },

  async getGeneros() {
    return http(CONTENIDO_BASE, '/generos')
  },

	async getUsuarios() {
		return http(USUARIOS_BASE, '/usuarios')
	},

  async crearAlbum(albumData) {
    return http(CONTENIDO_BASE, '/albums', withAuth({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumData)
    }))
  },

  async createCommunityPost(idComunidad, { comentario, postPadre = null, idUsuario }) {
    const payload = { comentario, idUsuario }
    if (postPadre !== null && postPadre !== undefined) payload.postPadre = postPadre
    return http(USUARIOS_BASE, `/comunidades/${idComunidad}/posts`, withAuth({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }))
  },

  async crearCancion(cancionData) {
    return http(CONTENIDO_BASE, '/canciones', withAuth({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cancionData)
    }))
  },

  async crearNoticia(noticiaData) {
    // noticiaData: { titulo, contenidoHTML, fecha: 'YYYY-MM-DD', autor }
    return http(CONTENIDO_BASE, '/noticias', withAuth({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticiaData)
    }))
  },

  async deleteNoticia(id) {
    return http(CONTENIDO_BASE, `/noticias/${id}`, withAuth({ method: 'DELETE' }))
  },
	
  async deleteCommunityPost(idPost) {
    return http(USUARIOS_BASE, `/posts/${idPost}`, withAuth({ method: 'DELETE' }))
  },

  // Función auxiliar para convertir File a Base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remover el prefijo "data:image/...;base64," para obtener solo los datos base64
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  },
	
  async getPost(idPost) {
    return http(USUARIOS_BASE, `/posts/${idPost}`, withAuth())
  },

  async getPostReplies(idPost) {
    return http(USUARIOS_BASE, `/posts/${idPost}/respuestas`, withAuth())
  },

  // Comunidad info (para conocer propietario/artista)
  async getCommunity(idComunidad) {
    return http(USUARIOS_BASE, `/comunidades/${idComunidad}`, withAuth())
  },

  async getCommunityPosts(idComunidad) {
    return http(USUARIOS_BASE, `/comunidades/${idComunidad}/posts`, withAuth())
  },
  
  // Información pública del artista
  async getArtist(idArtista) {
    return http(USUARIOS_BASE, `/artistas/${idArtista}`, withAuth())
  },

  async getHistorialCompras(usuarioId) {
    return http(ESTADISTICAS_BASE, `/usuarios/${usuarioId}/historialCompras`, withAuth())
  },

  async getAlbum(id) {
    const res = await http(CONTENIDO_BASE, `/albums/${id}`, withAuth())
    return res?.album || null
  },

  async getMerchs() {
    // Lista todos los productos de merchandising
    const res = await http(CONTENIDO_BASE, '/merch')
    return res?.merch || res
  },

  async getMerch(id) {
    const res = await http(CONTENIDO_BASE, `/merch/${id}`, withAuth())
    return res?.merch || null
  },

  async deleteMerch(id) {
    if (!id) throw new Error('ID de merch requerido')
    return http(CONTENIDO_BASE, `/merch/${id}`, withAuth({ method: 'DELETE' }))
  },
  

  async disminuirStockMerch(id, cantidad = 1) {
    return http(CONTENIDO_BASE, `/merch/${id}/disminuirStockMerch`, withAuth({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    }))
  },
	
  // Función auxiliar para convertir File a ArrayBuffer (bytes)
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => resolve(new Uint8Array(reader.result))
      reader.onerror = error => reject(error)
    })
  },

  async getUsuarios() {
    return http(USUARIOS_BASE, '/usuarios', withAuth())
  },

  async searchUsers(q) {
    if (!q || String(q).trim() === '') {
      throw new Error("Parámetro 'q' es requerido para buscar usuarios")
    }
    const url = `/usuarios?q=${encodeURIComponent(String(q))}`
    return http(USUARIOS_BASE, url, withAuth())
  },
  
  async buscarContenido(url) {
	return http(CONTENIDO_BASE, url)
  },

  async deleteUsuario(id) {
    if (!id) throw new Error('ID de usuario requerido')
    return http(USUARIOS_BASE, `/usuarios/${id}`, withAuth({ method: 'DELETE' }))
  },
  
  async getAlbumDetalle(albumId) {
	return http(CONTENIDO_BASE, `/albums/${albumId}/detalle`)
  },
  
  getAlbumImageUrl(albumId) {
    return `${CONTENIDO_BASE}/albums/${albumId}/imagen`
  },
  
  getCancionAudioUrl(cancionId) {
    return `${CONTENIDO_BASE}/canciones/${cancionId}/archivo`
  },

  async comprarMerch(payload) {
  return http(CONTENIDO_BASE, '/pedido/pago', withAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }))
  },

  async addAlbumFavorito(idUsuario, idAlbum) {
  return http(USUARIOS_BASE,`/usuarios/${idUsuario}/favoritos/albums/${idAlbum}`, withAuth({ method: 'POST' }))
  },

  async removeAlbumFavorito(idUsuario, idAlbum) {
  return http(USUARIOS_BASE,`/usuarios/${idUsuario}/favoritos/albums/${idAlbum}`,withAuth({ method: 'DELETE' }))
  },

  async getFavoritosAlbum(idUsuario) {
  return http(USUARIOS_BASE,`/usuarios/${idUsuario}/favoritos/albums`, withAuth({ method: 'GET' })) 
  },

  async addCancionFavorito(idUsuario, idCancion) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/canciones/${idCancion}`, withAuth({ method: 'POST' }))
  },

  async removeCancionFavorito(idUsuario, idCancion) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/canciones/${idCancion}`, withAuth({ method: 'DELETE' }))
  },

  async getFavoritosCanciones(idUsuario) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/canciones`, withAuth({ method: 'GET' }))
  },

  async addArtistaFavorito(idUsuario, idArtista) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/artistas/${idArtista}`, withAuth({ method: 'POST' }))
  },

  async removeArtistaFavorito(idUsuario, idArtista) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/artistas/${idArtista}`, withAuth({ method: 'DELETE' }))
  },

  async getFavoritosArtistas(idUsuario) {
    return http(USUARIOS_BASE, `/usuarios/${idUsuario}/favoritos/artistas`, withAuth({ method: 'GET' }))
  },

  // ========== ESTADÍSTICAS ==========

  async registrarEscucha(idUsuario, idCancion) {
    return http(ESTADISTICAS_BASE, '/escuchas', withAuth({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idUsuario, 
        idCancion, 
        fecha: new Date().toISOString() 
      })
    }))
  },

  async getEstadisticasUsuario(idUsuario, periodo = 'total') {
    return http(ESTADISTICAS_BASE, `/usuarios/${idUsuario}/estadisticas?periodo=${periodo}`, withAuth())
  },

  async getEstadisticasAlbum(idAlbum) {
    return http(ESTADISTICAS_BASE, `/estadisticas/albumes/${idAlbum}`, withAuth())
  },

  async getEstadisticasCancion(idCancion) {
    return http(ESTADISTICAS_BASE, `/estadisticas/canciones/${idCancion}`, withAuth())
  },

  async getEstadisticasMerchandising(idMerch) {
    return http(ESTADISTICAS_BASE, `/estadisticas/merchandising/${idMerch}`, withAuth())
  },

  async getRankingCanciones(limite = 10, periodo = 'total') {
    return http(ESTADISTICAS_BASE, `/ranking/canciones?limite=${limite}&periodo=${periodo}`)
  }
}
