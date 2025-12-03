import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class ExampleModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      noticias: [],
      loading: true,
      error: null,
      rankingCanciones: [],
      rankingLoading: false
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
		const noticiasLimitadas = noticias.slice(0,4)
      
      // Procesar las noticias y obtener nombres de autores
      const noticiasProcesadas = await Promise.all(
        noticiasLimitadas.map(async (noticia) => {
          const nombreAutor = await this.obtenerNombreAutor(noticia.autor)
          
          return {
            ...noticia,
            fechaFormateada: this.formatearFecha(noticia.fecha),
            extracto: this.extraerTexto(noticia.contenidoHTML).substring(0, 100) + '...',
            nombreAutor: nombreAutor
          }
        })
      )
      
      this.state = { 
        ...this.state, 
        noticias: noticiasProcesadas, 
        loading: false 
      }
      this.emit('change', this.getState())

      // Cargar ranking de canciones en segundo plano
      this.cargarRankingCanciones()
    } catch (error) {
      this.state = { 
        ...this.state, 
        loading: false, 
        error: error.message 
      }
      this.emit('change', this.getState())
    }
  }

  // Método para obtener el nombre del autor desde la API de usuarios
  async obtenerNombreAutor(idAutor) {
    // Si el autor es 0, null o undefined, usar un valor por defecto
    if (!idAutor || idAutor === 0) {
      return 'Redactor'
    }

    try {
      // Obtener información del usuario desde la API
      const usuario = await ApiClient.getUsuario(idAutor)
      return usuario?.nombre
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

  async cargarRankingCanciones(limite = 10, periodo = 'total') {
    try {
      this.state = { ...this.state, rankingLoading: true }
      this.emit('change', this.getState())

      const ranking = await ApiClient.getRankingCanciones(limite, periodo)
      
      this.state = {
        ...this.state,
        rankingCanciones: ranking || [],
        rankingLoading: false
      }
      this.emit('change', this.getState())
    } catch (error) {
      console.error('Error al cargar ranking de canciones:', error)
      this.state = {
        ...this.state,
        rankingCanciones: [],
        rankingLoading: false
      }
      this.emit('change', this.getState())
    }
  }
}
