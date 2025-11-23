import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class RegisterModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      userTypes: [],
      loadingUserTypes: false,
      error: null,
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async loadUserTypes() {
    try {
      this._set({ loadingUserTypes: true, error: null })
      const types = await ApiClient.getUserTypes()
      this._set({ userTypes: Array.isArray(types) ? types : [], loadingUserTypes: false })
      this.emit('userTypesLoaded', this.getState().userTypes)
    } catch (err) {
      this._set({ error: err.message || 'No se pudieron cargar los tipos de usuario', loadingUserTypes: false })
      this.emit('error', this.state.error)
    }
  }

  _set(partial) {
    this.state = { ...this.state, ...partial }
    this.emit('change', this.getState())
  }
}
