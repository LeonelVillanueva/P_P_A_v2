/**
 * Metadatos para el menú orbital (relaciones y textos).
 * Los ids son 1..N en el mismo orden que APP_CHROME_ACTIONS.
 */
export const ORBITAL_RELATED_BY_ACTION_ID = {
  home: [2],
  'open-modal': [3, 4],
  'manual-ping': [2, 5],
  'open-calendar': [2, 5],
  'open-stats': [6, 7],
  'open-config': [5, 7],
  'open-help': [6],
  logout: [1],
}

/** Descripción corta bajo el título en la tarjeta expandida */
export const ORBITAL_CONTENT_BY_ACTION_ID = {
  home: 'Volver al listado principal de tu colección.',
  'open-modal': 'Crear una entrada nueva o editar desde el flujo habitual.',
  'manual-ping': 'Registra actividad en Supabase para mantener el proyecto activo.',
  'open-calendar': 'Episodios y fechas en vista calendario.',
  'open-stats': 'Resumen numérico y paneles de la colección.',
  'open-config': 'Ajustes de la aplicación y almacenamiento.',
  'open-help': 'Atajos de teclado y ayuda rápida.',
  logout: 'Cierra la sesión en este dispositivo.',
}

function statusForAction(action) {
  if (action.variant === 'primary' || action.variant === 'emerald') return 'in-progress'
  if (action.variant === 'danger') return 'pending'
  return 'completed'
}

/** @param {Array<{ id: string, title: string, ariaLabel: string, variant?: string }>} actions */
export function buildOrbitalTimelineItems(actions) {
  return actions.map((action, index) => {
    const id = index + 1
    const related = ORBITAL_RELATED_BY_ACTION_ID[action.id] ?? []
    const relatedIds = related
      .map((actionId) => actions.findIndex((a) => a.id === actionId) + 1)
      .filter((n) => n > 0 && n !== id)

    return {
      id,
      action,
      title: action.title,
      content: ORBITAL_CONTENT_BY_ACTION_ID[action.id] ?? action.ariaLabel,
      relatedIds,
      status: statusForAction(action),
    }
  })
}
