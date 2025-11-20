import EventEmitter from '../core/EventEmitter.js'

export default class MerchDetailView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('merch-detail-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <div id="loading-state" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
        </div>

        <div id="error-state" class="alert alert-danger d-none" role="alert"></div>

        <div id="content" class="d-none">
          <div class="row g-4">
            <div class="col-md-6">
              <div class="ratio ratio-4x3 bg-light merch-image-container mb-3">
                <img id="merch-image" src="" alt="merch" class="w-100 h-100 object-fit-cover">
              </div>
            </div>
            <div class="col-md-6">
              <h2 id="merch-name" class="fw-bold"></h2>
              <div class="mb-2"><strong id="merch-price" class="text-primary"></strong></div>
              <div class="mb-3"><small class="text-muted">Stock: <span id="merch-stock">-</span></small></div>
              <p id="merch-desc" class="text-muted"></p>

              <div id="actions" class="mt-4">
                <button id="btn-buy" class="btn btn-primary">Comprar</button>
                <a href="/merch" data-link class="btn btn-outline-secondary ms-2">Volver</a>
              </div>

              <div id="message-area" class="mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    `

    this.$loading = this.root.querySelector('#loading-state')
    this.$error = this.root.querySelector('#error-state')
    this.$content = this.root.querySelector('#content')
    this.$image = this.root.querySelector('#merch-image')
    this.$name = this.root.querySelector('#merch-name')
    this.$price = this.root.querySelector('#merch-price')
    this.$stock = this.root.querySelector('#merch-stock')
    this.$desc = this.root.querySelector('#merch-desc')
    this.$btnBuy = this.root.querySelector('#btn-buy')
    this.$message = this.root.querySelector('#message-area')

    this.$btnBuy.addEventListener('click', () => this.emit('comprar'))
  }

  render(state) {
    if (state.loading) return this._showLoading()
    if (state.error) return this._showError(state.error)
    this._showContent(state.merch)
  }

  _showLoading() {
    this.$loading.classList.remove('d-none')
    this.$error.classList.add('d-none')
    this.$content.classList.add('d-none')
  }

  _showError(error) {
    this.$loading.classList.add('d-none')
    this.$error.classList.remove('d-none')
    this.$error.textContent = error
    this.$content.classList.add('d-none')
  }

  _showContent(merch) {
    this.$loading.classList.add('d-none')
    this.$error.classList.add('d-none')
    this.$content.classList.remove('d-none')

    if (!merch) return
    this.$image.src = merch.imagenUrl || ''
    this.$image.alt = merch.nombre || 'Producto'
    this.$name.textContent = merch.nombre || ''
    this.$price.textContent = merch.precioFormateado || merch.precio || ''
    this.$stock.textContent = typeof merch.stock !== 'undefined' ? merch.stock : '-'
    this.$desc.textContent = merch.descripcion || ''

    // Desactivar comprar si no hay stock
    if (Number(merch.stock) <= 0) {
      this.$btnBuy.setAttribute('disabled', 'disabled')
      this.$btnBuy.textContent = 'Agotado'
    } else {
      this.$btnBuy.removeAttribute('disabled')
      this.$btnBuy.textContent = 'Comprar'
    }
  }

  showMessage(text, type = 'success') {
    this.$message.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`
    setTimeout(() => { this.$message.innerHTML = '' }, 3500)
  }

  showError(text) {
    this.showMessage(text, 'danger')
  }
}
