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
          class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          @click.stop
        >
          <div class="border-b border-gray-100 px-4 py-3 sm:px-5">
            <h2 id="pick-entrega-title" class="text-lg font-bold text-gray-900">
              ¿Qué entrega quieres editar?
            </h2>
            <p class="mt-1 text-xs text-gray-500 line-clamp-2">{{ serie.titulo_original }}</p>
          </div>
          <ul class="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
            <li v-for="anime in serie.temporadas" :key="anime.id">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm text-gray-800 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none"
                @click="$emit('select', anime)"
              >
                <span class="min-w-0 font-medium">{{ label(anime) }}</span>
                <span class="shrink-0 text-xs text-gray-500">{{ anime.estado }}</span>
              </button>
            </li>
          </ul>
          <div class="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <button
              type="button"
              class="w-full rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
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
