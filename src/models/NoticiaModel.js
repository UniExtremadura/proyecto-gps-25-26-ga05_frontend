import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class NoticiaModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      noticia: null,
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarNoticia(id) {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())
      
      const noticia = await ApiClient.getNoticia(id)
      
      if (!noticia) {
        throw new Error('Noticia no encontrada')
      }

      // Procesar la noticia
      const noticiaProcesada = {
        ...noticia,
        fechaFormateada: this.formatearFecha(noticia.fecha),
        nombreAutor: await this.obtenerNombreAutor(noticia.autor)
      }
      
      this.state = { 
        ...this.state, 
        noticia: noticiaProcesada, 
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

  // Método para obtener el nombre del autor
  async obtenerNombreAutor(idAutor) {
    if (!idAutor || idAutor === 0) {
      return 'Redactor'
    }

    try {
      const usuario = await ApiClient.getUsuario(idAutor)
      return usuario?.nombre || `Usuario ${idAutor}`
    } catch (error) {
      console.warn(`No se pudo obtener el autor ${idAutor}:`, error.message)
      return `Usuario ${idAutor}`
    }
  }

  // Método para formatear fecha
  formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible'
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha inválida'
    }
  }
}
