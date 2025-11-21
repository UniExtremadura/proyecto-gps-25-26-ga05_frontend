import EventEmitter from '../core/EventEmitter.js'

export default class PurchaseHistoryView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('purchase-history-view')
  }

  render(state) {
    if (state.loading) {
      this._renderLoading()
      return
    }

    if (state.error) {
      this._renderError(state.error)
      return
    }

    this._renderHistory(state.historial)
  }

  _renderLoading() {
    this.root.innerHTML = `
      <div class="container py-5 text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Cargando historial de compras...</p>
      </div>
    `
  }

  _renderError(error) {
    this.root.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <div>${error}</div>
          <button class="btn btn-sm btn-outline-danger ms-auto" id="retry-btn">Reintentar</button>
        </div>
      </div>
    `

    this.root.querySelector('#retry-btn').addEventListener('click', () => {
      this.emit('retry')
    })
  }

  _renderHistory(historial) {
    if (!historial) {
      this._renderError('No hay historial de compras')
      return
    }

    const renderAlbums = historial.comprasAlbumes.map(a => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <img src="${a.urlImagen || ''}" alt="${a.nombre || 'Album'}" class="me-2" style="width:40px;height:40px;">
          ${a.nombre || 'Sin nombre'} 
        </div>
        <small class="text-muted">${a.fecha}</small>
      </li>
    `).join('')

    const renderMerch = historial.comprasMerchandising.map(m => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <img src="${m.urlImagen || ''}" alt="${m.nombre || 'Merch'}" class="me-2" style="width:40px;height:40px;">
          ${m.nombre || 'Sin nombre'} 
        </div>
        <small class="text-muted">${m.fecha}</small>
      </li>
    `).join('')

    this.root.innerHTML = `
      <div class="container py-4">
        <h3>Historial de Compras</h3>

        <h5 class="mt-4">Álbumes</h5>
        <ul class="list-group mb-4">${renderAlbums || '<li class="list-group-item text-muted">No hay compras de álbumes</li>'}</ul>

        <h5>Merchandising</h5>
        <ul class="list-group mb-4">${renderMerch || '<li class="list-group-item text-muted">No hay compras de merchandising</li>'}</ul>
      </div>
    `
  }
}
