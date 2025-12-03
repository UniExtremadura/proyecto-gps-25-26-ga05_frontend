// Vista: renderiza todas las noticias
import EventEmitter from '../core/EventEmitter.js'

export default class AllNewsView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('all-news-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <!-- Cabecera -->
        <header class="mb-5">
          <h1 class="display-4 fw-bold text-dark mb-3">
            <i class="bi bi-newspaper me-3"></i>Todas las Noticias
          </h1>
          <p class="lead text-muted">Mantente informado con las últimas novedades del mundo musical.</p>
        </header>

        <!-- Estados -->
        <div id="loading-state" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando noticias...</span>
          </div>
          <p class="text-muted mt-2">Cargando todas las noticias...</p>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
        </div>

        <!-- Grid de Noticias -->
        <div id="news-grid" class="row g-4 d-none">
          <!-- Las noticias se insertarán aquí dinámicamente -->
        </div>

        <!-- Sin resultados -->
        <div id="no-results" class="text-center py-5 d-none">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <h3 class="h4 text-muted mt-3">No hay noticias disponibles</h3>
          <p class="text-muted">Pronto tendremos nuevas noticias musicales para ti.</p>
        </div>
      </div>
    `

    // Referencias a elementos
    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$newsGrid = this.root.querySelector('#news-grid')
    this.$noResults = this.root.querySelector('#no-results')
    this.$retryBtn = this.root.querySelector('#retry-btn')

    // Event listeners
    this.$retryBtn.addEventListener('click', () => {
      this.emit('cargarNoticias')
    })
  }

  render(state) {
    if (state.loading) {
      this._showLoading()
      return
    }

    if (state.error) {
      this._showError(state.error)
      return
    }

    this._showContent(state)
  }

  _showLoading() {
    this.$loading.classList.remove('d-none')
    this.$error.classList.add('d-none')
    this.$newsGrid.classList.add('d-none')
    this.$noResults.classList.add('d-none')
  }

  _showError(error) {
    this.$loading.classList.add('d-none')
    this.$error.classList.remove('d-none')
    this.$errorMessage.textContent = error
    this.$newsGrid.classList.add('d-none')
    this.$noResults.classList.add('d-none')
  }

  _showContent(state) {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')

    if (!state.noticias || state.noticias.length === 0) {
      this.$newsGrid.classList.add('d-none')
      this.$noResults.classList.remove('d-none')
      return
    }

    this.$newsGrid.classList.remove('d-none')
    this.$noResults.classList.add('d-none')

    this._renderNoticias(state.noticias)
  }

  _renderNoticias(noticias) {
    this.$newsGrid.innerHTML = noticias.map(noticia => `
      <div class="col-md-6 col-lg-4">
        <article class="card h-100 news-card shadow-sm border-0">
          <div class="card-header gradient-music border-0 position-relative" style="height: 120px;">
            <div class="position-absolute top-50 start-50 translate-middle">
              <i class="bi bi-music-note-beamed display-4 text-white opacity-75"></i>
            </div>
          </div>

          <div class="card-body d-flex flex-column">
            <small class="text-muted mb-2">
              <i class="bi bi-calendar-event me-1"></i>
              ${noticia.fechaFormateada}
            </small>

            <h5 class="card-title fs-6 fw-bold text-dark line-clamp-2">${noticia.titulo}</h5>

            <p class="card-text text-muted small flex-grow-1 line-clamp-3">
              ${noticia.extracto}
            </p>

            <div class="d-flex align-items-center justify-content-between mt-auto pt-3">
              <div class="d-flex align-items-center">
                <small class="text-muted">${noticia.nombreAutor}</small>
              </div>
              <button class="btn btn-sm btn-outline-primary" data-id="${noticia.id}">
                Leer más
              </button>
            </div>
          </div>
        </article>
      </div>
    `).join('')

    // Event listeners para los botones
    this.$newsGrid.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id')
        this.emit('verNoticia', id)
      })
    })
  }
}
