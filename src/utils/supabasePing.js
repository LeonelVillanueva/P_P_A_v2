import { supabase, isSupabaseConfigured } from '../config/supabase'

/**
 * Ping ligero a Supabase para registrar actividad (auth o consulta mínima).
 * Reutilizable desde keep-alive, botón manual, etc.
 */
export async function performSupabasePing() {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase no está configurado' }
  }

  try {
    const { error: authError } = await supabase.auth.getSession()
    if (!authError) {
      return { ok: true, method: 'auth' }
    }

    const { error: queryError } = await supabase
      .from('animes')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (queryError && queryError.code !== 'PGRST116') {
      return { ok: false, error: queryError.message }
    }
    return { ok: true, method: 'query' }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Error desconocido'
    }
  }
}
