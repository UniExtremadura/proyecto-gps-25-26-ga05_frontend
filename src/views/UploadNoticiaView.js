import EventEmitter from '../core/EventEmitter.js'

export default class UploadNoticiaView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('upload-noticia-view')
    this.currentUser = this._getCurrentUser()

    if (!this._isAdmin()) {
      this._renderNotAuthorized()
      return
    }

    this._renderShell()
  }

  _getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('authUser') || 'null')
    } catch {
      return null
    }
  }

  _isAdmin() {
    return this.currentUser && this.currentUser.tipo === 1
  }

  _renderNotAuthorized() {
    this.root.innerHTML = `
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 text-center">
            <div class="card shadow-sm border-0">
              <div class="card-body py-5">
                <i class="bi bi-exclamation-triangle text-warning display-1 mb-4"></i>
                <h2 class="text-dark mb-3">Acceso restringido</h2>
                <p class="text-muted mb-4">Solo el administrador puede crear noticias.</p>
                <a href="/" class="btn btn-primary" data-link>
                  <i class="bi bi-arrow-left me-2"></i>Volver al inicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  _renderShell() {
    const today = new Date().toISOString().split('T')[0]

    this.root.innerHTML = `
      <div class="container py-4">
        <header class="mb-4">
          <h1 class="display-6 fw-bold text-dark mb-2">
            <i class="bi bi-newspaper me-2"></i>Crear Noticia
          </h1>
          <p class="text-muted mb-0">Administrador: ${this.currentUser?.nombre || 'Admin'}</p>
        </header>

        <div id="loading-state" class="text-center py-5 d-none">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Creando noticia...</span>
          </div>
          <p class="text-muted mt-2">Creando noticia...</p>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
        </div>

        <div id="success-state" class="alert alert-success d-none" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          <span id="success-message">¡Noticia creada correctamente!</span>
          <div class="mt-2 d-flex gap-2">
            <a id="ver-noticia-btn" class="btn btn-success btn-sm" href="#">Ver noticia</a>
            <button id="nueva-noticia-btn" class="btn btn-outline-success btn-sm">Crear otra</button>
          </div>
        </div>

        <div id="form-container">
          <form id="noticia-form" class="needs-validation" novalidate>
            <div class="card shadow-sm border-0">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0"><i class="bi bi-pencil-square me-2"></i>Datos de la noticia</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label for="titulo" class="form-label">Título *</label>
                  <input type="text" class="form-control" id="titulo" required />
                  <div class="invalid-feedback">El título es obligatorio.</div>
                </div>

                <div class="mb-3">
                  <label for="contenido" class="form-label">Contenido HTML *</label>
                  <textarea id="contenido" class="form-control" rows="10" placeholder="<p>Tu contenido en HTML...</p>" required></textarea>
                  <div class="form-text">Puedes pegar HTML (p, img, a, etc.).</div>
                  <div class="invalid-feedback">El contenido es obligatorio.</div>
                </div>

                <div class="row g-3">
                  <div class="col-md-4">
                    <label for="fecha" class="form-label">Fecha</label>
                    <input type="date" class="form-control" id="fecha" value="${today}" />
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Autor</label>
                    <div class="form-control bg-light">
                      <i class="bi bi-person-badge me-2 text-success"></i>
                      ${this.currentUser?.nombre || 'Administrador'} (ID: ${this.currentUser?.id || '-'})
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-footer d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary" id="cancelar-btn">
                  <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-cloud-upload me-1"></i>Crear Noticia
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$success = this.root.querySelector('#success-state')
    this.$successMessage = this.root.querySelector('#success-message')
    this.$formContainer = this.root.querySelector('#form-container')
    this.$form = this.root.querySelector('#noticia-form')
    this.$verNoticiaBtn = this.root.querySelector('#ver-noticia-btn')

    if (this._isAdmin()) this._setupEventListeners()
  }

  _setupEventListeners() {
    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      if (!this.$form.checkValidity()) {
        this.$form.classList.add('was-validated')
        return
      }
      const titulo = this.root.querySelector('#titulo').value.trim()
      const contenidoHTML = this.root.querySelector('#contenido').value.trim()
      const fecha = this.root.querySelector('#fecha').value || new Date().toISOString().split('T')[0]
      const autor = this.currentUser?.id || 0

      this.emit('crearNoticia', { titulo, contenidoHTML, fecha, autor })
    })

    this.root.querySelector('#cancelar-btn')?.addEventListener('click', () => {
      this.emit('cancelar')
    })

    this.root.querySelector('#nueva-noticia-btn')?.addEventListener('click', () => {
      this._resetForm()
    })
  }

  render(state) {
    if (state.loading) return this._showLoading()
    if (state.error) return this._showError(state.error)
    if (state.success) return this._showSuccess(state.successMessage, state.noticiaCreada)
    this._showForm()
  }

  _showLoading() {
    this.$loading.classList.remove('d-none')
    this.$error.classList.add('d-none')
    this.$success.classList.add('d-none')
    this.$formContainer.classList.add('d-none')
  }

  _showError(error) {
    this.$loading.classList.add('d-none')
    this.$error.classList.remove('d-none')
    this.$errorMessage.textContent = error
    this.$success.classList.add('d-none')
    this.$formContainer.classList.remove('d-none')
  }

  _showSuccess(message, noticia) {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$success.classList.remove('d-none')
    this.$successMessage.textContent = message || '¡Noticia creada correctamente!'
    this.$formContainer.classList.add('d-none')

    if (noticia?.id && this.$verNoticiaBtn) {
      this.$verNoticiaBtn.setAttribute('href', `/noticias/${noticia.id}`)
      this.$verNoticiaBtn.setAttribute('data-link', '')
    } else if (this.$verNoticiaBtn) {
      this.$verNoticiaBtn.classList.add('d-none')
    }
  }

  _showForm() {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$success.classList.add('d-none')
    this.$formContainer.classList.remove('d-none')
  }

  _resetForm() {
    this.$form.reset()
    this.$form.classList.remove('was-validated')
    this.$success.classList.add('d-none')
    this.$formContainer.classList.remove('d-none')
  }
}
