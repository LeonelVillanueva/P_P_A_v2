/**
 * Vercel Serverless Function para autenticación
 */

import {
  getJwtSecret,
  generateJwtToken,
  verifyJwtToken,
  comparePasswordSha256,
  createLoginPayload,
  parseSessionDays
} from '../lib/auth-server.js'

const JWT_SECRET = getJwtSecret()

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function applyCors(req, res) {
  const origin = req.headers?.origin || ''
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function parseCookieHeader(cookieHeader = '') {
  const pairs = cookieHeader.split(';')
  const out = {}
  for (const pair of pairs) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    const key = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    if (!key) continue
    out[key] = decodeURIComponent(value)
  }
  return out
}

function setSessionCookie(res, token, maxAgeMs) {
  const maxAgeSeconds = Math.max(1, Math.floor(maxAgeMs / 1000))
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `anime_saver_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`
  )
}

function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `anime_saver_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
  )
}

export default async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const { action, password, token, sessionDays: rawSessionDays } = body

    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está configurado')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    if (action === 'login') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }

      const correctPasswordHash = process.env.VITE_SITE_PASSWORD_HASH

      let isValid = false

      if (correctPasswordHash) {
        isValid = await comparePasswordSha256(password, correctPasswordHash)
      } else {
        return res.status(500).json({ error: 'Authentication not configured' })
      }

      if (isValid) {
        const sessionDays = parseSessionDays(rawSessionDays)
        const payload = createLoginPayload(sessionDays)
        const jwtToken = await generateJwtToken(payload, JWT_SECRET)
        const expiresInMs = sessionDays * 24 * 60 * 60 * 1000
        setSessionCookie(res, jwtToken, expiresInMs)

        return res.status(200).json({
          success: true,
          expiresIn: expiresInMs,
          sessionDays
        })
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      })
    }

    if (action === 'verify') {
      const cookies = parseCookieHeader(req.headers?.cookie || '')
      const cookieToken = cookies.anime_saver_session || ''
      const tokenToVerify = token || cookieToken
      if (!tokenToVerify) {
        return res.status(400).json({ error: 'Token is required' })
      }

      const payload = await verifyJwtToken(tokenToVerify, JWT_SECRET)

      if (payload && payload.authenticated) {
        return res.status(200).json({
          success: true,
          authenticated: true
        })
      }

      return res.status(401).json({
        success: false,
        authenticated: false,
        error: 'Invalid or expired token'
      })
    }

    if (action === 'logout') {
      clearSessionCookie(res)
      return res.status(200).json({ success: true })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
