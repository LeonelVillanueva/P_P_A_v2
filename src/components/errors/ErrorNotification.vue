<template>
  <Transition name="notification">
    <div
      v-if="error && error.type !== 'success'"
      class="fixed top-4 right-4 z-[99] max-w-md"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="flex items-start space-x-3 rounded-xl border border-red-200/80 bg-elevated p-4 shadow-2xl">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100" aria-hidden="true">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-ink">{{ error.message }}</p>
          <p v-if="error.context" class="mt-1 text-xs text-ink-muted">{{ error.context }}</p>
        </div>
        <button
          class="rounded text-ink-muted transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-red-500/40"
          aria-label="Cerrar notificación de error"
          @click="$emit('dismiss')"
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
  error: { type: Object, default: null }
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

