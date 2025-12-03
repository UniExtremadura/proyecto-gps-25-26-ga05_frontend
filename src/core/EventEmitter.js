// Pequeño EventEmitter para comunicar Modelo y Vista sin dependencias
export default class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, handler) {
    const list = this.events.get(event) || new Set()
    list.add(handler)
    this.events.set(event, list)
    return () => this.off(event, handler)
  }

  off(event, handler) {
    const list = this.events.get(event)
    if (!list) return
    list.delete(handler)
    if (list.size === 0) this.events.delete(event)
  }

  emit(event, payload) {
    const list = this.events.get(event)
    if (!list) return
    for (const handler of list) handler(payload)
  }
}
