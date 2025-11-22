import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AdminUsersModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      usuarios: [],
      loading: false,
      error: null,
      query: ''
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async buscar(q) {
    try {
      this.state = { ...this.state, loading: true, error: null, query: String(q) }
      this.emit('change', this.getState())

      const usuarios = await ApiClient.searchUsers(q)

      const preparados = (usuarios || []).map(u => ({
        ...u,
        imagenUrl: u.urlImagen || u.url || '',
        descripcionCorta: (u.descripcion || '').substring(0, 120)
      }))

      this.state = { ...this.state, usuarios: preparados, loading: false }
      this.emit('change', this.getState())
    } catch (err) {
      this.state = { ...this.state, loading: false, error: err.message || String(err) }
      this.emit('change', this.getState())
    }
  }
}
