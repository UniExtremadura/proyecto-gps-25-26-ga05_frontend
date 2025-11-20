// Vista: renderiza UI de noticias musicales
import EventEmitter from '../core/EventEmitter.js'

export default class ExampleView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('news-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <!-- Sección de cabecera -->
      <section class="hero-section mb-5">
        <div class="bg-dark text-white rounded-3 p-5 position-relative overflow-hidden">
          <div class="position-absolute top-0 end-0 opacity-25">
            <i class="bi bi-soundwave display-1"></i>
          </div>
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h1 class="display-4 fw-bold mb-3">Undersounds</h1>
              <p class="lead mb-4">Tu portal de música. Diseñado con los artistas en mente.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección de Noticias -->
      <section class="news-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="h3 fw-bold">
            <i class="bi bi-newspaper me-2"></i>Últimas Noticias
          </h2>
          <a href="#" class="btn btn-outline-primary" id="view-all-news">
            Ver Todas <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <!-- Cargando.... -->
        <div id="loading-state" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando noticias...</span>
          </div>
          <p class="text-muted mt-2">Cargando las últimas noticias...</p>
        </div>

        <!-- Error -->
        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
        </div>

        <!-- Grid de Noticias -->
        <div id="news-grid" class="row g-4 d-none">
          <!-- Las noticias se insertarán aquí dinámicamente -->
        </div>
      </section>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$newsGrid = this.root.querySelector('#news-grid')
    this.$retryBtn = this.root.querySelector('#retry-btn')

    this.$retryBtn.addEventListener('click', () => {
      this.emit('cargarNoticias')
    })

	this.root.querySelector('#view-all-news').addEventListener('click', (e) => {
		e.preventDefault()
		this.emit('verTodasNoticias')
	})
  }

  render(state) {
    if (state.loading) {
      this.$loading.classList.remove('d-none')
      this.$error.classList.add('d-none')
      this.$newsGrid.classList.add('d-none')
      return
    }

    if (state.error) {
      this.$loading.classList.add('d-none')
      this.$error.classList.remove('d-none')
      this.$errorMessage.textContent = state.error
      this.$newsGrid.classList.add('d-none')
      return
    }

    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$newsGrid.classList.remove('d-none')

    this._renderNoticias(state.noticias)
  }

	_renderNoticias(noticias) {
	if (!noticias || noticias.length === 0) {
		this.$newsGrid.innerHTML = `
		<div class="col-12 text-center py-5">
			<i class="bi bi-inbox display-1 text-muted"></i>
			<h3 class="h4 text-muted mt-3">No hay noticias disponibles</h3>
			<p class="text-muted">Pronto tendremos nuevas noticias musicales para ti.</p>
		</div>
		`
		return
	}

	this.$newsGrid.innerHTML = noticias.map(noticia => `
		<div class="col-md-6 col-lg-3">
		<article class="card h-100 news-card shadow-sm border-0">
			<!-- Header con gradiente musical -->
			<div class="card-header gradient-music border-0 position-relative" style="height: 120px;">
			<div class="position-absolute top-50 start-50 translate-middle">
				<i class="bi bi-music-note-beamed display-4 text-white opacity-75"></i>
			</div>
			</div>

			<div class="card-body d-flex flex-column">
			<!-- Fecha -->
			<small class="text-muted mb-2">
				<i class="bi bi-calendar-event me-1"></i>
				${noticia.fechaFormateada}
			</small>

			<!-- Título -->
			<h5 class="card-title fs-6 fw-bold text-dark line-clamp-2">${noticia.titulo}</h5>

			<!-- Extracto del contenido -->
			<p class="card-text text-muted small flex-grow-1 line-clamp-3">
				${noticia.extracto}
			</p>

			<!-- Autor -->
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
