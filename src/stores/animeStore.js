import { defineStore } from 'pinia'
import { animeService } from '../services/animeService'
import { configService } from '../services/configService'
import { storageService } from '../services/storageService'

export const useAnimeStore = defineStore('anime', {
  state: () => ({
    animes: [],
    estados: [],
    temporadas: [],
    loading: false,
    error: null
  }),

  getters: {
    animesPorSeccion: (state) => {
      return (seccion) => {
        return state.animes.filter(anime => anime.estado === seccion)
      }
    }
  },

  actions: {
    async fetchAnimes() {
      this.loading = true
      this.error = null
      try {
        this.animes = await animeService.getAll()
      } catch (error) {
        this.error = error.message
        // El error será manejado por el error handler en el componente
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchEstados() {
      try {
        this.estados = await configService.getEstados()
      } catch (error) {
        console.error('Error fetching estados:', error)
      }
    },

    async fetchTemporadas() {
      try {
        this.temporadas = await configService.getTemporadas()
      } catch (error) {
        console.error('Error fetching temporadas:', error)
      }
    },

    async createAnime(anime) {
      try {
        // Pasar estados válidos para validación
        const data = await animeService.create(anime, this.estados)
        this.animes.unshift(data)
        return data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateAnime(id, updates) {
      try {
        // Pasar estados válidos para validación
        const data = await animeService.update(id, updates, this.estados)
        const index = this.animes.findIndex(a => a.id === id)
        if (index !== -1) {
          this.animes[index] = data
        }
        return data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteAnime(id) {
      try {
        await animeService.delete(id)
        this.animes = this.animes.filter(a => a.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateConfiguracion(tipo, valores) {
      try {
        await configService.update(tipo, valores)
        
        if (tipo === 'estados') {
          this.estados = valores
        } else if (tipo === 'temporadas') {
          this.temporadas = valores
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async uploadImage(file, animeId) {
      try {
        return await storageService.uploadImage(file, animeId)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})

