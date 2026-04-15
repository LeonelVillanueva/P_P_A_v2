/**
 * Origen único de verdad para el chrome de la app (rail escritorio + dock móvil).
 * kind: home | emit | logout
 */
/** icon: clave para el glifo SVG en AppChromeIcon */
export const APP_CHROME_ACTIONS = [
  {
    id: 'home',
    kind: 'home',
    icon: 'logo',
    ariaLabel: 'Ir al inicio',
    title: 'Inicio',
  },
  {
    id: 'open-modal',
    kind: 'emit',
    emit: 'open-modal',
    icon: 'plus',
    ariaLabel: 'Crear nuevo anime',
    title: 'Nuevo anime',
    variant: 'primary',
  },
  {
    id: 'manual-ping',
    kind: 'emit',
    emit: 'manual-ping',
    icon: 'wifi',
    ariaLabel: 'Ping manual a Supabase',
    title: 'Registrar actividad en Supabase (mantener proyecto activo)',
    variant: 'emerald',
  },
  {
    id: 'open-calendar',
    kind: 'emit',
    emit: 'open-calendar',
    icon: 'calendar',
    ariaLabel: 'Vista de calendario',
    title: 'Calendario',
    variant: 'default',
  },
  {
    id: 'open-stats',
    kind: 'emit',
    emit: 'open-stats',
    icon: 'stats',
    ariaLabel: 'Vista de estadísticas',
    title: 'Estadísticas',
    variant: 'default',
  },
  {
    id: 'open-config',
    kind: 'emit',
    emit: 'open-config',
    icon: 'cog',
    ariaLabel: 'Abrir configuración',
    title: 'Configuración',
    variant: 'default',
  },
  {
    id: 'open-help',
    kind: 'emit',
    emit: 'open-help',
    icon: 'help',
    ariaLabel: 'Ayuda y atajos de teclado',
    title: 'Ayuda y atajos',
    variant: 'muted',
  },
  {
    id: 'logout',
    kind: 'logout',
    icon: 'logout',
    ariaLabel: 'Cerrar sesión',
    title: 'Cerrar sesión',
    variant: 'danger',
  },
]

/** Acciones que se muestran como botones emit (sin home/logout) en bucles secundarios */
export function chromeEmitActions() {
  return APP_CHROME_ACTIONS.filter((a) => a.kind === 'emit')
}
