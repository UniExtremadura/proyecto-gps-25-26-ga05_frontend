import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class AlbumDetailView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('album-detail-view')
    this.audioPlayer = null
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a href="/explorar" class="text-decoration-none" data-link>
                <i class="bi bi-arrow-left me-1"></i>Volver a Explorar
              </a>
            </li>
          </ol>
        </nav>

        <div id="loading-state" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando álbum...</span>
          </div>
          <p class="text-muted mt-2">Cargando álbum...</p>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Reintentar</button>
        </div>

        <div id="album-content" class="d-none">
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card border-0 shadow-sm">
                <div id="album-image-container" class="card-img-container">
                  <div class="placeholder-image bg-light d-flex align-items-center justify-content-center" style="height: 300px;">
                    <i class="bi bi-disc display-1 text-muted"></i>
                  </div>
                </div>
                <div class="card-body text-center">
                  <h2 id="album-title" class="h4 fw-bold mb-2"></h2>
                  <p id="album-artist" class="text-muted mb-3"></p>
                  <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-lg">
                      <i class="bi bi-cart me-2"></i>Comprar - $<span id="album-price"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-8">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white">
                  <h3 class="h5 fw-bold mb-0">
                    <i class="bi bi-music-note-list me-2"></i>Lista de canciones
                  </h3>
                </div>
                <div class="card-body p-0">
                  <div id="songs-list" class="list-group list-group-flush"></div>
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-md-6">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title fw-bold">Información del álbum</h5>
                      <ul class="list-unstyled">
                        <li class="mb-2">
                          <strong><i class="bi bi-clock me-2"></i>Duración:</strong>
                          <span id="album-duration" class="ms-2"></span>
                        </li>
                        <li class="mb-2">
                          <strong><i class="bi bi-calendar me-2"></i>Fecha:</strong>
                          <span id="album-date" class="ms-2"></span>
                        </li>
                        <li>
                          <strong><i class="bi bi-music-note-beamed me-2"></i>Género:</strong>
                          <span id="album-genre" class="ms-2"></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <audio id="audio-player" class="d-none" controls>
          Tu navegador no soporta el elemento de audio.
        </audio>
      </div>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$albumContent = this.root.querySelector('#album-content')
    this.$songsList = this.root.querySelector('#songs-list')
    this.$audioPlayer = this.root.querySelector('#audio-player')

    this.root.querySelector('#retry-btn').addEventListener('click', () => {
      this.emit('reintentar')
    })
  }

  render(state) {
    if (state.loading) {
      this.$loading.classList.remove('d-none')
      this.$error.classList.add('d-none')
      this.$albumContent.classList.add('d-none')
      return
    }

    if (state.error) {
      this.$loading.classList.add('d-none')
      this.$error.classList.remove('d-none')
      this.$errorMessage.textContent = state.error
      this.$albumContent.classList.add('d-none')
      return
    }

    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$albumContent.classList.remove('d-none')

    if (state.album) {
      this._renderAlbum(state.album, state.favoritoArtista)
    }
  }

  _renderAlbum(album, favoritoArtista = false) {
    this.root.querySelector('#album-title').textContent = album.nombre

    const $artistContainer = this.root.querySelector('#album-artist')
    $artistContainer.innerHTML = `
      ${album.nombreArtista}
      <button class="btn btn-sm btn-outline-danger ms-2 favorite-artist-btn" title="${favoritoArtista ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
        <i class="bi ${favoritoArtista ? 'bi-heart-fill' : 'bi-heart'}"></i>
      </button>
    `
    $artistContainer.querySelector('.favorite-artist-btn').addEventListener('click', (e) => {
      e.stopPropagation()
      // ✅ Aquí pasamos el ID correcto
      this.emit('toggleFavoritoArtista', album.artista)
    })

    this.root.querySelector('#album-price').textContent = album.precio
    this.root.querySelector('#album-duration').textContent = album.duracion
    this.root.querySelector('#album-date').textContent = new Date(album.fecha).toLocaleDateString('es-ES')
    this.root.querySelector('#album-genre').textContent = album.genero?.nombre || 'No especificado'

    const $imageContainer = this.root.querySelector('#album-image-container')
    $imageContainer.innerHTML = ''
    const img = document.createElement('img')
    img.src = ApiClient.getAlbumImageUrl(album.id)
    img.className = 'card-img-top'
    img.alt = album.nombre
    img.style.height = '300px'
    img.style.objectFit = 'cover'
    img.style.borderRadius = '0.375rem 0.375rem 0 0'
    img.onerror = () => {
      img.style.display = 'none'
    }
    $imageContainer.appendChild(img)

    this._renderCanciones(album.canciones)
  }

  _renderCanciones(canciones) {
    this.$songsList.innerHTML = canciones.map((cancion, index) => `
      <div class="list-group-item d-flex justify-content-between align-items-center py-3 song-item" data-song-id="${cancion.id}">
        <div class="d-flex align-items-center">
          <span class="text-muted me-3" style="min-width: 30px;">${index + 1}</span>
          <div>
            <h6 class="mb-0 fw-bold">${cancion.nombre}</h6>
            <small class="text-muted">${cancion.duracion}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-primary btn-sm play-btn" data-song-id="${cancion.id}">
            <i class="bi bi-play-fill"></i> Reproducir
          </button>
          <button class="btn btn-sm btn-outline-danger favorite-song-btn" data-song-id="${cancion.id}" title="${cancion.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
            <i class="bi ${cancion.favorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
        </div>
      </div>
    `).join('')

    this.$songsList.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const songId = Number(btn.getAttribute('data-song-id'))
        this.emit('reproducirCancion', songId)
      })
    })

    this.$songsList.querySelectorAll('.favorite-song-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const songId = Number(btn.getAttribute('data-song-id'))
        this.emit('toggleFavoritoCancion', songId)
      })
    })
  }

  reproducirCancion(cancionId, audioUrl) {
    this.$songsList.querySelectorAll('.play-btn').forEach(btn => {
      btn.classList.remove('btn-primary')
      btn.classList.add('btn-outline-primary')
      btn.innerHTML = '<i class="bi bi-play-fill"></i> Reproducir'
    })

    const currentBtn = this.$songsList.querySelector(`.play-btn[data-song-id="${cancionId}"]`)
    if (currentBtn) {
      currentBtn.classList.remove('btn-outline-primary')
      currentBtn.classList.add('btn-primary')
      currentBtn.innerHTML = '<i class="bi bi-pause-fill"></i> Pausar'
    }

    this.$audioPlayer.src = audioUrl
    this.$audioPlayer.play().catch(error => console.error('Error al reproducir audio:', error))

    this.$audioPlayer.onended = () => {
      if (currentBtn) {
        currentBtn.classList.remove('btn-primary')
        currentBtn.classList.add('btn-outline-primary')
        currentBtn.innerHTML = '<i class="bi bi-play-fill"></i> Reproducir'
      }
    }
  }

  pausarCancion() {
    this.$audioPlayer.pause()
    this.$songsList.querySelectorAll('.play-btn').forEach(btn => {
      btn.classList.remove('btn-primary')
      btn.classList.add('btn-outline-primary')
      btn.innerHTML = '<i class="bi bi-play-fill"></i> Reproducir'
    })
  }
}
