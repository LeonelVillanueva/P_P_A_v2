<template>
  <div 
    class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30"
    @contextmenu.prevent
  >
    <!-- Header -->
    <AppHeader 
      @open-config="configModal.open()"
      @open-modal="handleOpenAnimeModal"
    />

    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <!-- Título y controles -->
      <div class="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Calendario de Estrenos</h1>
          <p class="text-gray-600">Arrastra animes a las fechas de estreno</p>
          <!-- Indicador de anime arrastrado desde otra vista -->
          <div 
            v-if="pendingDropAnime"
            class="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2"
          >
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm font-medium text-blue-800">
              {{ pendingDropAnime.nombre }} listo para soltar - Haz clic en una fecha
            </span>
            <button
              @click="clearPendingDrop"
              class="ml-auto text-blue-600 hover:text-blue-800"
              title="Cancelar"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="goToHome"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            title="Volver al inicio"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Inicio</span>
          </button>
          <button
            @click="previousMonth"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Anterior
          </button>
          <button
            @click="goToToday"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Hoy
          </button>
          <button
            @click="nextMonth"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <!-- Calendario -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <!-- Header del calendario -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-center text-gray-900">
            {{ currentMonthName }} {{ currentYear }}
          </h2>
        </div>

        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center font-semibold text-gray-600 py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- Días del mes -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'min-h-[120px] border-2 rounded-lg p-2 transition-all',
              day.isCurrentMonth 
                ? 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30' 
                : 'border-gray-100 bg-gray-50/50',
              day.isToday ? 'border-purple-500 bg-purple-50' : '',
              day.isDropTarget ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-300' : ''
            ]"
            @dragover.prevent="handleDragOver($event, day)"
            @dragleave="handleDragLeave($event, day)"
            @drop="handleDrop($event, day)"
            @click="handleDayClick(day)"
            @contextmenu.prevent="handleContextMenu($event, day)"
          >
            <!-- Número del día -->
            <div class="flex items-center justify-between mb-2">
              <span
                :class="[
                  'text-sm font-semibold',
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                  day.isToday ? 'text-purple-600' : ''
                ]"
              >
                {{ day.date.getDate() }}
              </span>
              <span
                v-if="day.animesCount > 0"
                class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full"
              >
                {{ day.animesCount }}
              </span>
            </div>

            <!-- Animes en este día -->
            <div class="space-y-1">
              <div
                v-for="anime in day.animes"
                :key="anime.id"
                draggable="true"
                @dragstart="handleAnimeDragStart($event, anime)"
                @click="animeModal.open(anime)"
                @contextmenu.stop.prevent="handleContextMenu($event, day, anime)"
                class="group cursor-pointer p-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200 hover:border-purple-400 hover:shadow-sm transition-all"
              >
                <div class="flex items-center space-x-2">
                  <img
                    v-if="anime.imagen_url"
                    :src="anime.imagen_url"
                    :alt="anime.nombre"
                    class="w-8 h-8 rounded object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-gray-900 truncate">{{ anime.nombre }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ anime.tipo_temporada || 'Temporada' }} {{ anime.temporada_numero || '' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="mt-6 bg-white rounded-xl p-4 border border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-3">Leyenda</h3>
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 border-2 border-purple-500 bg-purple-50 rounded"></div>
            <span>Hoy</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 border-2 border-blue-500 bg-blue-100 rounded"></div>
            <span>Zona de arrastre</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 border-2 border-gray-200 bg-gray-50 rounded"></div>
            <span>Otro mes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Anime -->
    <AnimeModal
      :show="animeModal.isOpen.value"
      :anime="animeModal.selectedItem.value"
      :estados="animeStore.estados"
      :temporadas="animeStore.temporadas"
      :loading="savingAnime"
      @close="animeModal.close()"
      @submit="handleSubmitAnime"
    />

    <!-- Success Popup -->
    <SuccessPopup
      :show="successPopup.show.value"
      :title="successPopup.title.value"
      :message="successPopup.message.value"
      :duration="successPopup.duration.value"
      @close="successPopup.close"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useModal } from '../composables/useModal'
import { useSuccessPopup } from '../composables/useSuccessPopup'
import AppHeader from '../components/layout/AppHeader.vue'
import AnimeModal from '../components/anime/AnimeModal.vue'
import SuccessPopup from '../components/common/SuccessPopup.vue'

const router = useRouter()

const animeStore = useAnimeStore()
const errorStore = useErrorStore()
const animeModal = useModal()
const configModal = useModal()
const successPopup = useSuccessPopup()

const savingAnime = ref(false)
const currentDate = ref(new Date())
const draggedAnime = ref(null)
const dropTargetDay = ref(null)
const pendingDropAnime = ref(null)

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', { month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Días del mes anterior para completar la primera semana
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  const days = []
  
  // Días del mes anterior
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, daysInPrevMonth - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      animes: [],
      animesCount: 0,
      isDropTarget: false
    })
  }
  
  // Días del mes actual
  const today = new Date()
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    
    // Buscar animes con esta fecha de estreno
    const animes = animeStore.animes.filter(anime => {
      if (!anime.fecha_estreno) return false
      const animeDate = new Date(anime.fecha_estreno).toISOString().split('T')[0]
      return animeDate === dateStr
    })
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      animes,
      animesCount: animes.length,
      isDropTarget: dropTargetDay.value?.toDateString() === date.toDateString()
    })
  }
  
  // Días del mes siguiente para completar la última semana
  const remainingDays = 42 - days.length // 6 semanas * 7 días
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      animes: [],
      animesCount: 0,
      isDropTarget: false
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const goToHome = () => {
  router.push('/')
}

