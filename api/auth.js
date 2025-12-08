/**
 * Vercel Serverless Function para autenticación
 * 
 * Esta función valida la contraseña en el servidor y genera tokens JWT seguros
 */

// JWT Secret (debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_SITE_PASSWORD_HASH || process.env.VITE_SITE_PASSWORD

/**
 * Generar token JWT simple (para Edge Functions)
 * En producción, considera usar una librería como jose
 */
async function generateToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
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
  return btoa(String.fromCharCode(...signatureArray))
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
    
    // Comparación segura de firmas
    if (signature !== expectedSignature) return null
    
    const decodedPayload = JSON.parse(atob(payload))
    
    // Verificar expiración (24 horas)
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

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { action, password, token } = await req.json()
    
    // Verificar que JWT_SECRET esté configurado
    if (!JWT_SECRET) {
      console.error('JWT_SECRET no está configurado')
      return res.status(500).json({ error: 'Server configuration error' })
    }
    
    // Acción: login
    if (action === 'login') {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }
      
      // Obtener hash de contraseña correcta
      const correctPasswordHash = process.env.VITE_SITE_PASSWORD_HASH
      const correctPassword = process.env.VITE_SITE_PASSWORD
      
      let isValid = false
      
      if (correctPasswordHash) {
        // Comparar con hash
        isValid = await comparePassword(password, correctPasswordHash)
      } else if (correctPassword) {
        // Comparar directamente (modo legacy)
        isValid = password === correctPassword
      } else {
        return res.status(500).json({ error: 'Authentication not configured' })
      }
      
      if (isValid) {
        // Generar token JWT (expira en 24 horas)
        const payload = {
          authenticated: true,
          timestamp: Date.now(),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
        }
        
        const jwtToken = await generateToken(payload)
        
        return res.status(200).json({
          success: true,
          token: jwtToken,
          expiresIn: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
        })
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        })
      }
    }
    
    // Acción: verify (verificar token)
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
    console.error('Auth error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

