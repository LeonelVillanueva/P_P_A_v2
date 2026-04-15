/** Opciones de frecuencia para nuevos episodios */
export const EPISODIO_FRECUENCIAS = [
  { id: 'ninguna', label: 'Sin frecuencia fija' },
  { id: 'manual', label: 'Manual (elige días de la semana)' },
  { id: 'semanal', label: 'Cada semana' },
  { id: 'quincenal', label: 'Cada dos semanas' },
  { id: 'mensual', label: 'Cada mes' },
  { id: 'trimestral', label: 'Cada 3 meses' }
]

/** Etiquetas para días de la semana (0 = domingo, ISO similar a JS getDay) */
export const DIAS_SEMANA = [
  { v: 0, label: 'Dom' },
  { v: 1, label: 'Lun' },
  { v: 2, label: 'Mar' },
  { v: 3, label: 'Mié' },
  { v: 4, label: 'Jue' },
  { v: 5, label: 'Vie' },
  { v: 6, label: 'Sáb' }
]
