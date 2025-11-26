import EventEmitter from '../core/EventEmitter.js'

export default class ExampleController extends EventEmitter {
  constructor(model, view) {
    super()
    this.model = model
    this.view = view

    // Wiring: Model -> View
    this.model.on('change', (state) => {
      this.view.render(state)
    })

    // Wiring: View -> Model
    this.view.on('cargarNoticias', () => {
      this.model.cargarNoticias()
    })

    this.view.on('verNoticia', (id) => {
      this.emit('verNoticia', id)
    })

    this.view.on('verTodasNoticias', () => {
      this.emit('verTodasNoticias')
    })

    this.view.on('navigateToAlbum', (albumId) => {
      if (window.router) {
        window.router.navigate(`/album/${albumId}`)
      }
    })

    // Cargar noticias al inicializar
    this.model.cargarNoticias()
  }
}
