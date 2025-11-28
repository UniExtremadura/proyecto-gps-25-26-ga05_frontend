import EventEmitter from '../core/EventEmitter.js'

export default class AdminUsersView extends EventEmitter {
  constructor(root) {
    super()
    this.root = root
    this.root.classList.add('admin-users-view')
    this._renderShell()
  }

  _renderShell() {
    this.root.innerHTML = `
      <div class="container py-4">
        <header class="mb-4">
          <h1 class="h4">Gestión de Usuarios</h1>
          <p class="text-muted">Busca y revisa usuarios y artistas.</p>
        </header>

        <div class="mb-3 d-flex gap-2">
          <input id="search-q" class="form-control" placeholder="Buscar por nombre o correo" />
          <button id="search-btn" class="btn btn-primary">Buscar</button>
        </div>

        <div id="loading" class="text-center py-3 d-none">
          <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
        </div>

        <div id="error" class="alert alert-danger d-none" role="alert"></div>

        <div id="results" class="table-responsive d-none">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="results-body"></tbody>
          </table>
        </div>
      </div>
    `

    this.$q = this.root.querySelector('#search-q')
    this.$btn = this.root.querySelector('#search-btn')
    this.$loading = this.root.querySelector('#loading')
    this.$error = this.root.querySelector('#error')
    this.$results = this.root.querySelector('#results')
    this.$tbody = this.root.querySelector('#results-body')

    this.$btn.addEventListener('click', () => this.emit('buscar', this.$q.value))
    this.$q.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.emit('buscar', this.$q.value) })
  }

  render(state) {
    if (state.loading) {
      this.$loading.classList.remove('d-none')
      this.$error.classList.add('d-none')
      this.$results.classList.add('d-none')
      return
    }

    this.$loading.classList.add('d-none')
    if (state.error) {
      this.$error.classList.remove('d-none')
      this.$error.textContent = state.error
      this.$results.classList.add('d-none')
      return
    }

    this.$error.classList.add('d-none')
    const usuarios = state.usuarios || []
    if (usuarios.length === 0) {
      this.$results.classList.add('d-none')
      return
    }

    this.$results.classList.remove('d-none')

    // Obtener usuario autenticado para decisiones de UI (evitar que se pueda borrar a sí mismo)
    let currentUser = null
    try {
      currentUser = JSON.parse(localStorage.getItem('authUser') || 'null')
    } catch {}

    this.$tbody.innerHTML = usuarios.map(u => {
      const isSelf = currentUser && Number(currentUser.id) === Number(u.id)
      const isTargetAdmin = u.tipo === 1
      const tipoLabel = u.tipo === 2 ? 'Artista' : u.tipo === 1 ? 'Administrador' : 'Usuario'

      // Decide si mostrar el botón de borrar o mostrar deshabilitado con tooltip
      let borrarButton = ''
      if (isSelf) {
        borrarButton = `<button class="btn btn-sm btn-outline-danger" disabled title="No puedes eliminarte a ti mismo">Borrar</button>`
      } else if (isTargetAdmin) {
        borrarButton = `<button class="btn btn-sm btn-outline-danger" disabled title="No puedes eliminar a otros administradores">Borrar</button>`
      } else {
        borrarButton = `<button class="btn btn-sm btn-outline-danger" data-action="borrar" data-id="${u.id}">Borrar</button>`
      }

      return `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre || ''}</td>
        <td>${u.correo || ''}</td>
        <td>${tipoLabel}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-2" data-action="ver" data-id="${u.id}">Ver</button>
          ${borrarButton}
        </td>
      </tr>
      `
    }).join('')

    this.$tbody.querySelectorAll('button[data-action="ver"]').forEach(btn => {
      btn.addEventListener('click', () => this.emit('verUsuario', btn.getAttribute('data-id')))
    })
    this.$tbody.querySelectorAll('button[data-action="borrar"]').forEach(btn => {
      btn.addEventListener('click', () => this.emit('borrarUsuario', btn.getAttribute('data-id')))
    })
  }
}
