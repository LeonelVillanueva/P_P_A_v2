/**
 * Estilo de cada nodo orbital en reposo (borde + fondo + icono).
 * Fondos más saturados + icono blanco para contraste frente al blur del fondo.
 */
export const ORBITAL_IDLE_BY_ACTION_ID = {
  home: {
    ring: 'border-rose-200/90 bg-gradient-to-br from-rose-600 to-rose-900 shadow-md shadow-rose-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'open-modal': {
    ring: 'border-fuchsia-200/90 bg-gradient-to-br from-fuchsia-600 to-violet-900 shadow-md shadow-violet-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'manual-ping': {
    ring: 'border-emerald-200/90 bg-gradient-to-br from-emerald-600 to-teal-900 shadow-md shadow-emerald-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'open-calendar': {
    ring: 'border-sky-200/90 bg-gradient-to-br from-sky-600 to-blue-900 shadow-md shadow-sky-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'open-stats': {
    ring: 'border-amber-200/90 bg-gradient-to-br from-amber-600 to-orange-900 shadow-md shadow-amber-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'open-config': {
    ring: 'border-violet-200/90 bg-gradient-to-br from-violet-600 to-indigo-950 shadow-md shadow-violet-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  'open-help': {
    ring: 'border-cyan-200/90 bg-gradient-to-br from-cyan-600 to-slate-800 shadow-md shadow-cyan-950/40 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
  logout: {
    ring: 'border-red-200/90 bg-gradient-to-br from-red-600 to-rose-950 shadow-md shadow-red-950/50 ring-1 ring-white/25',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]',
  },
}

export function idleRingClass(actionId) {
  return ORBITAL_IDLE_BY_ACTION_ID[actionId]?.ring ?? 'border-zinc-300/80 bg-gradient-to-br from-zinc-700 to-zinc-950 shadow-md ring-1 ring-white/20'
}

export function idleIconClass(actionId, item) {
  const base = ORBITAL_IDLE_BY_ACTION_ID[actionId]?.icon ?? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
  if (item?.variant === 'muted') {
    return `text-base font-bold ${base}`
  }
  return `h-5 w-5 ${base}`
}

/** Refuerzo visual al seleccionar (misma paleta que en reposo). */
export function selectedRingExtraClass() {
  return 'ring-2 ring-white/60 shadow-xl brightness-110'
}
