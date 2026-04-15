<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-help-title"
        @click.self="$emit('close')"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden"
          @click.stop
        >
          <div class="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 id="shortcuts-help-title" class="text-lg font-semibold text-gray-900">
              Atajos de teclado
            </h2>
            <button
              type="button"
              class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul class="px-5 py-4 space-y-3 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
            <li class="flex justify-between gap-4">
              <span>Comandos rápidos (paleta)</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Ctrl+K</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Nuevo anime</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Ctrl+N</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Configuración</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Ctrl+,</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Mostrar u ocultar estadísticas (en Inicio)</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Ctrl+/</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Historial de actividad</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Ctrl+H</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Cerrar paleta o historial</span>
              <kbd class="shrink-0 px-2 py-0.5 bg-gray-100 rounded border border-gray-300 text-xs">Esc</kbd>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false }
})
defineEmits(['close'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
