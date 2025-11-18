import ApiClient from '../services/ApiClient.js'

export default class CommunityModel {
  async listPosts(idComunidad) {
    return ApiClient.getCommunityPosts(idComunidad)
  }

  async createPost(idComunidad, { comentario, postPadre = null, idUsuario }) {
    return ApiClient.createCommunityPost(idComunidad, { comentario, postPadre, idUsuario })
  }

  async deletePost(idPost) {
    return ApiClient.deleteCommunityPost(idPost)
  }

  async getPostReplies(idPost) {
    return ApiClient.getPostReplies(idPost)
  }
}
