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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
      const correctPassword = process.env.VITE_SITE_PASSWORD

      let isValid = false

      if (correctPasswordHash) {
        isValid = await comparePasswordSha256(password, correctPasswordHash)
      } else if (correctPassword) {
        isValid = password === correctPassword
      } else {
        return res.status(500).json({ error: 'Authentication not configured' })
      }

      if (isValid) {
        const sessionDays = parseSessionDays(rawSessionDays)
        const payload = createLoginPayload(sessionDays)
        const jwtToken = await generateJwtToken(payload, JWT_SECRET)
        const expiresInMs = sessionDays * 24 * 60 * 60 * 1000

        return res.status(200).json({
          success: true,
          token: jwtToken,
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
      if (!token) {
        return res.status(400).json({ error: 'Token is required' })
      }

      const payload = await verifyJwtToken(token, JWT_SECRET)

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

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
