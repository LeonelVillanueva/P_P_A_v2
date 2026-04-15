import { ref, unref } from 'vue'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { getAnimeDisplayTitle } from '../utils/animeTitles'

/**
 * Submit del AnimeModal, búsqueda Jikan y merge de portada (flujo compartido Home / Calendario).
 * @param {{
 *   savingAnime: import('vue').Ref<boolean>,
 *   animeModal: object,
 *   searchModal: object,
 *   animeModalRef: import('vue').Ref,
 *   defaultEstadoForNewAnime: import('vue').Ref | import('vue').ComputedRef | (() => string),
 *   activityHistory?: { addEntry: (msg: string, meta?: object) => void } | null
 * }} opts
 */
export function useAnimeModalSearchFlow({
  savingAnime,
  animeModal,
  searchModal,
  animeModalRef,
  defaultEstadoForNewAnime,
  activityHistory = null
}) {
  const animeStore = useAnimeStore()
  const errorStore = useErrorStore()
  const searchCoverMergeIntent = ref(false)

  function resolveDefaultEstado() {
    const v = defaultEstadoForNewAnime
    if (typeof v === 'function') return v() || animeStore.estados[0] || ''
    return unref(v) || animeStore.estados[0] || ''
  }

  function handleOpenSearchFromAnimeModal(payload) {
    searchCoverMergeIntent.value = !!payload?.mergeCover
    searchModal.open()
  }

  function handleAnimeSelected(animeData) {
    searchModal.close()
    if (
      searchCoverMergeIntent.value &&
      animeModal.isOpen.value &&
      animeModalRef?.value?.applyApiSearchResult
    ) {
      searchCoverMergeIntent.value = false
      animeModalRef.value.applyApiSearchResult(animeData)
      return
    }
    searchCoverMergeIntent.value = false

    animeModal.open({
      titulo_original: animeData.titulo_original || '',
      titulo_entrega: animeData.titulo_entrega || '',
      imagen_url: animeData.imagen_url || null,
      estado: resolveDefaultEstado(),
      temporadas: []
    })
  }

  async function handleSubmitAnime(formData) {
    savingAnime.value = true
    try {
      let imagenUrl = formData.imagen_url
      const isEditing = !!animeModal.selectedItem.value?.id
      const animeId = animeModal.selectedItem.value?.id

      if (formData.imageFile) {
        const tempId = animeId || 'temp_' + Date.now()
        imagenUrl = await errorStore.handleError(
          () => animeStore.uploadImage(formData.imageFile, tempId),
          'Subir Imagen'
        )
      }

      const animeData = {
        titulo_original: formData.titulo_original,
        titulo_entrega: formData.titulo_entrega?.trim() ? formData.titulo_entrega.trim() : null,
        estado: formData.estado,
        temporadas: formData.temporadas,
        imagen_url: imagenUrl,
        temporada_numero: formData.temporada_numero || null,
        tipo_temporada: formData.tipo_temporada || 'Temporada',
        fecha_estreno: formData.fecha_estreno || null,
        episodio_frecuencia: formData.episodio_frecuencia ?? undefined,
        episodio_dias_semana: formData.episodio_dias_semana ?? undefined,
        proximo_episodio_fecha: formData.proximo_episodio_fecha || null,
        monitoreo_activo: formData.monitoreo_activo ?? undefined,
        ultima_revision_info: formData.ultima_revision_info || null
      }

      const label = getAnimeDisplayTitle(animeData)

      if (isEditing) {
        await errorStore.handleError(
          () => animeStore.updateAnime(animeId, animeData),
          'Actualizar Anime'
        )
        activityHistory?.addEntry(`Anime actualizado: ${label}`, {
          animeId,
          anime: label,
          details: 'Actualización de información'
        })
      } else {
        const newAnime = await errorStore.handleError(
          () => animeStore.createAnime(animeData),
          'Crear Anime'
        )
        activityHistory?.addEntry(`Anime creado: ${label}`, {
          animeId: newAnime.id,
          anime: label,
          details: 'Nuevo anime agregado'
        })
      }

      animeModal.close()
      await animeStore.fetchAnimes()
    } catch {
      // errorStore.handleError ya mostró el error
    } finally {
      savingAnime.value = false
    }
  }

  return {
    searchCoverMergeIntent,
    handleOpenSearchFromAnimeModal,
    handleAnimeSelected,
    handleSubmitAnime
  }
}
