import EventEmitter from '../core/EventEmitter.js'

export default class AllNewsController extends EventEmitter {
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

    this.view.on('filtrosCambiados', (filtros) => {
      this.model.actualizarFiltros(filtros)
    })

    this.view.on('cambiarPagina', (pagina) => {
      this.model.cambiarPagina(pagina)
    })

    this.view.on('verNoticia', (id) => {
      this.emit('verNoticia', id)
    })

    this.view.on('goHome', () => {
      this.emit('goHome')
    })

    // Cargar noticias al inicializar
    this.model.cargarNoticias()
  }
}
