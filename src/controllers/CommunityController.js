import EventEmitter from '../core/EventEmitter.js'

function parseCurrentUser() {
  try {
    // Preferimos el nuevo esquema 'authUser', con retrocompatibilidad a 'currentUser'
    const rawNew = localStorage.getItem('authUser')
    const rawOld = localStorage.getItem('currentUser')
    const raw = rawNew || rawOld
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
    this.userId = deriveUserId(this.currentUser)

    // Pass capability into the view (initialize to false, compute after)
    this.view = view
    this.view.allowDelete = false

    this.view.on('createPost', ({ comentario }) => this.handleCreatePost(comentario))
    this.view.on('replyPost', ({ parentId, comentario }) => this.handleReplyPost(parentId, comentario))
    this.view.on('deletePost', ({ id }) => this.handleDeletePost(id))

    this.initPermissions(ownerFlag).then((ok) => { if (ok) this.load() })
  }

  async initPermissions(ownerFlag) {
    // Nota: no usamos ownerFlag para permitir borrado; solo administradores pueden borrar
    // Intentar obtener info de la comunidad para verificar propietario
    try {
      const info = await this.model.getCommunityInfo(this.idComunidad).catch(() => null)
      // 1) Nombre del artista: si el endpoint de comunidad no lo trae, usamos /artistas/:id
      let ownerId = info?.idArtista ?? info?.artistaId ?? info?.ownerId ?? info?.idUsuario ?? null
      let name = info?.nombreArtista || info?.nombre || (info?.artista && (info.artista.nombre || info.artista.name)) || ''

      if (!name) {
        // En muchos casos la comunidad coincide con el id del artista
        const artistId = ownerId || this.idComunidad
        const artist = await this.model.getArtistInfo(Number(artistId)).catch(() => null)
        if (artist) {
          name = artist.nombre || ''
          // El endpoint de artistas garantiza tipo=2 (artista) y devuelve id
          if (!ownerId) ownerId = artist.id
        }
      }
      if (name) this.view.setArtistName(String(name))

      // 2) Permisos: solo el administrador puede borrar
      const isAdmin = !!(this.currentUser && (this.currentUser.tipo === 1 || String(this.currentUser.role || '').toLowerCase().includes('admin')))
      const canDelete = isAdmin
      this.view.allowDelete = canDelete
      // Si no hay ownerId ni nombre y tampoco artista válido, bloquear acceso (solo artistas tienen comunidad)
      if (!ownerId && !name) {
        this.view.showErrors(['Esta comunidad no existe o no pertenece a un artista'])
        setTimeout(() => { try { window.history.back() } catch { window.location.href = '/' } }, 1500)
        return false
      }
      return true
    } catch (_) {
      // Si no se puede obtener, por seguridad mantener en false
      this.view.allowDelete = false
      this.view.showErrors(['Esta comunidad no existe o no pertenece a un artista'])
      setTimeout(() => { try { window.history.back() } catch { window.location.href = '/' } }, 1500)
      return false
    }
  }

  async load() {
    try {
      const posts = await this.model.listPosts(this.idComunidad)
      const enriched = await this._enrichPostsWithUsernames(posts)
      this.view.setPosts(enriched)
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
      // Adjuntar nombre del usuario actual si no viene del backend
      const withName = { ...created }
      if (!withName.nombreUsuario && this.currentUser?.nombre) withName.nombreUsuario = this.currentUser.nombre
      this.view.appendPost(withName)
      this.view.showSuccess('Publicado')
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo publicar'])
    }
  }

  async handleReplyPost(parentId, comentario) {
    this.view.clearAlerts()
    if (!this.userId) {
      this.view.showErrors(['Debes iniciar sesión para responder'])
      return
    }
    try {
      const created = await this.model.createPost(this.idComunidad, {
        comentario,
        postPadre: parentId,
        idUsuario: this.userId,
      })
      const withName = { ...created }
      if (!withName.nombreUsuario && this.currentUser?.nombre) withName.nombreUsuario = this.currentUser.nombre
      this.view.appendPost(withName)
      this.view.showSuccess('Respuesta publicada')
    } catch (err) {
      this.view.showErrors([err.message || 'No se pudo responder'])
    }
  }

  async _enrichPostsWithUsernames(posts = []) {
    try {
      const ids = new Set()
      posts.forEach(p => {
        const uid = p.idUsuario ?? p.IdUsuario
        if (uid != null) ids.add(Number(uid))
      })
      const idList = Array.from(ids).filter(Number.isFinite)
      const results = await Promise.allSettled(idList.map(id => this.model.getUsuario(id)))
      const nameMap = new Map()
      results.forEach((r, idx) => {
        const id = idList[idx]
        if (r.status === 'fulfilled' && r.value) {
          const u = r.value
          const nombre = u.nombre ?? u.Nombre ?? u.username ?? u.name ?? ''
          nameMap.set(id, String(nombre))
        }
      })
      return posts.map(p => {
        const uid = Number(p.idUsuario ?? p.IdUsuario)
        const nombreUsuario = nameMap.get(uid)
        return nombreUsuario ? { ...p, nombreUsuario } : p
      })
    } catch {
      return posts
    }
  }

  async handleDeletePost(id) {
    if (!this.view.allowDelete) return
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
