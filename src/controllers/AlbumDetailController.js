import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumDetailController extends EventEmitter {
  constructor(model, view, albumId) {
    super()
    this.model = model
    this.view = view
    this.albumId = albumId
    this.currentPlayingSong = null
    this.tiempoReproduccion = 0
    this.intervaloEscucha = null
    this.escuchaRegistrada = false

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

    this.view.on('pagar', async (tarjeta) => {
      await this._pagarAlbum(tarjeta)
    })

    this.view.on('shareAlbum', () => {
      this.compartirAlbum()
    })

    this.view.on('cargarEstadisticasCancion', async (cancionId) => {
      await this.model.cargarEstadisticasCancion(cancionId)
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
      this.view.showError("No se pudo cargar el álbum")
    }
  }

  async reproducirCancion(cancionId) {
    try {
      if (this.currentPlayingSong === cancionId) {
        this.view.pausarCancion()
        this._detenerContadorEscucha()
        this.currentPlayingSong = null
        return
      }

      this._detenerContadorEscucha()

      const audioUrl = ApiClient.getCancionAudioUrl(cancionId)
      this.view.reproducirCancion(cancionId, audioUrl)
      this.currentPlayingSong = cancionId
      this._iniciarContadorEscucha(cancionId)
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
      this.view.showError("Error gestionando favoritos de canción")
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
      this.view.showError("Error gestionando favoritos del artista")
    }
  }

  async _pagarAlbum(tarjeta) {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || 'null')
      if (!user?.id) throw new Error("Debes iniciar sesión")

      const { numero, cvv, expiracion } = tarjeta?.tarjeta || {}
      if (!numero || !cvv || !expiracion) throw new Error("Todos los campos de la tarjeta son obligatorios")

      const payload = {
        cliente_id: Number(user.id),
        producto: {
          id: Number(this.albumId),
          tipo: 'digital',
          cantidad: 1
        },
        pago: {
          tipo: 'tarjeta',
          numero: numero.trim(),
          cvv: cvv.trim(),
          expiracion: expiracion.trim()
        }
      }

      const res = await ApiClient.comprarMerch(payload)
      this.view.showMessage(res?.mensaje || 'Compra realizada con éxito!')
    } catch (err) {
      console.error(err)
      this.view.showError(err.message || 'Error en el pago')
    }
  }

  compartirAlbum() {
      if (!this.model.state.album) return;

      const album = this.model.state.album;
      const shareData = {
          title: album.nombre,
          text: `Mira el álbum "${album.nombre}" de ${album.nombreArtista}`,
          url: window.location.href
      };

      if (navigator.share) {
          navigator.share(shareData).catch(console.error);
      } else {
          navigator.clipboard.writeText(window.location.href)
              .then(() => {
                  alert('Enlace copiado al portapapeles');
              })
              .catch(console.error);
      }
  }

  _iniciarContadorEscucha(cancionId) {
    this.tiempoReproduccion = 0
    this.escuchaRegistrada = false

    this.intervaloEscucha = setInterval(async () => {
      this.tiempoReproduccion++
      
      if (this.tiempoReproduccion >= 15 && !this.escuchaRegistrada) {
        try {
          const user = JSON.parse(localStorage.getItem('authUser') || 'null')
          if (user?.id) {
            await ApiClient.registrarEscucha(user.id, cancionId)
            this.escuchaRegistrada = true
          }
        } catch (error) {
          console.error('Error al registrar escucha:', error)
        }
      }
    }, 1000)
  }

  _detenerContadorEscucha() {
    if (this.intervaloEscucha) {
      clearInterval(this.intervaloEscucha)
      this.intervaloEscucha = null
    }
    this.tiempoReproduccion = 0
    this.escuchaRegistrada = false
  }

  destroy() {
    this._detenerContadorEscucha()
    this.view.pausarCancion()
  }
}
