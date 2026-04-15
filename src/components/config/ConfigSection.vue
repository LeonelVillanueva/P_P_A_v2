<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      ref="overlayRef"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-sm"
      @mousedown="handleOverlayMouseDown"
      @mouseup="handleOverlayMouseUp"
    >
      <div 
        ref="modalContentRef"
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[min(92vh,880px)] overflow-hidden flex flex-col border border-gray-100"
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-bold text-white truncate">Configuración</h2>
              <p class="text-white/75 text-[11px] sm:text-xs mt-0.5 line-clamp-1">Estados, seguimiento en el modal y temporadas</p>
            </div>
          </div>
          <button 
            type="button"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200 shrink-0"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-purple-50/30">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

            <!-- Estados -->
            <div class="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-800">Estados</h3>
              </div>
              <p class="text-xs text-gray-500 mb-2">Estados disponibles para tus animes.</p>
              <p class="text-[11px] text-gray-500 mb-3 leading-snug">
                La casilla <span class="font-medium text-gray-600">Seg.</span> define si ese estado tendrá el paso extra «Seguimiento» (información de revisión) al crear o editar. Si todas están marcadas, se guarda como «todos» (igual que antes).
              </p>
              <div class="space-y-2 mb-3">
                <div 
                  v-for="(estado, index) in estadosLocales" 
                  :key="index"
                  class="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-blue-400 transition-all"
                >
                  <div class="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center font-bold text-xs">
                    {{ index + 1 }}
                  </div>
                  <label
                    class="flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-blue-800 hover:bg-blue-50"
                    :title="'Paso Seguimiento en el modal para: ' + (estadosLocales[index] || '(vacío)')"
                  >
                    <input
                      v-model="seguimientoLocales[index]"
                      type="checkbox"
                      class="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="ml-0.5 hidden sm:inline">Seg.</span>
                  </label>
                  <input 
                    v-model="estadosLocales[index]"
                    type="text"
                    class="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                    placeholder="Ej: Vistos, En curso…"
                  />
                  <button 
                    type="button"
                    class="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Eliminar estado"
                    @click="removeEstado(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  type="button"
                  class="w-full px-3 py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all font-medium flex items-center justify-center gap-1.5"
                  @click="addEstado"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar estado</span>
                </button>
              </div>
              <button 
                type="button"
                :disabled="saving"
                class="w-full px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-2"
                @click="saveEstados"
              >
                <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar estados' }}</span>
              </button>
            </div>

            <!-- Temporadas -->
            <div class="bg-white rounded-xl shadow-md p-3 sm:p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-800">Temporadas</h3>
              </div>
              <p class="text-xs text-gray-500 mb-3">Temporadas disponibles al crear o editar</p>
              <div class="space-y-2 mb-3">
                <div 
                  v-for="(temp, index) in temporadasLocales" 
                  :key="index"
                  class="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-pink-400 transition-all"
                >
                  <div class="flex-shrink-0 w-7 h-7 bg-pink-100 text-pink-700 rounded-md flex items-center justify-center font-bold text-xs">
                    {{ index + 1 }}
                  </div>
                  <input 
                    v-model="temporadasLocales[index]"
                    type="text"
                    class="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none bg-white"
                    placeholder="Ej: Temporada 1, Movie, OVA"
                  />
                  <button 
                    type="button"
                    class="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Eliminar temporada"
                    @click="removeTemporada(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  type="button"
                  class="w-full px-3 py-2 text-sm text-pink-600 border border-dashed border-pink-300 rounded-lg hover:bg-pink-50 hover:border-pink-400 transition-all font-medium flex items-center justify-center gap-1.5"
                  @click="addTemporada"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar temporada</span>
                </button>
              </div>
              <button 
                type="button"
                :disabled="saving"
                class="w-full px-3 py-2 text-sm bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-2"
                @click="saveTemporadas"
              >
                <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar temporadas' }}</span>
              </button>
            </div>
          </div>

          <!-- Exportar lista esencial -->
          <div class="mt-3 sm:mt-4 bg-white rounded-xl shadow-md p-3 sm:p-4 border border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <h3 class="text-base sm:text-lg font-bold text-gray-800">Exportar datos</h3>
                </div>
                <p class="text-xs text-gray-500 pl-0 sm:pl-10">
                  Descarga un CSV con <strong class="font-medium text-gray-700">título original</strong>, <strong class="font-medium text-gray-700">título de entrega</strong>, <strong class="font-medium text-gray-700">temporadas</strong> y <strong class="font-medium text-gray-700">estado</strong> (UTF-8, compatible con Excel).
                </p>
              </div>
              <button
                type="button"
                :disabled="saving"
                class="shrink-0 px-4 py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow disabled:opacity-50 flex items-center justify-center gap-2"
                @click="$emit('export-essential')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const overlayRef = ref(null)
