<template>
  <Teleport to="body">
    <div
      class="login-reveal-root fixed inset-0 z-[10001] flex items-center justify-center"
      :class="{ 'login-reveal-root--exit': phase === 'exit' }"
      aria-hidden="true"
    >
      <canvas ref="canvasRef" class="absolute inset-0 h-full w-full touch-none" />
      <p class="sr-only" aria-live="polite">
        {{ statusMessage }}
      </p>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['complete'])

const canvasRef = ref(null)
/** 'anim' | 'exit' */
const phase = ref('anim')
const prefersReducedMotion = ref(false)

const statusMessage = computed(() =>
  prefersReducedMotion.value ? 'Sesión iniciada.' : 'Sesión iniciada, entrando a la aplicación.'
)

const DURATION_MS = 2600
const EXIT_FADE_MS = 480
const PARTICLE_COUNT = 96

let rafId = 0
let start = 0
let particles = []
let resizeHandler = null
let fallbackTimer = null

function initParticles(width, height) {
  const cx = width / 2
  const cy = height / 2
  particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.4
    const speed = 0.45 + Math.random() * 1.35
    const hue = 255 + Math.random() * 55
    particles.push({
      angle,
      speed,
      hue,
      r: 1.2 + Math.random() * 2.8,
      wobble: Math.random() * Math.PI * 2
    })
  }
  return { cx, cy }
}

function draw(ctx, width, height, elapsed) {
  const t = Math.min(1, elapsed / DURATION_MS)
  const ease = 1 - (1 - t) ** 2.5
  const cx = width / 2
  const cy = height / 2

  if (particles.length === 0) {
    initParticles(width, height)
  }

  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, width, height)

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.55)
  g.addColorStop(0, `rgba(147, 51, 234, ${0.22 * (1 - t * 0.5)})`)
  g.addColorStop(0.45, 'rgba(59, 7, 100, 0.12)')
  g.addColorStop(1, 'rgba(2, 6, 23, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const maxDist = Math.min(width, height) * 0.48 * ease

  for (const p of particles) {
    const wobble = Math.sin(elapsed * 0.003 + p.wobble) * 12 * (1 - t)
    const dist = maxDist * p.speed + wobble
    const x = cx + Math.cos(p.angle) * dist
    const y = cy + Math.sin(p.angle) * dist
    const alpha = (1 - t) * 0.85 * (0.4 + p.speed * 0.4)
    ctx.beginPath()
    ctx.arc(x, y, p.r * (0.8 + 0.4 * (1 - t)), 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 85%, 68%, ${alpha})`
    ctx.fill()
  }

  const ringR = 40 + ease * Math.min(width, height) * 0.42
  ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * (1 - t)})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.stroke()

  const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringR * 0.9)
  innerGlow.addColorStop(0, `rgba(34, 211, 238, ${0.08 * (1 - t)})`)
  innerGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = innerGlow
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.fill()
}

function loop(now) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  const elapsed = now - start

  if (elapsed < DURATION_MS) {
    draw(ctx, w, h, elapsed)
    rafId = requestAnimationFrame(loop)
  } else {
    draw(ctx, w, h, DURATION_MS)
    finishExit()
  }
}

function finishExit() {
  phase.value = 'exit'
  window.setTimeout(() => {
    emit('complete')
  }, EXIT_FADE_MS)
}

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  particles = []
  initParticles(w, h)
}

onMounted(() => {
  prefersReducedMotion.value =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion.value) {
    queueMicrotask(() => emit('complete'))
    return
  }

  setupCanvas()
  resizeHandler = () => {
    setupCanvas()
  }
  window.addEventListener('resize', resizeHandler)

  start = performance.now()
  rafId = requestAnimationFrame(loop)

  fallbackTimer = window.setTimeout(() => {
    cancelAnimationFrame(rafId)
    if (phase.value === 'anim') {
      finishExit()
    }
  }, DURATION_MS + 1200)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
  }
})
</script>

<style scoped>
.login-reveal-root {
  pointer-events: auto;
  opacity: 1;
  transition: opacity 0.48s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-reveal-root--exit {
  opacity: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .login-reveal-root {
    transition-duration: 0.28s;
  }
}
</style>
