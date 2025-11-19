import EventEmitter from '../core/EventEmitter.js'

export default class CommunityView extends EventEmitter {
  constructor(rootEl, { allowDelete = false } = {}) {
    super()
    this.root = rootEl
    this.allowDelete = allowDelete
    this.posts = []
    this.root.classList.add('community-view')
    this._renderSkeleton()
  }

  _renderSkeleton() {
    this.root.innerHTML = `
      <div class="container py-3">
        <div class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-people"></i>
          <h2 class="mb-0">Comunidad de <span id="community-artist-name">Artista</span></h2>
        </div>

        <div id="alerts"></div>

        <div class="card mb-3">
          <div class="card-body">
            <form id="new-post-form" class="row g-2">
              <div class="col-12">
                <textarea id="comentario" class="form-control" rows="3" placeholder="Escribe un comentario..." required></textarea>
              </div>
              <div class="col-12 d-flex justify-content-end">
                <button class="btn btn-primary" type="submit">
                  <i class="bi bi-send"></i> Publicar
                </button>
              </div>
            </form>
          </div>
        </div>

        <div id="posts"></div>
      </div>
    `

    this.$alerts = this.root.querySelector('#alerts')
    this.$form = this.root.querySelector('#new-post-form')
    this.$textarea = this.root.querySelector('#comentario')
    this.$posts = this.root.querySelector('#posts')
  this.$artistName = this.root.querySelector('#community-artist-name')

    this.$form.addEventListener('submit', (e) => {
      e.preventDefault()
      const comentario = this.$textarea.value.trim()
      if (!comentario) return
      this.emit('createPost', { comentario })
    })
  }

  showErrors(errors = []) {
    if (!Array.isArray(errors)) errors = [String(errors)]
    this.$alerts.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <ul class="mb-0">${errors.map((e) => `<li>${e}</li>`).join('')}</ul>
      </div>
    `
  }

  showSuccess(message = 'Acción realizada') {
    this.$alerts.innerHTML = `
      <div class="alert alert-success" role="alert">${message}</div>
    `
  }

  clearAlerts() {
    this.$alerts.innerHTML = ''
  }

  setPosts(posts = []) {
    this.posts = Array.isArray(posts) ? posts : []
    this._renderPosts()
  }

  appendPost(post) {
    this.posts.unshift(post)
    this._renderPosts()
    this.$textarea.value = ''
  }

  removePost(idPost) {
    this.posts = this.posts.filter(p => p.id !== idPost && p.Id !== idPost)
    this._renderPosts()
  }

  _groupPosts(posts) {
    const map = new Map()
    posts.forEach(p => {
      const id = p.id ?? p.Id
      const parent = p.postPadre ?? p.PostPadre
      if (!map.has(id)) map.set(id, { ...p, replies: [] })
      if (parent == null) {
        // top-level handled separately
      }
    })
    const roots = []
    posts.forEach(p => {
      const id = p.id ?? p.Id
      const parent = p.postPadre ?? p.PostPadre
      if (parent == null) {
        roots.push(map.get(id))
      } else {
        const parentNode = map.get(parent)
        if (parentNode) parentNode.replies.push(map.get(id))
        else roots.push(map.get(id))
      }
    })
    return roots
  }

  _renderPosts() {
    const grouped = this._groupPosts(this.posts)
    if (!grouped.length) {
      this.$posts.innerHTML = `<div class="text-muted">No hay publicaciones todavía.</div>`
      return
    }

    const renderItem = (p, depth = 0) => {
      const id = p.id ?? p.Id
      const comentario = p.comentario ?? p.Comentario
      const idUsuario = p.idUsuario ?? p.IdUsuario
      const nombreUsuario = p.nombreUsuario ?? p.NombreUsuario
      const canDelete = !!this.allowDelete
      return `
        <div class="card mb-2" style="margin-left:${depth * 16}px">
          <div class="card-body py-2">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="small text-muted">${nombreUsuario ? nombreUsuario : `Usuario #${idUsuario}`}</div>
                <div>${comentario}</div>
              </div>
              ${canDelete ? `<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${id}"><i class="bi bi-trash"></i></button>` : ''}
            </div>
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-secondary" data-action="toggle-reply" data-id="${id}"><i class="bi bi-reply"></i> Responder</button>
            </div>
            <form class="row g-2 mt-2 d-none" data-reply-form="${id}">
              <div class="col-12">
                <textarea class="form-control" rows="2" placeholder="Escribe una respuesta..."></textarea>
              </div>
              <div class="col-12 d-flex justify-content-end">
                <button class="btn btn-primary btn-sm" data-action="send-reply" data-id="${id}"><i class="bi bi-send"></i> Enviar</button>
              </div>
            </form>
          </div>
        </div>
        ${Array.isArray(p.replies) && p.replies.length ? p.replies.map(r => renderItem(r, depth + 1)).join('') : ''}
      `
    }

    this.$posts.innerHTML = grouped.map(p => renderItem(p, 0)).join('')

    // bind deletes
    this.$posts.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const id = Number(btn.getAttribute('data-id'))
        if (!Number.isFinite(id)) return
        this.emit('deletePost', { id })
      })
    })

    // toggle reply forms
    this.$posts.querySelectorAll('[data-action="toggle-reply"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const id = btn.getAttribute('data-id')
        const form = this.$posts.querySelector(`[data-reply-form="${id}"]`)
        if (form) form.classList.toggle('d-none')
      })
    })

    // send reply
    this.$posts.querySelectorAll('[data-action="send-reply"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const id = Number(btn.getAttribute('data-id'))
        const form = this.$posts.querySelector(`[data-reply-form="${id}"]`)
        if (!form) return
        const textarea = form.querySelector('textarea')
        const comentario = (textarea?.value || '').trim()
        if (!comentario) return
        this.emit('replyPost', { parentId: id, comentario })
      })
    })
  }

  setArtistName(name = '') {
    if (this.$artistName) {
      this.$artistName.textContent = name || 'Artista'
    }
  }
}
