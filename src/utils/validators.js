/**
 * Utilidades de validación y sanitización para seguridad
 */

/**
 * Sanitizar string para prevenir XSS
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return ''
  
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .trim()
    .slice(0, 500) // Limitar longitud
}

/**
 * Validar nombre de anime
 */
export function validateAnimeName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es requerido' }
  }
  
  const sanitized = sanitizeString(name)
  
  if (sanitized.length < 1) {
    return { valid: false, error: 'El nombre no puede estar vacío' }
  }
  
  if (sanitized.length > 200) {
    return { valid: false, error: 'El nombre es demasiado largo (máx. 200 caracteres)' }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validar URL de imagen
 */
export function validateImageUrl(url) {
  if (!url) return { valid: true, value: null }
  
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL inválida' }
  }
  
  // Validar formato de URL
  try {
    const urlObj = new URL(url)
    
    // Solo permitir HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Protocolo no permitido' }
    }
    
    // Limitar longitud
    if (url.length > 1000) {
      return { valid: false, error: 'URL demasiado larga' }
    }
    
    return { valid: true, value: url }
  } catch {
    return { valid: false, error: 'URL inválida' }
  }
}

/**
 * Validar archivo de imagen
 */
export function validateImageFile(file) {
  if (!file) return { valid: true, value: null }
  
  if (!(file instanceof File)) {
    return { valid: false, error: 'Archivo inválido' }
  }
  
  // Validar tipo MIME
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Solo JPG, PNG o WEBP' }
  }
  
  // Validar tamaño (2MB máximo)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande (máx. 2MB)' }
  }
  
  // Validar extensión
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Extensión de archivo no permitida' }
  }
  
  return { valid: true, value: file }
}

/**
 * Validar array de temporadas
 */
export function validateTemporadas(temporadas) {
  if (!Array.isArray(temporadas)) {
    return { valid: false, error: 'Las temporadas deben ser un array' }
  }
  
  if (temporadas.length > 50) {
    return { valid: false, error: 'Demasiadas temporadas (máx. 50)' }
  }
  
  // Validar que cada temporada sea un string válido
  const sanitized = temporadas
    .filter(t => t && typeof t === 'string')
    .map(t => sanitizeString(t))
    .filter(t => t.length > 0 && t.length <= 50)
    .slice(0, 50) // Limitar cantidad
  
  return { valid: true, value: sanitized }
}

/**
 * Validar estado
 */
export function validateEstado(estado, estadosValidos = []) {
  if (!estado || typeof estado !== 'string') {
    return { valid: false, error: 'El estado es requerido' }
  }
  
  const sanitized = sanitizeString(estado)
  
  // Si hay estados válidos definidos, validar contra ellos (comparación case-insensitive)
  if (estadosValidos.length > 0) {
    const estadoEncontrado = estadosValidos.find(e => 
      e.trim().toLowerCase() === sanitized.toLowerCase()
    )
    if (!estadoEncontrado) {
      return { valid: false, error: `Estado no válido. Estados válidos: ${estadosValidos.join(', ')}` }
    }
    // Usar el estado exacto de la lista de válidos para mantener consistencia
    return { valid: true, value: estadoEncontrado.trim() }
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: 'Estado demasiado largo' }
  }
  
  return { valid: true, value: sanitized }
}

/**
 * Validar datos completos de anime antes de guardar
 */
export function validateAnimeData(animeData, estadosValidos = []) {
  const errors = []
  const validated = {}
  
  // Validar nombre
  const nameValidation = validateAnimeName(animeData.nombre)
  if (!nameValidation.valid) {
    errors.push(nameValidation.error)
  } else {
    validated.nombre = nameValidation.value
  }
  
  // Validar imagen URL
  const urlValidation = validateImageUrl(animeData.imagen_url)
  if (!urlValidation.valid) {
    errors.push(urlValidation.error)
  } else {
    validated.imagen_url = urlValidation.value
  }
  
  // Validar estado
  const estadoValidation = validateEstado(animeData.estado, estadosValidos)
  if (!estadoValidation.valid) {
    errors.push(estadoValidation.error)
  } else {
    validated.estado = estadoValidation.value
  }
  
  // Validar temporadas
  const temporadasValidation = validateTemporadas(animeData.temporadas)
  if (!temporadasValidation.valid) {
    errors.push(temporadasValidation.error)
  } else {
    validated.temporadas = temporadasValidation.value
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors: errors,
      data: null
    }
  }
  
  return {
    valid: true,
    errors: [],
    data: validated
  }
}

/**
 * Validar ID (UUID o número)
 */
export function validateId(id) {
  if (!id) {
    return { valid: false, error: 'ID requerido' }
  }
  
  // UUID v4 o número
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const numberRegex = /^\d+$/
  
  const idString = String(id)
  
  if (uuidRegex.test(idString) || numberRegex.test(idString)) {
    return { valid: true, value: idString }
  }
  
  return { valid: false, error: 'ID inválido' }
}

