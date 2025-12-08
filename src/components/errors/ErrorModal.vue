<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-100">
        <!-- Header -->
        <div 
          :class="[
            'px-6 py-5 flex justify-between items-center',
            errors.length > 0 && errors[0].details?.type === 'success'
              ? 'bg-gradient-to-r from-green-600 to-green-700'
              : 'bg-gradient-to-r from-red-600 to-red-700'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg 
                v-if="errors.length > 0 && errors[0].details?.type === 'success'"
                class="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg 
                v-else
                class="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">Errores</h2>
              <p class="text-white/80 text-sm">{{ errors.length }} {{ errors.length === 1 ? 'error' : 'errores' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="errors.length > 1"
              @click="$emit('clear-all')"
              class="px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all text-sm"
            >
              Limpiar todo
            </button>
            <button 
              @click="$emit('close')"
              class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Errors List -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div v-if="errors.length === 0" class="text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-gray-600 font-medium">No hay errores</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="error in errors"
              :key="error.id"
              :class="[
                'bg-white rounded-xl p-5 border-2 shadow-sm',
                error.details?.type === 'success'
                  ? 'border-green-100'
                  : 'border-red-100'
              ]"
            >
              <!-- Error Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs font-semibold rounded',
                        error.details?.type === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ error.context }}
                    </span>
                    <span class="text-xs text-gray-400">
                      {{ formatTime(error.timestamp) }}
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-800 text-lg">
                    {{ error.message }}
                  </h3>
                </div>
                <button
                  @click="$emit('remove', error.id)"
                  class="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar error"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Error Details -->
              <div v-if="error.details && Object.keys(error.details).length > 0" class="mt-3">
                <button
                  @click="expandedErrors[error.id] = !expandedErrors[error.id]"
                  class="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                >
                  <svg 
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': expandedErrors[error.id] }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Ver detalles</span>
                </button>

                <div v-if="expandedErrors[error.id]" class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div v-for="(value, key) in error.details" :key="key" class="mb-2 last:mb-0">
                    <span class="text-xs font-semibold text-gray-600 uppercase">{{ key }}:</span>
                    <pre class="text-xs text-gray-700 mt-1 overflow-x-auto">{{ formatDetail(value) }}</pre>
                  </div>
                  
                  <div v-if="error.stack" class="mt-3 pt-3 border-t border-gray-200">
                    <span class="text-xs font-semibold text-gray-600 uppercase">Stack Trace:</span>
                    <pre class="text-xs text-gray-600 mt-1 overflow-x-auto max-h-40">{{ error.stack }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-white border-t border-gray-200 flex justify-end">
          <button
            @click="$emit('close')"
            class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  errors: Array
})

const emit = defineEmits(['close', 'remove', 'clear-all'])

const expandedErrors = ref({})

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDetail = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}
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

