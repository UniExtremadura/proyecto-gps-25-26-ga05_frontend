import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumDetailModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      album: null,
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarAlbumDetalle(albumId) {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())

      const album = await ApiClient.getAlbumDetalle(albumId)
      
      this.state = {
        ...this.state,
        album: album,
        loading: false
      }
      
      this.emit('change', this.getState())
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error.message
      }
      this.emit('change', this.getState())
    }
  }

  async reproducirCancion(cancionId) {
    try {
      // Esta función podría manejar la lógica de reproducción
      // Por ahora solo emitimos el evento
      this.emit('reproducirCancion', cancionId)
    } catch (error) {
      console.error('Error al reproducir canción:', error)
    }
  }
}
