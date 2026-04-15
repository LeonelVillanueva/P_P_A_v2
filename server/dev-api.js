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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const JWT_SECRET = getJwtSecret()
const isDev = process.env.NODE_ENV !== 'production'

app.post('/api/auth', async (req, res) => {
  try {
    const { action, password, token, sessionDays: rawSessionDays } = req.body

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado')
      console.error('📝 Agrega JWT_SECRET a tu archivo .env')
      return res.status(500).json({
        error: 'Server configuration error: JWT_SECRET no configurado',
        hint: 'Agrega JWT_SECRET, VITE_SITE_PASSWORD_HASH o VITE_SITE_PASSWORD a tu archivo .env'
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
      const correctPassword = process.env.VITE_SITE_PASSWORD

      let isValid = false

      if (correctPasswordHash) {
        isValid = await comparePasswordSha256(password, correctPasswordHash)
        if (isDev) console.log('🔐 Comparación con hash:', isValid ? '✅ Válida' : '❌ Inválida')
      } else if (correctPassword) {
        isValid = password === correctPassword
        if (isDev) console.log('🔐 Comparación directa:', isValid ? '✅ Válida' : '❌ Inválida')
      } else {
        console.error('❌ No hay contraseña configurada')
        return res.status(500).json({
          error: 'Authentication not configured',
          message: 'Agrega VITE_SITE_PASSWORD o VITE_SITE_PASSWORD_HASH a tu archivo .env',
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
          return res.status(200).json({
            success: true,
            token: jwtToken,
            expiresIn: expiresInMs,
            sessionDays
          })
        } catch (tokenError) {
          console.error('❌ Error generando token:', tokenError)
          return res.status(500).json({
            error: 'Error generando token',
            message: tokenError.message,
            details: isDev ? tokenError.stack : undefined
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
    console.error('❌ Auth error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: isDev ? error.stack : undefined
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo API corriendo en http://localhost:${PORT}`)
  console.log('📝 Asegúrate de tener JWT_SECRET configurado en .env')
})
