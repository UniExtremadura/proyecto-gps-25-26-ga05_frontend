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
    const avatar = formData.get('avatar')

    if (!name) errors.push('El nombre es obligatorio.')
    const emailOk = /^(?:[A-Z0-9._%+-]+)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i.test(email)
    if (!emailOk) errors.push('El email no es válido.')
    if (!userTypeId) errors.push('Selecciona un tipo de usuario.')
    if (!phone) errors.push('El teléfono es obligatorio.')
    if (!address) errors.push('La dirección es obligatoria.')
    if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm) errors.push('Las contraseñas no coinciden.')

    if (avatar && avatar.size) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (avatar.size > maxSize) errors.push('La imagen debe pesar menos de 5MB.')
      const typeOk = /^image\//.test(avatar.type)
      if (!typeOk) errors.push('El archivo debe ser una imagen válida.')
    }

    if (errors.length) {
      this.view.showErrors(errors)
      return
    }

    try {
      // Llamada real a backend (multipart)
      await ApiClient.registerUser(formData)
      this.view.showSuccess('¡Tu cuenta ha sido creada!')
      this.view.resetForm()
      this.emit('registered', { name, email, userTypeId, phone, address, description })
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo registrar el usuario'])
    }
  }
}
