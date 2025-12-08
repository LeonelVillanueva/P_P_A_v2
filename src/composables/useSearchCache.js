const CACHE_KEY = 'anime_search_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
const MAX_CACHE_SIZE = 50 // Máximo 50 búsquedas en caché

export function useSearchCache() {
  const getCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return {}
      return JSON.parse(cached)
    } catch {
      return {}
    }
  }

  const setCache = (cache) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.warn('Error guardando caché:', error)
    }
  }

  const get = (query) => {
    const cache = getCache()
    const entry = cache[query.toLowerCase()]
    
    if (!entry) return null
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      delete cache[query.toLowerCase()]
      setCache(cache)
      return null
    }
    
    return entry.data
  }

  const set = (query, data) => {
    const cache = getCache()
    
    // Limpiar entradas expiradas
    const now = Date.now()
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_DURATION) {
        delete cache[key]
      }
    })
    
    // Limitar tamaño del caché
    const entries = Object.entries(cache)
    if (entries.length >= MAX_CACHE_SIZE) {
      // Eliminar la entrada más antigua
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      delete cache[sorted[0][0]]
    }
    
    // Agregar nueva entrada
    cache[query.toLowerCase()] = {
      data,
      timestamp: Date.now()
    }
    
    setCache(cache)
  }

  const clear = () => {
    localStorage.removeItem(CACHE_KEY)
  }

  return {
    get,
    set,
    clear
  }
}

