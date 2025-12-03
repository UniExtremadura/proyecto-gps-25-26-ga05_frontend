import ApiClient from '../services/ApiClient.js'

export default class FavoriteModel {
  constructor() {
    this.favorites = {
      artists: [],
      albums: [],
      songs: []
    }
  }

  async loadFavorites(userId) {
    try {
      // Traer artistas favoritos
      const resArtists = await ApiClient.getFavoritosArtistas(userId)
      const artists = Array.isArray(resArtists) ? resArtists : (resArtists.favoritos || [])

      // Traer álbumes favoritos
      const resAlbums = await ApiClient.getFavoritosAlbum(userId)
      const albums = Array.isArray(resAlbums) ? resAlbums : (resAlbums.favoritos || [])

      // Traer canciones favoritas
      const resSongs = await ApiClient.getFavoritosCanciones(userId)
      const songs = Array.isArray(resSongs) ? resSongs : (resSongs.favoritos || [])

      this.favorites = { artists, albums, songs }
      return this.favorites
    } catch (err) {
      throw err
    }
  }
}
