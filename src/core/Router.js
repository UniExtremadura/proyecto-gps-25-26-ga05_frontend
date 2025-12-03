// Router simple basado en hash para navegación SPA
export default class Router {
  constructor() {
    this.routes = new Map()
    this.currentController = null
    this.rootElement = null
  }

  setRoot(element) {
    this.rootElement = element
  }

  addRoute(pattern, handler) {
    this.routes.set(pattern, handler)
  }

  navigate(path) {
    window.location.hash = path
  }

  init() {
    // Listener para cambios en el hash
    window.addEventListener('hashchange', () => this.handleRoute())
    window.addEventListener('load', () => this.handleRoute())
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/'
    
    // Limpiar controlador anterior si existe
    if (this.currentController && typeof this.currentController.destroy === 'function') {
      this.currentController.destroy()
    }
    
    // Limpiar el contenedor
    if (this.rootElement) {
      this.rootElement.innerHTML = ''
    }

    // Buscar ruta coincidente
    for (const [pattern, handler] of this.routes) {
      const params = this.matchRoute(pattern, hash)
      if (params !== null) {
        this.currentController = handler(params, this.rootElement)
        return
      }
    }

    // Ruta no encontrada - ir a home
    if (hash !== '/') {
      this.navigate('/')
    }
  }

  matchRoute(pattern, path) {
    // Convertir patrón en regex: /artista/:id -> /artista/([^/]+)
    const paramNames = []
    const regexPattern = pattern.replace(/:([^/]+)/g, (_, name) => {
      paramNames.push(name)
      return '([^/]+)'
    })

    const regex = new RegExp(`^${regexPattern}$`)
    const match = path.match(regex)

    if (!match) return null

    // Extraer parámetros
    const params = {}
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1]
    })

    return params
  }
}
