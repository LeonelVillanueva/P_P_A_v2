<template>
  <div ref="rootRef" class="pointer-events-none">
    <Transition name="orbital-backdrop">
      <div
        v-show="menuOpen"
        class="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/[0.06] p-4 backdrop-blur-md backdrop-saturate-150 sm:p-6"
        role="presentation"
        @click.self="closeMenu"
      >
        <div
          :id="menuId"
          class="orbital-panel-wrap pointer-events-auto flex h-[min(88vh,780px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-transparent shadow-none"
          role="region"
          aria-label="Menú de acciones en órbita"
          @click.stop
        >
          <RadialOrbitalTimeline
            :items="orbitalItems"
            :active="menuOpen"
            @run-action="onOrbitalRun"
          />
        </div>
      </div>
    </Transition>

    <div class="pointer-events-auto fixed bottom-4 right-4 z-[110]">
      <button
        type="button"
        class="orb-main-btn"
        :aria-expanded="menuOpen"
        aria-haspopup="true"
        :aria-controls="menuId"
        aria-label="Abrir menú de acciones"
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
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { APP_CHROME_ACTIONS } from '../../constants/appChromeActions'
import { buildOrbitalTimelineItems } from '../../constants/orbitalChromeTimeline'
import RadialOrbitalTimeline from './RadialOrbitalTimeline.vue'

const emit = defineEmits(['open-config', 'open-modal', 'open-calendar', 'open-stats', 'manual-ping', 'open-help'])

const router = useRouter()
const authStore = useAuthStore()
const rootRef = ref(null)
const menuOpen = ref(false)
const menuId = 'app-orb-menu'

const orbitalItems = computed(() => buildOrbitalTimelineItems(APP_CHROME_ACTIONS))

const goToHome = () => {
  router.push('/')
}

const handleLogout = () => {
  authStore.logout()
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

function onOrbitalRun(action) {
  triggerAction(action)
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
  @apply inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-accent-foreground shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2;
}

.orbital-panel-wrap {
  min-height: 17.5rem;
}

.orbital-backdrop-enter-active,
.orbital-backdrop-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.orbital-backdrop-enter-from,
.orbital-backdrop-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