const clearPendingDrop = () => {
  pendingDropAnime.value = null
  animeStore.clearDraggedAnime()
}

const handleDayClick = async (day) => {
  // Si hay un anime pendiente de soltar y se hace clic en un día válido
  if (pendingDropAnime.value && day.isCurrentMonth) {
    const dateStr = day.date.toISOString().split('T')[0]
    
    try {
      await errorStore.handleError(
        () => animeStore.updateAnime(pendingDropAnime.value.id, { fecha_estreno: dateStr }),
        'Actualizar Fecha de Estreno',
        { anime: pendingDropAnime.value.nombre, fecha: dateStr }
      )
      
      clearPendingDrop()
      await animeStore.fetchAnimes()
    } catch (error) {
      // Error ya manejado
    }
  }
}

const handleContextMenu = async (event, day, anime = null) => {
  // Prevenir el menú contextual del navegador
  event.preventDefault()
  
  // Si se hace click derecho en un anime específico, quitarle la fecha de estreno
  if (anime && anime.fecha_estreno) {
    try {
      await errorStore.handleError(
        () => animeStore.updateAnime(anime.id, { fecha_estreno: null }),
        'Quitar Fecha de Estreno',
        { anime: anime.nombre }
      )
      
      await animeStore.fetchAnimes()
      successPopup.showSuccess(`Se ha retirado la fecha de estreno de "${anime.nombre}"`, 'Fecha retirada')
    } catch (error) {
      // Error ya manejado
    }
    return
  }
  
  // Si se hace click derecho en un día que tiene animes, quitar la fecha de estreno del primero
  if (day.animes && day.animes.length > 0 && day.isCurrentMonth) {
    const animeToUpdate = day.animes[0]
    if (animeToUpdate.fecha_estreno) {
      try {
        await errorStore.handleError(
          () => animeStore.updateAnime(animeToUpdate.id, { fecha_estreno: null }),
          'Quitar Fecha de Estreno',
          { anime: animeToUpdate.nombre }
        )
        
        await animeStore.fetchAnimes()
        successPopup.showSuccess(`Se ha retirado la fecha de estreno de "${animeToUpdate.nombre}"`, 'Fecha retirada')
      } catch (error) {
        // Error ya manejado
      }
    }
  }
}

const handleAnimeDragStart = (event, anime) => {
  draggedAnime.value = anime
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', anime.id)
}

const handleDragOver = (event, day) => {
  if (!day.isCurrentMonth) return
  event.preventDefault()
  
  // Verificar si hay un anime arrastrado (del store o del evento)
  const hasDraggedAnime = draggedAnime.value || animeStore.getDraggedAnime() || 
                          event.dataTransfer.types.includes('application/json')
  
  if (hasDraggedAnime) {
    event.dataTransfer.dropEffect = 'move'
    dropTargetDay.value = day.date
  } else {
    event.dataTransfer.dropEffect = 'none'
  }
}

