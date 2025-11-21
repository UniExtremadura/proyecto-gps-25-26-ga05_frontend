import EventEmitter from '../core/EventEmitter.js'

export default class UploadNoticiaController extends EventEmitter {
  constructor(model, view) {
    super()
    this.model = model
    this.view = view

    this.model.on('change', (state) => this.view.render(state))

    this.view.on('crearNoticia', (payload) => {
      this.model.crearNoticia(payload)
    })

    this.view.on('cancelar', () => this.emit('cancelar'))
  }
}
