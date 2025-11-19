// Cliente de API sencillo. Ajusta VITE_API_BASE_URL en `.env` si es necesario.
const CONTENIDO_BASE = 'http://localhost:8081'
const USUARIOS_BASE = 'http://localhost:8082'

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
    const message = (data && data.message) || (data && data.error) || res.statusText || 'Error de red'
    throw new Error(message)
  }
  return data
}

export default {
  async getUserTypes() {
    return http('/api/user-types')
  },

  async registerUser(formData) {
    return http('/api/users/register', {
      method: 'POST',
      body: formData,
    })
  },

  async loginUser(credentials) {
    return http('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
  },

  async getNoticias() {
    return http(CONTENIDO_BASE, '/noticias')
  },

  async getNoticia(id) {
    return http(CONTENIDO_BASE, '/noticias/' + id)
  },

  async getUsuario(id) {
    return http(USUARIOS_BASE, '/usuarios/' + id)
  },

  async getGeneros() {
    return http(CONTENIDO_BASE, '/generos')
  },

  async getUsuarios() {
    return http(USUARIOS_BASE, '/usuarios?q=a')
  },

  async crearAlbum(albumData) {
    return http(CONTENIDO_BASE, '/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumData)
    })
  },

  async crearCancion(cancionData) {
    return http(CONTENIDO_BASE, '/canciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cancionData)
    })
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
