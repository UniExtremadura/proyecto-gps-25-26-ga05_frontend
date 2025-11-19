// Cliente de API sencillo para microservicios "Contenido" y "Usuarios".
const CONTENIDO_BASE = 'http://localhost:8081'
const USUARIOS_BASE = 'http://localhost:8082'

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

  // Comunidad de artista
  async getCommunityPosts(idComunidad) {
    return http(USUARIOS_BASE, `/comunidades/${idComunidad}/posts`, withAuth())
  },

  async crearAlbum(albumData) {
    return http(CONTENIDO_BASE, '/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumData)
    })
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
    return http(CONTENIDO_BASE, '/canciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cancionData)
    })
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
  }
  ,

  // Comunidad info (para conocer propietario/artista)
  async getCommunity(idComunidad) {
    return http(USUARIOS_BASE, `/comunidades/${idComunidad}`, withAuth())
  }
  ,
  // Información pública del artista
  async getArtist(idArtista) {
    return http(USUARIOS_BASE, `/artistas/${idArtista}`, withAuth())
	
  // Función auxiliar para convertir File a ArrayBuffer (bytes)
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => resolve(new Uint8Array(reader.result))
      reader.onerror = error => reject(error)
    })
  }
}
