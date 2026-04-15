<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-[5.75rem] sm:pb-0">
    <AppChrome
      @open-config="shell.configModal.open()"
      @open-modal="shell.newAnimeOpener?.()"
      @open-calendar="shell.openCalendar()"
      @open-stats="shell.openStats()"
      @manual-ping="shell.handleManualPing"
      @open-help="shell.showHelp = true"
    />

    <main class="mx-auto w-full max-w-[min(100%,2200px)] px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-2 sm:py-3 md:py-4 text-gray-900">
      <section class="rounded-2xl border border-purple-100 bg-white p-3 sm:p-4 shadow-md">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-purple-500/90">Panel analitico</p>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Inteligencia del catalogo</h1>
            <p class="mt-0.5 text-xs sm:text-sm text-gray-600">
              Vista accionable para detectar equilibrio de estados, cadencia de estrenos y calidad del dataset.
            </p>
          </div>
          <div class="text-xs sm:text-sm text-gray-500">
            {{ totalAnimes }} animes analizados
          </div>
        </div>
      </section>

      <section class="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <article v-for="card in summaryCards" :key="card.label" class="rounded-xl border p-3 shadow-sm" :class="card.className">
          <p class="text-xs uppercase tracking-wide text-gray-500">{{ card.label }}</p>
          <p class="mt-1.5 text-xl sm:text-2xl font-black leading-none">{{ card.value }}</p>
          <p class="mt-1 text-[11px] text-gray-600">{{ card.hint }}</p>
        </article>
      </section>

      <section class="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <article class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm xl:col-span-6">
          <div class="mb-4">
            <h2 class="text-lg font-bold">Composicion por estado</h2>
            <p class="text-xs text-gray-500">Donut proporcional para identificar sobrecarga en un solo estado.</p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-[190px_1fr] sm:items-start">
            <div class="mx-auto flex flex-col items-center gap-2">
              <div class="flex h-44 w-44 items-center justify-center rounded-full border border-purple-100 bg-white">
              <div
                class="relative h-36 w-36 rounded-full"
                :style="{ background: estadoDonutGradient }"
                role="img"
                aria-label="Grafico circular de estados"
              >
                <div class="absolute inset-4 rounded-full bg-white shadow-inner" />
              </div>
              </div>
              <div class="rounded-lg border border-purple-100 bg-purple-50 px-3 py-1.5 text-center">
                <p class="text-[10px] uppercase tracking-wide text-purple-600">Diversidad</p>
                <p class="text-base font-black leading-none text-purple-700">{{ estadoEntries.length }} estados</p>
              </div>
            </div>
            <ul class="space-y-2">
              <li v-for="item in estadoSegments" :key="item.label" class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="h-3 w-3 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
                  <span class="truncate text-sm text-gray-700">{{ item.label }}</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">{{ item.count }}</p>
                  <p class="text-[11px] text-gray-500">{{ item.percent }}%</p>
                </div>
              </li>
            </ul>
          </div>
        </article>

        <article class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm xl:col-span-6">
          <h2 class="text-lg font-bold">Top temporadas</h2>
          <p class="mt-1 text-xs text-gray-500">Mas repetidas en todo el catalogo.</p>
          <div class="mt-2.5 flex flex-wrap gap-1.5">
            <span
              v-for="[temporada, count] in topTemporadas"
              :key="temporada"
              class="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700"
            >
              {{ temporada }} - {{ count }}
            </span>
            <p v-if="topTemporadas.length === 0" class="text-xs text-gray-500">Aun no hay temporadas para analizar.</p>
          </div>
        </article>
      </section>

      <section class="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <article class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm xl:col-span-5">
          <div class="mb-4">
            <h2 class="text-lg font-bold">Calidad de datos</h2>
            <p class="text-xs text-gray-500">Cobertura de campos criticos para analisis y automatizaciones.</p>
          </div>
          <div class="space-y-3">
            <div v-for="metric in dataQualityMetrics" :key="metric.label" class="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
              <div class="mb-1.5 flex items-center justify-between">
                <p class="text-sm font-semibold text-gray-700">{{ metric.label }}</p>
                <p class="text-xs font-bold text-purple-700">{{ metric.percent }}%</p>
              </div>
              <div class="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" :style="{ width: `${metric.percent}%` }" />
              </div>
              <p class="mt-1.5 text-[11px] text-gray-500">{{ metric.count }} de {{ totalAnimes }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm xl:col-span-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-lg font-bold">Series con mas temporadas</h2>
            <span class="text-xs text-gray-500">Top {{ topSeriesBySeasons.length }}</span>
          </div>
          <ol class="space-y-2">
            <li v-for="(item, idx) in topSeriesBySeasons" :key="item.name" class="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{{ idx + 1 }}</span>
                <span class="text-sm">{{ item.name }}</span>
              </div>
              <span class="text-sm font-bold text-purple-600">{{ item.seasons }}</span>
            </li>
            <p v-if="topSeriesBySeasons.length === 0" class="text-xs text-gray-500">Sin datos suficientes para ranking.</p>
          </ol>
        </article>

        <article class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm xl:col-span-3">
          <div class="mb-4">
            <h2 class="text-lg font-bold">Semaforo del catalogo</h2>
            <p class="text-xs text-gray-500">Lectura rapida de salud del backlog.</p>
          </div>
          <div class="space-y-3">
            <div v-for="signal in healthSignals" :key="signal.label" class="rounded-xl border px-3 py-2" :class="signal.className">
              <p class="text-sm font-semibold">{{ signal.label }}</p>
              <p class="text-xl font-black">{{ signal.value }}</p>
              <p class="text-[11px] text-gray-600">{{ signal.hint }}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { AppShellKey } from '../injectionKeys'
import AppChrome from '../components/layout/AppChrome.vue'
import { formatDate } from '../utils/formatters'

const shell = inject(AppShellKey)
if (!shell) {
  throw new Error('Stats requiere AppShell (App.vue)')
}

const animeStore = useAnimeStore()
const errorStore = useErrorStore()

const stats = computed(() => animeStore.stats)
const totalAnimes = computed(() => stats.value.total || 0)
const estadoEntries = computed(() => Object.entries(stats.value.porEstado || {}).sort((a, b) => b[1] - a[1]))
const topTemporadas = computed(() => Object.entries(stats.value.porTemporada || {}).sort((a, b) => b[1] - a[1]).slice(0, 8))

const animesConFecha = computed(() => animeStore.animes.filter((anime) => anime.fecha_estreno))
const animesConEpisodios = computed(() => animeStore.animes.filter((anime) => Number(anime.episodios) > 0))
const animesConAnio = computed(() => animeStore.animes.filter((anime) => anime.anio || anime.year))
const animesConImagen = computed(() => animeStore.animes.filter((anime) => anime.imagen_url))

const premierDate = computed(() => {
  if (animesConFecha.value.length === 0) return 'N/D'
  const first = [...animesConFecha.value].sort((a, b) =>
    String(a.fecha_estreno || '').localeCompare(String(b.fecha_estreno || ''))
  )[0]
  return formatDate(first.fecha_estreno)
})

const topSeriesBySeasons = computed(() => {
  return animeStore.animes
    .map((anime) => ({
      name: anime.titulo_original || 'Sin nombre',
      seasons: Array.isArray(anime.temporadas) ? anime.temporadas.length : 0,
    }))
    .filter((row) => row.seasons > 0)
    .sort((a, b) => b.seasons - a.seasons)
    .slice(0, 8)
})

const normalizedEstadoCounts = computed(() => {
  let done = 0
  let active = 0
  let backlog = 0
  estadoEntries.value.forEach(([estado, count]) => {
    const key = String(estado || '').toLowerCase()
    if (key.includes('visto') || key.includes('complet') || key.includes('final')) {
      done += count
    } else if (key.includes('emisi') || key.includes('viendo') || key.includes('siguiendo')) {
      active += count
    } else {
      backlog += count
    }
  })
  return { done, active, backlog }
})

const summaryCards = computed(() => [
  {
    label: 'Total animes',
    value: totalAnimes.value,
    hint: 'Cantidad total en catalogo',
    className: 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700',
  },
  {
    label: 'Cobertura de fechas',
    value: `${percent(animesConFecha.value.length)}%`,
    hint: `${animesConFecha.value.length} con fecha de estreno`,
    className: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700',
  },
  {
    label: 'Prom. temporadas',
    value: stats.value.promedioTemporadas || 0,
    hint: `${stats.value.totalTemporadas || 0} temporadas acumuladas`,
    className: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700',
  },
  {
    label: 'Primer estreno',
    value: premierDate.value,
    hint: `${topTemporadas.value.length} etiquetas de temporada frecuentes`,
    className: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700',
  },
])

const palette = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']
const estadoSegments = computed(() =>
  estadoEntries.value.map(([label, count], index) => ({
    label,
    count,
    percent: percent(count),
    color: palette[index % palette.length],
  }))
)

const estadoDonutGradient = computed(() => {
  if (estadoSegments.value.length === 0) return 'conic-gradient(#e5e7eb 0 100%)'
  let start = 0
  const chunks = estadoSegments.value.map((segment) => {
    const end = start + segment.percent
    const part = `${segment.color} ${start}% ${end}%`
    start = end
    return part
  })
  if (start < 100) chunks.push(`#e5e7eb ${start}% 100%`)
  return `conic-gradient(${chunks.join(', ')})`
})

const dataQualityMetrics = computed(() => [
  { label: 'Fecha de estreno', count: animesConFecha.value.length, percent: percent(animesConFecha.value.length) },
  { label: 'Episodios informados', count: animesConEpisodios.value.length, percent: percent(animesConEpisodios.value.length) },
  { label: 'Ano informado', count: animesConAnio.value.length, percent: percent(animesConAnio.value.length) },
  { label: 'Portada cargada', count: animesConImagen.value.length, percent: percent(animesConImagen.value.length) },
])

const healthSignals = computed(() => {
  const { done, active, backlog } = normalizedEstadoCounts.value
  return [
    {
      label: 'Finalizados',
      value: `${percent(done)}%`,
      hint: `${done} animes cerrados`,
      className: 'border-emerald-200 bg-emerald-50',
    },
    {
      label: 'En curso',
      value: `${percent(active)}%`,
      hint: `${active} animes en seguimiento`,
      className: 'border-blue-200 bg-blue-50',
    },
    {
      label: 'Backlog',
      value: `${percent(backlog)}%`,
      hint: `${backlog} pendientes o por iniciar`,
      className: 'border-amber-200 bg-amber-50',
    },
  ]
})

function percent(value, total = totalAnimes.value) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

onMounted(async () => {
  try {
    await errorStore.handleError(() => animeStore.fetchAnimes(), 'Cargar Animes')
  } catch {
    // Error ya manejado por el store global
  }
})
</script>

