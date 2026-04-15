<template>
  <div 
    class="min-h-screen bg-surface pb-[5.75rem] sm:pb-0"
    @contextmenu.prevent
  >
    <AppChrome 
      @open-config="shell.configModal.open()"
      @open-modal="handleOpenAnimeModal"
      @open-calendar="shell.openCalendar()"
      @open-stats="shell.openStats()"
      @manual-ping="shell.handleManualPing"
      @open-help="shell.showHelp = true"
    />

    <div class="mx-auto w-full max-w-[min(100%,2200px)] px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-3 sm:py-4 md:py-5">
      <!-- Cabecera compacta -->
      <header class="mb-4 sm:mb-5">
        <nav class="text-xs sm:text-sm text-gray-500 mb-1.5" aria-label="Ubicación en la aplicación">
          <router-link to="/" class="hover:text-purple-600 transition-colors">Inicio</router-link>
          <span class="mx-1.5 text-gray-400" aria-hidden="true">›</span>
          <span class="text-gray-700">Calendario</span>
        </nav>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-pink-800 bg-clip-text text-transparent">
              Calendario de estrenos
            </h1>
            <p class="text-sm text-gray-600 mt-0.5">Planifica fechas y arrastra títulos al día que toque.</p>
          </div>
        </div>
      </header>

      <!-- Layout: calendario compacto + panel lateral -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
        <!-- Columna izquierda: calendario (crece con el ancho disponible) -->
        <div class="min-w-0 flex-1">
          <div
            class="relative overflow-hidden rounded-2xl border border-purple-100/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/[0.03]"
          >
            <!-- Decoración de fondo -->
            <div
              class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/30 blur-2xl"
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-violet-100/50 blur-xl"
              aria-hidden="true"
            />

            <div class="relative p-3 sm:p-4">
              <div class="mb-4 flex flex-col items-center justify-center gap-1 sm:mb-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-500/90">Mes visible</p>
                <h2 class="text-center text-lg font-bold capitalize text-gray-900 sm:text-xl">
                  {{ currentMonthName }} <span class="text-purple-600">{{ currentYear }}</span>
                </h2>
              </div>

              <!-- Días de la semana -->
              <div class="grid grid-cols-7 gap-1 mb-1.5 sm:gap-1.5">
                <div
                  v-for="day in weekDays"
                  :key="day"
                  class="text-center text-[10px] font-bold uppercase tracking-wide text-gray-400 sm:text-xs"
                >
                  {{ day }}
                </div>
              </div>

              <!-- Días del mes -->
              <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  :class="[
                    'min-h-[76px] sm:min-h-[88px] border rounded-lg p-1 sm:p-1.5 transition-all duration-150',
                    day.isCurrentMonth
                      ? 'border-gray-200/90 bg-white/90 hover:border-purple-300/80 hover:bg-purple-50/40 hover:shadow-sm'
                      : 'border-transparent bg-gray-50/70',
                    day.isToday ? 'border-purple-500 ring-1 ring-purple-400/40 bg-gradient-to-br from-purple-50 to-pink-50/50' : '',
                    day.isDropTarget ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-300/60 scale-[1.02]' : ''
                  ]"
                  @dragover.prevent="handleDragOver($event, day)"
                  @dragleave="handleDragLeave($event, day)"
                  @drop="handleDrop($event, day)"
                  @click="handleDayClick(day)"
                  @contextmenu.prevent="handleContextMenu($event, day)"
                >
                  <div class="mb-1 flex items-center justify-between gap-0.5">
                    <span
                      :class="[
                        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md text-[11px] font-bold tabular-nums sm:text-xs',
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                        day.isToday ? 'bg-purple-600 text-white shadow-sm' : ''
                      ]"
                    >
                      {{ day.date.getDate() }}
                    </span>
                    <span
                      v-if="day.animesCount > 0"
                      class="rounded-full bg-purple-100 px-1.5 py-0 text-[9px] font-bold text-purple-700 sm:text-[10px]"
                    >
                      {{ day.animesCount }}
                    </span>
                  </div>

                  <div class="space-y-0.5">
                    <div
                      v-for="anime in day.animes"
                      :key="anime.id"
                      draggable="true"
                      class="group cursor-pointer rounded-md border border-purple-200/80 bg-gradient-to-r from-purple-50/90 to-pink-50/70 p-0.5 pl-1 transition-all hover:border-purple-400 hover:shadow-sm"
                      @dragstart="handleAnimeDragStart($event, anime)"
                      @click="animeModal.open(anime)"
                      @contextmenu.stop.prevent="handleContextMenu($event, day, anime)"
                    >
                      <div class="flex items-center gap-1">
                        <img
                          v-if="anime.imagen_url"
                          :src="anime.imagen_url"
                          :alt="getAnimeDisplayTitle(anime)"
                          class="h-6 w-6 shrink-0 rounded object-cover ring-1 ring-white sm:h-7 sm:w-7"
                        />
                        <div class="min-w-0 flex-1 leading-tight">
                          <p class="truncate text-[10px] font-semibold text-gray-900 sm:text-[11px]">{{ getAnimeDisplayTitle(anime) }}</p>
                          <p class="truncate text-[9px] text-gray-500 sm:text-[10px]">
                            {{ anime.tipo_temporada || 'Temp.' }} {{ anime.temporada_numero || '' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha: opciones + leyenda (sticky en desktop) -->
        <aside
          class="w-full shrink-0 space-y-4 lg:sticky lg:top-4 lg:w-[min(100%,18.5rem)] xl:w-80"
          aria-label="Controles y leyenda del calendario"
        >
          <!-- Navegación y acciones -->
          <div
            class="overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg shadow-purple-900/5 backdrop-blur-md ring-1 ring-purple-100/80"
          >
            <h3 class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm" aria-hidden="true">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              Navegación
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                @click="previousMonth"
              >
                <span class="text-lg leading-none text-gray-400" aria-hidden="true">‹</span>
                <span class="text-[10px] uppercase tracking-wide text-gray-500">Ant.</span>
              </button>
              <button
                type="button"
                class="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-500/25 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                @click="goToToday"
              >
                <svg class="h-4 w-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hoy
              </button>
              <button
                type="button"
                class="flex flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 transition hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                @click="nextMonth"
              >
                <span class="text-lg leading-none text-gray-400" aria-hidden="true">›</span>
                <span class="text-[10px] uppercase tracking-wide text-gray-500">Sig.</span>
              </button>
            </div>
            <button
              type="button"
              class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-2 text-sm text-gray-600 transition hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Volver al inicio"
              @click="goToHome"
            >
              <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Volver al inicio
            </button>
          </div>

          <!-- Leyenda -->
          <div
            class="overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-b from-white/90 to-purple-50/30 p-4 shadow-lg shadow-purple-900/5 backdrop-blur-md ring-1 ring-purple-100/80"
          >
            <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Leyenda</h3>
            <ul class="space-y-2.5" role="list">
              <li class="flex items-start gap-3 rounded-xl bg-white/60 p-2 ring-1 ring-gray-100">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-purple-500 bg-purple-50 shadow-inner" aria-hidden="true" />
                <div>
                  <p class="text-sm font-semibold text-gray-900">Hoy</p>
                  <p class="text-xs text-gray-500">Día actual resaltado.</p>
                </div>
              </li>
              <li class="flex items-start gap-3 rounded-xl bg-white/60 p-2 ring-1 ring-gray-100">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-sky-500 bg-sky-50 shadow-inner" aria-hidden="true" />
                <div>
                  <p class="text-sm font-semibold text-gray-900">Zona de soltar</p>
                  <p class="text-xs text-gray-500">Al arrastrar un anime sobre la fecha.</p>
                </div>
              </li>
              <li class="flex items-start gap-3 rounded-xl bg-white/60 p-2 ring-1 ring-gray-100">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50/90" aria-hidden="true" />
                <div>
                  <p class="text-sm font-semibold text-gray-900">Otro mes</p>
                  <p class="text-xs text-gray-500">Días atenuados fuera del mes.</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Consejos rápidos -->
          <div class="rounded-2xl border border-purple-200/60 bg-purple-900/[0.03] p-4">
            <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-purple-800/80">Cómo usar</h3>
            <ul class="space-y-2 text-xs leading-relaxed text-gray-600">
              <li class="flex gap-2">
                <span class="text-purple-500" aria-hidden="true">→</span>
                Arrastra un anime desde la lista o desde un día a otra fecha.
              </li>
              <li class="flex gap-2">
                <span class="text-purple-500" aria-hidden="true">→</span>
                Clic en un día con pendiente asigna la fecha de estreno.
              </li>
              <li class="flex gap-2">
                <span class="text-purple-500" aria-hidden="true">→</span>
                Clic derecho en un título o día para quitar la fecha.
              </li>
            </ul>
          </div>

          <!-- Indicador arrastre desde otra vista -->
          <div
            v-if="pendingDropAnime"
            class="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50/80 p-3 shadow-md ring-1 ring-sky-100"
            role="status"
          >
            <div class="flex items-start gap-2">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-lg text-white shadow-sm" aria-hidden="true">↓</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold uppercase tracking-wide text-sky-900">Listo para asignar</p>
                <p class="mt-0.5 text-sm font-medium text-sky-950">{{ getAnimeDisplayTitle(pendingDropAnime) }}</p>
                <p class="mt-1 text-xs text-sky-800/90">Toca una fecha del mes actual para confirmar.</p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-1.5 text-sky-600 hover:bg-white/80 hover:text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                title="Cancelar"
                @click="clearPendingDrop"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Modal Anime -->
    <AnimeModal
      ref="animeModalRef"
      :show="animeModal.isOpen.value"
      :anime="animeModal.selectedItem.value"
      :estados="animeStore.estados"
      :estados-paso-seguimiento="animeStore.estadosPasoSeguimiento"
      :temporadas="animeStore.temporadas"
      :loading="savingAnime"
      :default-estado="defaultEstadoForCalendar"
      @close="animeModal.close()"
      @submit="handleSubmitAnime"
      @open-search="handleOpenSearchFromAnimeModal"
    />

    <AnimeSearchModal
      :show="searchModal.isOpen.value"
      @close="searchModal.close()"
      @select="handleAnimeSelected"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useCalendarMonth } from '../composables/useCalendarMonth'
import { useCalendarDragDrop } from '../composables/useCalendarDragDrop'
import { useAnimeModalSearchFlow } from '../composables/useAnimeModalSearchFlow'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useModal } from '../composables/useModal'
import { AppShellKey } from '../injectionKeys'
import AppChrome from '../components/layout/AppChrome.vue'
import AnimeModal from '../components/anime/AnimeModal.vue'
import AnimeSearchModal from '../components/anime/AnimeSearchModal.vue'
import { getAnimeDisplayTitle } from '../utils/animeTitles'

