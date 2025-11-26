import EventEmitter from '../core/EventEmitter.js'
import ApiClient from '../services/ApiClient.js'

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
              <div id="merch-stats" class="mb-3"></div>
              <p id="merch-desc" class="text-muted"></p>

              <!-- 🟦 FORMULARIO DE COMPRA -->
              <div class="card p-3 mt-4">
                <h5 class="mb-3">Datos de pago</h5>

                <label class="form-label">Cantidad</label>
                <input id="input-cantidad" type="number" min="1" value="1" class="form-control mb-3">

                <label class="form-label">Número de tarjeta</label>
                <input id="input-numero" type="text" maxlength="16" class="form-control mb-3">

                <label class="form-label">CVV</label>
                <input id="input-cvv" type="text" maxlength="3" class="form-control mb-3">

                <label class="form-label">Fecha expiración (MM/AA)</label>
                <input id="input-exp" type="text" placeholder="12/26" class="form-control mb-3">

                <button id="btn-pagar" class="btn btn-success w-100">Pagar</button>
              </div>

              <a href="/merch" data-link class="btn btn-outline-secondary mt-3">Volver</a>
              <button id="btn-borrar-merch" class="btn btn-danger mt-3 ms-2" hidden>Borrar producto</button>

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
    this.$stats = this.root.querySelector('#merch-stats')
    this.$desc = this.root.querySelector('#merch-desc')
    this.$message = this.root.querySelector('#message-area')

    // Inputs
    this.$cantidad = this.root.querySelector("#input-cantidad")
    this.$numero = this.root.querySelector("#input-numero")
    this.$cvv = this.root.querySelector("#input-cvv")
    this.$exp = this.root.querySelector("#input-exp")

    // Botón pagar
    this.$btnPagar = this.root.querySelector("#btn-pagar")

    this.$btnBorrar = this.root.querySelector('#btn-borrar-merch')

    // Evento pagar
    this.$btnPagar.addEventListener("click", () => {
      this.emit("pagar", {
        cantidad: Number(this.$cantidad.value),
        tarjeta: {
          numero: this.$numero.value,
          cvv: this.$cvv.value,
          expiracion: this.$exp.value
        }
      })
    })

    // Borrar (solo administradores)
    const currentUser = JSON.parse(localStorage.getItem('authUser') || 'null')
    const isAdmin = !!(currentUser && currentUser.tipo === 1)
    if (this.$btnBorrar) {
      this.$btnBorrar.hidden = !isAdmin
      this.$btnBorrar.addEventListener('click', async () => {
        const ok = confirm('¿Eliminar este producto de merchandising? Esta acción no se puede deshacer.')
        if (!ok) return
        // Obtenemos id del merch desde dataset o desde el name text si fuera necesario
        const id = this.$name.dataset?.id || this.$btnBorrar.dataset?.id || null
        if (!id) {
          // Emitir sin id para que el controlador intente realizar acción con el estado actual
          this.emit('borrarMerch')
          return
        }
        try {
          await ApiClient.deleteMerch(id)
          this.emit('merchDeleted', id)
        } catch (err) {
          console.error('Error al eliminar merch:', err)
          this.showError('Error al eliminar el producto: ' + (err.message || err))
        }
      })
    }
  }

  render(state) {
    if (state.loading) return this._showLoading()
    if (state.error) return this._showError(state.error)
    this._showContent(state.merch)
    
    if (state.estadisticas) {
      this._renderEstadisticas(state.estadisticas)
    }
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

    this.$image.src = merch.imagenUrl || ''
    this.$image.alt = merch.nombre || 'Producto'
    this.$name.textContent = merch.nombre || ''
    // Guardar id en dataset para acciones como borrar
    if (merch.id || merch.Id || merch.merchId) {
      this.$name.dataset.id = merch.id || merch.Id || merch.merchId
      if (this.$btnBorrar) this.$btnBorrar.dataset.id = merch.id || merch.Id || merch.merchId
    }
    this.$price.textContent = merch.precioFormateado || merch.precio || ''
    this.$stock.textContent = merch.stock ?? '-'
    this.$desc.textContent = merch.descripcion || ''

    // Si no hay stock → deshabilitar pago
    if (Number(merch.stock) <= 0) {
      this.$btnPagar.setAttribute('disabled', 'disabled')
      this.$btnPagar.textContent = 'Agotado'
    } else {
      this.$btnPagar.removeAttribute('disabled')
      this.$btnPagar.textContent = 'Pagar'
    }
  }

  showMessage(text, type = 'success') {
    this.$message.innerHTML = `<div class="alert alert-${type}" role="alert">${text}</div>`
    setTimeout(() => { this.$message.innerHTML = '' }, 3500)
  }

  showError(text) {
    this.showMessage(text, 'danger')
  }

  _renderEstadisticas(estadisticas) {
    if (!this.$stats) return
    
    const totalVentas = estadisticas.totalVentas || 0
    const ventasUltimoMes = estadisticas.ventasUltimoMes || 0
    
    this.$stats.innerHTML = `
      <div class="alert alert-info mb-0">
        <strong><i class="bi bi-graph-up me-2"></i>Estadísticas de ventas:</strong>
        <div class="mt-2">
          <span class="badge bg-primary me-2">${totalVentas} unidades vendidas</span>
          ${ventasUltimoMes > 0 ? `<span class="badge bg-secondary">${ventasUltimoMes} este mes</span>` : ''}
        </div>
      </div>
    `
  }
}
