<template>
  <div
    ref="containerRef"
    class="relative flex h-full min-h-[280px] w-full min-w-[260px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-transparent"
    role="presentation"
    @click="handleContainerClick"
  >
    <div
      ref="orbitRef"
      class="absolute flex h-full w-full items-center justify-center"
      style="perspective: 1000px"
    >
      <!-- Centro -->
      <div
        class="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent via-violet-500 to-teal-600 shadow-lg motion-safe:animate-pulse"
        aria-hidden="true"
      >
        <div
          class="pointer-events-none absolute h-[4.5rem] w-[4.5rem] rounded-full border border-white/20 motion-safe:animate-ping motion-reduce:animate-none"
        />
        <div
          class="pointer-events-none absolute h-[5.5rem] w-[5.5rem] rounded-full border border-white/10 motion-safe:animate-ping motion-reduce:animate-none"
          style="animation-delay: 0.5s"
        />
        <div class="h-8 w-8 rounded-full bg-white/85 shadow-inner backdrop-blur-sm" />
      </div>

      <div
        v-for="item in items"
        :key="item.id"
        :ref="(el) => setNodeRef(item.id, el)"
        class="absolute cursor-pointer"
        :style="nodeWrapperStyle(item)"
        role="button"
        :tabindex="0"
        :aria-label="item.action.ariaLabel"
        @click.stop="toggleItem(item.id)"
        @keydown.enter.prevent="toggleItem(item.id)"
        @keydown.space.prevent="toggleItem(item.id)"
      >
        <div
          class="absolute rounded-full -inset-1 motion-reduce:animate-none"
          :class="pulseEffect[item.id] ? 'motion-safe:animate-pulse' : ''"
          :style="haloStyle()"
        />

        <div
          class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300"
          :class="nodeCircleClass(item)"
        >
          <AppChromeIcon :name="item.action.icon" :icon-class="nodeIconClass(item)" />
        </div>

        <div
          class="absolute top-12 whitespace-nowrap text-center text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 sm:text-xs"
          :class="expandedItems[item.id] ? 'scale-110 text-white drop-shadow-sm' : 'text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'"
          style="left: 50%; transform: translateX(-50%)"
        >
          {{ item.title }}
        </div>

        <div
          v-if="expandedItems[item.id]"
          class="absolute top-[4.75rem] left-1/2 z-[200] w-[min(16rem,calc(100vw-4rem))] -translate-x-1/2 rounded-xl border border-border-subtle bg-elevated/95 p-0 text-left shadow-card-lg backdrop-blur-md"
          @click.stop
        >
          <div class="pointer-events-none absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-border-subtle" />
          <div class="border-b border-border-subtle px-3 pb-2 pt-3">
            <div class="flex items-center justify-between gap-2">
              <span :class="badgeClass(item.status)">
                {{ statusLabel(item.status) }}
              </span>
              <span class="font-mono text-[10px] text-ink-subtle">Hanare</span>
            </div>
            <h3 class="mt-2 font-display text-sm font-semibold text-ink">
              {{ item.title }}
            </h3>
          </div>
          <div class="px-3 pb-3 pt-0 text-xs leading-relaxed text-ink-muted">
            <p>{{ item.content }}</p>

            <div v-if="item.relatedIds.length" class="mt-3 border-t border-border-subtle pt-3">
              <div class="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
                <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Enlaces
              </div>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="rid in item.relatedIds"
                  :key="rid"
                  type="button"
                  class="inline-flex h-7 items-center gap-1 border border-border-subtle bg-surface-muted/80 px-2 py-0 text-[11px] text-ink transition hover:bg-surface-muted"
                  @click.stop="toggleItem(rid)"
                >
                  {{ titleForId(rid) }}
                  <svg class="h-2.5 w-2.5 text-ink-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="mt-4 flex w-full items-center justify-center rounded-card bg-gradient-to-r from-accent to-accent-hover px-3 py-2 text-sm font-semibold text-accent-foreground shadow-card transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
              @click.stop="emitRun(item)"
            >
              Ejecutar acción
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import AppChromeIcon from './AppChromeIcon.vue'
import { idleRingClass, idleIconClass, selectedRingExtraClass } from '../../constants/orbitalNodeIdleStyles'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  /** Si false, se pausa la rotación automática (menú cerrado) */
  active: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['run-action'])

