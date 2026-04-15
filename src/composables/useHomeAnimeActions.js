import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { getAnimeDisplayTitle } from '../utils/animeTitles'
import { useAnimeModalSearchFlow } from './useAnimeModalSearchFlow'

/**
 * Acciones CRUD y flujos de modales de la pantalla principal.
 * Los guardados van directo a Supabase; no se duplica cola de "auto-guardado" tras éxito.
 */
export function useHomeAnimeActions(options) {
  const {
    savingAnime,
    animeModal,
    searchModal,
    defaultEstadoForNewAnime,
    activityHistory,
    successPopup,
    confirmDialog,
    getStateBySection,
    animeModalRef
  } = options

  const animeStore = useAnimeStore()
  const errorStore = useErrorStore()

  const { handleOpenSearchFromAnimeModal, handleAnimeSelected, handleSubmitAnime } =
    useAnimeModalSearchFlow({
      savingAnime,
      animeModal,
      searchModal,
      animeModalRef,
      defaultEstadoForNewAnime,
      activityHistory
    })

  const handleDropAnime = async (anime, targetSectionId) => {
    const targetEstado = getStateBySection(targetSectionId)

    if (!targetEstado) {
      console.error('Estado no encontrado para sección:', targetSectionId)
      errorStore.addError('Sección no válida', 'Error', { type: 'error' })
      return
    }

    const currentEstado = anime.estado?.trim()
    const normalizedTargetEstado = targetEstado.trim()

    if (currentEstado === normalizedTargetEstado) {
      return
    }

    try {
      await errorStore.handleError(
        () => animeStore.updateAnime(anime.id, { estado: normalizedTargetEstado }),
        'Mover Anime',
        { anime: getAnimeDisplayTitle(anime), estado: normalizedTargetEstado }
      )

      activityHistory.addEntry(
        `Anime movido: ${getAnimeDisplayTitle(anime)}`,
        {
          animeId: anime.id,
          anime: getAnimeDisplayTitle(anime),
          details: `De "${currentEstado}" a "${normalizedTargetEstado}"`
        }
      )

      await animeStore.fetchAnimes()
      successPopup.showSuccess(`"${getAnimeDisplayTitle(anime)}" movido a ${normalizedTargetEstado}`, 'Éxito')
    } catch {
      // ya manejado
    }
  }

  const handleDeleteAnime = async (anime) => {
    const confirmed = await confirmDialog.confirm({
      title: 'Eliminar Anime',
      message: `¿Estás seguro de que quieres eliminar "${getAnimeDisplayTitle(anime)}"?\n\nEsta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) return false

    try {
      await errorStore.handleError(
        () => animeStore.deleteAnime(anime.id),
        'Eliminar Anime',
        { anime: getAnimeDisplayTitle(anime) }
      )

      activityHistory.addEntry(
        `Anime eliminado: ${getAnimeDisplayTitle(anime)}`,
        { animeId: anime.id, anime: getAnimeDisplayTitle(anime), details: 'Anime eliminado permanentemente' }
      )

      await animeStore.fetchAnimes()
      successPopup.showSuccess(`"${getAnimeDisplayTitle(anime)}" eliminado correctamente`, 'Éxito')
      return true
    } catch {
      // ya manejado
      return false
    }
  }

  const handleUpdateFromApi = async (anime) => {
    if (!anime.jikan_id) {
      errorStore.addError('Este anime no tiene asociado un ID de Jikan API', 'Error')
      return
    }

    try {
      await errorStore.handleError(
        () => animeStore.updateAnimeFromJikan(anime.id, anime.jikan_id),
        'Actualizar desde API',
        { anime: getAnimeDisplayTitle(anime) }
      )

      await animeStore.fetchAnimes()
      successPopup.showSuccess(`"${getAnimeDisplayTitle(anime)}" actualizado desde la API`, 'Éxito')
    } catch {
      // ya manejado
    }
  }

  const handleAssociateJikan = (anime) => {
    searchModal.open()
    animeModal.open(anime)
  }

  return {
    handleSubmitAnime,
    handleAnimeSelected,
    handleOpenSearchFromAnimeModal,
    handleDropAnime,
    handleDeleteAnime,
    handleUpdateFromApi,
    handleAssociateJikan
  }
}
