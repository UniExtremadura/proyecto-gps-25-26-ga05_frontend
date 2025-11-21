import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

export default class PurchaseHistoryModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      historial: null,
      loading: true,
      error: null
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  async cargarHistorial(usuarioId) {
    try {
      this.state = { ...this.state, loading: true, error: null }
      this.emit('change', this.getState())

      // Llamada al API para obtener historial completo
      const data = await ApiClient.getHistorialCompras(usuarioId)
      const historial = data.historial || { comprasAlbumes: [], comprasMerchandising: [] }
      
      // Procesar los álbumes
      const comprasAlbumesProcesadas = await Promise.all(
        (historial.comprasAlbumes || []).map(async (album) => {
          const detalles = await ApiClient.getAlbum(album.idAlbum)
          const fecha = new Date(album.fecha)
          const fechaFormateada = `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`
          return {
            ...album,
            nombre: detalles?.nombre || `Álbum`,
            urlImagen: detalles?.urlImagen || '',
            fecha: fechaFormateada
          }
        })
      )

      // Procesar merchandising
      const comprasMerchProcesadas = await Promise.all(
        (historial.comprasMerchandising || []).map(async (merch) => {
          const detalles = await ApiClient.getMerch(merch.idMerch)
          const fecha = new Date(merch.fecha)
          const fechaFormateada = `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`
          return {
            ...merch,
            nombre: detalles?.nombre || `Producto`,
            urlImagen: detalles?.urlImagen || '',
            fecha: fechaFormateada
          }
        })
      )

      this.state = {
        ...this.state,
        historial: {
          comprasAlbumes: comprasAlbumesProcesadas,
          comprasMerchandising: comprasMerchProcesadas
        },
        loading: false
      }
      this.emit('change', this.getState())
    } catch (error) {
      this.state = {
        ...this.state,
        loading: false,
        error: error.message
      }
      this.emit('change', this.getState())
    }
  }
}
