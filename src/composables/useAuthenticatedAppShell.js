import { ref, reactive, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { useAuthStore } from '../stores/authStore'
import { useModal } from './useModal'
import { useCommandPalette } from './useCommandPalette'
import { useActivityHistory } from './useActivityHistory'
import { useSuccessPopup } from './useSuccessPopup'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'
import { createAppCommandHandlers } from './useAppCommands'
import { performSupabasePing } from '../utils/supabasePing'
import { buildAnimeEssentialCsv, downloadAnimeEssentialCsv } from '../utils/exportAnimeEssentialCsv'
import { compareAnimesByTitle } from '../utils/animeTitles'
import { AppShellKey } from '../injectionKeys'

/**
 * Estado global de la app autenticada: paleta de comandos, config, historial, atajos.
 * Debe llamarse una vez desde App.vue (setup) cuando Pinia y el router están listos.
 */
export function provideAuthenticatedAppShell() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const animeStore = useAnimeStore()
  const errorStore = useErrorStore()

  const configModal = useModal()
  const commandPalette = useCommandPalette()
  const activityHistory = useActivityHistory()
  const successPopup = useSuccessPopup()

  const showHistory = ref(false)
  const showHelp = ref(false)
  const savingConfig = ref(false)
  const manualPingInFlight = ref(false)
  const lastManualPingAt = ref(0)
  const MANUAL_PING_COOLDOWN_MS = 60 * 1000

  const newAnimeOpener = ref(() => {})

  const { handleCommand } = createAppCommandHandlers({
    showHistory,
    showHelp,
    commandPalette,
    configModal,
    router,
    onNewAnime: () => newAnimeOpener.value?.()
  })

  const handleSaveEstados = async (payload) => {
    const estados = Array.isArray(payload) ? payload : payload?.estados
    const estadosPasoSeguimiento = Array.isArray(payload)
      ? animeStore.estadosPasoSeguimiento
      : payload?.estadosPasoSeguimiento
    savingConfig.value = true
    try {
      await errorStore.handleError(
        () => animeStore.updateEstadosYSeguimiento(estados, estadosPasoSeguimiento),
        'Guardar Estados'
      )
      successPopup.showSuccess('Estados guardados correctamente', 'Éxito')
    } finally {
      savingConfig.value = false
    }
  }

  const handleSaveTemporadas = async (temporadas) => {
    savingConfig.value = true
    try {
      await errorStore.handleError(
        () => animeStore.updateConfiguracion('temporadas', temporadas),
        'Guardar Temporadas'
      )
      successPopup.showSuccess('Temporadas guardadas correctamente', 'Éxito')
    } finally {
      savingConfig.value = false
    }
  }

  const handleExportAnimeEssential = () => {
    const list = [...(animeStore.animes || [])].sort(compareAnimesByTitle)
    const csv = buildAnimeEssentialCsv(list)
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fname = `animes-esenciales-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`
    downloadAnimeEssentialCsv(fname, csv)
    successPopup.showSuccess(
      list.length ? `Descargado: ${list.length} fila(s).` : 'Archivo vacío (solo cabeceras).',
      'Exportación'
    )
  }

  const handleManualPing = async () => {
    if (manualPingInFlight.value) {
      errorStore.addError('Ya hay un ping en curso. Espera un momento.', 'Ping')
      return
    }

    const now = Date.now()
    const elapsed = now - lastManualPingAt.value
    if (elapsed < MANUAL_PING_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((MANUAL_PING_COOLDOWN_MS - elapsed) / 1000)
      errorStore.addError(
        `Ping limitado por seguridad. Intenta de nuevo en ${secondsLeft}s.`,
        'Ping'
      )
      return
    }

    manualPingInFlight.value = true
    lastManualPingAt.value = now
    const result = await performSupabasePing()
    try {
      if (result.ok) {
        successPopup.showSuccess(
          `Actividad registrada en Supabase (${result.method || 'ok'})`,
          'Ping manual'
        )
      } else {
        errorStore.addError(result.error || 'No se pudo contactar con Supabase', 'Ping')
      }
    } finally {
      manualPingInFlight.value = false
    }
  }

  const openCalendar = () => {
    if (route.name === 'calendar') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/calendar')
  }

  const openStats = () => {
    if (route.name === 'stats') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/stats')
  }

  useKeyboardShortcuts({
    'ctrl+k': () => {
      if (!authStore.isAuthenticated) return
      commandPalette.open()
    },
    'ctrl+n': () => {
      if (!authStore.isAuthenticated) return
      newAnimeOpener.value?.()
    },
    'ctrl+,': () => {
      if (!authStore.isAuthenticated) return
      configModal.open()
    },
    'ctrl+/': () => {
      if (!authStore.isAuthenticated) return
      openStats()
    },
    'ctrl+h': () => {
      if (!authStore.isAuthenticated) return
      showHistory.value = !showHistory.value
    },
    escape: () => {
      if (commandPalette.isOpen.value) commandPalette.close()
      if (showHistory.value) showHistory.value = false
      if (showHelp.value) showHelp.value = false
    }
  })

  const shell = reactive({
    configModal,
    commandPalette,
    activityHistory,
    successPopup,
    showHistory,
    showHelp,
    savingConfig,
    newAnimeOpener,
    setNewAnimeHandler: (fn) => {
      newAnimeOpener.value = typeof fn === 'function' ? fn : () => {}
    },
    handleCommand,
    handleManualPing,
    handleSaveEstados,
    handleSaveTemporadas,
    handleExportAnimeEssential,
    openCalendar,
    openStats
  })

  provide(AppShellKey, shell)
  return shell
}
