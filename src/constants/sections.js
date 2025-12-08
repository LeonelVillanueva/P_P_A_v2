/**
 * Constantes de secciones de animes
 */
export const SECTIONS = [
  { id: 'vistos', nombre: 'Animes Vistos' },
  { id: 'estrenos', nombre: 'Estrenos' },
  { id: 'sin_fecha', nombre: 'Sin Fecha' },
  { id: 'emision', nombre: 'En Emisión' },
  { id: 'en_espera', nombre: 'En Espera' },
  { id: 'faltantes', nombre: 'Animes Faltantes de Ver' }
]

/**
 * Mapeo de IDs de sección a nombres de estado
 */
export const SECTION_STATE_MAP = {
  'vistos': 'Animes Vistos',
  'estrenos': 'Estrenos',
  'sin_fecha': 'Sin fecha',
  'emision': 'Emisión',
  'en_espera': 'En espera',
  'faltantes': 'Animes faltantes de ver'
}

/**
 * Obtiene el nombre del estado basado en el ID de sección
 */
export const getStateBySection = (sectionId) => {
  return SECTION_STATE_MAP[sectionId] || null
}

