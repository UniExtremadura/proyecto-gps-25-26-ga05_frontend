// Modelo: gestiona estado y notifica cambios
import EventEmitter from '../core/EventEmitter.js'

export default class ExampleModel extends EventEmitter {
  constructor() {
    super()
    this.state = {
      items: ['Vinilo', 'CD'],
    }
  }

  getState() {
    // Inmutabilidad ligera
    return JSON.parse(JSON.stringify(this.state))
  }

  addItem(text) {
    const t = (text || '').trim()
    if (!t) return
    this.state = { ...this.state, items: [...this.state.items, t] }
    this.emit('change', this.getState())
  }

  removeAt(index) {
    if (index < 0 || index >= this.state.items.length) return
    const items = this.state.items.filter((_, i) => i !== index)
    this.state = { ...this.state, items }
    this.emit('change', this.getState())
  }
}
