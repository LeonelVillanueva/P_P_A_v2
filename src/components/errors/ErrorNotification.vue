<template>
  <Transition name="notification">
    <div
      v-if="error && error.type !== 'success'"
      class="fixed top-4 right-4 z-[99] max-w-md"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="bg-white rounded-xl shadow-2xl border-2 border-red-200 p-4 flex items-start space-x-3">
        <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center" aria-hidden="true">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800">{{ error.message }}</p>
          <p v-if="error.context" class="text-xs text-gray-500 mt-1">{{ error.context }}</p>
        </div>
        <button
          @click="$emit('dismiss')"
          class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
          aria-label="Cerrar notificación de error"
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
defineProps({
  error: Object
})

defineEmits(['dismiss'])
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

