import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class MerchDetailController extends EventEmitter {
  constructor(model, view, id) {
    super()
    this.model = model
    this.view = view
    this.id = id

    // Renderizar cuando cambie el modelo
    this.model.on('change', (state) => this.view.render(state))

    // Mantener el evento "comprar" si alguien lo usa
    this.view.on('comprar', () => this.emit('comprar'))

    // Pago con cantidad que envía al endpoint /pedido/pago
    this.view.on('pagar', async (data) => {
      try {
        // Obtener usuario logueado
        const user = JSON.parse(localStorage.getItem('authUser') || 'null')
        if (!user?.id) throw new Error('Usuario no logueado')

        // Desestructurar tarjeta
        const { numero, cvv, expiracion } = data.tarjeta || {}
        const numeroStr = String(numero).replace(/\s+/g, '')
        const cvvStr = String(cvv).replace(/\s+/g, '')
        const cantidad = Number(data.cantidad) || 1

        if (!numeroStr || numeroStr.length !== 16) throw new Error('Número de tarjeta inválido')
        if (!cvvStr || cvvStr.length < 3) throw new Error('CVV inválido')
        if (!expiracion) throw new Error('Fecha de expiración inválida')
        if (cantidad < 1) throw new Error('Cantidad inválida')

        // Construir payload para el backend
        const payload = {
          cliente_id: user.id,
          producto: {
            id: this.id,
            tipo: 'fisico',
            cantidad
          },
          pago: {
            tipo: 'tarjeta',
            numero: numeroStr,
            cvv: cvvStr,
            expiracion
          }
        }

        // Llamada al backend
        const res = await ApiClient.comprarMerch(payload)
        this.view.showMessage(res?.mensaje || 'Compra realizada con éxito!')

        // Recargar información del producto (stock, etc.)
        await this.model.load(this.id)
      } catch (err) {
        this.view.showError(err.message || 'Error en el pago')
      }
    })

    // Cargar detalle del merch
    this.model.load(this.id)
  }
}
