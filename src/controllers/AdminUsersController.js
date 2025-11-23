import AdminUsersModel from '../models/AdminUsersModel.js'
import AdminUsersView from '../views/AdminUsersView.js'
import ApiClient from '../services/ApiClient.js'

// Controller para la vista de administración de usuarios
// Maneja la interacción entre la vista y el modelo (búsqueda y navegación).
export default class AdminUsersController {
  constructor(root) {
    // Estado y vista
    this.model = new AdminUsersModel()
    this.view = new AdminUsersView(root)

    // Suscribirse a eventos de la vista
    this.view.on('buscar', (q) => this.buscar(q))
    this.view.on('verUsuario', (id) => this.verUsuario(id))
    this.view.on('borrarUsuario', (id) => this.borrarUsuario(id))

    // Render inicial
    this.render()
  }

  // Ejecuta la búsqueda de usuarios. Actualiza el estado local del modelo
  // y fuerza un re-render. Evita usar setState inexistente en el modelo.
  async buscar(q) {
    try {
      // Actualizar estado de carga manualmente en el modelo
      this.model.state = { ...this.model.state, loading: true, error: null }
      this.render()

      // Llamada al modelo para realizar la búsqueda
      await this.model.buscar(q)

      // El modelo ya emite 'change' tras completar la búsqueda, pero
      // forzamos el render por si acaso.
      this.render()
    } catch (err) {
      // Capturar y exponer error en el estado del modelo
      this.model.state = { ...this.model.state, loading: false, error: err.message || String(err) }
      this.render()
    }
  }

  // Navega al perfil público del usuario/artist seleccionado
  verUsuario(id) {
    // Usamos el router global si está disponible
    if (window.router) {
      window.router.navigate(`/usuario/${id}`)
    } else {
      // Alternativa: cambiar la ubicación
      window.location.href = `/usuario/${id}`
    }
  }

  // Eliminar usuario (solo administradores). Pide confirmación y refresca resultados.
  async borrarUsuario(id) {
    if (!id) return
    const confirmado = window.confirm('¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')
    if (!confirmado) return
    // Actualización optimista: eliminar la fila inmediatamente de la vista
    const prevUsuarios = Array.isArray(this.model.state.usuarios) ? [...this.model.state.usuarios] : []
    this.model.state = { ...this.model.state, usuarios: prevUsuarios.filter(u => String(u.id) !== String(id)) }
    this.render()

    try {
      // Llamada al API para borrar
      await ApiClient.deleteUsuario(id)

      // Tras éxito, re-ejecutar la búsqueda actual para sincronizar con el servidor
      const q = this.model.state?.query || ''
      if (q && q.trim() !== '') {
        await this.model.buscar(q)
      }
      // Si no hay query, la tabla ya se ha actualizado optimistamente
    } catch (err) {
      // Restaurar estado anterior en caso de error
      this.model.state = { ...this.model.state, usuarios: prevUsuarios }
      this.render()
      alert('Error al eliminar el usuario: ' + (err.message || err))
    }
  }

  // Renderiza la vista con el estado actual del modelo
  render() {
    this.view.render(this.model.state)
  }
}
