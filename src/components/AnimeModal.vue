<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex justify-between items-center rounded-t-2xl">
          <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
            <svg v-if="isEditing" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ isEditing ? 'Editar Anime' : 'Nuevo Anime' }}</span>
          </h2>
          <div class="flex items-center space-x-2">
            <button 
              v-if="!isEditing"
              @click="$emit('open-search')"
              class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg px-3 py-1.5 transition-all duration-200 flex items-center space-x-2 text-sm"
              title="Buscar anime en la API"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar</span>
            </button>
            <button 
              @click="$emit('close')"
              class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-6 bg-gray-50/50">
          <!-- Imagen -->
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Imagen de Portada</span>
            </label>
            <div class="flex items-center space-x-4">
              <div v-if="formData.imagen_url || previewImage" class="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-purple-200">
                <img 
                  :src="previewImage || formData.imagen_url" 
                  alt="Preview"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <div class="flex-1">
                <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-purple-50/50 hover:bg-purple-50 transition-colors">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click para subir</span> o arrastra</p>
                    <p class="text-xs text-gray-400">PNG, JPG o WEBP (MAX. 2MB)</p>
                    <p v-if="formData.imagen_url && !previewImage" class="text-xs text-purple-600 mt-2 font-medium">
                      ✓ Imagen de la API (se guardará como referencia)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleImageChange"
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <!-- Nombre -->
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Nombre del Anime <span class="text-red-500">*</span></span>
            </label>
            <input 
              v-model="formData.nombre"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              placeholder="Ej: Naruto, One Piece, Attack on Titan..."
            />
          </div>

          <!-- Estado -->
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Estado <span class="text-red-500">*</span></span>
            </label>
            <select 
              v-model="formData.estado"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white"
            >
              <option value="">Selecciona un estado</option>
              <option v-for="estado in estados" :key="estado" :value="estado">
                {{ estado }}
              </option>
            </select>
          </div>

          <!-- Temporadas -->
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span>Temporadas</span>
            </label>
            <div class="flex flex-wrap gap-3">
              <label 
                v-for="temp in temporadas" 
                :key="temp"
                class="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                :class="formData.temporadas.includes(temp) ? 'border-purple-500 bg-purple-50' : ''"
              >
                <input 
                  type="checkbox"
                  :value="temp"
                  v-model="formData.temporadas"
                  class="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span class="text-sm font-medium text-gray-700">{{ temp }}</span>
              </label>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex justify-end space-x-3 pt-4 bg-white rounded-b-2xl px-6 pb-6">
            <button 
              type="button"
              @click="$emit('close')"
              class="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { watch, computed } from 'vue'
import { useAnimeForm } from '../composables/useAnimeForm'

const props = defineProps({
  show: Boolean,
  anime: Object,
  estados: Array,
  temporadas: Array,
  loading: Boolean
})

const emit = defineEmits(['close', 'submit', 'open-search'])

const {
  formData,
  previewImage,
  imageFile,
  isEditing,
  resetForm,
  handleImageChange,
  getFormData
} = useAnimeForm(computed(() => props.anime))

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm(props.anime)
  }
})

// También observar cambios en props.anime
watch(() => props.anime, (newAnime) => {
  if (props.show && newAnime) {
    resetForm(newAnime)
  }
}, { deep: true })

const handleSubmit = () => {
  emit('submit', getFormData())
}

const handleImageError = (event) => {
  // Si la imagen de la API falla al cargar, mostrar placeholder
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
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
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>

