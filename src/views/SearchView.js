// Vista: renderiza la barra de búsqueda y los resultados dinámicos
import EventEmitter from '../core/EventEmitter.js'

export default class SearchView extends EventEmitter {
  constructor(searchInputEl, searchButtonEl) {
    super()
    this.$input = searchInputEl
    this.$button = searchButtonEl
    this.$dropdown = null
    this._createDropdown()
    this._attachListeners()
  }

  _createDropdown() {
    // Crear contenedor de resultados
    this.$dropdown = document.createElement('div')
    this.$dropdown.className = 'search-dropdown'
    this.$dropdown.style.display = 'none'
    
    // Insertar después del input de búsqueda
    const searchForm = this.$input.closest('form')
    if (searchForm) {
      searchForm.style.position = 'relative'
      searchForm.appendChild(this.$dropdown)
    }
  }

  _attachListeners() {
    // Evento de escritura en el input
    this.$input.addEventListener('input', (e) => {
      console.log('👀 SearchView: Input detectado:', e.target.value)
      this.emit('search', e.target.value)
    })

    // Evento de submit del formulario
    const searchForm = this.$input.closest('form')
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault()
        console.log('📝 SearchView: Formulario enviado:', this.$input.value)
        this.emit('search', this.$input.value)
      })
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.$input.contains(e.target) && 
          !this.$dropdown.contains(e.target) &&
          !this.$button.contains(e.target)) {
        this.hideDropdown()
      }
    })

    // Mostrar dropdown al hacer focus en el input si hay resultados
    this.$input.addEventListener('focus', () => {
      if (this.$dropdown.children.length > 0) {
        this.showDropdown()
      }
    })
  }

  render(state) {
    const { query, results, isLoading, error } = state

    console.log('🎨 SearchView: Renderizando con estado:', { 
      query, 
      resultCount: results.length, 
      isLoading, 
      error 
    })

    // Si no hay query o es muy corta, ocultar dropdown
    if (!query || query.trim().length < 2) {
      this.hideDropdown()
      return
    }

    // Mostrar dropdown
    this.showDropdown()

    // Renderizar contenido según estado
    if (isLoading) {
      console.log('⏳ SearchView: Mostrando estado de carga')
      this._renderLoading()
    } else if (error) {
      console.log('❌ SearchView: Mostrando error:', error)
      this._renderError(error)
    } else if (results.length === 0) {
      console.log('📭 SearchView: Sin resultados')
      this._renderEmpty(query)
    } else {
      console.log('📋 SearchView: Mostrando', results.length, 'resultados')
      this._renderResults(results)
    }
  }

  _renderLoading() {
    this.$dropdown.innerHTML = `
      <div class="search-dropdown-item loading">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        Buscando...
      </div>
    `
  }

  _renderError(error) {
    this.$dropdown.innerHTML = `
      <div class="search-dropdown-item error">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${error}
      </div>
    `
  }

  _renderEmpty(query) {
    this.$dropdown.innerHTML = `
      <div class="search-dropdown-item empty">
        <i class="bi bi-search me-2"></i>
        No se encontraron resultados para "${query}"
      </div>
    `
  }

  _renderResults(results) {
    // Agrupar resultados por tipo
    const grouped = this._groupByType(results)
    
    this.$dropdown.innerHTML = ''

    // Renderizar cada grupo
    Object.keys(grouped).forEach(type => {
      if (grouped[type].length > 0) {
        this._renderGroup(type, grouped[type])
      }
    })
  }

  _groupByType(results) {
    const grouped = {
      artist: [],
      song: [],
      album: [],
      product: []
    }

    results.forEach(result => {
      if (grouped[result.type]) {
        grouped[result.type].push(result)
      }
    })

    return grouped
  }

  _renderGroup(type, items) {
    // Título del grupo
    const groupTitle = document.createElement('div')
    groupTitle.className = 'search-dropdown-group-title'
    groupTitle.innerHTML = this._getGroupIcon(type) + ' ' + this._getGroupTitle(type)
    this.$dropdown.appendChild(groupTitle)

    // Items del grupo
    items.slice(0, 5).forEach(item => { // Limitar a 5 resultados por grupo
      const itemEl = this._createResultItem(item)
      this.$dropdown.appendChild(itemEl)
    })
  }

  _getGroupIcon(type) {
    const icons = {
      artist: '<i class="bi bi-person-circle"></i>',
      song: '<i class="bi bi-music-note-beamed"></i>',
      album: '<i class="bi bi-disc"></i>',
      product: '<i class="bi bi-bag"></i>'
    }
    return icons[type] || '<i class="bi bi-search"></i>'
  }

  _getGroupTitle(type) {
    const titles = {
      artist: 'Artistas',
      song: 'Canciones',
      album: 'Álbumes',
      product: 'Productos'
    }
    return titles[type] || 'Resultados'
  }

  _createResultItem(item) {
    const itemEl = document.createElement('div')
    itemEl.className = 'search-dropdown-item clickable'
    itemEl.setAttribute('data-type', item.type)
    itemEl.setAttribute('data-id', item.id)

    itemEl.innerHTML = this._getItemHTML(item)

    // Evento de clic en el resultado
    itemEl.addEventListener('click', () => {
      this.emit('selectResult', { type: item.type, id: item.id, item })
      this.hideDropdown()
      this.$input.value = ''
    })

    return itemEl
  }

  _getItemHTML(item) {
    switch (item.type) {
      case 'artist':
        return `
          <div class="d-flex align-items-center">
            <span class="me-2" style="font-size: 1.5rem;">${item.image}</span>
            <div>
              <div class="fw-bold">${item.name}</div>
              <small class="text-muted">${item.followers} seguidores</small>
            </div>
          </div>
        `
      case 'song':
        return `
          <div>
            <div class="fw-bold">${item.name}</div>
            <small class="text-muted">${item.artist} • ${item.duration}</small>
          </div>
        `
      case 'album':
        return `
          <div>
            <div class="fw-bold">${item.name}</div>
            <small class="text-muted">${item.artist} • ${item.year}</small>
          </div>
        `
      case 'product':
        return `
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-bold">${item.name}</div>
              <small class="text-muted">${item.format}</small>
            </div>
            <span class="badge bg-primary">${item.price}</span>
          </div>
        `
      default:
        return `<div>${item.name || 'Resultado'}</div>`
    }
  }

  showDropdown() {
    this.$dropdown.style.display = 'block'
  }

  hideDropdown() {
    this.$dropdown.style.display = 'none'
  }

  clear() {
    this.$input.value = ''
    this.hideDropdown()
  }
}
