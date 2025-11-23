import EventEmitter from '../core/EventEmitter.js'

export default class PurchaseHistoryController extends EventEmitter {
  constructor(model, view, usuarioId) {
    super()
    this.model = model
    this.view = view
    this.usuarioId = usuarioId

    // Wiring: Model -> View
    this.model.on('change', (state) => {
      this.view.render(state)
    })

    // Wiring: View -> Model
    this.view.on('retry', () => {
      this.model.cargarHistorial(this.usuarioId)
    })

    this.view.on('goBack', () => {
      this.emit('goBack')
    })

    this.view.on('goHome', () => {
      this.emit('goHome')
    })

    this.view.on('share', (compra) => {
      this.compartirCompra(compra)
    })

    // Cargar historial al inicializar
    this.model.cargarHistorial(this.usuarioId)
  }

  compartirCompra(compra) {
    const url = window.location.href
    const titulo = compra.nombre || 'Compra en Undersounds'
    const texto = `Mira esta compra: ${compra.nombre || 'Detalle no disponible'}`

    if (navigator.share) {
      navigator.share({
        title: titulo,
        text: texto,
        url: url
      })
      .then(() => console.log('Compra compartida exitosamente'))
      .catch((error) => console.log('Error al compartir:', error))
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(url)
        .then(() => alert('URL copiada al portapapeles'))
        .catch(() => prompt('Comparte esta compra copiando la URL:', url))
    }
  }
}
