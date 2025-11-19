import EventEmitter from '../core/EventEmitter.js'

export default class UploadAlbumView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('upload-album-view')
    this.canciones = []
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <!-- Cabecera -->
        <header class="mb-5">
          <h1 class="display-4 fw-bold text-dark mb-3">
            <i class="bi bi-cloud-upload me-3"></i>Subir Álbum
          </h1>
          <p class="lead text-muted">Agrega un nuevo álbum con todas sus canciones a la plataforma.</p>
        </header>

        <!-- Estados -->
        <div id="loading-state" class="text-center py-5 d-none">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Subiendo álbum...</span>
          </div>
          <p class="text-muted mt-2">Subiendo álbum y canciones...</p>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <span id="error-message"></span>
        </div>

        <div id="success-state" class="alert alert-success d-none" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          <span id="success-message">¡Álbum subido exitosamente!</span>
          <button class="btn btn-sm btn-outline-success ms-3" id="nuevo-album-btn">Subir otro álbum</button>
        </div>

        <!-- Formulario principal -->
        <div id="form-container">
          <form id="album-form" class="needs-validation" novalidate>
            <div class="row g-4">
              <!-- Información del Álbum -->
              <div class="col-lg-6">
                <div class="card shadow-sm border-0">
                  <div class="card-header bg-primary text-white">
                    <h5 class="card-title mb-0">
                      <i class="bi bi-disc me-2"></i>Información del Álbum
                    </h5>
                  </div>
                  <div class="card-body">
                    <!-- Nombre del Álbum -->
                    <div class="mb-3">
                      <label for="album-nombre" class="form-label">Nombre del Álbum *</label>
                      <input type="text" class="form-control" id="album-nombre" required>
                      <div class="invalid-feedback">Por favor ingresa el nombre del álbum.</div>
                    </div>

                    <!-- Artista -->
                    <div class="mb-3">
                      <label for="album-artista" class="form-label">Artista *</label>
                      <select class="form-select" id="album-artista" required>
                        <option value="">Seleccionar artista...</option>
                      </select>
                      <div class="invalid-feedback">Por favor selecciona un artista.</div>
                    </div>

                    <!-- Género -->
                    <div class="mb-3">
                      <label for="album-genero" class="form-label">Género</label>
                      <select class="form-select" id="album-genero">
                        <option value="">Seleccionar género...</option>
                      </select>
                    </div>

                    <!-- Fecha de Lanzamiento -->
                    <div class="mb-3">
                      <label for="album-fecha" class="form-label">Fecha de Lanzamiento</label>
                      <input type="date" class="form-control" id="album-fecha">
                    </div>

                    <!-- Imagen del Álbum (OBLIGATORIA) -->
                    <div class="mb-3">
                      <label for="album-imagen" class="form-label">Imagen del Álbum *</label>
                      <input type="file" class="form-control" id="album-imagen" accept="image/*" required>
                      <div class="invalid-feedback">La imagen del álbum es obligatoria.</div>
                      <div class="form-text">Formatos aceptados: JPG, GIF. Máx. 1MB.</div>
                      <div id="imagen-preview" class="mt-2 d-none">
                        <img src="" alt="Vista previa" class="img-thumbnail" style="max-height: 150px;">
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Canciones -->
              <div class="col-lg-6">
                <div class="card shadow-sm border-0">
                  <div class="card-header bg-success text-white">
                    <h5 class="card-title mb-0">
                      <i class="bi bi-music-note-list me-2"></i>Canciones
                    </h5>
                  </div>
                  <div class="card-body">
                    <!-- Formulario para agregar canción -->
                    <div class="mb-4 p-3 border rounded">
                      <h6 class="mb-3">Agregar Canción</h6>
                      
                      <div class="mb-2">
                        <label for="cancion-nombre" class="form-label">Nombre *</label>
                        <input type="text" class="form-control" id="cancion-nombre" placeholder="Nombre de la canción">
                      </div>

                      <div class="row g-2 mb-3">
                        <div class="col-6">
                          <label for="cancion-duracion" class="form-label">Duración (MM:SS) *</label>
                          <input type="text" class="form-control" id="cancion-duracion" placeholder="3:45" pattern="[0-9]{1,2}:[0-9]{2}">
                        </div>
                        <div class="col-6">
                          <label for="cancion-audio" class="form-label">Archivo de Audio *</label>
                          <input type="file" class="form-control" id="cancion-audio" accept="audio/*">
                        </div>
                      </div>

                      <button type="button" class="btn btn-outline-primary btn-sm" id="agregar-cancion-btn">
                        <i class="bi bi-plus-circle me-1"></i>Agregar Canción
                      </button>
                    </div>

                    <!-- Lista de canciones -->
                    <div id="lista-canciones" class="mt-3">
                      <h6 class="text-muted mb-3">Canciones agregadas (<span id="contador-canciones">0</span>)</h6>
                      <div id="canciones-container" class="space-y-2">
                        <!-- Las canciones se mostrarán aquí -->
                      </div>
                      <div id="sin-canciones-alert" class="alert alert-warning mt-3 ${this.canciones.length > 0 ? 'd-none' : ''}">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Debes agregar al menos una canción al álbum.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex gap-2 justify-content-end">
                  <button type="button" class="btn btn-outline-secondary" id="cancelar-btn">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                  <button type="submit" class="btn btn-primary" id="subir-btn">
                    <i class="bi bi-cloud-upload me-1"></i>Subir Álbum
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `

    // Referencias a elementos
    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$errorMessage = this.root.querySelector('#error-message')
    this.$success = this.root.querySelector('#success-state')
    this.$successMessage = this.root.querySelector('#success-message')
    this.$formContainer = this.root.querySelector('#form-container')
    this.$form = this.root.querySelector('#album-form')
    this.$cancionesContainer = this.root.querySelector('#canciones-container')
    this.$contadorCanciones = this.root.querySelector('#contador-canciones')
    this.$sinCancionesAlert = this.root.querySelector('#sin-canciones-alert')
    this.$imagenPreview = this.root.querySelector('#imagen-preview')
    this.$imagenPreviewImg = this.$imagenPreview.querySelector('img')

    // Event listeners
    this._setupEventListeners()
  }

  _setupEventListeners() {
    // Agregar canción
    this.root.querySelector('#agregar-cancion-btn').addEventListener('click', () => {
      this._agregarCancion()
    })

    // Submit del formulario
    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      this._submitForm()
    })

    // Botón cancelar
    this.root.querySelector('#cancelar-btn').addEventListener('click', () => {
      this.emit('cancelar')
    })

    // Botón nuevo álbum
    this.root.querySelector('#nuevo-album-btn').addEventListener('click', () => {
      this._resetForm()
    })

    // Enter en los campos de canción
    this.root.querySelector('#cancion-nombre').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this._agregarCancion()
      }
    })

    // Vista previa de imagen
    this.root.querySelector('#album-imagen').addEventListener('change', (e) => {
      this._mostrarVistaPreviaImagen(e.target.files[0])
    })
  }

  _mostrarVistaPreviaImagen(file) {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.$imagenPreviewImg.src = e.target.result
        this.$imagenPreview.classList.remove('d-none')
      }
      reader.readAsDataURL(file)
    } else {
      this.$imagenPreview.classList.add('d-none')
    }
  }

  _agregarCancion() {
    const nombre = this.root.querySelector('#cancion-nombre').value.trim()
    const duracion = this.root.querySelector('#cancion-duracion').value.trim()
    const audioFile = this.root.querySelector('#cancion-audio').files[0]

    // Validaciones
    if (!nombre) {
      this._mostrarErrorTemporal('Por favor ingresa el nombre de la canción')
      return
    }

    if (!duracion || !/^\d{1,2}:\d{2}$/.test(duracion)) {
      this._mostrarErrorTemporal('Por favor ingresa una duración válida en formato MM:SS')
      return
    }

    if (!audioFile) {
      this._mostrarErrorTemporal('Por favor selecciona un archivo de audio')
      return
    }

    // Validar tipo de archivo
    if (!audioFile.type.startsWith('audio/')) {
      this._mostrarErrorTemporal('Por favor selecciona un archivo de audio válido')
      return
    }

    // Agregar canción a la lista
    const cancion = {
      id: Date.now(), // ID temporal
      nombre,
      duracion,
      archivoAudio: audioFile,
      nombreArchivo: audioFile.name
    }

    this.canciones.push(cancion)
    this._actualizarListaCanciones()
    this._limpiarCamposCancion()

    this._mostrarExitoTemporal('Canción agregada correctamente')
  }

  _actualizarListaCanciones() {
    this.$cancionesContainer.innerHTML = this.canciones.map((cancion, index) => `
      <div class="card border-0 bg-light mb-2" data-id="${cancion.id}">
        <div class="card-body py-2">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-0">${cancion.nombre}</h6>
              <small class="text-muted">Duración: ${cancion.duracion} | Archivo: ${cancion.nombreArchivo}</small>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm quitar-cancion" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('')

    this.$contadorCanciones.textContent = this.canciones.length
    
    // Mostrar/ocultar alerta de sin canciones
    if (this.canciones.length === 0) {
      this.$sinCancionesAlert.classList.remove('d-none')
    } else {
      this.$sinCancionesAlert.classList.add('d-none')
    }

    // Event listeners para botones de quitar
    this.$cancionesContainer.querySelectorAll('.quitar-cancion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.closest('.quitar-cancion').getAttribute('data-index'))
        this.canciones.splice(index, 1)
        this._actualizarListaCanciones()
      })
    })
  }

  _limpiarCamposCancion() {
    this.root.querySelector('#cancion-nombre').value = ''
    this.root.querySelector('#cancion-duracion').value = ''
    this.root.querySelector('#cancion-audio').value = ''
  }

  _mostrarErrorTemporal(mensaje) {
    const alert = document.createElement('div')
    alert.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3'
    alert.style.zIndex = '1060'
    alert.innerHTML = `
      <i class="bi bi-exclamation-triangle me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    document.body.appendChild(alert)

    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert)
      }
    }, 3000)
  }

  _mostrarExitoTemporal(mensaje) {
    const alert = document.createElement('div')
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3'
    alert.style.zIndex = '1060'
    alert.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    document.body.appendChild(alert)

    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert)
      }
    }, 2000)
  }

async _submitForm() {
  if (!this.$form.checkValidity()) {
    this.$form.classList.add('was-validated')
    
    // Validación adicional para la imagen
    const imagenFile = this.root.querySelector('#album-imagen').files[0]
    if (!imagenFile) {
      this.root.querySelector('#album-imagen').classList.add('is-invalid')
    }
    
    return
  }

  // Validación de imagen
  const imagenFile = this.root.querySelector('#album-imagen').files[0]
  if (imagenFile) {
    // Validar tamaño (1MB = 5 * 1024 * 1024 bytes)
    const maxSize = 1 * 1024 * 1024; // 1MB en bytes
    if (imagenFile.size > maxSize) {
      this._mostrarErrorTemporal('La imagen es demasiado grande. Máximo 1MB permitido.')
      this.root.querySelector('#album-imagen').classList.add('is-invalid')
      return
    }

    // Validar formato
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/gif']
    if (!allowedTypes.includes(imagenFile.type)) {
      this._mostrarErrorTemporal('Formato de imagen no válido. Solo se permiten JPG o GIF.')
      this.root.querySelector('#album-imagen').classList.add('is-invalid')
      return
    }
  }


  

  if (this.canciones.length === 0) {
    this._mostrarErrorTemporal('Debes agregar al menos una canción al álbum')
    return
  }

  try {
    // Obtener datos del formulario
    const nombre = this.root.querySelector('#album-nombre').value.trim()
    const artista = parseInt(this.root.querySelector('#album-artista').value)
    const generoValue = this.root.querySelector('#album-genero').value
    const fecha = this.root.querySelector('#album-fecha').value
    const imagenFile = this.root.querySelector('#album-imagen').files[0]

    const imagenBase64 = await this._fileToBase64(imagenFile)

    const albumData = {
      nombre: nombre,
      artista: artista,
      imagen: imagenBase64,
      fecha: fecha || new Date().toISOString().split('T')[0]
    }

    if (generoValue) {
      albumData.genero = parseInt(generoValue)
    }

  this.emit('subirAlbum', {
	album: albumData,
	songs: this.canciones
  })

  } catch (error) {
    this._mostrarErrorTemporal('Error al procesar la imagen: ' + error.message)
  }
}

  // Función auxiliar para convertir File a Base64
  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Remover el prefijo "data:image/...;base64," para obtener solo los datos base64
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  _resetForm() {
    this.$form.reset()
    this.$form.classList.remove('was-validated')
    this.canciones = []
    this._actualizarListaCanciones()
    this.$imagenPreview.classList.add('d-none')
    this.$formContainer.classList.remove('d-none')
    this.$success.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$loading.classList.add('d-none')
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

    if (state.success) {
      this._showSuccess(state.successMessage)
      return
    }

    this._showForm(state)
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

  _showSuccess(message = '¡Álbum subido exitosamente!') {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$success.classList.remove('d-none')
    this.$successMessage.textContent = message
    this.$formContainer.classList.add('d-none')
  }

  _showForm(state) {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$success.classList.add('d-none')
    this.$formContainer.classList.remove('d-none')

    // Llenar select de géneros
    const $generoSelect = this.root.querySelector('#album-genero')
    $generoSelect.innerHTML = '<option value="">Seleccionar género...</option>' +
      (state.generos?.map(genero => 
        `<option value="${genero.id}">${genero.nombre}</option>`
      ).join('') || '')

    // Llenar select de artistas
    const $artistaSelect = this.root.querySelector('#album-artista')
    $artistaSelect.innerHTML = '<option value="">Seleccionar artista...</option>' +
      (state.artistas?.map(artista => 
        `<option value="${artista.id}">${artista.nombre}</option>`
      ).join('') || '')
  }
}
