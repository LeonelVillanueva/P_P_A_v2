<template>
  <Teleport to="body">
    <Transition name="detail-modal">
      <div
        v-if="show && serie?.temporadas?.length"
        class="fixed inset-0 z-[65] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pick-entrega-title"
      >
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')" />
        <div
          class="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-2xl"
          @click.stop
        >
          <div class="border-b border-border-subtle px-4 py-3 sm:px-5">
            <h2 id="pick-entrega-title" class="font-display text-lg font-semibold text-ink">
              ¿Qué entrega quieres editar?
            </h2>
            <p class="mt-1 line-clamp-2 text-xs text-ink-muted">{{ serie.titulo_original }}</p>
          </div>
          <ul class="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
            <li v-for="anime in serie.temporadas" :key="anime.id">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm text-ink transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:outline-none"
                @click="$emit('select', anime)"
              >
                <span class="min-w-0 font-medium">{{ label(anime) }}</span>
                <span class="shrink-0 text-xs text-ink-muted">{{ anime.estado }}</span>
              </button>
            </li>
          </ul>
          <div class="border-t border-border-subtle bg-surface-muted/80 px-4 py-3">
            <button
              type="button"
              class="w-full rounded-lg py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              @click="$emit('close')"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { getAnimeDisplayTitle } from '../../utils/animeTitles'

defineProps({
  show: Boolean,
  serie: { type: Object, default: null }
})

defineEmits(['close', 'select'])

function label(anime) {
  return getAnimeDisplayTitle(anime)
}
</script>

<style scoped>
.detail-modal-enter-active,
.detail-modal-leave-active {
  transition: opacity 0.2s ease;
}
.detail-modal-enter-from,
.detail-modal-leave-to {
  opacity: 0;
}
</style>
