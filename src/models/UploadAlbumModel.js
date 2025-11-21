import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class UploadAlbumModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      loading: false,
      error: null,
      success: false,
      successMessage: '',
      generos: [],
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarGeneros() {
    try {
      const generos = await ApiClient.getGeneros()
      this.state = { 
        ...this.state, 
        generos: generos || []
      }
      this.emit('change', this.getState())
    } catch (error) {
      console.warn('No se pudieron cargar los géneros:', error.message)
      this.state = { 
        ...this.state, 
        generos: [] 
      }
      this.emit('change', this.getState())
    }
  }

  async subirAlbum(albumData, canciones) {
    try {
      this.state = { ...this.state, loading: true, error: null, success: false }
      this.emit('change', this.getState())

      // Validar que el precio esté presente y sea válido
      if (!albumData.precio || albumData.precio <= 0) {
        throw new Error('El precio del álbum es requerido y debe ser mayor a 0')
      }

      // 1. Subir el álbum usando el endpoint POST /albums
      const albumCreado = await ApiClient.crearAlbum(albumData)

      let cancionesCreadas = 0

      // 2. Subir las canciones del álbum
      if (canciones && canciones.length > 0) {
        for (const [index, cancion] of canciones.entries()) {
          try {
            // Convertir archivo de audio a base64
            const archivoAudioBase64 = await ApiClient.fileToBase64(cancion.archivoAudio)

            const cancionData = {
              nombre: cancion.nombre,
              duracion: cancion.duracion,
              album: albumCreado.id,
              archivoAudio: archivoAudioBase64
            }

            const cancionCreada = await ApiClient.crearCancion(cancionData)
            
            cancionesCreadas++
          } catch (error) {
            // Continuar con las siguientes canciones aunque falle una
          }
        }
      } else {
        console.log('MODEL: No hay canciones para subir')
      }

      this.state = { 
        ...this.state, 
        loading: false, 
        success: true,
        successMessage: `¡Álbum "${albumCreado.nombre}" subido exitosamente! Se crearon ${cancionesCreadas} canciones.`,
        error: null
      }
      this.emit('change', this.getState())
      
    } catch (error) {
      this.state = { 
        ...this.state, 
        loading: false, 
        error: error.message || 'Error al subir el álbum',
        success: false,
        successMessage: ''
      }
      this.emit('change', this.getState())
    }
  }

  limpiarEstado() {
    this.state = {
      ...this.state,
      loading: false,
      error: null,
      success: false,
      successMessage: ''
    }
    this.emit('change', this.getState())
  }
}