// Cliente de API sencillo. Ajusta VITE_API_BASE_URL en `.env` si es necesario.
const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

async function http(url, opts = {}) {
  const res = await fetch(BASE + url, opts)
  const contentType = res.headers.get('content-type') || ''
  let data = null
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null)
  } else {
    data = await res.text().catch(() => null)
  }
  if (!res.ok) {
    const message = (data && data.message) || res.statusText || 'Error de red'
    throw new Error(message)
  }
  return data
}

export default {
  async getUserTypes() {
    // Esperado: [{ id: 1, name: 'Cliente' }, { id: 2, name: 'Vendedor' }, ...]
    return http('/api/user-types')
  },

  async registerUser(formData) {
    // formData: instancia de FormData con todos los campos e imagen
    return http('/api/users/register', {
      method: 'POST',
      body: formData, // fetch pone Content-Type multipart automáticamente
    })
  },

  async loginUser(credentials) {
    // credentials: { email, password, remember?: boolean }
    return http('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      // Añade 'credentials: "include"' si el backend usa cookies de sesión
    })
  },
}
