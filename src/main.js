import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'

// MVC demo minimal: Model-View-Controller wiring
import ExampleModel from './models/ExampleModel.js'
import ExampleView from './views/ExampleView.js'
import ExampleController from './controllers/ExampleController.js'

// Punto de entrada: monta la app en #app
const root = document.getElementById('app')
if (root) {
	const model = new ExampleModel()
	const view = new ExampleView(root)
	// eslint-disable-next-line no-unused-vars
	const controller = new ExampleController(model, view)
}
