/**
 * Utilidades de acceso seguro a Supabase desde backend (Vercel/Express).
 * Requiere service role key para escrituras cuando RLS bloquea anon/authenticated.
 */

function getSupabaseUrlFromEnv(env = process.env) {
  if (env.SUPABASE_URL) return env.SUPABASE_URL
  if (env.VITE_SUPABASE_URL) return env.VITE_SUPABASE_URL

  const uri = env.VITE_SUPABASE_PROYECT_URI || ''
  const match = uri.match(/@db\.([^.]+)\.supabase\.co/)
  if (match) {
    return `https://${match[1]}.supabase.co`
  }
  return ''
}

function getServiceRoleKeyFromEnv(env = process.env) {
  return env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
}

export function getDataServerConfig(env = process.env) {
  return {
    supabaseUrl: getSupabaseUrlFromEnv(env),
    serviceRoleKey: getServiceRoleKeyFromEnv(env)
  }
}

function authHeaders(serviceRoleKey) {
  return {
    apikey: serviceRoleKey,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
}

async function supabaseRest(baseUrl, serviceRoleKey, path, init = {}) {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders(serviceRoleKey),
      ...(init.headers || {})
    }
  })

  const text = await response.text()
  let parsed = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === 'object' && (parsed.message || parsed.error || parsed.hint)) ||
      `Supabase REST error ${response.status}`
    const err = new Error(message)
    err.status = response.status
    err.details = parsed
    throw err
  }

  return parsed
}

export async function createAnimeSecure(config, animeData) {
  const data = await supabaseRest(
    config.supabaseUrl,
    config.serviceRoleKey,
    '/rest/v1/animes',
    {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify([animeData])
    }
  )
  return Array.isArray(data) ? data[0] : data
}

export async function updateAnimeSecure(config, id, updates) {
  const data = await supabaseRest(
    config.supabaseUrl,
    config.serviceRoleKey,
    `/rest/v1/animes?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(updates)
    }
  )
  return Array.isArray(data) ? data[0] : data
}

export async function deleteAnimeSecure(config, id) {
  await supabaseRest(
    config.supabaseUrl,
    config.serviceRoleKey,
    `/rest/v1/animes?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' }
    }
  )
}

export async function updateConfiguracionSecure(config, patch) {
  const data = await supabaseRest(
    config.supabaseUrl,
    config.serviceRoleKey,
    '/rest/v1/configuracion?id=eq.1',
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch)
    }
  )
  return Array.isArray(data) ? data[0] : data
}

