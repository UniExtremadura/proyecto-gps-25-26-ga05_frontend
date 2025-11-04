// Modelo: gestiona el estado de búsqueda y consultas al backend
import EventEmitter from '../core/EventEmitter.js'

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
    console.log('🔍 SearchModel: setQuery llamado con:', query)
    this.state = { ...this.state, query, error: null }
    this.emit('change', this.getState())
    
    // Debounce para evitar demasiadas peticiones
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    if (query.trim().length >= 2) {
      console.log('⏱️ SearchModel: Iniciando búsqueda con debounce...')
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

    console.log('🔎 SearchModel: Buscando:', query)
    this.state = { ...this.state, isLoading: true, error: null }
    this.emit('change', this.getState())

    try {
      // Simulación de llamada a API - Reemplazar con URL real del backend
      const results = await this.mockApiSearch(query, this.state.selectedCategory)
      
      console.log('✅ SearchModel: Resultados encontrados:', results.length)
      console.table(results)
      
      this.state = {
        ...this.state,
        results,
        isLoading: false
      }
      this.emit('change', this.getState())
    } catch (error) {
      console.error('❌ SearchModel: Error en búsqueda:', error)
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

  // Simulación de API - Reemplazar con llamada real al backend
  async mockApiSearch(query, category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          artists: [
            { id: 1, type: 'artist', name: 'The Beatles', image: '🎤', followers: '50M' },
            { id: 2, type: 'artist', name: 'Pink Floyd', image: '🎤', followers: '30M' },
            { id: 3, type: 'artist', name: 'Radiohead', image: '🎤', followers: '20M' }
          ],
          songs: [
            { id: 1, type: 'song', name: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
            { id: 2, type: 'song', name: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
            { id: 3, type: 'song', name: 'Hotel California', artist: 'Eagles', duration: '6:30' }
          ],
          albums: [
            { id: 1, type: 'album', name: 'Abbey Road', artist: 'The Beatles', year: 1969 },
            { id: 2, type: 'album', name: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973 },
            { id: 3, type: 'album', name: 'OK Computer', artist: 'Radiohead', year: 1997 }
          ],
          products: [
            { id: 1, type: 'product', name: 'Abbey Road - Vinilo', price: '29.99€', format: 'Vinilo' },
            { id: 2, type: 'product', name: 'The Beatles - Camiseta', price: '19.99€', format: 'Merch' },
            { id: 3, type: 'product', name: 'Dark Side of the Moon - CD', price: '14.99€', format: 'CD' }
          ]
        }

        let results = []
        const lowerQuery = query.toLowerCase()

        if (category === 'all' || category === 'artists') {
          const filtered = mockData.artists.filter(item => 
            item.name.toLowerCase().includes(lowerQuery)
          )
          results = [...results, ...filtered]
        }

        if (category === 'all' || category === 'songs') {
          const filtered = mockData.songs.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) ||
            item.artist.toLowerCase().includes(lowerQuery)
          )
          results = [...results, ...filtered]
        }

        if (category === 'all' || category === 'albums') {
          const filtered = mockData.albums.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) ||
            item.artist.toLowerCase().includes(lowerQuery)
          )
          results = [...results, ...filtered]
        }

        if (category === 'all' || category === 'products') {
          const filtered = mockData.products.filter(item => 
            item.name.toLowerCase().includes(lowerQuery)
          )
          results = [...results, ...filtered]
        }

        resolve(results)
      }, 400) // Simula latencia de red
    })
  }
}
