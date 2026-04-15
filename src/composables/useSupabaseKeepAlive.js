import { onMounted, onUnmounted } from 'vue'
import { isSupabaseConfigured } from '../config/supabase'
import { performSupabasePing } from '../utils/supabasePing'

/**
 * Composable para mantener Supabase activo mediante pings periódicos
 * (no sustituye el cron en Vercel: la app debe estar abierta para que esto corra)
 */
export function useSupabaseKeepAlive(options = {}) {
  const {
    interval = 2 * 60 * 1000, // 2 minutos por defecto
    enabled = true,
    onError = null
  } = options

  let pingInterval = null
  let isActive = false
  let visibilityHandler = null

  /**
   * Realiza un ping ligero a Supabase para mantener el proyecto activo
   * Usa múltiples métodos para asegurar que al menos uno funcione
   */
  const performPing = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const result = await performSupabasePing()
      if (result.ok) {
        if (import.meta.env.DEV) {
          console.debug('[KeepAlive] Ping exitoso a Supabase', result.method ? `(${result.method})` : '')
        }
        return
      }
      if (import.meta.env.DEV) {
        console.warn('[KeepAlive] Ping fallido:', result.error)
      }
      if (onError && result.error) {
        onError(new Error(result.error))
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[KeepAlive] Error en ping (no crítico):', error.message)
      }
      if (onError) {
        onError(error)
      }
    }
  }

  /**
   * Inicia el sistema de keep-alive
   */
  const start = () => {
    if (!enabled || !isSupabaseConfigured()) {
      return
    }

    if (isActive) {
      return // Ya está activo
    }

    isActive = true

    // Realizar primer ping inmediatamente
    performPing()

    // Configurar intervalo para pings periódicos
    pingInterval = setInterval(() => {
      performPing()
    }, interval)

    // Ping al volver a la pestaña (evita largos huecos con la app abierta en segundo plano)
    visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        performPing()
      }
    }
    document.addEventListener('visibilitychange', visibilityHandler)
    window.addEventListener('focus', visibilityHandler)

    if (import.meta.env.DEV) {
      console.log(`[KeepAlive] Sistema activado - pings cada ${interval / 1000 / 60} minutos`)
    }
  }

  /**
   * Detiene el sistema de keep-alive
   */
  const stop = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler)
      window.removeEventListener('focus', visibilityHandler)
      visibilityHandler = null
    }
    isActive = false

    if (import.meta.env.DEV) {
      console.log('[KeepAlive] Sistema detenido')
    }
  }

  // Iniciar automáticamente al montar el componente
  onMounted(() => {
    if (enabled) {
      start()
    }
  })

  // Detener automáticamente al desmontar el componente
  onUnmounted(() => {
    stop()
  })

  return {
    start,
    stop,
    isActive: () => isActive
  }
}
