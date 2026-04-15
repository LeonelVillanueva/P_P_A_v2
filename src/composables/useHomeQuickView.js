import { ref } from 'vue'

/**
 * Vista rápida al hover sobre tarjetas de anime (posición, timers, cierre al abrir modales).
 */
export function useHomeQuickView(animeStore, animeModal, detailModal) {
  const quickView = ref({
    show: false,
    anime: null,
    /** Obra agrupada (tarjeta por serie en cuadrícula) */
    serie: null,
    x: 0,
    y: 0
  })

  let quickViewHideTimer = null

  const clearQuickViewHideTimer = () => {
    if (quickViewHideTimer) {
      clearTimeout(quickViewHideTimer)
      quickViewHideTimer = null
    }
  }

  const scheduleQuickViewHide = () => {
    clearQuickViewHideTimer()
    quickViewHideTimer = setTimeout(() => {
      quickView.value = { show: false, anime: null, serie: null, x: 0, y: 0 }
      quickViewHideTimer = null
    }, 400)
  }

  const closeQuickViewImmediate = () => {
    clearQuickViewHideTimer()
    quickView.value = { show: false, anime: null, serie: null, x: 0, y: 0 }
  }

  const resolveAnimeFromStore = (anime) => {
    if (!anime?.id) return anime
    return animeStore.animes.find((a) => a.id === anime.id) || anime
  }

  const openAnimeDetail = (anime) => {
    detailModal.open(resolveAnimeFromStore(anime))
  }

  const handleQuickViewEdit = (anime) => {
    closeQuickViewImmediate()
    animeModal.open(resolveAnimeFromStore(anime))
  }

  const handleQuickViewView = (anime) => {
    closeQuickViewImmediate()
    openAnimeDetail(anime)
  }

  const handleDetailModalEdit = (anime) => {
    detailModal.close()
    animeModal.open(resolveAnimeFromStore(anime))
  }

  const handleAnimeHover = (event, anime) => {
    clearQuickViewHideTimer()
    quickView.value = {
      show: true,
      anime,
      serie: null,
      x: event.clientX,
      y: event.clientY
    }
  }

  const handleSerieHover = (event, serie) => {
    clearQuickViewHideTimer()
    quickView.value = {
      show: true,
      anime: null,
      serie,
      x: event.clientX,
      y: event.clientY
    }
  }

  const handleAnimeLeave = () => {
    scheduleQuickViewHide()
  }

  const handleQuickViewPanelEnter = () => {
    clearQuickViewHideTimer()
  }

  const handleQuickViewPanelLeave = () => {
    scheduleQuickViewHide()
  }

  return {
    quickView,
    closeQuickView: closeQuickViewImmediate,
    handleAnimeHover,
    handleSerieHover,
    handleAnimeLeave,
    handleQuickViewPanelEnter,
    handleQuickViewPanelLeave,
    handleQuickViewEdit,
    handleQuickViewView,
    openAnimeDetail,
    handleDetailModalEdit
  }
}
