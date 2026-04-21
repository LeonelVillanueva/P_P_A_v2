import { getJwtSecret, verifyJwtToken } from '../lib/auth-server.js'
import {
  createAnimeSecure,
  deleteAnimeSecure,
  getDataServerConfig,
  updateAnimeSecure,
  updateConfiguracionSecure
} from '../lib/data-server.js'

function setCorsForRequest(req, res) {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const origin = req.headers?.origin || ''
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function getBearerToken(req) {
  const auth = req.headers?.authorization || ''
  if (!auth.startsWith('Bearer ')) return ''
  return auth.slice('Bearer '.length).trim()
}

function getCookieToken(req) {
  const raw = req.headers?.cookie || ''
  const pairs = raw.split(';')
  for (const pair of pairs) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim()
    if (key !== 'anime_saver_session') continue
    return decodeURIComponent(pair.slice(idx + 1).trim())
  }
  return ''
}

export default async function handler(req, res) {
  setCorsForRequest(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const jwtSecret = getJwtSecret()
  if (!jwtSecret) {
    return res.status(500).json({
      error: 'Server configuration error',
      hint: 'Falta una credencial interna de seguridad'
    })
  }

  const token = getCookieToken(req) || getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: token requerido' })
  }

  const payload = await verifyJwtToken(token, jwtSecret)
  if (!payload?.authenticated) {
    return res.status(401).json({ error: 'Unauthorized: token inválido o expirado' })
  }

  const config = getDataServerConfig()
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      hint: 'Faltan credenciales de acceso a datos en el servidor'
    })
  }

  try {
    const body = req.body || {}
    const { action } = body

    if (action === 'createAnime') {
      const created = await createAnimeSecure(config, body.payload || {})
      return res.status(200).json({ success: true, data: created })
    }

    if (action === 'updateAnime') {
      const updated = await updateAnimeSecure(config, body.id, body.payload || {})
      return res.status(200).json({ success: true, data: updated })
    }

    if (action === 'deleteAnime') {
      await deleteAnimeSecure(config, body.id)
      return res.status(200).json({ success: true })
    }

    if (action === 'updateConfiguracion') {
      const out = await updateConfiguracionSecure(config, body.payload || {})
      return res.status(200).json({ success: true, data: out })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    const isDev = process.env.NODE_ENV !== 'production'
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
      details: isDev ? error.details || null : undefined
    })
  }
}

