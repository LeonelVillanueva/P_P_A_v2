import { onMounted, onUnmounted } from 'vue'
import { supabase, isSupabaseConfigured } from '../config/supabase'

/**
 * Composable para mantener Supabase activo mediante pings periódicos
 * Evita que el proyecto se pause por inactividad
 */
export function useSupabaseKeepAlive(options = {}) {
  const {
    interval = 5 * 60 * 1000, // 5 minutos por defecto
    enabled = true,
    onError = null
  } = options

  let pingInterval = null
  let isActive = false

  /**
   * Realiza un ping ligero a Supabase para mantener el proyecto activo
   * Usa múltiples métodos para asegurar que al menos uno funcione
   */
  const performPing = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      // Método 1: Verificar sesión de autenticación (muy ligero, no depende de tablas)
      // Este es el método preferido ya que no requiere acceso a tablas específicas
      const { error: authError } = await supabase.auth.getSession()
      
      if (!authError) {
        // Ping exitoso usando auth (silencioso en producción)
        if (import.meta.env.DEV) {
          console.debug('[KeepAlive] Ping exitoso a Supabase (auth)')
        }
        return
      }

      // Método 2: Si auth falla, intentar con una consulta ligera a la tabla animes
      // Solo si la tabla existe y está accesible
      const { error: queryError } = await supabase
        .from('animes')
        .select('id')
        .limit(1)
        .maybeSingle() // maybeSingle() evita error si no hay registros

      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned, es aceptable
        // Si ambos métodos fallan, registrar advertencia pero no es crítico
        if (import.meta.env.DEV) {
          console.warn('[KeepAlive] Advertencia en ping a Supabase:', queryError.message)
        }
        if (onError) {
          onError(queryError)
        }
      } else {
        // Ping exitoso usando query (silencioso en producción)
        if (import.meta.env.DEV) {
          console.debug('[KeepAlive] Ping exitoso a Supabase (query)')
        }
      }
    } catch (error) {
      // Errores de red u otros errores - no críticos para keep-alive
      // Estos errores pueden ocurrir si el proyecto está pausado o hay problemas de red
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
