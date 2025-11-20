import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class UploadNoticiaModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      loading: false,
      error: null,
      success: false,
      successMessage: '',
      noticiaCreada: null,
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async crearNoticia(noticiaData) {
    try {
      this.state = { ...this.state, loading: true, error: null, success: false, successMessage: '' }
      this.emit('change', this.getState())

      const creada = await ApiClient.crearNoticia(noticiaData)

      this.state = {
        ...this.state,
        loading: false,
        success: true,
        successMessage: '¡Noticia creada correctamente!',
        noticiaCreada: creada || null,
        error: null,
      }
      this.emit('change', this.getState())
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        success: false,
        successMessage: '',
        error: error.message || 'Error al crear la noticia',
      }
      this.emit('change', this.getState())
    }
  }

  limpiarEstado() {
    this.state = {
      loading: false,
      error: null,
      success: false,
      successMessage: '',
      noticiaCreada: null,
    }
    this.emit('change', this.getState())
  }
}
