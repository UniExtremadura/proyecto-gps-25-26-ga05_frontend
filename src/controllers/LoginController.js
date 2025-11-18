import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class LoginController extends EventEmitter {
  constructor(view) {
    super()
    this.view = view

    this.view.on('submit', (data) => this.handleSubmit(data))
    this.view.on('goRegister', () => this.emit('goRegister'))
  }

  async handleSubmit({ email = '', password = '', remember = '0' }) {
    const errors = []
    const emailOk = /^(?:[A-Z0-9._%+-]+)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i.test(email)
    if (!emailOk) errors.push('El email no es válido.')
    if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres.')

    if (errors.length) {
      this.view.showErrors(errors)
      return
    }

    try {
      const result = await ApiClient.loginUser({ email, password, remember: remember === '1' })
      // Aquí podrías guardar token/cookie según lo que devuelva el backend
      this.view.showSuccess('¡Bienvenido!')
      this.emit('loggedIn', result)
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo iniciar sesión'])
    }
  }
}
