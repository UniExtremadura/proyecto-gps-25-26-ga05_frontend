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
    
    // Aquí se manejaría la navegación a la página correspondiente
    console.log('Resultado seleccionado:', { type, id, item })
    
    // Ejemplo de navegación (implementar según el enrutador de la aplicación)
    switch (type) {
      case 'artist':
        this.navigateToArtist(id)
        break
      case 'song':
        this.navigateToSong(id)
        break
      case 'album':
        this.navigateToAlbum(id)
        break
      case 'product':
        this.navigateToProduct(id)
        break
      default:
        console.warn('Tipo de resultado desconocido:', type)
    }
  }

  navigateToArtist(id) {
    console.log(`Navegando a artista con ID: ${id}`)
    // Implementar navegación real: window.location.href = `/artist/${id}`
    // O usar el sistema de enrutamiento de la aplicación
    alert(`Navegando a página del artista (ID: ${id})`)
  }

  navigateToSong(id) {
    console.log(`Navegando a canción con ID: ${id}`)
    alert(`Navegando a página de la canción (ID: ${id})`)
  }

  navigateToAlbum(id) {
    console.log(`Navegando a álbum con ID: ${id}`)
    alert(`Navegando a página del álbum (ID: ${id})`)
  }

  navigateToProduct(id) {
    console.log(`Navegando a producto con ID: ${id}`)
    alert(`Navegando a página del producto (ID: ${id})`)
  }
}
