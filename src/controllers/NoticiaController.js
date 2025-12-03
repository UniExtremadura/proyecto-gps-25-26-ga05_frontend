import EventEmitter from '../core/EventEmitter.js'

export default class NoticiaController extends EventEmitter {
  constructor(model, view, noticiaId) {
    super()
    this.model = model
    this.view = view
    this.noticiaId = noticiaId

    // Wiring: Model -> View
    this.model.on('change', (state) => {
      this.view.render(state)
    })

    // Wiring: View -> Model
    this.view.on('retry', () => {
      this.model.cargarNoticia(this.noticiaId)
    })

    this.view.on('goBack', () => {
      this.emit('goBack')
    })

    this.view.on('goHome', () => {
      this.emit('goHome')
    })

    this.view.on('share', (noticia) => {
      this.compartirNoticia(noticia)
    })

    this.view.on('delete', (id) => {
      this.eliminarNoticia(id)
    })

    // Cargar noticia al inicializar
    this.model.cargarNoticia(this.noticiaId)
  }

  compartirNoticia(noticia) {
    if (navigator.share) {
      navigator.share({
        title: noticia.titulo,
        text: noticia.extracto || 'Mira esta noticia en Undersounds',
        url: window.location.href
      })
      .then(() => console.log('Noticia compartida exitosamente'))
      .catch((error) => console.log('Error al compartir:', error))
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('URL copiada al portapapeles')
        })
        .catch(() => {
          // Fallback más básico
          prompt('Comparte esta noticia copiando la URL:', window.location.href)
        })
    }
  }

  async eliminarNoticia(id) {
    // Pre-chequeo de token en cliente para evitar petición inútil
    let token = ''
    try { token = localStorage.getItem('authToken') || '' } catch {}
    if (!token) {
      alert('Debes iniciar sesión como administrador para eliminar noticias.')
      return
    }

    const confirmado = window.confirm('¿Seguro que deseas eliminar esta noticia? Esta acción no se puede deshacer.')
    if (!confirmado) return
    await this.model.eliminarNoticia(id)
    const state = this.model.getState()
    if (state.deleted) {
      // Redirigir al listado de noticias
      window.location.href = '/noticias'
    }
  }
}
