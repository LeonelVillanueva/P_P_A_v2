import { ref } from 'vue'
import { getAnimeDisplayTitle } from '../utils/animeTitles'

/**
 * Arrastre, soltar y menú contextual para asignar o quitar `fecha_estreno` en el calendario.
 * @param {{ animeStore: object, errorStore: object, shell: object, dropTargetDay: import('vue').Ref }} deps
 */
export function useCalendarDragDrop({ animeStore, errorStore, shell, dropTargetDay }) {
  const draggedAnime = ref(null)
  const pendingDropAnime = ref(null)

  function clearPendingDrop() {
    pendingDropAnime.value = null
    animeStore.clearDraggedAnime()
  }

  async function handleDayClick(day) {
    if (pendingDropAnime.value && day.isCurrentMonth) {
      const dateStr = day.date.toISOString().split('T')[0]
      try {
        await errorStore.handleError(
          () => animeStore.updateAnime(pendingDropAnime.value.id, { fecha_estreno: dateStr }),
          'Actualizar Fecha de Estreno',
          { anime: getAnimeDisplayTitle(pendingDropAnime.value), fecha: dateStr }
        )
        clearPendingDrop()
        await animeStore.fetchAnimes()
      } catch {
        // Error ya manejado
      }
    }
  }

  async function handleContextMenu(event, day, anime = null) {
    event.preventDefault()

    if (anime && anime.fecha_estreno) {
      try {
        await errorStore.handleError(
          () => animeStore.updateAnime(anime.id, { fecha_estreno: null }),
          'Quitar Fecha de Estreno',
          { anime: getAnimeDisplayTitle(anime) }
        )
        await animeStore.fetchAnimes()
        shell.successPopup.showSuccess(
          `Se ha retirado la fecha de estreno de "${getAnimeDisplayTitle(anime)}"`,
          'Fecha retirada'
        )
      } catch {
        // Error ya manejado
      }
      return
    }

    if (day.animes && day.animes.length > 0 && day.isCurrentMonth) {
      const animeToUpdate = day.animes[0]
      if (animeToUpdate.fecha_estreno) {
        try {
          await errorStore.handleError(
            () => animeStore.updateAnime(animeToUpdate.id, { fecha_estreno: null }),
            'Quitar Fecha de Estreno',
            { anime: getAnimeDisplayTitle(animeToUpdate) }
          )
          await animeStore.fetchAnimes()
          shell.successPopup.showSuccess(
            `Se ha retirado la fecha de estreno de "${getAnimeDisplayTitle(animeToUpdate)}"`,
            'Fecha retirada'
          )
        } catch {
          // Error ya manejado
        }
      }
    }
  }

  function handleAnimeDragStart(event, anime) {
    draggedAnime.value = anime
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', anime.id)
  }

  function handleDragOver(event, day) {
    if (!day.isCurrentMonth) return
    event.preventDefault()

    const hasDraggedAnime =
      draggedAnime.value ||
      animeStore.getDraggedAnime() ||
      event.dataTransfer.types.includes('application/json')

    if (hasDraggedAnime) {
      event.dataTransfer.dropEffect = 'move'
      dropTargetDay.value = day.date
    } else {
      event.dataTransfer.dropEffect = 'none'
    }
  }

  function handleDragLeave(_event, day) {
    if (!day.isCurrentMonth) return
    dropTargetDay.value = null
  }

  async function handleDrop(event, day) {
    event.preventDefault()
    dropTargetDay.value = null

    if (!day.isCurrentMonth) return

    let animeToDrop = draggedAnime.value
    if (!animeToDrop) {
      animeToDrop = animeStore.getDraggedAnime()
    }
    if (!animeToDrop && event.dataTransfer.types.includes('application/json')) {
      try {
        const data = event.dataTransfer.getData('application/json')
        if (data) {
          animeToDrop = JSON.parse(data)
        }
      } catch (err) {
        console.error('Error al leer datos del drag:', err)
      }
    }

    if (!animeToDrop) return

    const dateStr = day.date.toISOString().split('T')[0]

    try {
      await errorStore.handleError(
        () => animeStore.updateAnime(animeToDrop.id, { fecha_estreno: dateStr }),
        'Actualizar Fecha de Estreno',
        { anime: getAnimeDisplayTitle(animeToDrop), fecha: dateStr }
      )
      animeStore.clearDraggedAnime()
      pendingDropAnime.value = null
      await animeStore.fetchAnimes()
    } catch {
      // Error ya manejado
    }

    draggedAnime.value = null
  }

  /** Tras cargar animes: rehidratar drag desde otra vista y temporizador de limpieza. */
  function initPendingDragFromStore() {
    const storedAnime = animeStore.getDraggedAnime()
    if (!storedAnime) return

    const fullAnime = animeStore.animes.find((a) => a.id === storedAnime.id)
    if (fullAnime) {
      draggedAnime.value = fullAnime
      pendingDropAnime.value = fullAnime
      setTimeout(() => {
        if (pendingDropAnime.value && pendingDropAnime.value.id === fullAnime.id) {
          clearPendingDrop()
        }
      }, 5 * 60 * 1000)
    } else {
      animeStore.clearDraggedAnime()
    }
  }

  return {
    draggedAnime,
    pendingDropAnime,
    clearPendingDrop,
    handleDayClick,
    handleContextMenu,
    handleAnimeDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    initPendingDragFromStore
  }
}
