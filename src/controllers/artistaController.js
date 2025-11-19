import ArtistaView from '../views/ArtistaView.js'
import { obtenerUsuarioPorId, esArtista } from '../models/artistaModel.js'

export default class ArtistaController {
  //simulamos ownership con el bool isOwner provisionalmente
  constructor(root, userId = 1, isOwner = true) {
    this.view = new ArtistaView(root, isOwner)
    this.usuario = null
    this.followed = false
    this.userId = userId
    this.isOwner = isOwner
    this.editMode = false
    this.visibilitySettings = null

    // Suscripciones a eventos de la vista
    this.view.on('followToggle', () => this.toggleFollow())
    this.view.on('goCommunity', () => this.openCommunity())
    this.view.on('editProfile', () => this.toggleEditMode())
    this.view.on('saveProfile', (profileData) => this.saveProfile(profileData))
    this.view.on('cancelEdit', () => this.toggleEditMode())

    // Inicializar
    this.init()
  }

  async init() {
    // Cargar usuario según el ID recibido
    const usuario = await obtenerUsuarioPorId(this.userId)
    if (!usuario) {
      console.error('Usuario no encontrado')
      return
    }
    this.usuario = usuario
    this.isArtist = esArtista(usuario)
    
    // Cargar configuración de visibilidad (localStorage) - solo para artistas
    if (this.isArtist) {
      this.loadVisibilitySettings()
    }
    
    // cargar estado local de seguimiento (localStorage por demo)
    try {
      const key = `follow_user_${this.usuario.id}`
      this.followed = localStorage.getItem(key) === '1'
    } catch (e) {
      this.followed = false
    }

    this.view.render(this.usuario, this.isArtist, this.visibilitySettings)
    if (!this.isOwner) {
      this.view.setFollowState(this.followed)
    }
  }

  loadVisibilitySettings() {
    try {
      const key = `visibility_user_${this.userId}`
      const stored = localStorage.getItem(key)
      this.visibilitySettings = stored ? JSON.parse(stored) : {
        showPopulares: true,
        showCanciones: true,
        showAlbumes: true,
        showMerch: true,
        showMoreInfo: true
      }
    } catch (e) {
      this.visibilitySettings = {
        showPopulares: true,
        showCanciones: true,
        showAlbumes: true,
        showMerch: true,
        showMoreInfo: true
      }
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode
    this.view.setEditMode(this.editMode, this.usuario, this.isArtist, this.visibilitySettings)
  }

  async saveProfile(profileData) {
    // Validar datos
    if (!profileData.nombre || !profileData.correo) {
      alert('Nombre y correo son obligatorios')
      return
    }
    
    // Actualizar datos del usuario localmente
    this.usuario.nombre = profileData.nombre
    this.usuario.descripcion = profileData.descripcion
    this.usuario.correo = profileData.correo
    
    // Si hay configuración de visibilidad (solo artistas), guardarla
    if (profileData.visibilitySettings) {
      this.visibilitySettings = profileData.visibilitySettings
      try {
        const key = `visibility_user_${this.userId}`
        localStorage.setItem(key, JSON.stringify(this.visibilitySettings))
      } catch (e) {
        console.error('Error guardando configuración de visibilidad:', e)
      }
    }
    
    // TODO: Aquí se haría la petición PUT al backend para actualizar el usuario
    // await ApiClient.updateUsuario(this.userId, this.usuario)
    
    console.log('Guardando perfil:', profileData)
    
    // Cerrar modo edición y re-renderizar
    this.editMode = false
    this.view.setEditMode(false)
    this.view.render(this.usuario, this.isArtist, this.visibilitySettings)
    
    alert('Perfil actualizado correctamente (cambios locales)')
  }

  toggleFollow() {
    this.followed = !this.followed
    try {
      const key = `follow_user_${this.usuario.id}`
      localStorage.setItem(key, this.followed ? '1' : '0')
    } catch (e) {}
    this.view.setFollowState(this.followed)
  }

  openCommunity() {
    if (!this.usuario || !this.usuario.comunidadUrl) return
    window.open(this.usuario.comunidadUrl, '_blank', 'noopener')
  }
}
