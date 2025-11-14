import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AllNewsModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      noticias: [],
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarNoticias() {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())
      
      const noticias = await ApiClient.getNoticias()
      
      // Procesar las noticias
      const noticiasProcesadas = await Promise.all(
        noticias.map(async (noticia) => {
          const nombreAutor = await this.obtenerNombreAutor(noticia.autor)
          
          return {
            ...noticia,
            fechaFormateada: this.formatearFecha(noticia.fecha),
            extracto: this.extraerTexto(noticia.contenidoHTML).substring(0, 100) + '...',
            nombreAutor: nombreAutor
          }
        })
      )
      
      // Actualizar estado
      this.state = { 
        ...this.state, 
        noticias: noticiasProcesadas, 
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

  // Método para extraer texto plano del HTML
  extraerTexto(html) {
    if (!html) return ''
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.replace(/\s+/g, ' ').trim()
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
