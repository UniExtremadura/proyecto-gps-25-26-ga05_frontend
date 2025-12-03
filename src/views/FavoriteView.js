import EventEmitter from '../core/EventEmitter.js'

export default class FavoriteView extends EventEmitter {
  constructor(rootEl) {
    super()
    this.root = rootEl
    this.root.classList.add('favorite-view')
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

    this._renderFavorites(state.favorites)
  }

  _renderLoading() {
    this.root.innerHTML = `
      <div class="container py-5 text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading your favorites...</p>
      </div>
    `
  }

  _renderError(error) {
    this.root.innerHTML = `
      <div class="container py-5">
        <div class="alert alert-danger">
          ${error}
          <button class="btn btn-sm btn-outline-danger ms-3" id="retry-btn">Retry</button>
        </div>
      </div>
    `
    this.root.querySelector('#retry-btn')?.addEventListener('click', () => this.emit('retry'))
  }

  _renderFavorites(favorites) {
    const albums = Array.isArray(favorites?.albums) ? favorites.albums : []
    const artists = Array.isArray(favorites?.artists) ? favorites.artists : []
    const songs = Array.isArray(favorites?.songs) ? favorites.songs : []

    const renderItems = (items, type) => {
      if (items.length === 0) return `<p class="text-muted">No ${type.toLowerCase()} found.</p>`
      return items
        .map(item => `<div class="favorite-item py-1">${item.nombre || 'Sin nombre'} </div>`)
        .join('')
    }

    this.root.innerHTML = `
      <div class="container py-4">
        <h3>Artistas favoritos</h3>
        ${renderItems(artists, 'Artista')}

        <h3>Álbumes favoritos</h3>
        ${renderItems(albums, 'Álbum')}

        <h3>Canciones favoritas</h3>
        ${renderItems(songs, 'Canción')}
      </div>
    `
  }
}
