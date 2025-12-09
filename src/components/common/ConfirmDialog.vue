<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      ref="overlayRef"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      @mousedown="handleOverlayMouseDown"
      @mouseup="handleOverlayMouseUp"
    >
      <div 
        ref="modalContentRef"
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200"
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div 
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              :class="iconClass"
            >
              <svg class="w-6 h-6" :class="iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path 
                  v-if="type === 'danger'"
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
                <path 
                  v-else
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 id="confirm-title" class="text-xl font-bold text-gray-800">
              {{ title }}
            </h2>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p id="confirm-description" class="text-gray-600 mb-6">
            {{ message }}
          </p>

          <!-- Actions -->
          <div class="flex space-x-3 justify-end">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              :class="confirmButtonClass"
              class="px-4 py-2 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useFocusTrap } from '../../composables/useFocusTrap'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'danger', // 'danger' | 'warning' | 'info'
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const modalRef = ref(null)
const overlayRef = ref(null)
const modalContentRef = ref(null)
const mouseDownTarget = ref(null)

// Manejar mousedown en el overlay
const handleOverlayMouseDown = (event) => {
  // Guardar dónde comenzó el mousedown
  mouseDownTarget.value = event.target
}

// Manejar mouseup en el overlay
const handleOverlayMouseUp = (event) => {
  // Solo cerrar si tanto el mousedown como el mouseup fueron en el overlay
  // (no en el contenido del modal)
  if (
    mouseDownTarget.value === overlayRef.value && 
    event.target === overlayRef.value
  ) {
    emit('cancel')
  }
  // Resetear el flag
  mouseDownTarget.value = null
}

const iconClass = computed(() => {
  const classes = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  }
  return classes[props.type] || classes.danger
})

const iconColor = computed(() => {
  const classes = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }
  return classes[props.type] || classes.danger
})

const confirmButtonClass = computed(() => {
  const classes = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  }
  return classes[props.type] || classes.danger
})

// Focus trap
onMounted(() => {
  if (modalRef.value) {
    useFocusTrap(modalRef)
  }
})

// Cerrar con Escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.show) {
    emit('cancel')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>

