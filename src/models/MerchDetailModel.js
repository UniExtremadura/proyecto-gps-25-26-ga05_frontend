import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class MerchDetailModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      merch: null,
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async load(id) {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())

      const m = await ApiClient.getMerch(id)

      let imagenUrl = ''
      try {
        if (m && m.imagen) {
          if (typeof m.imagen === 'string' && m.imagen.startsWith('data:')) imagenUrl = m.imagen
          else if (typeof m.imagen === 'string') imagenUrl = 'data:image/png;base64,' + m.imagen
          else if (Array.isArray(m.imagen) || (m.imagen && typeof m.imagen === 'object' && typeof m.imagen.length === 'number')) {
            const bytes = Uint8Array.from(m.imagen)
            let binary = ''
            const chunkSize = 0x8000
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
            }
            imagenUrl = 'data:image/png;base64,' + btoa(binary)
          }
        }
      } catch (err) {
        console.warn('Error procesando imagen detail:', err)
        imagenUrl = ''
      }

      const merch = {
        ...m,
        imagenUrl,
        precioFormateado: this.formatearPrecio(m?.precio),
      }

      this.state = { ...this.state, merch, loading: false }
      this.emit('change', this.getState())
    } catch (err) {
      this.state = { ...this.state, error: err.message || String(err), loading: false }
      this.emit('change', this.getState())
    }
  }

  formatearPrecio(precio) {
    try {
      const n = Number(precio)
      if (Number.isNaN(n)) return precio
      return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
    } catch {
      return precio
    }
  }
}
