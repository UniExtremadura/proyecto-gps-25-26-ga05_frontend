import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class MerchModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      merchs: [],
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarMerchs() {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())

      const merchs = await ApiClient.getMerchs()

      const merchsProcesados = (merchs || []).map(m => {
        // Construir URL de imagen a partir del campo `imagen` que el backend devuelve (base64 o array de bytes)
        let imagenUrl = ''
        try {
          if (m && m.imagen) {
            // Si ya viene con prefijo data:, usar tal cual
            if (typeof m.imagen === 'string' && m.imagen.startsWith('data:')) {
              imagenUrl = m.imagen
            } else if (typeof m.imagen === 'string') {
              // Asumir base64 sin prefijo
              imagenUrl = 'data:image/png;base64,' + m.imagen
            } else if (Array.isArray(m.imagen) || (m.imagen && typeof m.imagen === 'object' && typeof m.imagen.length === 'number')) {
              // Convertir array de bytes a base64
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
          console.warn('Error procesando imagen de merch:', err)
          imagenUrl = ''
        }

        return {
          ...m,
          precioFormateado: this.formatearPrecio(m.precio),
          imagenUrl,
          descripcionCorta: (m.descripcion || '').substring(0, 120) + (m.descripcion && m.descripcion.length > 120 ? '...' : '')
        }
      })

      this.state = {
        ...this.state,
        merchs: merchsProcesados,
        loading: false
      }
      this.emit('change', this.getState())
    } catch (error) {
      this.state = { ...this.state, loading: false, error: error.message }
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