const expandedItems = ref({})
const rotationAngle = ref(0)
const autoRotate = ref(true)
const pulseEffect = ref({})
const activeNodeId = ref(null)
const containerRef = ref(null)
const orbitRef = ref(null)
const nodeRefs = ref({})
const orbitRadius = ref(158)

/** °/s: giro lento y fluido (requestAnimationFrame + delta). Subir/bajar este valor para afinar. */
const ORBIT_ROTATION_DEG_PER_SEC = 6

let rotationRafId = null
let rotationLastTs = 0

/** Animación al centrar otro nodo (sustituye el salto brusco tras quitar transition-all del órbita). */
let snapRafId = null

function cancelSnapAnimation() {
  if (snapRafId != null) {
    cancelAnimationFrame(snapRafId)
    snapRafId = null
  }
}

function mod360(x) {
  return ((x % 360) + 360) % 360
}

/**
 * Gira la órbita el camino más corto hasta alinear el nodo (misma meta que antes, pero interpolado).
 */
function animateOrbitToNode(nodeId) {
  cancelSnapAnimation()
  const nodeIndex = props.items.findIndex((item) => item.id === nodeId)
  if (nodeIndex < 0) return
  const totalNodes = props.items.length
  const targetRotation = 270 - (nodeIndex / totalNodes) * 360

  const start = rotationAngle.value
  const startMod = mod360(start)
  const targetMod = mod360(targetRotation)
  let delta = targetMod - startMod
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360

  const duration = 400
  const t0 = performance.now()

  function step(now) {
    const t = Math.min((now - t0) / duration, 1)
    const eased = 1 - (1 - t) ** 2
    rotationAngle.value = start + delta * eased
    if (t < 1) {
      snapRafId = requestAnimationFrame(step)
    } else {
      snapRafId = null
      rotationAngle.value = start + delta
    }
  }
  snapRafId = requestAnimationFrame(step)
}

function setNodeRef(id, el) {
  if (el) nodeRefs.value[id] = el
  else delete nodeRefs.value[id]
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function updateRadius() {
  const el = containerRef.value
  if (!el) return
  const s = Math.min(el.clientWidth, el.clientHeight)
  /** Radio mayor = iconos más separados del centro (antes 0.36, max 200). */
  orbitRadius.value = Math.min(268, Math.max(132, s * 0.46))
}

let resizeObserver = null

onMounted(() => {
  updateRadius()
  resizeObserver = new ResizeObserver(() => updateRadius())
  nextTick(() => {
    if (containerRef.value && resizeObserver) resizeObserver.observe(containerRef.value)
  })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  clearRotationTimer()
  cancelSnapAnimation()
})

function clearRotationTimer() {
  if (rotationRafId != null) {
    cancelAnimationFrame(rotationRafId)
    rotationRafId = null
  }
  rotationLastTs = 0
}

function rotationStep(ts) {
  if (prefersReducedMotion || !props.active || !autoRotate.value) {
    rotationLastTs = 0
    return
  }
  if (rotationLastTs === 0) {
    rotationLastTs = ts
    rotationRafId = requestAnimationFrame(rotationStep)
    return
  }
  const dt = Math.min((ts - rotationLastTs) / 1000, 0.05)
  rotationLastTs = ts
  rotationAngle.value = Number(
    ((rotationAngle.value + ORBIT_ROTATION_DEG_PER_SEC * dt) % 360).toFixed(4)
  )
  rotationRafId = requestAnimationFrame(rotationStep)
}

function startRotationTimer() {
  clearRotationTimer()
  if (prefersReducedMotion || !props.active) return
  if (!autoRotate.value) return
  rotationLastTs = 0
  rotationRafId = requestAnimationFrame(rotationStep)
}

watch(
  () => [props.active, autoRotate.value],
  () => {
    startRotationTimer()
  },
  { immediate: true }
)

watch(
  () => props.active,
  (open) => {
    if (!open) {
      expandedItems.value = {}
      activeNodeId.value = null
      pulseEffect.value = {}
      autoRotate.value = true
    } else {
      // Tras mostrar el panel (v-show), el tamaño real del contenedor aún no existía: recalcular radio.
      nextTick(() => {
        requestAnimationFrame(() => {
          updateRadius()
        })
      })
    }
  }
)

function handleContainerClick(e) {
  if (e.target === containerRef.value || e.target === orbitRef.value) {
    expandedItems.value = {}
    activeNodeId.value = null
    pulseEffect.value = {}
    autoRotate.value = true
  }
}

function getRelatedItems(itemId) {
  const current = props.items.find((i) => i.id === itemId)
  return current ? current.relatedIds : []
}

function isRelatedToActive(itemId) {
  if (activeNodeId.value == null) return false
  return getRelatedItems(activeNodeId.value).includes(itemId)
}

function calculateNodePosition(index, total) {
  const angle = mod360((index / total) * 360 + rotationAngle.value)
  const radius = orbitRadius.value
  const radian = (angle * Math.PI) / 180
  const x = radius * Math.cos(radian)
  const y = radius * Math.sin(radian)
  const zIndex = Math.round(100 + 50 * Math.cos(radian))
  const opacity = Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2)))
  return { x, y, angle, zIndex, opacity }
}

