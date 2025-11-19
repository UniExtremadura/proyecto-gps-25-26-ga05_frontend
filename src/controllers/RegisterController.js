// Controlador de registro: valida datos y notifica resultado
import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class RegisterController extends EventEmitter {
  constructor(view, model) {
    super()
    this.view = view
    this.model = model // provee tipos de usuario

    this.view.on('submit', (formData) => this.handleSubmit(formData))

    if (this.model) {
      // Cargar tipos de usuario y reflejar en la vista
      this.model.on('userTypesLoaded', (types) => this.view.setUserTypes(types))
      this.model.on('error', (msg) => this.view.showErrors([msg]))
      this.model.loadUserTypes()
    }
  }

  async handleSubmit(formData) {
    const errors = []
    // Extraer datos para validaciones básicas
    const name = (formData.get('name') || '').toString().trim()
    const email = (formData.get('email') || '').toString().trim()
    const userTypeId = (formData.get('userTypeId') || '').toString().trim()
    const phone = (formData.get('phone') || '').toString().trim()
    const address = (formData.get('address') || '').toString().trim()
    const description = (formData.get('description') || '').toString()
    const password = (formData.get('password') || '').toString()
    const confirm = (formData.get('confirm') || '').toString()

    if (!name) errors.push('El nombre es obligatorio.')
    const emailOk = /^(?:[A-Z0-9._%+-]+)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i.test(email)
    if (!emailOk) errors.push('El email no es válido.')
    if (!userTypeId) errors.push('Selecciona un tipo de usuario.')
    if (!phone) errors.push('El teléfono es obligatorio.')
    if (!address) errors.push('La dirección es obligatoria.')
    if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm) errors.push('Las contraseñas no coinciden.')

    // La imagen de perfil ya no se solicita; se usará un icono por defecto.

    if (errors.length) {
      this.view.showErrors(errors)
      return
    }

    try {
      // Llamada al microservicio de usuarios (JSON)
      const result = await ApiClient.registerUser(formData)
      // Guardar token e información básica si el backend lo devuelve tras registro
      if (result && result.token) {
        try {
          localStorage.setItem('authToken', result.token)
          const userPayload = { id: result.id, nombre: result.nombre, correo: result.correo, tipo: result.tipo }
          localStorage.setItem('authUser', JSON.stringify(userPayload))
          // Eliminamos cualquier resto previo de authUserId
          try { localStorage.removeItem('authUserId') } catch {}
        } catch {}
      }
      this.view.showSuccess('¡Tu cuenta ha sido creada!')
      this.view.resetForm()
      this.emit('registered', { name, email, userTypeId, phone, address, description })
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo registrar el usuario'])
    }
  }
}
