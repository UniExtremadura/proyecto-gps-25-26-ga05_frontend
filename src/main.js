import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import './styleSearch.css'

// MVC demo minimal: Model-View-Controller wiring
import ExampleModel from './models/ExampleModel.js'
import ExampleView from './views/ExampleView.js'
import ExampleController from './controllers/ExampleController.js'
import RegisterView from './views/RegisterView.js'
import RegisterController from './controllers/RegisterController.js'
import RegisterModel from './models/RegisterModel.js'
import LoginView from './views/LoginView.js'
import LoginController from './controllers/LoginController.js'
import ArtistaController from './controllers/artistaController.js'

// Funcionalidad de búsqueda
import SearchModel from './models/SearchModel.js'
import SearchView from './views/SearchView.js'
import SearchController from './controllers/SearchController.js'

//Noticias
import NoticiaView from './views/NoticiaView.js'
import AllNewsView from './views/AllNewsView.js'
import NoticiaModel from './models/NoticiaModel.js'
import AllNewsModel from './models/AllNewsModel.js'
import NoticiaController from './controllers/NoticiaController.js'
import AllNewsController from './controllers/AllNewsController.js'

// Router simple
class Router {
	constructor() {
		this.routes = {
			'/': () => mountExample(),
			'/login': () => mountLogin(),
			'/register': () => mountRegister(),
			'/noticias': () => mountAllNews()
		}
		this.init()
	}

	init() {
		window.addEventListener('popstate', () => this.route())

		document.addEventListener('click', (e) => {
			if (e.target.matches('[data-link]')) {
				e.preventDefault()
				this.navigate(e.target.getAttribute('href'))
			}
		})

		this.route()
	}

	navigate(path) {
		window.history.pushState(null, '', path)
		this.route()
	}

	route() {
		const path = window.location.pathname
		const noticiaMatch = path.match(/^\/noticias\/(\d+)$/)
		if (noticiaMatch) {
			mountNoticia(noticiaMatch[1])
			return
		}
		
		// Match para rutas de usuario (incluye artistas)
		const usuarioMatch = path.match(/^\/usuario\/(\d+)(\/owner)?$/)
		if (usuarioMatch) {
			const userId = parseInt(usuarioMatch[1], 10)
			const isOwner = !!usuarioMatch[2]
			mountUsuario(userId, isOwner)
			return
		}
		
		const handler = this.routes[path] || this.routes['/']
		handler()
	}
}

// Funciones de montaje
const mountExample = () => {
	const root = document.getElementById('app')
	if (!root) return
	
	root.innerHTML = ''
	const model = new ExampleModel()
	const view = new ExampleView(root)
	// eslint-disable-next-line no-unused-vars
	const controller = new ExampleController(model, view)

	controller.on('verNoticia', (id) => {
		router.navigate(`/noticias/${id}`)
	})
	
	controller.on('verTodasNoticias', () => {
		router.navigate('/noticias')
	})
}

const mountRegister = () => {
  const root = document.getElementById('app')
  if (!root) return
  
  root.innerHTML = ''
  const model = new RegisterModel()
  const view = new RegisterView(root)
  // eslint-disable-next-line no-unused-vars
	const controller = new RegisterController(view, model)
	controller.on('registered', () => {
		renderAuthArea()
		router.navigate('/')
	})
}

const mountLogin = () => {
	const root = document.getElementById('app')
	if (!root) return
	
	root.innerHTML = ''
	const view = new LoginView(root)
	const controller = new LoginController(view)
	controller.on('goRegister', () => {
		router.navigate('/register')
	})
	controller.on('loggedIn', (result) => {
		renderAuthArea()
		router.navigate('/')
	})
}

const mountNoticia = (id) => {
	const root = document.getElementById('app')
	if (!root) return
	
	root.innerHTML = ''
	const model = new NoticiaModel()
	const view = new NoticiaView(root)
	const controller = new NoticiaController(model, view, id)
}

