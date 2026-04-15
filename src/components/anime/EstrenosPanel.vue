<template>
  <div class="space-y-6">
    <div
      class="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-5 sm:p-6 shadow-sm"
    >
      <h2 class="text-lg font-bold text-amber-900 flex items-center gap-2">
        <span class="text-2xl" aria-hidden="true">📡</span>
        Panel de estrenos y emisión
      </h2>
      <p class="text-sm text-amber-900/80 mt-2 max-w-3xl">
        Aquí defines cuándo se espera el próximo episodio, la frecuencia (o días manuales) y si quieres
        <strong>monitorear</strong> la serie. La fecha de estreno de la obra sigue siendo la referencia del inicio;
        el resto ayuda a seguir la actividad semanal o mensual.
      </p>
    </div>

    <div v-if="!animes.length" class="text-center py-16 text-gray-500">
      No hay animes en Estrenos. Añade títulos o muévelos a esta sección.
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="anime in animes"
        :key="anime.id"
        class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          <div class="flex gap-4 flex-1 min-w-0">
            <div
              class="w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500"
            >
              <img
                v-if="anime.imagen_url"
                :src="anime.imagen_url"
                :alt="getAnimeDisplayTitle(anime)"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {{ getAnimeDisplayTitle(anime).charAt(0) }}
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{{ getAnimeDisplayTitle(anime) }}</h3>
              <p class="text-xs text-gray-500 mt-1">
                Actualizado: {{ formatDate(anime.updated_at, true) }}
                <span v-if="anime.ultima_verificacion" class="ml-2">
                  · API: {{ formatRelativeTime(anime.ultima_verificacion) }}
                </span>
              </p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  {{ anime.estado }}
                </span>
                <span
                  v-if="anime.monitoreo_activo"
                  class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
                >
                  Monitoreo activo
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:items-end gap-2 sm:min-w-[200px]">
            <button
              type="button"
              class="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-medium text-sm hover:bg-purple-100 transition-colors"
              @click="$emit('open', anime)"
            >
              Ver detalles
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              @click="$emit('edit', anime)"
            >
              Editar ficha
            </button>
          </div>
        </div>

        <div class="border-t border-gray-100 bg-gray-50/80 p-4 sm:p-5 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Estreno (serie / primera emisión)</label>
              <input
                type="date"
                :value="anime.fecha_estreno || ''"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                @change="onFechaEstrenoChange(anime, $event.target.value)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Próximo episodio (esperado)</label>
              <input
                type="date"
                :value="anime.proximo_episodio_fecha || ''"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                @change="onProximoEpChange(anime, $event.target.value)"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Frecuencia de nuevos episodios</label>
              <select
                :value="normalizeFrec(anime.episodio_frecuencia)"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
                @change="onFrecuenciaChange(anime, $event.target.value)"
              >
                <option v-for="opt in EPISODIO_FRECUENCIAS" :key="opt.id" :value="opt.id">
                  {{ opt.label }}
                </option>
              </select>
              <button
                v-if="canSuggest(anime)"
                type="button"
                class="mt-2 text-xs text-purple-600 font-medium hover:underline"
                @click="aplicarSugerencia(anime)"
              >
                Calcular siguiente fecha desde la última referencia
              </button>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">
                Días de emisión (manual)
              </label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="d in DIAS_SEMANA"
                  :key="d.v"
                  type="button"
                  :class="[
                    'px-2 py-1 rounded-lg text-xs font-medium border transition-colors',
                    diasSet(anime).has(d.v)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  ]"
                  @click="toggleDia(anime, d.v)"
                >
                  {{ d.label }}
                </button>
              </div>
              <p class="text-[11px] text-gray-500 mt-1">
                Útil si sale un día fijo cada semana aunque la frecuencia sea “manual”.
              </p>
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              :checked="!!anime.monitoreo_activo"
              @change="onMonitoreoChange(anime, $event.target.checked)"
            />
            <span class="text-sm text-gray-700">Monitorear actividad de esta serie en el panel</span>
          </label>

          <p v-if="saveError[anime.id]" class="text-sm text-red-600">{{ saveError[anime.id] }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useAnimeStore } from '../../stores/animeStore'
import { useErrorStore } from '../../stores/errorStore'
import { EPISODIO_FRECUENCIAS, DIAS_SEMANA } from '../../constants/episodioAgenda'
import { formatDate, formatRelativeTime } from '../../utils/formatters'
import { getAnimeDisplayTitle } from '../../utils/animeTitles'
import { sugerirProximaFecha } from '../../composables/useEpisodioAgenda'

defineProps({
  animes: {
    type: Array,
    default: () => []
  }
})

defineEmits(['open', 'edit'])

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const saveError = reactive({})

const normalizeFrec = (f) => {
  const allowed = EPISODIO_FRECUENCIAS.map((x) => x.id)
  return f && allowed.includes(f) ? f : 'ninguna'
}

const diasSet = (anime) => {
  let raw = anime.episodio_dias_semana
  if (raw == null) raw = []
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw || '[]')
    } catch {
      raw = []
    }
  }
  const arr = Array.isArray(raw) ? raw : []
  return new Set(arr.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n) && n >= 0 && n <= 6))
}

const persist = async (anime, updates) => {
  delete saveError[anime.id]
  try {
    await errorStore.handleError(
      () => animeStore.updateAnime(anime.id, updates),
      'Guardar agenda'
    )
    await animeStore.fetchAnimes()
  } catch (e) {
    saveError[anime.id] = e?.message || 'No se pudo guardar'
  }
}

const onFechaEstrenoChange = (anime, value) => {
  persist(anime, { fecha_estreno: value || null })
}

const onProximoEpChange = (anime, value) => {
  persist(anime, { proximo_episodio_fecha: value || null })
}

const onFrecuenciaChange = (anime, value) => {
  persist(anime, { episodio_frecuencia: value })
}

const onMonitoreoChange = (anime, checked) => {
  persist(anime, { monitoreo_activo: checked })
}

const toggleDia = (anime, dia) => {
  const s = diasSet(anime)
  if (s.has(dia)) s.delete(dia)
  else s.add(dia)
  const arr = [...s].sort((a, b) => a - b)
  persist(anime, { episodio_dias_semana: arr })
}

const canSuggest = (anime) => {
  const f = normalizeFrec(anime.episodio_frecuencia)
  return f !== 'ninguna' && f !== 'manual'
}

const aplicarSugerencia = (anime) => {
  const base = anime.proximo_episodio_fecha || anime.fecha_estreno
  if (!base) {
    saveError[anime.id] = 'Indica al menos fecha de estreno o próximo episodio como referencia.'
    return
  }
  const next = sugerirProximaFecha(base, normalizeFrec(anime.episodio_frecuencia))
  if (next) persist(anime, { proximo_episodio_fecha: next })
}
</script>
