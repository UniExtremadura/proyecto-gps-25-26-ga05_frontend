// Modelo: gestiona el estado de búsqueda y consultas al backend
import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class SearchModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      query: '',
      results: [],
      isLoading: false,
      error: null,
      selectedCategory: 'all' // all, artists, songs, albums, products
    }
    this.debounceTimer = null
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  setQuery(query) {
    this.state = { ...this.state, query, error: null }
    this.emit('change', this.getState())
    
    // Debounce para evitar demasiadas peticiones
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    if (query.trim().length >= 2) {
      this.debounceTimer = setTimeout(() => {
        this.search(query)
      }, 300)
    } else {
      this.clearResults()
    }
  }

  setCategory(category) {
    this.state = { ...this.state, selectedCategory: category }
    this.emit('change', this.getState())
    if (this.state.query.trim().length >= 2) {
      this.search(this.state.query)
    }
  }

  async search(query) {
    if (!query || query.trim().length < 2) {
      this.clearResults()
      return
    }

    this.state = { ...this.state, isLoading: true, error: null }
    this.emit('change', this.getState())

    try {
      const params = new URLSearchParams()
      params.append('q', query)
      
      const response = await ApiClient.buscarContenido(`/busqueda?${params.toString()}`)
      
      // Procesar resultados según la estructura de la API
      const results = this.processApiResults(response)
      
      this.state = {
        ...this.state,
        results,
        isLoading: false
      }
      this.emit('change', this.getState())
    } catch (error) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: 'Error al buscar. Intenta de nuevo.',
        results: []
      }
      this.emit('change', this.getState())
    }
  }

  clearResults() {
    this.state = {
      ...this.state,
      results: [],
      error: null
    }
    this.emit('change', this.getState())
  }

  // Procesar resultados de la API para normalizar el formato
  processApiResults(response) {
    const results = []
    
    if (!response || !response.data || !response.data.results) {
      return results
    }
    
    const { results: apiResults } = response.data
    
    // Procesar artistas
    if (apiResults.artistas && Array.isArray(apiResults.artistas) && apiResults.artistas.length > 0) {
      apiResults.artistas.forEach(artista => {
        const albums = artista.albums_count || 0
        const songs = artista.songs_count || 0
        const merch = artista.merch_count || 0
        const totalContent = albums + songs + merch
        
        let info = 'Artista'
        if (totalContent > 0) {
          const parts = []
          if (albums > 0) parts.push(`${albums} ${albums === 1 ? 'álbum' : 'álbumes'}`)
          if (songs > 0) parts.push(`${songs} ${songs === 1 ? 'canción' : 'canciones'}`)
          if (merch > 0) parts.push(`${merch} producto${merch === 1 ? '' : 's'}`)
          info = parts.join(', ')
        }
        
        results.push({
          id: artista.id,
          type: 'artist',
          name: artista.nombre,
          image: '🎤',
          info: info
        })
      })
    }
    
    // Procesar canciones
    if (apiResults.canciones && Array.isArray(apiResults.canciones) && apiResults.canciones.length > 0) {
      apiResults.canciones.forEach(cancion => {
        // Formatear duración de segundos a mm:ss
        let durationFormatted = ''
        if (cancion.duracion) {
          const minutes = Math.floor(cancion.duracion / 60)
          const seconds = cancion.duracion % 60
          durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
        
        results.push({
          id: cancion.id,
          type: 'song',
          name: cancion.nombre,
          artist: cancion.nombreArtista || cancion.artista || 'Artista desconocido',
          duration: durationFormatted,
          albumId: cancion.album // Guardar el ID del álbum para navegación
        })
      })
    }
    
    // Procesar álbumes
    if (apiResults.albumes && Array.isArray(apiResults.albumes) && apiResults.albumes.length > 0) {
      apiResults.albumes.forEach(album => {
        results.push({
          id: album.id,
          type: 'album',
          name: album.titulo,
          artist: album.nombreArtista || album.artista || '',
          year: album.fechaPublicacion ? new Date(album.fechaPublicacion).getFullYear() : ''
        })
      })
    }
    
    // Procesar merchandising
    if (apiResults.merch && Array.isArray(apiResults.merch) && apiResults.merch.length > 0) {
      apiResults.merch.forEach(merch => {
        results.push({
          id: merch.id,
          type: 'product',
          name: merch.nombre,
          price: `${merch.precio}€`,
          format: 'Merch'
        })
      })
    }
    
    return results
  }
}
