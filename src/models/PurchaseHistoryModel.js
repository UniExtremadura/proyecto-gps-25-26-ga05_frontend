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

    // Procesar los álbumes directamente desde el historial sin volver a llamar a getAlbum
    const comprasAlbumesProcesadas = (historial.comprasAlbumes || []).map(album => {
      const fecha = new Date(album.fecha)
      const fechaFormateada = `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`
      return {
        ...album,
        fecha: fechaFormateada,
        urlImagen: album.urlImagen || '' // ya viene base64 desde la API
      }
    })

    // Procesar merchandising directamente
    const comprasMerchProcesadas = (historial.comprasMerchandising || []).map(merch => {
      const fecha = new Date(merch.fecha)
      const fechaFormateada = `${fecha.getDate().toString().padStart(2,'0')}/${(fecha.getMonth()+1).toString().padStart(2,'0')}/${fecha.getFullYear()}`
      return {
        ...merch,
        fecha: fechaFormateada,
        urlImagen: merch.urlImagen || ''
      }
    })

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
