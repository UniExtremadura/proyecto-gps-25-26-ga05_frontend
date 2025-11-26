import EventEmitter from '../core/EventEmitter.js'

export default class ArtistaView extends EventEmitter {
  constructor(rootEl, isOwner = false) {
    super()
    this.root = rootEl
    this.isOwner = isOwner
    this.currentUser = this._getCurrentUser()
    this.root.classList.add('artist-view')
    this._renderShell()
  }

  _getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('authUser') || 'null')
    } catch {
      return null
    }
  }

  _renderShell() {
    // Comprobar si el usuario autenticado es administrador
    const isAdmin = !!(this.currentUser && this.currentUser.tipo === 1)

    // Comprobar si el usuario autenticado es artista (propietario-artista podrá subir álbumes)
    const isCurrentArtist = !!(this.currentUser && this.currentUser.tipo === 2)
    // Botón de editar solo si es el propietario del perfil
    const editButtonHtml = this.isOwner ? '<button id="editProfileBtn" class="btn btn-warning btn-sm"><i class="bi bi-pencil"></i> Editar perfil</button>' : ''
    // Botón para subir álbum (visible solo para el artista propietario)
    const uploadAlbumButtonHtml = (this.isOwner && isCurrentArtist) ? '<a href="/upload-album" data-link class="btn btn-success btn-sm"><i class="bi bi-cloud-upload"></i> Subir álbum</a>' : ''
    // Botón para publicar noticias (visible solo para administradores propietarios)
    const adminNewsButtonHtml = (this.isOwner && isAdmin) ? '<a href="/upload-noticia" data-link class="btn btn-primary btn-sm"><i class="bi bi-newspaper"></i> Publicar noticia</a>' : ''
    // Botón para administrar usuarios (visible solo cuando el administrador visita su propio perfil)
    const adminUsersButtonHtml = (this.isOwner && isAdmin) ? '<button id="adminUsersBtn" class="btn btn-outline-primary btn-sm"><i class="bi bi-people"></i> Administrar usuarios</button>' : ''
    
    this.root.innerHTML = `
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <div id="artistAvatar" class="rounded-circle d-flex align-items-center justify-content-center" style="width:120px;height:120px;background-color:#e9ecef;">
                <i class="bi bi-person-circle" style="font-size:120px;color:#6c757d;"></i>
              </div>
            </div>
            <div class="col">
              <h2 id="artistName" class="h4 mb-1">Nombre del Artista</h2>
              <div class="d-flex gap-2 align-items-center mb-2">
                <span class="text-muted" id="monthlyListeners">0</span>
                <small class="text-muted">oyentes mensuales</small>
              </div>
              <div class="d-flex gap-2 mb-2">
                ${this.isOwner ? editButtonHtml : '<button id="followBtn" class="btn btn-success btn-sm">Seguir</button>'}
                ${uploadAlbumButtonHtml}
                <button id="communityBtn" class="btn btn-outline-secondary btn-sm" hidden>Comunidad</button>
                ${adminNewsButtonHtml}
                ${adminUsersButtonHtml}
              </div>
              <div id="artistSocials" class="d-flex gap-2 flex-wrap mb-3"></div>
              
              <!-- Información del usuario integrada -->
              <div id="moreInfo" class="mt-2">
                <p id="artistBio" class="text-muted mb-2" style="font-size:0.95rem;">Biografía...</p>
                <div class="text-muted small">
                  <span id="artistEmail">—</span>
                </div>
              </div>

              <!-- Sección de estadísticas del usuario -->
              <div id="estadisticas-usuario" class="mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="mb-0"><i class="bi bi-graph-up"></i> Estadísticas</h6>
                  <div class="btn-group btn-group-sm" role="group" id="periodo-selector">
                    <button type="button" class="btn btn-outline-primary active" data-periodo="total">Total</button>
                    <button type="button" class="btn btn-outline-primary" data-periodo="anno">Año</button>
                    <button type="button" class="btn btn-outline-primary" data-periodo="mes">Mes</button>
                  </div>
                </div>
                <div id="estadisticas-contenido" class="text-muted small">
                  <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="editPanel" class="card shadow-sm mb-4" hidden>
        <div class="card-body">
          <h5 class="card-title"><i class="bi bi-pencil"></i> Editar Perfil</h5>
          <p class="text-muted small">Modifica la información de tu perfil</p>
          
          <div class="mb-3">
            <label for="editNombre" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="editNombre" placeholder="Nombre completo">
          </div>
          
          <div class="mb-3">
            <label for="editDescripcion" class="form-label">Descripción</label>
            <textarea class="form-control" id="editDescripcion" rows="3" placeholder="Cuéntanos sobre ti..."></textarea>
          </div>
          
          <div class="mb-3">
            <label for="editCorreo" class="form-label">Correo</label>
            <input type="email" class="form-control" id="editCorreo" placeholder="tu@email.com">
          </div>
          
          <div id="artistVisibilitySection" hidden>
            <hr class="my-3">
            <h6 class="mb-2"><i class="bi bi-gear"></i> Configurar visibilidad del perfil</h6>
            <p class="text-muted small mb-2">Selecciona qué secciones quieres mostrar en tu perfil público</p>
            <!-- Checkbox 'Populares' eliminado -->
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="checkCanciones" checked>
              <label class="form-check-label" for="checkCanciones">Mostrar sección Canciones</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="checkAlbumes" checked>
              <label class="form-check-label" for="checkAlbumes">Mostrar sección Álbumes</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="checkbox" id="checkMerch" checked>
              <label class="form-check-label" for="checkMerch">Mostrar sección Merchandising</label>
            </div>
          </div>
          
          <div class="d-flex gap-2 mt-3">
            <button id="saveProfileBtn" class="btn btn-primary"><i class="bi bi-check-lg"></i> Guardar cambios</button>
            <button id="cancelEditBtn" class="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="row row-cols-1">
        <div class="col mb-3" id="sectionCanciones">
          <h5>Canciones</h5>
          <div id="songsCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
        <div class="col mb-3" id="sectionAlbumes">
          <h5>Álbumes</h5>
          <div id="albumsCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
        <div class="col mb-3" id="sectionMerch">
          <h5>Merchandising</h5>
          <div id="merchCarousel" class="d-flex overflow-auto gap-3 py-2"></div>
        </div>
      </div>
    `

    // Referencias a elementos
    this.$avatar = this.root.querySelector('#artistAvatar')
    this.$name = this.root.querySelector('#artistName')
    this.$listeners = this.root.querySelector('#monthlyListeners')
    this.$follow = this.root.querySelector('#followBtn')
    this.$editProfile = this.root.querySelector('#editProfileBtn')
    this.$community = this.root.querySelector('#communityBtn')
    this.$adminUsers = this.root.querySelector('#adminUsersBtn')
    this.$socials = this.root.querySelector('#artistSocials')
    this.$songs = this.root.querySelector('#songsCarousel')
    this.$albums = this.root.querySelector('#albumsCarousel')
    this.$merch = this.root.querySelector('#merchCarousel')
    this.$more = this.root.querySelector('#moreInfo')
    this.$bio = this.root.querySelector('#artistBio')
    this.$email = this.root.querySelector('#artistEmail')
    
    // Panel de edición
    this.$editPanel = this.root.querySelector('#editPanel')
    this.$editNombre = this.root.querySelector('#editNombre')
    this.$editDescripcion = this.root.querySelector('#editDescripcion')
    this.$editCorreo = this.root.querySelector('#editCorreo')
    this.$artistVisibilitySection = this.root.querySelector('#artistVisibilitySection')
    this.$checkCanciones = this.root.querySelector('#checkCanciones')
    this.$checkAlbumes = this.root.querySelector('#checkAlbumes')
    this.$checkMerch = this.root.querySelector('#checkMerch')
    this.$saveProfile = this.root.querySelector('#saveProfileBtn')
    this.$cancelEdit = this.root.querySelector('#cancelEditBtn')
    
    // Secciones
    this.$sectionCanciones = this.root.querySelector('#sectionCanciones')
    this.$sectionAlbumes = this.root.querySelector('#sectionAlbumes')
    this.$sectionMerch = this.root.querySelector('#sectionMerch')

    // Estadísticas
    this.$estadisticasContenido = this.root.querySelector('#estadisticas-contenido')
    this.$periodoSelector = this.root.querySelector('#periodo-selector')

    // Listeners
    if (this.$follow) {
      this.$follow.addEventListener('click', () => this.emit('followToggle'))
    }
    if (this.$editProfile) {
      this.$editProfile.addEventListener('click', () => this.emit('editProfile'))
    }
    this.$community.addEventListener('click', () => this.emit('goCommunity'))

    // Si existe el botón de administrar usuarios, emitir evento al hacer click
    if (this.$adminUsers) {
      this.$adminUsers.addEventListener('click', (e) => {
        e.preventDefault()
        this.emit('adminUsers')
      })
    }
    
    if (this.$saveProfile) {
      this.$saveProfile.addEventListener('click', () => {
        const profileData = {
          nombre: this.$editNombre.value.trim(),
          descripcion: this.$editDescripcion.value.trim(),
          correo: this.$editCorreo.value.trim()
        }
        
        // Solo incluir settings de visibilidad si es artista
        if (!this.$artistVisibilitySection.hidden) {
          profileData.visibilitySettings = {
            showCanciones: this.$checkCanciones.checked,
            showAlbumes: this.$checkAlbumes.checked,
            showMerch: this.$checkMerch.checked
          }
        }
        
        this.emit('saveProfile', profileData)
      })
    }
    
    if (this.$cancelEdit) {
      this.$cancelEdit.addEventListener('click', () => this.emit('cancelEdit'))
    }

    // Selector de periodo para estadísticas
    if (this.$periodoSelector) {
      this.$periodoSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          this.$periodoSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'))
          e.target.classList.add('active')
          const periodo = e.target.dataset.periodo
          this.emit('cambioPeriodoEstadisticas', periodo)
        }
      })
    }
  }

  render(usuario, isArtist = false, visibilitySettings = {}) {
    if (!usuario) return
    
  // Valores por defecto
    const visibility = {
      showCanciones: true,
      showAlbumes: true,
      showMerch: true,
      showMoreInfo: true,
      ...visibilitySettings
    }
    
    // Mapeo de campos de base de datos a vista
    // Avatar hardcodeado como icono de Bootstrap (provisional)
    // this.$avatar ya contiene el icono, no necesitamos modificarlo
    
    this.$name.textContent = usuario.nombre || '—'
    
    // Mostrar información de contacto en la biografía para usuarios no artistas
    this.$bio.textContent = usuario.descripcion || 'Sin descripción'
    
    // Mostrar solo el correo (información pública no intrusiva)
    this.$email.textContent = usuario.correo || ''

    // Mostrar el botón Comunidad solo si el perfil es de un artista
    if (this.$community) this.$community.hidden = !isArtist
    
    // Si es artista, mostramos oyentes mensuales
    if (isArtist) {
      this.$listeners.textContent = (usuario.oyentesMensuales || 0).toLocaleString()
      this.$listeners.parentElement.style.display = 'flex'
    } else {
      // Para usuarios no artistas, ocultamos esta información
      this.$listeners.parentElement.style.display = 'none'
    }
    
    // Aplicar visibilidad (solo para artistas)
    if (isArtist) {
      this.$sectionCanciones.hidden = !visibility.showCanciones
      this.$sectionAlbumes.hidden = !visibility.showAlbumes
      this.$sectionMerch.hidden = !visibility.showMerch
    } else {
      // Para usuarios no artistas, ocultamos todas las secciones de contenido artístico
      this.$sectionCanciones.hidden = true
      this.$sectionAlbumes.hidden = true
      this.$sectionMerch.hidden = true
    }

    // Socials with icons (Bootstrap Icons + custom SVG)
    this.$socials.innerHTML = ''
    const ICON_MAP = {
      instagram: 'bi-instagram',
      spotify: 'bi-spotify',
      twitter: 'bi-twitter',
      facebook: 'bi-facebook',
      youtube: 'bi-youtube',
      tiktok: 'tiktok-svg'
    }
    
    const TIKTOK_SVG = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z"></path></svg>'
    
    if (usuario.enlaces) {
      for (const [key, url] of Object.entries(usuario.enlaces)) {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noreferrer'
        a.className = 'btn btn-outline-secondary btn-sm d-inline-flex align-items-center'
        a.style.minWidth = 'unset'
        const iconClass = ICON_MAP[key.toLowerCase()] || 'bi-link-45deg'
        
        // Icon + hidden text for screen readers
        if (key.toLowerCase() === 'tiktok') {
          a.innerHTML = `${TIKTOK_SVG}<span class="visually-hidden">${key}</span>`
        } else {
          a.innerHTML = `<i class="bi ${iconClass}" aria-hidden="true"></i><span class="visually-hidden">${key}</span>`
        }
        a.title = key
        this.$socials.appendChild(a)
      }
    }

    // Solo renderizamos contenido de artista si isArtist es true
    if (!isArtist) {
      return
    }

    // Sección Populares eliminada en vista de perfil

    // Helper para formatear precios y renderizar tarjetas en carrusel
    const formatPrice = (p) => {
      if (p == null || p === '') return ''
      const num = Number(p)
      if (!Number.isFinite(num)) return String(p) + ' €'
      try {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num)
      } catch {
        return num.toFixed(2) + ' €'
      }
    }

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
        const imgSrc = item.portada || item.imagen || '/public/default-profile.png'
        const title = item.titulo || item.nombre || item.title || ''
        let meta = ''
        if (item.precio != null && item.precio !== '') {
          meta = formatPrice(item.precio)
        } else {
          meta = item.anio || item.duracion || ''
        }
        card.innerHTML = `
          <img src="${imgSrc}" class="card-img-top" style="height:120px;object-fit:cover" alt="">
          <div class="card-body p-2">
            <div class="card-title small fw-bold">${title}</div>
            <div class="card-text small text-muted">${meta}</div>
          </div>
        `
        container.appendChild(card)
      })
    }

    renderCards(this.$songs, usuario.canciones, 'cancion')
    renderCards(this.$albums, usuario.albumes, 'album')
    renderCards(this.$merch, usuario.productos, 'producto')
  }

  setFollowState(followed) {
    if (!this.$follow) return
    this.$follow.textContent = followed ? 'Siguiendo' : 'Seguir'
    this.$follow.classList.toggle('btn-outline-success', followed)
    this.$follow.classList.toggle('btn-success', !followed)
  }

  setEditMode(editMode, usuario = null, isArtist = false, visibilitySettings = null) {
    if (!this.$editPanel) return
    
    this.$editPanel.hidden = !editMode
    
    if (editMode && usuario) {
      // Rellenar formulario con datos actuales
      this.$editNombre.value = usuario.nombre || ''
      this.$editDescripcion.value = usuario.descripcion || ''
      this.$editCorreo.value = usuario.correo || ''
      
      // Mostrar sección de visibilidad solo para artistas
      if (this.$artistVisibilitySection) {
        this.$artistVisibilitySection.hidden = !isArtist
      }
      
      // Sincronizar checkboxes con configuración actual (solo artistas)
      if (isArtist && visibilitySettings) {
        this.$checkCanciones.checked = visibilitySettings.showCanciones
        this.$checkAlbumes.checked = visibilitySettings.showAlbumes
        this.$checkMerch.checked = visibilitySettings.showMerch
      }
    }
  }

  renderEstadisticas(estadisticas, periodo = 'total') {
    if (!this.$estadisticasContenido) return
    
    const periodoTexto = {
      'total': 'totales',
      'anno': 'del último año',
      'mes': 'del último mes'
    }[periodo] || 'totales'

    this.$estadisticasContenido.innerHTML = `
      <div class="row g-2 mt-1">
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body p-2 text-center">
              <i class="bi bi-headphones text-primary"></i>
              <div class="fw-bold">${estadisticas.totalEscuchas || 0}</div>
              <small class="text-muted">Escuchas ${periodoTexto}</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body p-2 text-center">
              <i class="bi bi-disc text-success"></i>
              <div class="fw-bold">${estadisticas.totalComprasAlbumes || 0}</div>
              <small class="text-muted">Álbumes comprados ${periodoTexto}</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 bg-light">
            <div class="card-body p-2 text-center">
              <i class="bi bi-bag text-warning"></i>
              <div class="fw-bold">${estadisticas.totalComprasMerch || 0}</div>
              <small class="text-muted">Merchandising comprado ${periodoTexto}</small>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

