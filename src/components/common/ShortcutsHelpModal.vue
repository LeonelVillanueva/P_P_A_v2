<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-help-title"
        @click.self="$emit('close')"
      >
        <div
          class="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-2xl"
          @click.stop
        >
          <div class="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/90 px-5 py-4">
            <h2 id="shortcuts-help-title" class="font-display text-lg font-semibold text-ink">
              Atajos de teclado
            </h2>
            <button
              type="button"
              class="rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              aria-label="Cerrar"
              @click="$emit('close')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul class="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4 text-sm text-ink">
            <li class="flex justify-between gap-4">
              <span>Comandos rápidos (paleta)</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Ctrl+K</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Nuevo anime</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Ctrl+N</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Configuración</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Ctrl+,</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Mostrar u ocultar estadísticas (en Inicio)</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Ctrl+/</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Historial de actividad</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Ctrl+H</kbd>
            </li>
            <li class="flex justify-between gap-4">
              <span>Cerrar paleta o historial</span>
              <kbd class="shrink-0 rounded border border-border-subtle bg-surface-muted px-2 py-0.5 text-xs text-ink">Esc</kbd>
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
