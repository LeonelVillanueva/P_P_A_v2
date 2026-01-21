import { ref, computed } from 'vue'

/**
 * Composable para manejar el formulario de anime
 */
export function useAnimeForm(initialAnime = null) {
  const formData = ref({
    nombre: '',
    nombre_base: '', // Nombre base de la serie (para agrupar temporadas)
    estado: '',
    temporadas: [],
    imagen_url: null,
    temporada_numero: null, // Número de temporada (1, 2, 3, etc.)
    tipo_temporada: 'Temporada', // Tipo: Temporada, Movie, OVA, Spin off
    fecha_estreno: null, // Fecha de estreno
    jikan_id: null // ID de Jikan API para actualizaciones automáticas
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
        nombre_base: anime.nombre_base || anime.nombre || '', // Si no hay nombre_base, usar nombre
        estado: anime.estado || '',
        temporadas: [...(anime.temporadas || [])],
        imagen_url: anime.imagen_url || null,
        temporada_numero: anime.temporada_numero || null,
        tipo_temporada: anime.tipo_temporada || 'Temporada',
        fecha_estreno: anime.fecha_estreno || null,
        jikan_id: anime.jikan_id || null
      }
      
      // Si hay imagen_url pero no es un archivo local, mantenerla para mostrar
      // No establecer previewImage para URLs externas, se mostrará desde imagen_url
      if (anime.imagen_url && !anime.imagen_url.startsWith('data:')) {
        previewImage.value = null // Se mostrará desde formData.imagen_url
      }
    } else {
      formData.value = {
        nombre: '',
        nombre_base: '',
        estado: '',
        temporadas: [],
        imagen_url: null,
        temporada_numero: null,
        tipo_temporada: 'Temporada',
        fecha_estreno: null,
        jikan_id: null
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

