import { ref, computed } from 'vue'

/**
 * Composable para manejar el formulario de anime
 */
export function useAnimeForm(initialAnime = null) {
  const formData = ref({
    titulo_original: '',
    titulo_entrega: '',
    estado: '',
    temporadas: [],
    imagen_url: null,
    temporada_numero: null, // Número de temporada (1, 2, 3, etc.)
    tipo_temporada: 'Temporada', // Tipo: Temporada, Movie, OVA, Spin off
    fecha_estreno: null, // Fecha de estreno
    jikan_id: null, // ID de Jikan API para actualizaciones automáticas
    episodio_frecuencia: 'ninguna',
    episodio_dias_semana: [],
    proximo_episodio_fecha: null,
    monitoreo_activo: false,
    ultima_revision_info: null
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
        titulo_original: anime.titulo_original || '',
        titulo_entrega: anime.titulo_entrega || '',
        estado: anime.estado || '',
        temporadas: [...(anime.temporadas || [])],
        imagen_url: anime.imagen_url || null,
        temporada_numero: anime.temporada_numero || null,
        tipo_temporada: anime.tipo_temporada || 'Temporada',
        fecha_estreno: anime.fecha_estreno || null,
        jikan_id: anime.jikan_id || null,
        episodio_frecuencia: anime.episodio_frecuencia || 'ninguna',
        episodio_dias_semana: Array.isArray(anime.episodio_dias_semana)
          ? [...anime.episodio_dias_semana]
          : [],
        proximo_episodio_fecha: anime.proximo_episodio_fecha || null,
        monitoreo_activo: !!anime.monitoreo_activo,
        ultima_revision_info: anime.ultima_revision_info || null
      }
      
      // Si hay imagen_url pero no es un archivo local, mantenerla para mostrar
      // No establecer previewImage para URLs externas, se mostrará desde imagen_url
      if (anime.imagen_url && !anime.imagen_url.startsWith('data:')) {
        previewImage.value = null // Se mostrará desde formData.imagen_url
      }
    } else {
      formData.value = {
        titulo_original: '',
        titulo_entrega: '',
        estado: '',
        temporadas: [],
        imagen_url: null,
        temporada_numero: null,
        tipo_temporada: 'Temporada',
        fecha_estreno: null,
        jikan_id: null,
        episodio_frecuencia: 'ninguna',
        episodio_dias_semana: [],
        proximo_episodio_fecha: null,
        monitoreo_activo: false,
        ultima_revision_info: null
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

  /** URL externa (p. ej. Jikan): quita archivo local y usa la URL en el formulario */
  const applyExternalImageUrl = (url) => {
    if (!url) return
    imageFile.value = null
    previewImage.value = null
    formData.value.imagen_url = url
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
    applyExternalImageUrl,
    getFormData
  }
}

