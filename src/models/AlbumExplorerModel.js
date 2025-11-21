import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumExplorerModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      albumes: [],
      loading: true,
      error: null,
      filtroFormato: null,
      filtroGenero: null,
      query: '',
      page: 1,
      perPage: 12,
      total: 0
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarAlbumes() {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())

      const params = new URLSearchParams()
      
      if (this.state.query) {
        params.append('q', this.state.query)
      }
      
      if (this.state.filtroFormato) {
        params.append('formato', this.state.filtroFormato)
      }
      
      if (this.state.filtroGenero) {
        params.append('genero', this.state.filtroGenero)
      }
      
      params.append('page', this.state.page)
      params.append('per_page', this.state.perPage)
      params.append('type', 'albumes')

      const response = await ApiClient.buscarContenido(`/busqueda?${params.toString()}`)
      
      this.state = {
        ...this.state,
        albumes: response.data.results.albumes || [],
        total: response.data.totals.albumes || 0,
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

  setFiltroFormato(formato) {
    this.state.filtroFormato = formato
    this.state.page = 1
    this.cargarAlbumes()
  }

  setFiltroGenero(genero) {
    this.state.filtroGenero = genero
    this.state.page = 1
    this.cargarAlbumes()
  }

  setQuery(query) {
    this.state.query = query
    this.state.page = 1
    this.cargarAlbumes()
  }

  setPage(page) {
    this.state.page = page
    this.cargarAlbumes()
  }

  async cargarGeneros() {
    try {
      return await ApiClient.getGeneros()
    } catch (error) {
      console.error('Error al cargar géneros:', error)
      return []
    }
  }
}