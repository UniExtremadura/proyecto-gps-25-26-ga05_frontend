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
      this.view.render({
        ...state,
        favoritoArtista: state.favoritoArtista
      })
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

    this.view.on('toggleFavoritoCancion', async (cancionId) => {
      await this._toggleFavoritoCancion(cancionId)
    })

    this.view.on('toggleFavoritoArtista', async (artistaId) => {
      await this._toggleFavoritoArtista(artistaId)
    })

    this._inicializar()
  }

  async _inicializar() {
    try {
      await this.model.cargarAlbumDetalle(this.albumId)
      const user = JSON.parse(localStorage.getItem('authUser') || 'null')
      if (!user?.id) return
      await this.model.cargarFavoritos(user.id)
    } catch (error) {
      console.error("Error al inicializar AlbumDetailController:", error)
      this.view.showError && this.view.showError("No se pudo cargar el álbum")
    }
  }

  async reproducirCancion(cancionId) {
    try {
      if (this.currentPlayingSong === cancionId) {
        this.view.pausarCancion()
        this.currentPlayingSong = null
        return
      }

      const audioUrl = ApiClient.getCancionAudioUrl(cancionId)
      this.view.reproducirCancion(cancionId, audioUrl)
      this.currentPlayingSong = cancionId
    } catch (error) {
      console.error('Error al reproducir canción:', error)
    }
  }

  async _toggleFavoritoCancion(cancionId) {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || 'null')
      if (!user?.id) throw new Error("Debes iniciar sesión")

      const cancion = this.model.state.album.canciones.find(c => c.id === Number(cancionId))
      if (!cancion) return

      if (cancion.favorito) {
        await ApiClient.removeCancionFavorito(user.id, cancion.id)
        this.model.marcarFavoritoCancion(cancion.id, false)
      } else {
        await ApiClient.addCancionFavorito(user.id, cancion.id)
        this.model.marcarFavoritoCancion(cancion.id, true)
      }
    } catch (error) {
      console.error(error)
      this.view.showError && this.view.showError("Error gestionando favoritos de canción")
    }
  }

  async _toggleFavoritoArtista(artistaId) {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || 'null')
      if (!user?.id) throw new Error("Debes iniciar sesión")
      if (!artistaId) throw new Error("ID de artista inválido")

      if (this.model.state.favoritoArtista) {
        await ApiClient.removeArtistaFavorito(user.id, artistaId)
        this.model.marcarFavoritoArtista(false)
      } else {
        await ApiClient.addArtistaFavorito(user.id, artistaId)
        this.model.marcarFavoritoArtista(true)
      }
    } catch (error) {
      console.error(error)
      this.view.showError && this.view.showError("Error gestionando favoritos del artista")
    }
  }

  destroy() {
    this.view.pausarCancion()
  }
}
