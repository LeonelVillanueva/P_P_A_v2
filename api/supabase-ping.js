/**
 * Ping programado a Supabase (Vercel Cron + llamadas manuales autorizadas).
 * Mantiene actividad en el proyecto aunque nadie abra la web.
 *
 * Variables en Vercel (Project Settings → Environment Variables):
 * - VITE_SUPABASE_URL o SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY o SUPABASE_ANON_KEY
 * - CRON_SECRET (opcional): si la defines, el cron debe enviar Authorization: Bearer …
 *   Si NO la tienes: no hace falta crearla; Vercel Cron envía x-vercel-cron: 1 y con eso basta.
 */

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers?.authorization || ''
  if (cronSecret) {
    return auth === `Bearer ${cronSecret}`
  }
  // Sin CRON_SECRET: solo aceptar invocaciones oficiales de Cron de Vercel
  return req.headers['x-vercel-cron'] === '1'
}

export default async function handler(req, res) {
  // CORS: permitir invocación cross-origin controlada (útil para pruebas/monitoreo web)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
      error: 'Faltan SUPABASE_URL / ANON_KEY en el servidor'
    })
  }

  const base = supabaseUrl.replace(/\/$/, '')

  try {
    const r = await fetch(`${base}/rest/v1/animes?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
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
