<template>
  <Teleport to="body">
    <Transition name="detail-modal">
      <div
        v-if="show && serie"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')" />
        <div
          class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          @click.stop
        >
          <div class="relative h-36 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 sm:h-44">
            <img
              v-if="serie.imagen_url"
              :src="serie.imagen_url"
              :alt="serie.titulo_original"
              class="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <button
              type="button"
              class="absolute right-3 top-3 rounded-xl bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
              aria-label="Cerrar"
              @click="$emit('close')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <p class="mb-1 text-xs font-medium uppercase tracking-wider text-white/70">Obra</p>
              <h2 :id="titleId" class="text-xl font-bold leading-tight text-white sm:text-2xl">
                {{ serie.titulo_original }}
              </h2>
              <p class="mt-2 text-sm text-white/80">
                {{ serie.total_temporadas }} {{ serie.total_temporadas === 1 ? 'ficha' : 'fichas' }} en tu lista
              </p>
            </div>
          </div>

          <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
            <p class="text-xs text-gray-500">
              Solo lectura. Usa «Editar» en la ficha que quieras cambiar o eliminar.
            </p>
            <ul class="space-y-3">
              <li
                v-for="anime in serie.temporadas"
                :key="anime.id"
                class="rounded-xl border border-gray-100 bg-gray-50/80 p-3 sm:p-4"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900">{{ displayTitle(anime) }}</p>
                    <p v-if="anime.titulo_entrega" class="mt-0.5 text-xs text-gray-500">
                      Obra: {{ anime.titulo_original }}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        class="rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="estadoClass(anime.estado)"
                      >
                        {{ anime.estado }}
                      </span>
                      <span
                        v-for="t in anime.temporadas || []"
                        :key="t"
                        class="rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-800"
                      >
                        {{ t }}
                      </span>
                    </div>
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
                      @click="$emit('edit', anime)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      @click="$emit('delete', anime)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="shrink-0 border-t border-gray-100 bg-gray-50/90 px-4 py-3 sm:px-6">
            <button
              type="button"
              class="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              @click="$emit('close')"
            >
              Cerrar
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

defineEmits(['close', 'edit', 'delete'])

const titleId = 'serie-detail-title'

function displayTitle(anime) {
  return getAnimeDisplayTitle(anime)
}

function estadoClass(estado) {
  const map = {
    'Animes Vistos': 'bg-emerald-100 text-emerald-800',
    Estrenos: 'bg-amber-100 text-amber-800',
    Emisión: 'bg-blue-100 text-blue-800',
    'En espera': 'bg-orange-100 text-orange-800',
    'Sin fecha': 'bg-slate-100 text-slate-800',
    'Animes faltantes de ver': 'bg-red-100 text-red-800'
  }
  return map[estado] || 'bg-slate-100 text-slate-800'
}
</script>

<style scoped>
.detail-modal-enter-active,
.detail-modal-leave-active {
  transition: opacity 0.2s ease;
}
.detail-modal-enter-active .relative,
.detail-modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.detail-modal-enter-from,
.detail-modal-leave-to {
  opacity: 0;
}
.detail-modal-enter-from .relative,
.detail-modal-leave-to .relative {
  transform: scale(0.96) translateY(8px);
}
</style>
