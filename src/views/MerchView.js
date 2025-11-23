import EventEmitter from '../core/EventEmitter.js'

export default class MerchView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('merch-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <header class="mb-4">
          <h1 class="display-5 fw-bold text-dark">
            <i class="bi bi-bag-heart me-2"></i>Merchandising
          </h1>
          <p class="text-muted">Explora nuestros productos oficiales.</p>
        </header>

        <div id="loading-state" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando merch...</span>
          </div>
          <p class="text-muted mt-2">Cargando productos...</p>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
        </div>

        <div id="merch-grid" class="row g-4 d-none"></div>

        <div id="no-results" class="text-center py-5 d-none">
          <i class="bi bi-inbox display-1 text-muted"></i>
          <h3 class="h4 text-muted mt-3">No hay productos disponibles</h3>
          <p class="text-muted">Vuelve más tarde para ver nuevo merch.</p>
        </div>
      </div>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$merchGrid = this.root.querySelector('#merch-grid')
    this.$noResults = this.root.querySelector('#no-results')
    this.$retryBtn = this.root.querySelector('#retry-btn')

    this.$retryBtn.addEventListener('click', () => this.emit('cargarMerchs'))
  }

  render(state) {
    if (state.loading) return this._showLoading()
    if (state.error) return this._showError(state.error)
    this._showContent(state)
  }

  _showLoading() {
    this.$loading.classList.remove('d-none')
    this.$error.classList.add('d-none')
    this.$merchGrid.classList.add('d-none')
    this.$noResults.classList.add('d-none')
  }

  _showError(error) {
    this.$loading.classList.add('d-none')
    this.$error.classList.remove('d-none')
    this.$errorMessage.textContent = error
    this.$merchGrid.classList.add('d-none')
    this.$noResults.classList.add('d-none')
  }

  _showContent(state) {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')

    const merchs = state.merchs || []
    if (merchs.length === 0) {
      this.$merchGrid.classList.add('d-none')
      this.$noResults.classList.remove('d-none')
      return
    }

    this.$merchGrid.classList.remove('d-none')
    this.$noResults.classList.add('d-none')

    this._renderMerchs(merchs)
  }

  _renderMerchs(merchs) {
    this.$merchGrid.innerHTML = merchs.map(m => `
      <div class="col-md-6 col-lg-4">
        <article class="card h-100 shadow-sm border-0 merch-card">
          <div class="ratio ratio-16x9 bg-light position-relative overflow-hidden">
            ${m.imagenUrl ? `<img src="${m.imagenUrl}" alt="${(m.nombre||'Producto')}" class="w-100 h-100 object-fit-cover">` : `<div class="d-flex align-items-center justify-content-center h-100 text-muted"><i class="bi bi-bag display-3"></i></div>`}
          </div>

          <div class="card-body d-flex flex-column">
            <h5 class="card-title fs-6 fw-bold text-dark line-clamp-2">${m.nombre || 'Sin nombre'}</h5>
            <p class="text-muted small mb-2">${m.descripcionCorta || ''}</p>
            <div class="d-flex align-items-center justify-content-between mt-auto pt-3">
              <div>
                <div class="fw-bold text-primary">${m.precioFormateado || m.precio || ''}</div>
                <small class="text-muted">Stock: ${m.stock !== undefined ? m.stock : '—'}</small>
              </div>
              <div>
                <button class="btn btn-sm btn-outline-secondary" data-id="${m.id}" data-action="ver">Ver</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `).join('')

    // Event binding: solo el botón "Ver"
    this.$merchGrid.querySelectorAll('button[data-action="ver"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id')
        this.emit('verMerch', id)
      })
    })
  }
}