const handleDragLeave = (event, day) => {
  if (!day.isCurrentMonth) return
  dropTargetDay.value = null
}

const handleDrop = async (event, day) => {
  event.preventDefault()
  dropTargetDay.value = null
  
  if (!day.isCurrentMonth) return
  
  // Intentar obtener el anime del evento primero
  let animeToDrop = draggedAnime.value
  
  // Si no hay anime en el evento, intentar obtenerlo del store (drag desde otra vista)
  if (!animeToDrop) {
    animeToDrop = animeStore.getDraggedAnime()
  }
  
  // Si aún no hay anime, intentar leerlo del dataTransfer
  if (!animeToDrop && event.dataTransfer.types.includes('application/json')) {
    try {
      const data = event.dataTransfer.getData('application/json')
      if (data) {
        animeToDrop = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error al leer datos del drag:', error)
    }
  }
  
  if (!animeToDrop) return
  
  const dateStr = day.date.toISOString().split('T')[0]
  
  try {
    await errorStore.handleError(
      () => animeStore.updateAnime(animeToDrop.id, { fecha_estreno: dateStr }),
      'Actualizar Fecha de Estreno',
      { anime: animeToDrop.nombre, fecha: dateStr }
    )
    
    // Limpiar el anime arrastrado del store y el indicador pendiente
    animeStore.clearDraggedAnime()
    pendingDropAnime.value = null
    
    await animeStore.fetchAnimes()
  } catch (error) {
    // Error ya manejado
  }
  
  draggedAnime.value = null
}

const handleSubmitAnime = async (formData) => {
  savingAnime.value = true
  try {
    let imagenUrl = formData.imagen_url

    if (formData.imageFile) {
      const tempId = animeModal.selectedItem.value?.id || 'temp_' + Date.now()
      imagenUrl = await errorStore.handleError(
        () => animeStore.uploadImage(formData.imageFile, tempId),
        'Subir Imagen'
      )
    }

    const animeData = {
      nombre: formData.nombre,
      nombre_base: formData.nombre_base || formData.nombre,
      estado: formData.estado,
      temporadas: formData.temporadas,
      imagen_url: imagenUrl,
      temporada_numero: formData.temporada_numero || null,
      tipo_temporada: formData.tipo_temporada || 'Temporada',
      fecha_estreno: formData.fecha_estreno || null,
    }

    if (animeModal.selectedItem.value?.id) {
      await errorStore.handleError(
        () => animeStore.updateAnime(animeModal.selectedItem.value.id, animeData),
        'Actualizar Anime'
      )
    } else {
      await errorStore.handleError(
        () => animeStore.createAnime(animeData),
        'Crear Anime'
      )
    }

    animeModal.close()
    await animeStore.fetchAnimes()
  } catch (error) {
    // El error ya fue manejado por handleError
  } finally {
    savingAnime.value = false
  }
}

const handleOpenAnimeModal = () => {
  animeModal.open()
}

onMounted(async () => {
  try {
    await errorStore.handleError(
      () => animeStore.fetchEstados(),
      'Cargar Estados'
    )
    await errorStore.handleError(
      () => animeStore.fetchTemporadas(),
      'Cargar Temporadas'
    )
    await errorStore.handleError(
      () => animeStore.fetchAnimes(),
      'Cargar Animes'
    )
    
    // Verificar si hay un anime arrastrado desde otra vista
    const storedAnime = animeStore.getDraggedAnime()
    if (storedAnime) {
      // Buscar el anime completo en la lista actualizada
      const fullAnime = animeStore.animes.find(a => a.id === storedAnime.id)
      if (fullAnime) {
        draggedAnime.value = fullAnime
        pendingDropAnime.value = fullAnime
        
        // Limpiar automáticamente después de 5 minutos si no se usa
        setTimeout(() => {
          if (pendingDropAnime.value && pendingDropAnime.value.id === fullAnime.id) {
            clearPendingDrop()
          }
        }, 5 * 60 * 1000) // 5 minutos
      } else {
        // Si el anime no se encuentra, limpiar el estado
        animeStore.clearDraggedAnime()
      }
    }
  } catch (error) {
    // Errores ya manejados
  }
})
</script>
