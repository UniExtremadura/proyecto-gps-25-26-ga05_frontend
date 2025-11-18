import EventEmitter from '../core/EventEmitter.js'

function parseCurrentUser() {
  try {
    const raw = localStorage.getItem('currentUser')
    if (!raw) return null
    const json = JSON.parse(raw)
    return json
  } catch (_) {
    return null
  }
}

function deriveIsArtist(user) {
  if (!user) return false
  const candidates = [
    (user.rol || user.role || ''),
    (user.tipo || ''),
    (user.tipoUsuario && (user.tipoUsuario.nombre || user.tipoUsuario.name)) || '',
    (user.userType && (user.userType.name || user.userType)) || ''
  ]
  return candidates.some(v => String(v).toLowerCase().includes('artista'))
}

function deriveUserId(user) {
  if (!user) return null
  return user.id ?? user.Id ?? user.idUsuario ?? user.userId ?? null
}

export default class CommunityController extends EventEmitter {
  constructor(model, view, idComunidad) {
    super()
    this.model = model
    this.idComunidad = idComunidad

    const url = new URL(window.location.href)
    const ownerFlag = url.searchParams.get('owner') === '1'

    this.currentUser = parseCurrentUser()
    this.isArtist = ownerFlag || deriveIsArtist(this.currentUser)
    this.userId = deriveUserId(this.currentUser)

    // Pass capability into the view
    this.view = view
    this.view.allowDelete = this.isArtist

    this.view.on('createPost', ({ comentario }) => this.handleCreatePost(comentario))
    this.view.on('deletePost', ({ id }) => this.handleDeletePost(id))

    this.load()
  }

  async load() {
    try {
      const posts = await this.model.listPosts(this.idComunidad)
      this.view.setPosts(posts)
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudieron cargar los posts'])
    }
  }

  async handleCreatePost(comentario) {
    this.view.clearAlerts()
    if (!this.userId) {
      this.view.showErrors(['Debes iniciar sesión para publicar'])
      return
    }
    try {
      const created = await this.model.createPost(this.idComunidad, {
        comentario,
        postPadre: null,
        idUsuario: this.userId,
      })
      this.view.appendPost(created)
      this.view.showSuccess('Publicado')
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo publicar'])
    }
  }

  async handleDeletePost(id) {
    if (!this.isArtist) return
    if (!confirm('¿Eliminar esta publicación?')) return
    try {
      await this.model.deletePost(id)
      this.view.removePost(id)
      this.view.showSuccess('Publicación eliminada')
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo eliminar'])
    }
  }
}
