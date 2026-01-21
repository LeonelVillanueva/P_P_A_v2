import { defineStore } from 'pinia'
import { animeService } from '../services/animeService'
import { configService } from '../services/configService'
import { storageService } from '../services/storageService'
import { animeUpdateService } from '../services/animeUpdateService'

export const useAnimeStore = defineStore('anime', {
  state: () => ({
    animes: [],
    estados: [],
    temporadas: [],
    loading: false,
    error: null,
    // Anime que se está arrastrando (para drag & drop entre vistas)
    draggedAnime: null
  }),

  getters: {
    animesPorSeccion: (state) => {
      return (seccion) => {
        return state.animes.filter(anime => anime.estado === seccion)
      }
    },
    
    // Búsqueda y filtrado avanzado
    filteredAnimes: (state) => (filters = {}) => {
      let filtered = [...state.animes]
      
      // Filtro por búsqueda (nombre)
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim()
        filtered = filtered.filter(anime => 
          anime.nombre.toLowerCase().includes(searchLower) ||
          anime.nombre_base?.toLowerCase().includes(searchLower) ||
          anime.sinopsis?.toLowerCase().includes(searchLower)
        )
      }
      
      // Filtro por estado
      if (filters.estado) {
        filtered = filtered.filter(anime => anime.estado === filters.estado)
      }
      
      // Filtro por temporadas
      if (filters.temporada) {
        filtered = filtered.filter(anime => 
          anime.temporadas?.includes(filters.temporada)
        )
      }
      
      // Filtro por año
      if (filters.año) {
        filtered = filtered.filter(anime => {
          if (anime.año) return anime.año === filters.año
          if (anime.fecha_estreno) {
            return new Date(anime.fecha_estreno).getFullYear() === filters.año
          }
          return false
        })
      }
      
      // Filtro por episodios mínimo
      if (filters.episodiosMin) {
        filtered = filtered.filter(anime => 
          anime.episodios && anime.episodios >= filters.episodiosMin
        )
      }
      
      // Filtro por fecha de estreno desde
      if (filters.fechaDesde) {
        filtered = filtered.filter(anime => {
          if (!anime.fecha_estreno) return false
          return new Date(anime.fecha_estreno) >= new Date(filters.fechaDesde)
        })
      }
      
      // Filtro por fecha de estreno hasta
      if (filters.fechaHasta) {
        filtered = filtered.filter(anime => {
          if (!anime.fecha_estreno) return false
          return new Date(anime.fecha_estreno) <= new Date(filters.fechaHasta)
        })
      }
      
      // Ordenamiento
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'nombre-asc':
            filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
            break
          case 'nombre-desc':
            filtered.sort((a, b) => b.nombre.localeCompare(a.nombre))
            break
          case 'fecha-asc':
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            break
          case 'fecha-desc':
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            break
          case 'actualizado-asc':
            filtered.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
            break
          case 'actualizado-desc':
            filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            break
          case 'fecha-estreno-asc':
            filtered.sort((a, b) => {
              const dateA = a.fecha_estreno ? new Date(a.fecha_estreno) : new Date(0)
              const dateB = b.fecha_estreno ? new Date(b.fecha_estreno) : new Date(0)
              return dateA - dateB
            })
            break
          case 'fecha-estreno-desc':
            filtered.sort((a, b) => {
              const dateA = a.fecha_estreno ? new Date(a.fecha_estreno) : new Date(0)
              const dateB = b.fecha_estreno ? new Date(b.fecha_estreno) : new Date(0)
              return dateB - dateA
            })
            break
        }
      }
      
      return filtered
    },
    
    // Estadísticas
    stats: (state) => {
      const total = state.animes.length
      const porEstado = {}
      const porTemporada = {}
      let totalTemporadas = 0
      
      state.animes.forEach(anime => {
        // Contar por estado
        porEstado[anime.estado] = (porEstado[anime.estado] || 0) + 1
        
        // Contar por temporada
        if (anime.temporadas && anime.temporadas.length > 0) {
          anime.temporadas.forEach(temp => {
            porTemporada[temp] = (porTemporada[temp] || 0) + 1
          })
          totalTemporadas += anime.temporadas.length
        }
      })
      
      return {
        total,
        porEstado,
        porTemporada,
        totalTemporadas,
        promedioTemporadas: total > 0 ? (totalTemporadas / total).toFixed(1) : 0
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
        if (import.meta.env.DEV) {
          console.error('Error fetching estados:', error)
        }
      }
    },

    async fetchTemporadas() {
      try {
        this.temporadas = await configService.getTemporadas()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching temporadas:', error)
        }
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
    },

    /**
     * Actualizar información de un anime desde Jikan API
     */
    async updateAnimeFromJikan(animeId, jikanId) {
      try {
        const updated = await animeUpdateService.updateAnimeFromJikan(animeId, jikanId)
        // Actualizar en el store
        const index = this.animes.findIndex(a => a.id === animeId)
        if (index !== -1) {
          this.animes[index] = updated
        }
        return updated
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    /**
     * Asociar Jikan ID a un anime y actualizar información
     */
    async associateJikanId(animeId, searchQuery) {
      try {
        const updated = await animeUpdateService.associateJikanId(animeId, searchQuery)
        // Actualizar en el store
        const index = this.animes.findIndex(a => a.id === animeId)
        if (index !== -1) {
          this.animes[index] = updated
        }
        return updated
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    /**
     * Actualizar todos los animes que necesitan actualización
     */
    async updateAllAnimes(daysSinceLastCheck = 7) {
      try {
        const results = await animeUpdateService.updateAllAnimes(daysSinceLastCheck)
        // Recargar animes después de actualización
        await this.fetchAnimes()
        return results
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    /**
     * Guardar anime que se está arrastrando (para drag & drop entre vistas)
     */
    setDraggedAnime(anime) {
      this.draggedAnime = anime
      // Guardar también en localStorage como respaldo
      if (anime) {
        localStorage.setItem('draggedAnime', JSON.stringify(anime))
      } else {
        localStorage.removeItem('draggedAnime')
      }
    },

    /**
     * Obtener anime que se está arrastrando
     */
    getDraggedAnime() {
      // Primero intentar desde el store
      if (this.draggedAnime) {
        return this.draggedAnime
      }
      // Si no hay en el store, intentar desde localStorage
      try {
        const stored = localStorage.getItem('draggedAnime')
        if (stored) {
          const anime = JSON.parse(stored)
          this.draggedAnime = anime
          return anime
        }
      } catch (error) {
        console.error('Error al leer draggedAnime de localStorage:', error)
      }
      return null
    },

    /**
     * Limpiar anime arrastrado
     */
    clearDraggedAnime() {
      this.draggedAnime = null
      localStorage.removeItem('draggedAnime')
    },

    /**
     * Verificar si un anime está seleccionado (para calendario)
     */
    isAnimeSelected(animeId) {
      if (!this.draggedAnime) return false
      return this.draggedAnime.id === animeId
    }
  }
})

