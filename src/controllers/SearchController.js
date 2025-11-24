// Controlador: conecta Vista y Modelo de búsqueda
export default class SearchController {
  constructor(model, view) {
    this.model = model
    this.view = view

    // Suscribe a eventos de la vista
    this.view.on('search', (query) => this.model.setQuery(query))
    this.view.on('selectResult', (data) => this.handleResultSelect(data))

    // Render en cambios del modelo
    this.model.on('change', (state) => this.view.render(state))
  }

  handleResultSelect(data) {
    const { type, id, item } = data
    
    // Navegar usando el router global
    if (!window.router) {
      return
    }
    
    switch (type) {
      case 'artist':
        window.router.navigate(`/usuario/${id}`)
        break
      case 'song':
        // Navegar al álbum que contiene la canción
        if (item.albumId) {
          window.router.navigate(`/album/${item.albumId}`)
        } else {
          console.log('Canción sin álbum asociado')
        }
        break
      case 'album':
        window.router.navigate(`/album/${id}`)
        break
      case 'product':
        window.router.navigate(`/merch/${id}`)
        break
      default:
        console.warn('Tipo de resultado desconocido:', type)
    }
  }
}
