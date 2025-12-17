/**
 * Servidor de desarrollo para simular la API de Vercel
 * 
 * Uso: node server/dev-api.js
 * O ejecuta: npm run dev:api
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_SITE_PASSWORD_HASH || process.env.VITE_SITE_PASSWORD

/**
 * Generar token JWT simple
 */
async function generateToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  // Usar Buffer para base64 (Node.js)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  const signature = await signToken(`${encodedHeader}.${encodedPayload}`, JWT_SECRET)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Firmar token usando Web Crypto API
 */
async function signToken(data, secret) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const signatureArray = Array.from(new Uint8Array(signature))
  return Buffer.from(signatureArray).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Verificar token JWT
 */
async function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [header, payload, signature] = parts
    const expectedSignature = await signToken(`${header}.${payload}`, JWT_SECRET)
    
    if (signature !== expectedSignature) return null
    
    // Decodificar base64url (Node.js)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Agregar padding si es necesario
    const padding = (4 - base64.length % 4) % 4
    const paddedBase64 = base64 + '='.repeat(padding)
    const decodedPayload = JSON.parse(Buffer.from(paddedBase64, 'base64').toString('utf-8'))
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null
    }
    
    return decodedPayload
  } catch (error) {
    return null
  }
}

/**
 * Hash de contraseña usando SHA-256
 */
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Comparar contraseña con hash
 */
async function comparePassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Ruta de autenticación
app.post('/api/auth', async (req, res) => {
  try {
    const { action, password, token } = req.body
    
    // Verificar que JWT_SECRET esté configurado
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado')
      console.error('📝 Agrega JWT_SECRET a tu archivo .env')
      console.error('📝 O usa: VITE_SITE_PASSWORD_HASH o VITE_SITE_PASSWORD como fallback')
      return res.status(500).json({ 
        error: 'Server configuration error: JWT_SECRET no configurado',
        hint: 'Agrega JWT_SECRET, VITE_SITE_PASSWORD_HASH o VITE_SITE_PASSWORD a tu archivo .env'
      })
    }
    
    console.log('🔐 Petición recibida:', { action, hasPassword: !!password, hasToken: !!token })
    
    // Acción: login
    if (action === 'login') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }
      
      // Obtener hash de contraseña correcta
      const correctPasswordHash = process.env.VITE_SITE_PASSWORD_HASH
      const correctPassword = process.env.VITE_SITE_PASSWORD
      
      console.log('🔍 Verificando contraseña...', { 
        hasHash: !!correctPasswordHash, 
        hasPassword: !!correctPassword 
      })
      
      let isValid = false
      
      if (correctPasswordHash) {
        isValid = await comparePassword(password, correctPasswordHash)
        console.log('🔐 Comparación con hash:', isValid ? '✅ Válida' : '❌ Inválida')
      } else if (correctPassword) {
        isValid = password === correctPassword
        console.log('🔐 Comparación directa:', isValid ? '✅ Válida' : '❌ Inválida')
      } else {
        console.error('❌ No hay contraseña configurada')
        console.error('📝 Variables disponibles:', {
          hasJWT_SECRET: !!JWT_SECRET,
          hasVITE_SITE_PASSWORD_HASH: !!process.env.VITE_SITE_PASSWORD_HASH,
          hasVITE_SITE_PASSWORD: !!process.env.VITE_SITE_PASSWORD
        })
        return res.status(500).json({ 
          error: 'Authentication not configured',
          message: 'Agrega VITE_SITE_PASSWORD o VITE_SITE_PASSWORD_HASH a tu archivo .env',
          hint: 'Ejecuta: npm run hash-password "tu-contraseña" para generar el hash'
        })
      }
      
      if (isValid) {
        console.log('✅ Contraseña válida, generando token...')
        // Generar token JWT (expira en 24 horas)
        const payload = {
          authenticated: true,
          timestamp: Date.now(),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }
        
        try {
          const jwtToken = await generateToken(payload)
          console.log('✅ Token generado exitosamente')
          
          return res.status(200).json({
            success: true,
            token: jwtToken,
            expiresIn: 24 * 60 * 60 * 1000
          })
        } catch (tokenError) {
          console.error('❌ Error generando token:', tokenError)
          console.error('Stack:', tokenError.stack)
          return res.status(500).json({ 
            error: 'Error generando token',
            message: tokenError.message,
            details: process.env.NODE_ENV !== 'production' ? tokenError.stack : undefined
          })
        }
      } else {
        console.log('❌ Contraseña inválida')
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        })
      }
    }
    
    // Acción: verify
    if (action === 'verify') {
      if (!token) {
        return res.status(400).json({ error: 'Token is required' })
      }
      
      const payload = await verifyToken(token)
      
      if (payload && payload.authenticated) {
        return res.status(200).json({
          success: true,
          authenticated: true
        })
      } else {
        return res.status(401).json({
          success: false,
          authenticated: false,
          error: 'Invalid or expired token'
        })
      }
    }
    
    return res.status(400).json({ error: 'Invalid action' })
    
  } catch (error) {
    console.error('❌ Auth error:', error)
    console.error('Stack:', error.stack)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: import.meta.env.DEV ? error.stack : undefined
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo API corriendo en http://localhost:${PORT}`)
  console.log(`📝 Asegúrate de tener JWT_SECRET configurado en .env`)
})

