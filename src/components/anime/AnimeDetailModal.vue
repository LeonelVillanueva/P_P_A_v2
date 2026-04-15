<template>
  <Teleport to="body">
    <Transition name="detail-modal">
      <div
        v-if="show && anime"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          @click="$emit('close')"
        />
        <div
          class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-2xl"
          @click.stop
        >
          <!-- Cabecera visual -->
          <div class="relative h-40 sm:h-52 shrink-0 bg-gradient-to-br from-slate-800 to-slate-900">
            <img
              v-if="anime.imagen_url"
              :src="anime.imagen_url"
              :alt="displayTitle"
              class="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <button
              type="button"
              class="absolute top-3 right-3 p-2 rounded-xl bg-black/30 text-white hover:bg-black/50 transition-colors"
              aria-label="Cerrar"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p class="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Ficha del anime</p>
              <h2 :id="titleId" class="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2">
                {{ displayTitle }}
              </h2>
              <span
                v-if="anime.estado"
                class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                :class="estadoClass(anime.estado)"
              >
                {{ anime.estado }}
              </span>
            </div>
          </div>

          <div class="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            <section v-if="anime.titulo_entrega" class="text-sm text-ink-muted">
              <span class="font-medium text-ink-muted">Obra (título original) · </span>{{ anime.titulo_original }}
            </section>

            <section class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="row in infoRows"
                :key="row.label"
                class="rounded-xl border border-border-subtle bg-surface-muted/80 px-4 py-3"
              >
                <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{{ row.label }}</p>
                <p class="mt-0.5 text-sm font-medium text-ink">{{ row.value }}</p>
              </div>
            </section>

            <section v-if="anime.temporadas?.length" class="flex flex-wrap gap-2">
              <span
                v-for="t in anime.temporadas"
                :key="t"
                class="rounded-full border border-accent-border/30 bg-accent-muted/30 px-3 py-1 text-xs font-semibold text-ink"
              >
                {{ t }}
              </span>
            </section>

            <section
              v-if="mostrarSeguimientoInfo"
              class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
            >
              <h3 class="text-xs font-bold uppercase tracking-wide text-indigo-800 mb-2">
                Seguimiento de información
              </h3>
              <p class="text-sm text-indigo-950">
                <span class="text-indigo-700/90">Última revisión: </span>
                <span class="font-medium">{{
                  anime.ultima_revision_info ? formatDate(anime.ultima_revision_info) : 'Sin registrar'
                }}</span>
              </p>
              <p v-if="!anime.ultima_revision_info" class="text-xs text-indigo-800/80 mt-2">
                Indica en edición cuándo buscaste anuncios o fechas para no repetir consultas con frecuencia.
              </p>
            </section>

            <section v-if="anime.sinopsis" class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h3 class="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sinopsis</h3>
              <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{{ anime.sinopsis }}</p>
            </section>

            <section
              v-if="hasAgenda"
              class="rounded-xl border border-amber-100 bg-amber-50/50 p-4"
            >
              <h3 class="text-xs font-bold uppercase tracking-wide text-amber-800 mb-3">Agenda de episodios</h3>
              <ul class="text-sm text-amber-950 space-y-1.5">
                <li v-if="anime.episodio_frecuencia && anime.episodio_frecuencia !== 'ninguna'">
                  <span class="text-amber-700/80">Frecuencia: </span>{{ labelFrecuencia(anime.episodio_frecuencia) }}
                </li>
                <li v-if="diasLabel">
                  <span class="text-amber-700/80">Días: </span>{{ diasLabel }}
                </li>
                <li v-if="anime.proximo_episodio_fecha">
                  <span class="text-amber-700/80">Próximo episodio: </span>{{ formatDate(anime.proximo_episodio_fecha) }}
                </li>
                <li v-if="anime.monitoreo_activo" class="text-emerald-700 font-medium">Monitoreo activo</li>
              </ul>
            </section>
          </div>

          <div class="flex shrink-0 justify-end gap-3 border-t border-border-subtle bg-surface-muted/90 px-5 py-4 sm:px-6">
            <button
              type="button"
              class="rounded-xl border border-border-subtle bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
              @click="$emit('close')"
            >
              Cerrar
            </button>
            <button
              type="button"
              class="rounded-xl bg-gradient-to-r from-accent to-accent-hover px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-card transition hover:brightness-110"
              @click="$emit('edit', anime)"
            >
              Editar información
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate, formatDateTime } from '../../utils/formatters'
import { labelFrecuencia } from '../../composables/useEpisodioAgenda'
import { DIAS_SEMANA } from '../../constants/episodioAgenda'
import { getAnimeDisplayTitle } from '../../utils/animeTitles'

const props = defineProps({
  show: Boolean,
  anime: {
    type: Object,
    default: null
  }
})

defineEmits(['close', 'edit'])

const titleId = 'anime-detail-title'

const displayTitle = computed(() => getAnimeDisplayTitle(props.anime))

const estadoClass = (estado) => {
  const map = {
    'Animes Vistos': 'bg-emerald-500/90 text-white',
    Estrenos: 'bg-amber-500/90 text-white',
    Emisión: 'bg-blue-500/90 text-white',
    'En espera': 'bg-orange-500/90 text-white',
    'Sin fecha': 'bg-slate-500/90 text-white',
    'Animes faltantes de ver': 'bg-red-500/90 text-white'
  }
  return map[estado] || 'bg-slate-600/90 text-white'
}

const infoRows = computed(() => {
  const a = props.anime
  if (!a) return []
  const rows = []
  if (a.fecha_estreno) {
    rows.push({ label: 'Estreno', value: formatDate(a.fecha_estreno) })
  }
  if (a.episodios != null && a.episodios !== '') {
    rows.push({ label: 'Episodios', value: String(a.episodios) })
  }
  if (a.temporada_numero) {
    rows.push({
      label: 'Temporada',
      value: `${a.tipo_temporada || 'Temporada'} ${a.temporada_numero}`
    })
  }
  if (a.generos?.length) {
    rows.push({ label: 'Géneros', value: a.generos.join(', ') })
  }
  if (a.jikan_id) {
    rows.push({ label: 'Jikan ID', value: String(a.jikan_id) })
  }
  rows.push({
    label: 'Última actualización',
    value: a.updated_at ? formatDateTime(a.updated_at) : '—'
  })
  return rows
})

const mostrarSeguimientoInfo = computed(() => !!props.anime)

const hasAgenda = computed(() => {
  const a = props.anime
  if (!a) return false
  return !!(
    (a.episodio_frecuencia && a.episodio_frecuencia !== 'ninguna') ||
    (Array.isArray(a.episodio_dias_semana) && a.episodio_dias_semana.length) ||
    a.proximo_episodio_fecha ||
    a.monitoreo_activo
  )
})

const diasLabel = computed(() => {
  const a = props.anime
  if (!a?.episodio_dias_semana?.length) return ''
  const set = new Set(
    (Array.isArray(a.episodio_dias_semana) ? a.episodio_dias_semana : []).map((n) => parseInt(n, 10))
  )
  return DIAS_SEMANA.filter((d) => set.has(d.v))
    .map((d) => d.label)
    .join(', ')
})
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
