import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumDetailModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      album: null,
      loading: true,
      error: null,
      favoritosCanciones: [],
      favoritoArtista: false
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
      console.error('Error al consultar el álbum:', error)
      const errorMsg = error.message || 'Error al cargar el álbum'
      
      // Si el error es de SQL, mostrar mensaje más claro
      const displayError = errorMsg.includes('does not exist') 
        ? 'El álbum no está disponible actualmente' 
        : errorMsg
      
      this.state = {
        ...this.state,
        loading: false,
        error: displayError
      }
      this.emit('change', this.getState())
    }
  }

  async reproducirCancion(cancionId) {
    this.emit('reproducirCancion', cancionId)
  }

  async cargarFavoritos(userId) {
    try {
      // Cargar favoritos de canciones
      const favCancionesResp = await ApiClient.getFavoritosCanciones(userId)
      const favCancionesIds = Array.isArray(favCancionesResp?.favoritos)
        ? favCancionesResp.favoritos.map(f => Number(f.idCancion))
        : []

      this.state.favoritosCanciones = favCancionesIds

      if (this.state.album?.canciones) {
        this.state.album.canciones = this.state.album.canciones.map(c => ({
          ...c,
          favorito: favCancionesIds.includes(Number(c.id))
        }))
      }

      // Cargar favoritos de artistas
      const favArtistasResp = await ApiClient.getFavoritosArtistas(userId)
      const favArtistasIds = Array.isArray(favArtistasResp?.favoritos)
        ? favArtistasResp.favoritos.map(f => Number(f.idArtista))
        : []

      const artistaId = this.state.album?.artista
      this.state.favoritoArtista = favArtistasIds.includes(artistaId)

      this.emit('change', this.getState())
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
    }
  }


  marcarFavoritoCancion(cancionId, valor) {
    if (!this.state.album?.canciones) return
    this.state.album.canciones = this.state.album.canciones.map(c =>
      c.id === cancionId ? { ...c, favorito: valor } : c
    )
    this.emit('change', this.getState())
  }

  marcarFavoritoArtista(valor) {
    this.state.favoritoArtista = valor
    this.emit('change', this.getState())
  }
}
