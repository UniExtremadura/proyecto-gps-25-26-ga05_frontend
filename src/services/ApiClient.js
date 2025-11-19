// Cliente de API sencillo para microservicios "Contenido" y "Usuarios".
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
    return http(USUARIOS_BASE, '/usuarios/' + id)
	},

	async getUsuarios() {
		return http(USUARIOS_BASE, '/usuarios')
	},

	async getArtistas() {
		// Obtener usuarios de tipo artista (tipo=2) del microservicio de usuarios
		return http(USUARIOS_BASE, '/usuarios?tipo=2')
	}
}
