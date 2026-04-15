<template>
  <Transition name="notification">
    <div
      v-if="show"
      class="fixed top-4 right-4 z-[99] max-w-md"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="flex items-start space-x-3 rounded-xl border border-emerald-200/80 bg-elevated p-4 shadow-2xl">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100" aria-hidden="true">
          <svg class="h-6 w-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-ink">{{ message }}</p>
          <p v-if="title && title !== 'Éxito'" class="mt-1 text-xs text-ink-muted">{{ title }}</p>
        </div>
        <button
          class="rounded text-ink-muted transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          aria-label="Cerrar notificación de éxito"
          @click="close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Éxito'
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000 // Auto-cerrar después de 3 segundos
  }
})

const emit = defineEmits(['close'])

let autoCloseTimeout = null

// Auto-cerrar después de la duración especificada
onMounted(() => {
  if (props.duration > 0 && props.show) {
    autoCloseTimeout = setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
  }
})

const close = () => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
    autoCloseTimeout = null
  }
  emit('close')
}

// Watch para reiniciar el timer si show cambia
import { watch } from 'vue'
watch(() => props.show, (newValue) => {
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
    autoCloseTimeout = null
  }
  
  if (newValue && props.duration > 0) {
    autoCloseTimeout = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