const router = useRouter()
const shell = inject(AppShellKey)
if (!shell) {
  throw new Error('Calendar requiere AppShell (App.vue)')
}

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const animeModal = useModal()
const searchModal = useModal()

const savingAnime = ref(false)
const animeModalRef = ref(null)

const defaultEstadoForCalendar = computed(() => animeStore.estados[0] || '')

const { handleSubmitAnime, handleAnimeSelected, handleOpenSearchFromAnimeModal } =
  useAnimeModalSearchFlow({
    savingAnime,
    animeModal,
    searchModal,
    animeModalRef,
    defaultEstadoForNewAnime: defaultEstadoForCalendar,
    activityHistory: null
  })

const animesForCalendar = computed(() => animeStore.animes)
const {
  weekDays,
  currentYear,
  currentMonthName,
  calendarDays,
  dropTargetDay,
  previousMonth,
  nextMonth,
  goToToday
} = useCalendarMonth(animesForCalendar)

const {
  pendingDropAnime,
  clearPendingDrop,
  handleDayClick,
  handleContextMenu,
  handleAnimeDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  initPendingDragFromStore
} = useCalendarDragDrop({
  animeStore,
  errorStore,
  shell,
  dropTargetDay
})

const goToHome = () => {
  router.push('/')
}

const handleOpenAnimeModal = () => {
  animeModal.open()
}

onMounted(async () => {
  shell.setNewAnimeHandler(handleOpenAnimeModal)
  try {
    await errorStore.handleError(
      () => animeStore.fetchConfiguracion(),
      'Cargar configuración'
    )
    await errorStore.handleError(
      () => animeStore.fetchAnimes(),
      'Cargar Animes'
    )

    initPendingDragFromStore()
  } catch {
    // Errores ya manejados
  }
})

onUnmounted(() => {
  shell.setNewAnimeHandler(() => {})
})
</script>
