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
    console.error('❌ Falta la URL del servicio de datos')
  }
  return ''
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validar formato de URL
const isValidSupabaseUrl = (url) => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    // Debe ser HTTPS y tener el formato correcto de Supabase
    return urlObj.protocol === 'https:' && 
           (urlObj.hostname.endsWith('.supabase.co') || urlObj.hostname.includes('supabase'))
  } catch {
    return false
  }
}

// Validar configuración
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '❌ Configuración de datos incompleta. Revisa tus variables de entorno de cliente.'
  if (import.meta.env.DEV) {
    console.error(errorMsg)
    console.warn('📝 Revisa en tu panel del proveedor de datos las credenciales públicas del proyecto.')
  }
} else if (!isValidSupabaseUrl(supabaseUrl)) {
  const errorMsg = '❌ URL del servicio de datos inválida.'
  if (import.meta.env.DEV) {
    console.error(errorMsg)
    console.warn('📝 La URL debe ser HTTPS y apuntar al dominio de tu proyecto.')
  }
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Función para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl))
}

// Exportar URL para debugging
export const getSupabaseUrlForDebug = () => supabaseUrl

