<template>
  <div ref="rootRef" class="fixed bottom-4 right-4 z-50">
    <ul
      :id="menuId"
      class="pointer-events-none absolute bottom-2 right-2 m-0 list-none p-0"
      role="menu"
      aria-label="Acciones principales"
    >
      <li
        v-for="(action, index) in APP_CHROME_ACTIONS"
        :key="action.id"
        class="group absolute right-0 bottom-0 transition-all duration-300"
        :style="menuItemStyle(index)"
      >
        <button
          type="button"
          class="orb-action-btn"
          :class="actionClass(action)"
          role="menuitem"
          :tabindex="menuOpen ? 0 : -1"
          :aria-label="action.ariaLabel"
          :title="action.title"
          @click="triggerAction(action)"
        >
          <AppChromeIcon :name="action.icon" :icon-class="iconClass(action)" />
        </button>
        <span
          class="pointer-events-none absolute right-[3.35rem] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border-subtle bg-elevated px-2 py-1 text-xs font-medium text-ink shadow-card opacity-0 transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 sm:inline-block"
          aria-hidden="true"
        >
          {{ action.title }}
        </span>
      </li>
    </ul>

    <button
      type="button"
      class="orb-main-btn"
      :aria-expanded="menuOpen"
      :aria-controls="menuId"
      aria-label="Abrir menu de acciones"
      @click="toggleMenu"
    >
      <svg v-if="!menuOpen" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { APP_CHROME_ACTIONS } from '../../constants/appChromeActions'
import AppChromeIcon from './AppChromeIcon.vue'

const emit = defineEmits(['open-config', 'open-modal', 'open-calendar', 'open-stats', 'manual-ping', 'open-help'])

const router = useRouter()
const authStore = useAuthStore()
const rootRef = ref(null)
const menuOpen = ref(false)
const menuId = 'app-orb-menu'

const goToHome = () => {
  router.push('/')
}

const handleLogout = () => {
  authStore.logout()
  window.location.reload()
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function triggerAction(action) {
  if (action.kind === 'home') {
    goToHome()
  } else if (action.kind === 'logout') {
    handleLogout()
  } else if (action.kind === 'emit') {
    emit(action.emit)
  }
  closeMenu()
}

function menuItemStyle(index) {
  const count = APP_CHROME_ACTIONS.length
  const isMobile = window.innerWidth < 640
  const innerRadius = isMobile ? 122 : 138
  const outerRadius = isMobile ? 168 : 186
  const startDeg = 190
  const endDeg = 262
  // Distribucion en dos sub-lineas (anillos) para evitar colision entre botones.
  const ring = index % 2 // 0 = anillo interno, 1 = anillo externo
  const slot = Math.floor(index / 2)
  const totalInRing = Math.ceil((count - ring) / 2)
  const step = totalInRing > 1 ? (endDeg - startDeg) / (totalInRing - 1) : 0
  const angle = (startDeg + step * slot) * (Math.PI / 180)
  const radius = ring === 0 ? innerRadius : outerRadius
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return {
    transform: menuOpen.value
      ? `translate(${x}px, ${y}px) scale(1)`
      : 'translate(0px, 0px) scale(0.7)',
    opacity: menuOpen.value ? 1 : 0,
    pointerEvents: menuOpen.value ? 'auto' : 'none',
    transitionDelay: menuOpen.value ? `${index * 18}ms` : '0ms',
  }
}

function actionClass(action) {
  const base =
    'h-11 w-11 rounded-full border shadow-md transition focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2'
  if (action.variant === 'primary') {
    return `${base} bg-gradient-to-br from-accent to-accent-hover text-accent-foreground border-transparent hover:brightness-110`
  }
  if (action.variant === 'danger') {
    return `${base} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`
  }
  if (action.variant === 'emerald') {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100`
  }
  if (action.variant === 'muted') {
    return `${base} border-border-subtle bg-elevated text-ink-muted hover:bg-surface-muted`
  }
  return `${base} border-border-subtle bg-elevated text-ink hover:bg-surface-muted`
}

function iconClass(action) {
  if (action.variant === 'muted') return 'text-base font-semibold text-ink-muted'
  if (action.variant === 'primary') return 'h-5 w-5 text-accent-foreground'
  if (action.variant === 'emerald') return 'h-5 w-5'
  return 'h-5 w-5'
}

function onDocumentPointerDown(event) {
  if (!menuOpen.value) return
  if (!rootRef.value?.contains(event.target)) {
    closeMenu()
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.orb-main-btn {
  @apply inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-accent-foreground shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2;
}

.orb-action-btn {
  @apply inline-flex h-12 w-12 items-center justify-center;
}
</style>
