<template>
  <Transition name="notification">
    <div
      v-if="show"
      class="fixed top-4 right-4 z-[99] max-w-md"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="bg-white rounded-xl shadow-2xl border-2 border-green-200 p-4 flex items-start space-x-3">
        <div class="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center" aria-hidden="true">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800">{{ message }}</p>
          <p v-if="title && title !== 'Éxito'" class="text-xs text-gray-500 mt-1">{{ title }}</p>
        </div>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
          aria-label="Cerrar notificación de éxito"
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

