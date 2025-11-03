import ArtistaView from '../views/ArtistaView.js'
import { obtenerArtistaPorId } from '../models/artistaModel.js'

export default class ArtistaController {
  constructor(root) {
    this.view = new ArtistaView(root)
    this.artist = null
    this.followed = false

    // Suscripciones a eventos de la vista
    this.view.on('followToggle', () => this.toggleFollow())
    this.view.on('moreInfoToggle', () => this.view.toggleMoreInfo())
    this.view.on('goCommunity', () => this.openCommunity())

    // Inicializar
    this.init()
  }

  async init() {
    // Por ahora usamos id=1 como demo
    const a = await obtenerArtistaPorId(1)
    if (!a) return
    this.artist = a
    // cargar estado local de seguimiento (localStorage por demo)
    try {
      const key = `follow_artist_${this.artist.id}`
      this.followed = localStorage.getItem(key) === '1'
    } catch (e) {
      this.followed = false
    }

    this.view.render(this.artist)
    this.view.setFollowState(this.followed)
  }

  toggleFollow() {
    this.followed = !this.followed
    try {
      const key = `follow_artist_${this.artist.id}`
      localStorage.setItem(key, this.followed ? '1' : '0')
    } catch (e) {}
    this.view.setFollowState(this.followed)
  }

  openCommunity() {
    if (!this.artist || !this.artist.comunidadUrl) return
    window.open(this.artist.comunidadUrl, '_blank', 'noopener')
  }
}
