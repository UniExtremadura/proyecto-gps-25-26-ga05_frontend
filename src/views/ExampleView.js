// Vista: renderiza UI y emite eventos de interacción
import EventEmitter from '../core/EventEmitter.js'

export default class ExampleView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('example-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-header d-flex align-items-center gap-2">
          <i class="bi bi-music-note-list"></i>
          <strong>Ejemplo MVC (lista simple)</strong>
        </div>
        <div class="card-body">
          <form id="add-form" class="d-flex gap-2 mb-3" autocomplete="off">
            <input id="item-input" class="form-control" placeholder="Añadir elemento (p.ej. Merch)" />
            <button class="btn btn-primary" type="submit">
              <i class="bi bi-plus-lg"></i> Añadir
            </button>
          </form>
          <ul id="list" class="list-group"></ul>
        </div>
      </div>
    `

    this.$form = this.root.querySelector('#add-form')
    this.$input = this.root.querySelector('#item-input')
    this.$list = this.root.querySelector('#list')

    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      this.emit('add', this.$input.value)
      this.$input.value = ''
      this.$input.focus()
    })
  }

  render(state) {
    // Rellena la lista
    this.$list.innerHTML = ''

    if (!state.items || state.items.length === 0) {
      const li = document.createElement('li')
      li.className = 'list-group-item text-muted'
      li.textContent = 'Sin elementos aún'
      this.$list.appendChild(li)
      return
    }

    state.items.forEach((text, index) => {
      const li = document.createElement('li')
      li.className = 'list-group-item d-flex justify-content-between align-items-center'
      li.innerHTML = `
        <span>${text}</span>
        <button class="btn btn-sm btn-outline-danger" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      `
      this.$list.appendChild(li)
    })

    // Delegación para borrar
    this.$list.querySelectorAll('button[data-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'))
        this.emit('removeAt', idx)
      })
    })
  }
}
