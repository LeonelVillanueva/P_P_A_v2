import { ref, computed } from 'vue'

/**
 * Composable para manejar el formulario de anime
 */
export function useAnimeForm(initialAnime = null) {
  const formData = ref({
    nombre: '',
    estado: '',
    temporadas: [],
    imagen_url: null
  })

  const previewImage = ref(null)
  const imageFile = ref(null)

  const isEditing = computed(() => {
    const anime = typeof initialAnime === 'function' ? initialAnime() : initialAnime
    return !!anime?.id
  })

  // Resetear formulario cuando cambia el anime
  const resetForm = (anime = null) => {
    if (anime) {
      formData.value = {
        nombre: anime.nombre || '',
        estado: anime.estado || '',
        temporadas: [...(anime.temporadas || [])],
        imagen_url: anime.imagen_url || null
      }
      
      // Si hay imagen_url pero no es un archivo local, mantenerla para mostrar
      // No establecer previewImage para URLs externas, se mostrará desde imagen_url
      if (anime.imagen_url && !anime.imagen_url.startsWith('data:')) {
        previewImage.value = null // Se mostrará desde formData.imagen_url
      }
    } else {
      formData.value = {
        nombre: '',
        estado: '',
        temporadas: [],
        imagen_url: null
      }
      previewImage.value = null
    }
    imageFile.value = null
  }

  // Manejar cambio de imagen
  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      imageFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImage.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Obtener datos del formulario para enviar
  const getFormData = () => {
    return {
      ...formData.value,
      imageFile: imageFile.value
    }
  }

  return {
    formData,
    previewImage,
    imageFile,
    isEditing,
    resetForm,
    handleImageChange,
    getFormData
  }
}

