<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 m-2 sm:m-0">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-white">Configuración</h2>
              <p class="text-white/80 text-xs sm:text-sm mt-1 hidden sm:block">Personaliza estados y temporadas</p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-purple-50/30">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">

            <!-- Estados -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">Estados</h3>
              </div>
              <p class="text-sm text-gray-500 mb-5">Gestiona los diferentes estados de tus animes</p>
              <div class="space-y-3 mb-5">
                <div 
                  v-for="(estado, index) in estadosLocales" 
                  :key="index"
                  class="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 border-2 border-gray-200 hover:border-blue-400 transition-all"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <input 
                    v-model="estadosLocales[index]"
                    type="text"
                    class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                    placeholder="Ej: Animes Vistos"
                  />
                  <button 
                    @click="removeEstado(index)"
                    class="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                    title="Eliminar estado"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  @click="addEstado"
                  class="w-full px-4 py-3 text-blue-600 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar Estado</span>
                </button>
              </div>
              <button 
                @click="saveEstados"
                :disabled="saving"
                class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar Estados' }}</span>
              </button>
            </div>

            <!-- Temporadas -->
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">Temporadas</h3>
              </div>
              <p class="text-sm text-gray-500 mb-5">Define las temporadas disponibles para tus animes</p>
              <div class="space-y-3 mb-5">
                <div 
                  v-for="(temp, index) in temporadasLocales" 
                  :key="index"
                  class="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 border-2 border-gray-200 hover:border-pink-400 transition-all"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <input 
                    v-model="temporadasLocales[index]"
                    type="text"
                    class="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none bg-white"
                    placeholder="Ej: Temporada 1, Movie, OVA"
                  />
                  <button 
                    @click="removeTemporada(index)"
                    class="flex-shrink-0 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                    title="Eliminar temporada"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  @click="addTemporada"
                  class="w-full px-4 py-3 text-pink-600 border-2 border-dashed border-pink-300 rounded-xl hover:bg-pink-50 hover:border-pink-400 transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar Temporada</span>
                </button>
              </div>
              <button 
                @click="saveTemporadas"
                :disabled="saving"
                class="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <svg v-if="!saving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar Temporadas' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  estados: Array,
  temporadas: Array,
  saving: Boolean
})

const emit = defineEmits(['close', 'save-estados', 'save-temporadas'])

const estadosLocales = ref([...props.estados])
const temporadasLocales = ref([...props.temporadas])

watch(() => props.estados, (newVal) => {
  estadosLocales.value = [...newVal]
}, { deep: true })

watch(() => props.temporadas, (newVal) => {
  temporadasLocales.value = [...newVal]
}, { deep: true })

const addEstado = () => {
  estadosLocales.value.push('')
}

const removeEstado = (index) => {
  estadosLocales.value.splice(index, 1)
}

const addTemporada = () => {
  temporadasLocales.value.push('')
}

const removeTemporada = (index) => {
  temporadasLocales.value.splice(index, 1)
}

const saveEstados = () => {
  const estadosFiltrados = estadosLocales.value.filter(e => e.trim() !== '')
  emit('save-estados', estadosFiltrados)
}

const saveTemporadas = () => {
  const temporadasFiltradas = temporadasLocales.value.filter(t => t.trim() !== '')
  emit('save-temporadas', temporadasFiltradas)
}
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

