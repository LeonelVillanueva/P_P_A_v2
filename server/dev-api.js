/**
 * Servidor de desarrollo para simular la API de Vercel
 *
 * Uso: node server/dev-api.js  |  npm run dev:api
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  getJwtSecret,
  generateJwtToken,
  verifyJwtToken,
  comparePasswordSha256,
  createLoginPayload,
  parseSessionDays
} from '../lib/auth-server.js'
import {
  createAnimeSecure,
  deleteAnimeSecure,
  getDataServerConfig,
  updateAnimeSecure,
  updateConfiguracionSecure
} from '../lib/data-server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, callback) {
    // Permite herramientas sin Origin (curl, server-to-server).
    if (!origin) return callback(null, true)
    return callback(null, allowedOrigins.includes(origin))
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

const JWT_SECRET = getJwtSecret()
const isDev = process.env.NODE_ENV !== 'production'

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

app.post('/api/auth', async (req, res) => {
  try {
    const { action, password, token, sessionDays: rawSessionDays } = req.body

    if (!JWT_SECRET) {
      console.error('❌ Falta una credencial interna de seguridad')
      console.error('📝 Revisa las variables privadas del entorno')
      return res.status(500).json({
        error: 'Server configuration error',
        hint: 'Falta una credencial interna de seguridad'
      })
    }

    if (isDev) {
      console.log('🔐 Petición recibida:', { action, hasPassword: !!password, hasToken: !!token })
    }

    if (action === 'login') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }

      const correctPasswordHash = process.env.VITE_SITE_PASSWORD_HASH

      let isValid = false

      if (correctPasswordHash) {
        isValid = await comparePasswordSha256(password, correctPasswordHash)
        if (isDev) console.log('🔐 Comparación con hash:', isValid ? '✅ Válida' : '❌ Inválida')
      } else {
        console.error('❌ No hay contraseña configurada')
        return res.status(500).json({
          error: 'Authentication not configured',
          message: 'Configura una credencial de acceso en variables privadas',
          hint: 'Ejecuta: npm run hash-password "tu-contraseña" para generar el hash'
        })
      }

      if (isValid) {
        try {
          const sessionDays = parseSessionDays(rawSessionDays)
          const payload = createLoginPayload(sessionDays)
          const jwtToken = await generateJwtToken(payload, JWT_SECRET)
          if (isDev) console.log('✅ Token generado exitosamente')

          const expiresInMs = sessionDays * 24 * 60 * 60 * 1000
          setSessionCookie(res, jwtToken, expiresInMs)
          return res.status(200).json({
            success: true,
            expiresIn: expiresInMs,
            sessionDays
          })
        } catch (tokenError) {
          console.error('❌ Error generando token:', tokenError)
          return res.status(500).json({
            error: 'Error generando token',
            message: tokenError.message,
            details: undefined
          })
        }
      }

      if (isDev) console.log('❌ Contraseña inválida')
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
    console.error('❌ Auth error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Unexpected server failure',
      details: undefined
    })
  }
})

app.post('/api/data', async (req, res) => {
  try {
    const auth = req.headers?.authorization || ''
    const bearerToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
    const cookies = parseCookieHeader(req.headers?.cookie || '')
    const token = cookies.anime_saver_session || bearerToken
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: token requerido' })
    }

    const payload = await verifyJwtToken(token, JWT_SECRET)
    if (!payload?.authenticated) {
      return res.status(401).json({ error: 'Unauthorized: token inválido o expirado' })
    }

    const cfg = getDataServerConfig(process.env)
    if (!cfg.supabaseUrl || !cfg.serviceRoleKey) {
      return res.status(500).json({
        error: 'Server configuration error',
        hint: 'Faltan credenciales de acceso a datos en el servidor'
      })
    }

    const body = req.body || {}
    const { action } = body

    if (action === 'createAnime') {
      const created = await createAnimeSecure(cfg, body.payload || {})
      return res.status(200).json({ success: true, data: created })
    }

    if (action === 'updateAnime') {
      const updated = await updateAnimeSecure(cfg, body.id, body.payload || {})
      return res.status(200).json({ success: true, data: updated })
    }

    if (action === 'deleteAnime') {
      await deleteAnimeSecure(cfg, body.id)
      return res.status(200).json({ success: true })
    }

    if (action === 'updateConfiguracion') {
      const out = await updateConfiguracionSecure(cfg, body.payload || {})
      return res.status(200).json({ success: true, data: out })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error',
      details: isDev ? error.details || null : undefined
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo API corriendo en http://localhost:${PORT}`)
  console.log('📝 Verifica que tus credenciales privadas esten configuradas en .env')
})
