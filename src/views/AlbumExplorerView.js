import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumExplorerView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('album-explorer-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <section class="hero-section mb-4">
        <div class="bg-primary text-white rounded-3 p-4">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h1 class="display-5 fw-bold mb-2">
                <i class="bi bi-disc me-2"></i>Explorar Álbumes
              </h1>
              <p class="lead mb-0">Descubre música en todos los formatos</p>
            </div>
          </div>
        </div>
      </section>

      <section class="filters-section mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control" id="search-input" placeholder="Buscar álbumes...">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" id="genre-filter">
              <option value="">Todos los géneros</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" id="format-filter">
              <option value="">Todos los formatos</option>
              <option value="1">Digital</option>
              <option value="2">Vinilo</option>
              <option value="3">CD</option>
              <option value="4">Cassette</option>
            </select>
          </div>
        </div>
      </section>

      <div id="loading-state" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando álbumes...</span>
        </div>
        <p class="text-muted mt-2">Cargando álbumes...</p>
      </div>

      <div id="error-state" class="alert alert-danger d-none" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <span id="error-message"></span>
        <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
      </div>

      <section id="albums-section" class="d-none">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="h5 fw-bold mb-0">
            <span id="results-count">0</span> álbumes encontrados
          </h3>
          <div class="btn-group" role="group" id="pagination-controls">
          </div>
        </div>

        <div id="albums-grid" class="row g-4">
        </div>
      </section>

      <div id="no-results" class="text-center py-5 d-none">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <h3 class="h4 text-muted mt-3">No se encontraron álbumes</h3>
        <p class="text-muted">Intenta con otros filtros o términos de búsqueda.</p>
        <button class="btn btn-primary" id="clear-filters-btn">Limpiar filtros</button>
      </div>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$albumsSection = this.root.querySelector('#albums-section')
    this.$albumsGrid = this.root.querySelector('#albums-grid')
    this.$resultsCount = this.root.querySelector('#results-count')
    this.$noResults = this.root.querySelector('#no-results')
    this.$paginationControls = this.root.querySelector('#pagination-controls')

    this.root.querySelector('#search-input').addEventListener('input', (e) => {
      this.emit('buscar', e.target.value)
    })

    this.root.querySelector('#genre-filter').addEventListener('change', (e) => {
      this.emit('cambiarGenero', e.target.value)
    })

    this.root.querySelector('#format-filter').addEventListener('change', (e) => {
      this.emit('cambiarFormato', e.target.value)
    })

    this.root.querySelector('#retry-btn').addEventListener('click', () => {
      this.emit('reintentar')
    })

    this.root.querySelector('#clear-filters-btn').addEventListener('click', () => {
      this.emit('limpiarFiltros')
    })
  }

  render(state) {
    if (state.loading) {
      this.$loading.classList.remove('d-none')
      this.$error.classList.add('d-none')
      this.$albumsSection.classList.add('d-none')
      this.$noResults.classList.add('d-none')
      return
    }

    if (state.error) {
      this.$loading.classList.add('d-none')
      this.$error.classList.remove('d-none')
      this.$errorMessage.textContent = state.error
      this.$albumsSection.classList.add('d-none')
      this.$noResults.classList.add('d-none')
      return
    }

    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')

    if (state.albumes.length === 0) {
      this.$albumsSection.classList.add('d-none')
      this.$noResults.classList.remove('d-none')
      return
    }

    this.$albumsSection.classList.remove('d-none')
    this.$noResults.classList.add('d-none')

    this._renderAlbumes(state.albumes)
    this._renderPaginacion(state)
    this.$resultsCount.textContent = state.total
  }

  _renderAlbumes(albumes) {
    this.$albumsGrid.innerHTML = albumes.map(album => {
      // Construir URL de imagen usando ApiClient
      const imagenUrl = ApiClient.getAlbumImageUrl(album.id);

      return `
      <div class="col-md-6 col-lg-4 col-xl-3">
        <div class="card h-100 album-card shadow-sm border-0" style="cursor: pointer;" data-album-id="${album.id}">
          <div class="position-relative">
            <img src="${imagenUrl}" 
                 class="card-img-top" 
                 alt="${album.nombre}" 
                 style="height: 200px; object-fit: cover;">
            <div class="position-absolute top-0 end-0 m-2">
              <span class="badge bg-primary">$${album.precio}</span>
            </div>
          </div>

          <div class="card-body d-flex flex-column">
            <h5 class="card-title fs-6 fw-bold text-dark line-clamp-2">${album.nombre}</h5>

            <p class="card-text text-muted small mb-2">
              <i class="bi bi-person me-1"></i>
              ${album.nombre_artista || 'Artista'}
            </p>

            ${album.fecha ? `
            <small class="text-muted mb-2">
              <i class="bi bi-calendar me-1"></i>
              ${new Date(album.fecha).getFullYear()}
            </small>
            ` : ''}

            ${album.formatos && album.formatos.length > 0 ? `
            <div class="mt-auto pt-2">
              <div class="d-flex flex-wrap gap-1">
                ${album.formatos.map(formato => `
                  <span class="badge bg-light text-dark border small">
                    ${this._obtenerNombreFormato(formato)}
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      `;
    }).join('')

    // Event listeners
    this.$albumsGrid.querySelectorAll('.album-card[data-album-id]').forEach(card => {
      card.addEventListener('click', () => {
        const albumId = card.getAttribute('data-album-id')
        this.emit('verAlbumDetalle', albumId)
      })
    })
  }
  
  _renderPaginacion(state) {
    const totalPages = Math.ceil(state.total / state.perPage)
    
    if (totalPages <= 1) {
      this.$paginationControls.innerHTML = ''
      return
    }

    let paginationHTML = ''
    
    if (state.page > 1) {
      paginationHTML += `
        <button type="button" class="btn btn-outline-primary" data-page="${state.page - 1}">
          <i class="bi bi-chevron-left"></i>
        </button>
      `
    }

    for (let i = 1; i <= totalPages; i++) {
      if (i === state.page) {
        paginationHTML += `
          <button type="button" class="btn btn-primary" data-page="${i}">${i}</button>
        `
      } else if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
        paginationHTML += `
          <button type="button" class="btn btn-outline-primary" data-page="${i}">${i}</button>
        `
      }
    }

    if (state.page < totalPages) {
      paginationHTML += `
        <button type="button" class="btn btn-outline-primary" data-page="${state.page + 1}">
          <i class="bi bi-chevron-right"></i>
        </button>
      `
    }

    this.$paginationControls.innerHTML = paginationHTML

    this.$paginationControls.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'))
        this.emit('cambiarPagina', page)
      })
    })
  }

  _obtenerNombreFormato(idFormato) {
    const formatos = {
      1: 'Digital',
      2: 'Vinilo', 
      3: 'CD',
      4: 'Cassette'
    }
    return formatos[idFormato] || 'Formato'
  }

  cargarGeneros(generos) {
    const $select = this.root.querySelector('#genre-filter')
    $select.innerHTML = '<option value="">Todos los géneros</option>'
    
    generos.forEach(genero => {
      $select.innerHTML += `<option value="${genero.id}">${genero.nombre}</option>`
    })
  }
}
