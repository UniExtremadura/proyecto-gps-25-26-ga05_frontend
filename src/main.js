import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'

// MVC demo minimal: Model-View-Controller wiring
import ExampleModel from './models/ExampleModel.js'
import ExampleView from './views/ExampleView.js'
import ExampleController from './controllers/ExampleController.js'
import RegisterView from './views/RegisterView.js'
import RegisterController from './controllers/RegisterController.js'
import RegisterModel from './models/RegisterModel.js'
import LoginView from './views/LoginView.js'
import LoginController from './controllers/LoginController.js'

// Punto de entrada: monta la app en #app
const root = document.getElementById('app')
if (root) {
	const mountExample = () => {
		root.innerHTML = ''
		const model = new ExampleModel()
		const view = new ExampleView(root)
		// eslint-disable-next-line no-unused-vars
		const controller = new ExampleController(model, view)
	}

	const mountRegister = () => {
		root.innerHTML = ''
			const model = new RegisterModel()
			const view = new RegisterView(root)
			// eslint-disable-next-line no-unused-vars
			const controller = new RegisterController(view, model)
	}

		const mountLogin = () => {
			root.innerHTML = ''
			const view = new LoginView(root)
			const controller = new LoginController(view)
			controller.on('goRegister', () => mountRegister())
			controller.on('loggedIn', (result) => {
				// Aquí podrías redirigir o cargar contenido privado
				// Por ahora, volvemos a la vista de ejemplo
				mountExample()
			})
		}

	// Render por defecto
	mountExample()

	// Navegación simple: botón de la navbar
	const btnRegister = document.getElementById('btn-register')
	btnRegister?.addEventListener('click', (e) => {
		e.preventDefault()
		mountRegister()
	})

		const btnLogin = document.getElementById('btn-login')
		btnLogin?.addEventListener('click', (e) => {
			e.preventDefault()
			mountLogin()
		})
}
