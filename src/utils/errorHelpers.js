/**
 * Utilidades para manejo de errores
 */

/**
 * Extraer mensaje de error legible
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.response?.statusText) {
    return `${error.response.status}: ${error.response.statusText}`
  }
  
  return 'Ha ocurrido un error desconocido'
}

/**
 * Determinar contexto del error basado en la operación
 */
export function getErrorContext(operation) {
  const contextMap = {
    'fetch': 'Cargar Datos',
    'create': 'Crear',
    'update': 'Actualizar',
    'delete': 'Eliminar',
    'upload': 'Subir Archivo',
    'search': 'Buscar',
    'save': 'Guardar',
    'load': 'Cargar'
  }
  
  return contextMap[operation] || 'Operación'
}

/**
 * Formatear detalles del error para mostrar
 */
export function formatErrorDetails(error) {
  const details = {}
  
  if (error?.response) {
    details.status = error.response.status
    details.statusText = error.response.statusText
    if (error.response.data) {
      details.data = error.response.data
    }
  }
  
  if (error?.code) {
    details.code = error.code
  }
  
  if (error?.stack) {
    details.stack = error.stack
  }
  
  return details
}

