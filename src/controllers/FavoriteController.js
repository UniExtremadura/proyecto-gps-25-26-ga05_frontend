import EventEmitter from '../core/EventEmitter.js'

export default class FavoriteController extends EventEmitter {
  constructor(model, view, userId) {
    super()
    this.model = model
    this.view = view
    this.userId = userId

    this.view.render({ loading: true })

    this.loadFavorites()
    this.view.on('retry', () => this.loadFavorites())
  }

  async loadFavorites() {
    try {
      const favorites = await this.model.loadFavorites(this.userId)
      this.view.render({ favorites })
    } catch (err) {
      this.view.render({ error: err.message || 'Error loading favorites' })
    }
  }
}