const modalContentRef = ref(null)
const mouseDownTarget = ref(null)

// Manejar mousedown en el overlay
const handleOverlayMouseDown = (event) => {
  // Guardar dónde comenzó el mousedown
  mouseDownTarget.value = event.target
}

// Manejar mouseup en el overlay
const handleOverlayMouseUp = (event) => {
  // Solo cerrar si tanto el mousedown como el mouseup fueron en el overlay
  // (no en el contenido del modal)
  if (
    mouseDownTarget.value === overlayRef.value && 
    event.target === overlayRef.value &&
    !props.saving
  ) {
    emit('close')
  }
  // Resetear el flag
  mouseDownTarget.value = null
}

const props = defineProps({
  show: Boolean,
  estados: { type: Array, default: () => [] },
  /** null = todos marcados; [] = ninguno */
  estadosPasoSeguimiento: {
    default: null,
    validator: (v) => v === null || Array.isArray(v)
  },
  temporadas: { type: Array, default: () => [] },
  saving: Boolean
})

const emit = defineEmits(['close', 'save-estados', 'save-temporadas', 'export-essential'])

const estadosLocales = ref([...props.estados])
const temporadasLocales = ref([...props.temporadas])

function seguimientoDefaultParaNombre(nombre) {
  const name = (nombre || '').trim()
  if (!name) return true
  const cfg = props.estadosPasoSeguimiento
  if (cfg == null) return true
  if (cfg.length === 0) return false
  return cfg.includes(name)
}

const seguimientoLocales = ref(props.estados.map((e) => seguimientoDefaultParaNombre(e)))

watch(
  () => [props.estados, props.estadosPasoSeguimiento],
  () => {
    estadosLocales.value = [...props.estados]
    seguimientoLocales.value = estadosLocales.value.map((e) => seguimientoDefaultParaNombre(e))
  },
  { deep: true }
)

watch(() => props.temporadas, (newVal) => {
  temporadasLocales.value = [...newVal]
}, { deep: true })

const addEstado = () => {
  estadosLocales.value.push('')
  seguimientoLocales.value.push(true)
}

const removeEstado = (index) => {
  estadosLocales.value.splice(index, 1)
  seguimientoLocales.value.splice(index, 1)
}

const addTemporada = () => {
  temporadasLocales.value.push('')
}

const removeTemporada = (index) => {
  temporadasLocales.value.splice(index, 1)
}

function buildEstadosPasoSeguimientoPayload() {
  const rows = estadosLocales.value.map((e, i) => ({
    name: (e || '').trim(),
    on: !!seguimientoLocales.value[i]
  })).filter((r) => r.name)
  if (rows.length === 0) return null
  if (rows.every((r) => r.on)) return null
  if (rows.every((r) => !r.on)) return []
  return rows.filter((r) => r.on).map((r) => r.name)
}

const saveEstados = () => {
  const estadosFiltrados = estadosLocales.value.filter((e) => e.trim() !== '')
  emit('save-estados', {
    estados: estadosFiltrados,
    estadosPasoSeguimiento: buildEstadosPasoSeguimientoPayload()
  })
}

const saveTemporadas = () => {
  const temporadasFiltradas = temporadasLocales.value.filter(t => t.trim() !== '')
  emit('save-temporadas', temporadasFiltradas)
}

// Cerrar con Escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.show && !props.saving) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>