const mountAllNews = () => {
  const root = document.getElementById('app')
  if (!root) return

  root.innerHTML = ''
  const model = new AllNewsModel()
  const view = new AllNewsView(root)
  const controller = new AllNewsController(model, view)

  controller.on('verNoticia', (id) => {
    router.navigate(`/noticias/${id}`)
  })
}

const mountUsuario = (userId, isOwner = false) => {
	const root = document.getElementById('app')
	if (!root) return
	
	root.innerHTML = ''
	// eslint-disable-next-line no-unused-vars
	const controller = new ArtistaController(root, userId, isOwner)
}

// Inicializar router
const router = new Router()

// Configurar botones con navegación de la barra superior
const setupNavigation = () => {
	const newsNavLink = document.getElementById('news-nav-link')
	newsNavLink?.addEventListener('click', (e) => {
		e.preventDefault()
		router.navigate('/noticias')
	})

	attachAuthAreaHandlers()
}

// Render dinámico del área de autenticación en el header
const getAuthUser = () => {
	try {
		return JSON.parse(localStorage.getItem('authUser') || 'null')
	} catch {
		return null
	}
}

const logout = () => {
	try {
		localStorage.removeItem('authToken')
		localStorage.removeItem('authUser')
	} catch {}
	renderAuthArea()
	router.navigate('/')
}

const renderAuthArea = () => {
	const container = document.getElementById('auth-area')
	if (!container) return
	const user = getAuthUser()

	if (!user) {
		container.innerHTML = `
			<a id="btn-login" href="/login" class="btn btn-outline-light me-2" data-link>Iniciar Sesión</a>
			<a id="btn-register" href="/register" class="btn btn-primary" data-link>Registrarse</a>
		`
	} else {
		const avatarUrl = user.urlImagen && String(user.urlImagen).trim().length > 0 ? user.urlImagen : ''
		const avatar = avatarUrl
			? `<img src="${avatarUrl}" alt="avatar" class="rounded-circle" style="width:32px;height:32px;object-fit:cover;">`
			: `<i class="bi bi-person-circle fs-4"></i>`

		container.innerHTML = `
			<div class="dropdown">
				<button class="btn btn-dark dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
					${avatar}
					<span class="d-none d-md-inline">${user.nombre || user.correo || 'Perfil'}</span>
				</button>
				<ul class="dropdown-menu dropdown-menu-end">
					<li><h6 class="dropdown-header">${user.correo || ''}</h6></li>
					<li><a class="dropdown-item" href="#" id="nav-profile">Perfil</a></li>
					<li><hr class="dropdown-divider"></li>
					<li><a class="dropdown-item text-danger" href="#" id="nav-logout">Cerrar sesión</a></li>
				</ul>
			</div>
		`
	}

	attachAuthAreaHandlers()
}

const attachAuthAreaHandlers = () => {
	const btnRegister = document.getElementById('btn-register')
	const btnLogin = document.getElementById('btn-login')
	const btnLogout = document.getElementById('nav-logout')
	const btnProfile = document.getElementById('nav-profile')

	btnRegister?.addEventListener('click', (e) => {
		e.preventDefault()
		router.navigate('/register')
	})
	btnLogin?.addEventListener('click', (e) => {
		e.preventDefault()
		router.navigate('/login')
	})
	btnLogout?.addEventListener('click', (e) => {
		e.preventDefault()
		logout()
	})
	btnProfile?.addEventListener('click', (e) => {
		e.preventDefault()
		// Pendiente: navegar a página de perfil cuando exista
	})
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation()
	renderAuthArea()

  // Inicializar búsqueda
  const searchInput = document.querySelector('input[type="search"]')
  const searchButton = document.querySelector('button[type="submit"]')

  if (searchInput && searchButton) {
    const searchModel = new SearchModel()
    const searchView = new SearchView(searchInput, searchButton)
    // eslint-disable-next-line no-unused-vars
    const searchController = new SearchController(searchModel, searchView)
  }
})

