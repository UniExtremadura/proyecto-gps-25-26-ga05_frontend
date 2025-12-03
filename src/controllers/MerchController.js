import EventEmitter from '../core/EventEmitter.js'

export default class MerchController extends EventEmitter {
  constructor(model, view) {
    super()
    this.model = model
    this.view = view

    this.model.on('change', (state) => this.view.render(state))

    this.view.on('cargarMerchs', () => this.model.cargarMerchs())

    this.view.on('verMerch', (id) => this.emit('verMerch', id))

    // Cargar al iniciar
    this.model.cargarMerchs()
  }
}
