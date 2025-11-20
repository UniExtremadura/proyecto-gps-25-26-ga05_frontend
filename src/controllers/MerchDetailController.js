import EventEmitter from '../core/EventEmitter.js'

export default class MerchDetailController extends EventEmitter {
  constructor(model, view, id) {
    super()
    this.model = model
    this.view = view
    this.id = id

    this.model.on('change', (state) => this.view.render(state))

    this.view.on('comprar', () => this.emit('comprar'))

    // cargar merch
    this.model.load(this.id)
  }
}
