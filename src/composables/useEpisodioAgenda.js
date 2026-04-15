import { EPISODIO_FRECUENCIAS } from '../constants/episodioAgenda'

/**
 * Calcula una fecha sugerida para el próximo episodio según la frecuencia
 * @param {string} desdeIso - YYYY-MM-DD punto de partida (p. ej. último estreno o hoy)
 * @param {string} frecuencia - id de EPISODIO_FRECUENCIAS
 */
export function sugerirProximaFecha(desdeIso, frecuencia) {
  if (!desdeIso || !frecuencia || frecuencia === 'ninguna' || frecuencia === 'manual') {
    return null
  }
  const base = new Date(desdeIso + 'T12:00:00')
  if (isNaN(base.getTime())) return null

  const d = new Date(base)
  switch (frecuencia) {
    case 'semanal':
      d.setDate(d.getDate() + 7)
      break
    case 'quincenal':
      d.setDate(d.getDate() + 14)
      break
    case 'mensual':
      d.setMonth(d.getMonth() + 1)
      break
    case 'trimestral':
      d.setMonth(d.getMonth() + 3)
      break
    default:
      return null
  }
  return d.toISOString().slice(0, 10)
}

export function labelFrecuencia(id) {
  const f = EPISODIO_FRECUENCIAS.find((x) => x.id === id)
  return f ? f.label : id || '—'
}
