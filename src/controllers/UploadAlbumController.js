import EventEmitter from '../core/EventEmitter.js'

export default class UploadAlbumController extends EventEmitter {
  constructor(model, view) {
    super()
    this.model = model
    this.view = view

    // Wiring: Model -> View
    this.model.on('change', (state) => {
      this.view.render(state)
    })

    // Wiring: View -> Model
    this.view.on('subirAlbum', (data) => {
		this.model.subirAlbum(data.album, data.songs)
    })

    this.view.on('cancelar', () => {
      this.emit('cancelar')
    })

    // Cargar datos iniciales
    this.model.cargarGeneros()
    this.model.cargarArtistas()
  }
}
