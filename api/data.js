import { getJwtSecret, verifyJwtToken } from '../lib/auth-server.js'
import {
  createAnimeSecure,
  deleteAnimeSecure,
  getDataServerConfig,
  updateAnimeSecure,
  updateConfiguracionSecure
} from '../lib/data-server.js'

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function getBearerToken(req) {
  const auth = req.headers?.authorization || ''
  if (!auth.startsWith('Bearer ')) return ''
  return auth.slice('Bearer '.length).trim()
}

export default async function handler(req, res) {
  setCors(res)

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
      hint: 'JWT_SECRET no configurado'
    })
  }

  const token = getBearerToken(req)
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
      hint: 'Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY'
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
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
      details: error.details || null
    })
  }
}

