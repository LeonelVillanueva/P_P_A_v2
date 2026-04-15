/**
 * Lógica compartida de JWT (HS256) y hash de contraseña (SHA-256 hex).
 * Usada por `api/auth.js` (Vercel) y `server/dev-api.js` (Express local).
 * Node 18+ (Web Crypto + Buffer).
 */

/** Segundos de una jornada de sesión (24 h). */
export const SESSION_DAY_SECONDS = 24 * 60 * 60

/** Compatibilidad: una jornada = 24 h. */
export const JWT_EXPIRY_SECONDS = SESSION_DAY_SECONDS

export const DEFAULT_SESSION_DAYS = 1
export const MAX_SESSION_DAYS = 7

/**
 * Normaliza días de sesión (1–7) para login.
 * @param {unknown} value
 * @returns {number}
 */
export function parseSessionDays(value) {
  const n = Math.floor(Number(value))
  if (!Number.isFinite(n) || n < 1) return DEFAULT_SESSION_DAYS
  return Math.min(MAX_SESSION_DAYS, n)
}

/**
 * Secreto JWT: misma prioridad que antes en ambos entornos.
 * @param {NodeJS.ProcessEnv} [env=process.env]
 */
export function getJwtSecret(env = process.env) {
  return env.JWT_SECRET || env.VITE_SITE_PASSWORD_HASH || env.VITE_SITE_PASSWORD
}

/**
 * @param {number} [sessionDays=1] Días que dura el JWT (máx. {@link MAX_SESSION_DAYS}).
 */
export function createLoginPayload(sessionDays = DEFAULT_SESSION_DAYS) {
  const days = parseSessionDays(sessionDays)
  const now = Math.floor(Date.now() / 1000)
  return {
    authenticated: true,
    timestamp: Date.now(),
    exp: now + days * SESSION_DAY_SECONDS
  }
}

/**
 * Firma HMAC-SHA256 del fragmento header.payload (base64url sin padding en salida).
 */
export async function signJwtSegment(data, secret) {
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
  return Buffer.from(signatureArray)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * JWT completo (header.payload.signature).
 */
export async function generateJwtToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  const signature = await signJwtSegment(`${encodedHeader}.${encodedPayload}`, secret)
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verifica firma y expiración; devuelve payload o null.
 */
export async function verifyJwtToken(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, signature] = parts
    const expectedSignature = await signJwtSegment(`${encodedHeader}.${encodedPayload}`, secret)
    if (signature !== expectedSignature) return null

    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padding = (4 - (base64.length % 4)) % 4
    const paddedBase64 = base64 + '='.repeat(padding)
    const decodedPayload = JSON.parse(Buffer.from(paddedBase64, 'base64').toString('utf-8'))

    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp && decodedPayload.exp < now) return null

    return decodedPayload
  } catch {
    return null
  }
}

export async function hashPasswordSha256(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function comparePasswordSha256(password, hashHex) {
  const passwordHash = await hashPasswordSha256(password)
  return passwordHash === hashHex
}
