// Controlador: conecta Vista y Modelo
export default class ExampleController {
  constructor(model, view) {
    this.model = model
    this.view = view

    // Suscribe a eventos de la vista
    this.view.on('add', (text) => this.model.addItem(text))
    this.view.on('removeAt', (idx) => this.model.removeAt(idx))

    // Render inicial y re-render en cambios
    this.view.render(this.model.getState())
    this.model.on('change', (state) => this.view.render(state))
  }
}
