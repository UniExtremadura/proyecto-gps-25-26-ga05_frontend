import EventEmitter from '../core/EventEmitter.js'

export default class AlbumExplorerController extends EventEmitter {
  constructor(model, view, router) {
    super()
    this.model = model
    this.view = view
	this.router = router

    this.model.on('change', (state) => {
      this.view.render(state)
    })

    this.view.on('buscar', (query) => {
      this.model.setQuery(query)
    })

    this.view.on('cambiarGenero', (genero) => {
      this.model.setFiltroGenero(genero || null)
    })

    this.view.on('cambiarFormato', (formato) => {
      this.model.setFiltroFormato(formato || null)
    })

    this.view.on('cambiarPagina', (page) => {
      this.model.setPage(page)
    })

    this.view.on('reintentar', () => {
      this.model.cargarAlbumes()
    })

    this.view.on('limpiarFiltros', () => {
      this.model.setQuery('')
      this.model.setFiltroGenero(null)
      this.model.setFiltroFormato(null)
      this.view.root.querySelector('#search-input').value = ''
      this.view.root.querySelector('#genre-filter').value = ''
      this.view.root.querySelector('#format-filter').value = ''
    })

	this.view.on('verAlbumDetalle', (albumId) => {
      this.router.navigate(`/album/${albumId}`)
    })

  this.view.on('toggleFavoritoAlbum', async (albumId) => {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || 'null')
      if (!user?.id) throw new Error("Debes iniciar sesión")

      const albumIdNum = Number(albumId)  // <-- convertir a número
      const album = this.model.state.albumes.find(a => a.id === albumIdNum)
      if (!album) return

      if (album.favorito) {
        await this.model.removeFavorito(user.id, albumIdNum)
        this.model.marcarFavoritoLocal(albumIdNum, false)
      } else {
        await this.model.addFavorito(user.id, albumIdNum)
        this.model.marcarFavoritoLocal(albumIdNum, true)
      }
    } catch (err) {
      console.error(err)
      this.view.showError("Error gestionando favoritos")
    }
  })

    this._inicializar()
  }

  async _inicializar() {
    const generos = await this.model.cargarGeneros()
    this.view.cargarGeneros(generos)
    this.model.cargarAlbumes()
  }
}
