import EventEmitter from '../core/EventEmitter.js'

export default class ArtistaView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('artist-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <img id="artistAvatar" src="/public/default-profile.png" alt="Avatar" class="rounded-circle" style="width:120px;height:120px;object-fit:cover;">
            </div>
            <div class="col">
              <h2 id="artistName" class="h4 mb-1">Nombre del Artista</h2>
              <div class="d-flex gap-2 align-items-center mb-2">
                <span class="text-muted" id="monthlyListeners">0</span>
                <small class="text-muted">oyentes mensuales</small>
              </div>
              <div class="d-flex gap-2 mb-2">
                <button id="followBtn" class="btn btn-success btn-sm">Seguir</button>
                <button id="communityBtn" class="btn btn-outline-secondary btn-sm">Comunidad</button>
              </div>
              <div id="artistSocials" class="d-flex gap-2 flex-wrap"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Populares</h5>
              <div id="popularList" class="list-group list-group-flush"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row row-cols-1">
        <div class="col mb-3">
          <h5>Canciones</h5>
          <div id="songsCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
        <div class="col mb-3">
          <h5>Álbumes</h5>
          <div id="albumsCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
        <div class="col mb-3">
          <h5>Merchandising</h5>
          <div id="merchCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <button id="toggleMoreInfo" class="btn btn-link p-0">Más información</button>
          <div id="moreInfo" class="mt-3" hidden>
            <h6>Sobre el artista</h6>
            <p id="artistBio" class="text-muted">Biografía...</p>
            <ul class="list-unstyled small text-muted">
              <li><strong>Género:</strong> <span id="artistGenre">—</span></li>
              <li><strong>País:</strong> <span id="artistCountry">—</span></li>
              <li><strong>Año de inicio:</strong> <span id="artistStarted">—</span></li>
            </ul>
          </div>
        </div>
      </div>
    `

    // Referencias a elementos
    this.$avatar = this.root.querySelector('#artistAvatar')
    this.$name = this.root.querySelector('#artistName')
    this.$listeners = this.root.querySelector('#monthlyListeners')
    this.$follow = this.root.querySelector('#followBtn')
    this.$community = this.root.querySelector('#communityBtn')
    this.$socials = this.root.querySelector('#artistSocials')
    this.$popular = this.root.querySelector('#popularList')
    this.$songs = this.root.querySelector('#songsCarousel')
    this.$albums = this.root.querySelector('#albumsCarousel')
    this.$merch = this.root.querySelector('#merchCarousel')
    this.$toggleMore = this.root.querySelector('#toggleMoreInfo')
    this.$more = this.root.querySelector('#moreInfo')
    this.$bio = this.root.querySelector('#artistBio')
    this.$genre = this.root.querySelector('#artistGenre')
    this.$country = this.root.querySelector('#artistCountry')
    this.$started = this.root.querySelector('#artistStarted')

    // Listeners
    this.$follow.addEventListener('click', () => this.emit('followToggle'))
    this.$toggleMore.addEventListener('click', () => this.emit('moreInfoToggle'))
    this.$community.addEventListener('click', () => this.emit('goCommunity'))
  }

  render(artist) {
    if (!artist) return
    this.$avatar.src = artist.imagen || '/public/default-profile.png'
    this.$name.textContent = artist.nombre || '—'
    this.$listeners.textContent = (artist.oyentesMensuales || 0).toLocaleString()
    this.$bio.textContent = artist.bio || ''
    this.$genre.textContent = artist.genre || '—'
    this.$country.textContent = artist.country || '—'
    this.$started.textContent = artist.started || '—'

    // Socials with icons (Bootstrap Icons)
    this.$socials.innerHTML = ''
    const ICON_MAP = {
      instagram: 'bi-instagram',
      spotify: 'bi-spotify',
      twitter: 'bi-twitter',
      facebook: 'bi-facebook',
      youtube: 'bi-youtube',
      tiktok: 'bi-music-note-beamed'
    }
    if (artist.enlaces) {
      for (const [key, url] of Object.entries(artist.enlaces)) {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noreferrer'
        a.className = 'btn btn-outline-secondary btn-sm d-inline-flex align-items-center'
        a.style.minWidth = 'unset'
        const iconClass = ICON_MAP[key.toLowerCase()] || 'bi-link-45deg'
        // Icon + hidden text for screen readers
        a.innerHTML = `<i class="bi ${iconClass}" aria-hidden="true"></i><span class="visually-hidden">${key}</span>`
        a.title = key
        this.$socials.appendChild(a)
      }
    }

    // Populares
    this.$popular.innerHTML = ''
    if (artist.populares && artist.populares.length) {
      artist.populares.forEach(p => {
        const div = document.createElement('div')
        div.className = 'list-group-item d-flex gap-3 align-items-center'
        div.innerHTML = `
          <img src="${p.portada || '/public/default-profile.png'}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px">
          <div>
            <div class="fw-bold">${p.titulo}</div>
            <div class="text-muted small">${p.tipo}${p.anio ? ' · ' + p.anio : ''}</div>
          </div>
        `
        this.$popular.appendChild(div)
      })
    } else {
      const li = document.createElement('div')
      li.className = 'list-group-item text-muted'
      li.textContent = 'Sin elementos populares'
      this.$popular.appendChild(li)
    }

    // Helper para renderizar tarjetas en carrusel
    const renderCards = (container, items, type) => {
      container.innerHTML = ''
      if (!items || items.length === 0) {
        const empty = document.createElement('div')
        empty.className = 'text-muted'
        empty.textContent = 'Sin elementos'
        container.appendChild(empty)
        return
      }
      items.forEach(item => {
        const card = document.createElement('div')
        card.className = 'card'
        card.style.minWidth = '180px'
        card.innerHTML = `
          <img src="${item.portada || item.imagen || '/public/default-profile.png'}" class="card-img-top" style="height:120px;object-fit:cover" alt="">
          <div class="card-body p-2">
            <div class="card-title small fw-bold">${item.titulo || item.nombre || item.nombre}</div>
            <div class="card-text small text-muted">${item.anio || item.precio || item.duracion || ''}</div>
          </div>
        `
        container.appendChild(card)
      })
    }

    renderCards(this.$songs, artist.canciones, 'cancion')
    renderCards(this.$albums, artist.albumes, 'album')
    renderCards(this.$merch, artist.productos, 'producto')
  }

  setFollowState(followed) {
    this.$follow.textContent = followed ? 'Siguiendo' : 'Seguir'
    this.$follow.classList.toggle('btn-outline-success', followed)
    this.$follow.classList.toggle('btn-success', !followed)
  }

  toggleMoreInfo(show) {
    if (typeof show === 'boolean') {
      this.$more.hidden = !show
      return
    }
    this.$more.hidden = !this.$more.hidden
  }
}
