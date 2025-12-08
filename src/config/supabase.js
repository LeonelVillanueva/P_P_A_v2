import { createClient } from '@supabase/supabase-js'

// Extraer URL del proyecto desde el URI de PostgreSQL
const getSupabaseUrl = () => {
  // Intentar desde variable de entorno directa
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL
  }
  
  // Extraer de URI de PostgreSQL si existe (formato: postgresql://...@db.xxx.supabase.co:5432/postgres)
  const uri = import.meta.env.VITE_SUPABASE_PROYECT_URI || ''
  if (uri) {
    const match = uri.match(/@db\.([^.]+)\.supabase\.co/)
    if (match) {
      return `https://${match[1]}.supabase.co`
    }
  }
  
  // No hay URL configurada
  if (import.meta.env.DEV) {
    console.error('❌ VITE_SUPABASE_URL no está configurada')
  }
  return ''
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey && import.meta.env.DEV) {
  console.error('❌ VITE_SUPABASE_ANON_KEY es requerida!')
  console.warn('📝 Para obtenerla: Ve a Supabase Dashboard → Settings → API → Copia la "anon public" key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

