import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumDetailController extends EventEmitter {
  constructor(model, view, albumId) {
    super()
    this.model = model
    this.view = view
    this.albumId = albumId
    this.currentPlayingSong = null

    this.model.on('change', (state) => {
      this.view.render(state)
    })

    this.model.on('reproducirCancion', (cancionId) => {
      this.reproducirCancion(cancionId)
    })

    this.view.on('reproducirCancion', (cancionId) => {
      this.reproducirCancion(cancionId)
    })

    this.view.on('reintentar', () => {
      this.model.cargarAlbumDetalle(this.albumId)
    })

    this._inicializar()
  }

  async _inicializar() {
    await this.model.cargarAlbumDetalle(this.albumId)
  }

  async reproducirCancion(cancionId) {
    try {
      // Si ya está reproduciendo esta canción, pausarla
      if (this.currentPlayingSong === cancionId) {
        this.view.pausarCancion()
        this.currentPlayingSong = null
        return
      }

      // Obtener URL del archivo de audio
	  const audioUrl = ApiClient.getCancionAudioUrl(cancionId)

	  console.log('Intentando reproducir:', audioUrl)
      
      // Reproducir la canción
      this.view.reproducirCancion(cancionId, audioUrl)
      this.currentPlayingSong = cancionId

    } catch (error) {
      console.error('Error al reproducir canción:', error)
    }
  }

  destroy() {
    // Limpiar recursos si es necesario
    this.view.pausarCancion()
  }
}
