/**
 * Ping programado a Supabase (Vercel Cron + llamadas manuales autorizadas).
 * Mantiene actividad en el proyecto aunque nadie abra la web.
 *
 * Variables en Vercel (Project Settings → Environment Variables):
 * - VITE_SUPABASE_URL o SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY
 * - CRON_SECRET (obligatorio): el cron debe enviar Authorization: Bearer <secret>
 */

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const auth = req.headers?.authorization || ''
  return auth === `Bearer ${cronSecret}`
}

function applyCors(req, res) {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const origin = req.headers?.origin || ''
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      ok: false,
      error: 'Falta configuracion de conexion de lectura en el servidor'
    })
  }

  const base = supabaseUrl.replace(/\/$/, '')

  try {
    const r = await fetch(`${base}/rest/v1/animes?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Accept: 'application/json'
      }
    })

    if (!r.ok) {
      const text = await r.text()
      return res.status(502).json({
        ok: false,
        status: r.status,
        detail: text.slice(0, 300)
      })
    }

    return res.status(200).json({
      ok: true,
      at: new Date().toISOString()
    })
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    })
  }
}