function toggleItem(id) {
  const prev = !!expandedItems.value[id]
  const next = { ...expandedItems.value }
  Object.keys(next).forEach((k) => {
    if (parseInt(k, 10) !== id) next[parseInt(k, 10)] = false
  })
  next[id] = !prev

  if (!prev) {
    activeNodeId.value = id
    autoRotate.value = false
    const related = getRelatedItems(id)
    const pulses = {}
    related.forEach((rid) => {
      pulses[rid] = true
    })
    pulseEffect.value = pulses
    animateOrbitToNode(id)
  } else {
    activeNodeId.value = null
    autoRotate.value = true
    pulseEffect.value = {}
    cancelSnapAnimation()
  }
  expandedItems.value = next
}

function nodeWrapperStyle(item) {
  const index = props.items.findIndex((i) => i.id === item.id)
  const pos = calculateNodePosition(index, props.items.length)
  const isExpanded = expandedItems.value[item.id]
  return {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    zIndex: isExpanded ? 200 : pos.zIndex,
    opacity: isExpanded ? 1 : pos.opacity,
  }
}

function haloStyle() {
  const size = 48
  const offset = (size - 40) / 2
  return {
    background: 'radial-gradient(circle, rgba(147,51,234,0.22) 0%, rgba(255,255,255,0) 70%)',
    width: `${size}px`,
    height: `${size}px`,
    left: `-${offset}px`,
    top: `-${offset}px`,
  }
}

function nodeCircleClass(item) {
  const ex = expandedItems.value[item.id]
  const rel = isRelatedToActive(item.id)
  const aid = item.action.id
  if (ex) {
    return `scale-150 border-2 transition-all ${idleRingClass(aid)} ${selectedRingExtraClass()}`
  }
  if (rel) {
    return 'scale-100 border-white/60 bg-white/25 text-zinc-900 motion-safe:animate-pulse'
  }
  return `scale-100 border-2 transition-colors hover:brightness-110 ${idleRingClass(aid)}`
}

function nodeIconClass(item) {
  const ex = expandedItems.value[item.id]
  const rel = isRelatedToActive(item.id)
  const aid = item.action.id
  if (ex) {
    return idleIconClass(aid, item.action)
  }
  if (rel) {
    if (item.action.variant === 'muted') return 'text-sm font-semibold text-zinc-900'
    return 'h-5 w-5 text-zinc-900'
  }
  return idleIconClass(aid, item.action)
}

function badgeClass(status) {
  switch (status) {
    case 'completed':
      return 'rounded-full border border-border-subtle bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink'
    case 'in-progress':
      return 'rounded-full border border-accent/40 bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground'
    case 'pending':
      return 'rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700'
    default:
      return 'rounded-full border border-border-subtle px-2 py-0.5 text-[10px] font-semibold text-ink-muted'
  }
}

function statusLabel(status) {
  if (status === 'completed') return 'Listo'
  if (status === 'in-progress') return 'Activo'
  return 'Atención'
}

function titleForId(id) {
  const it = props.items.find((i) => i.id === id)
  return it?.title ?? ''
}

function emitRun(item) {
  emit('run-action', item.action)
}
</script>
