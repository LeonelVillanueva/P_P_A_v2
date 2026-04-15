import { requestMainSearchFocus } from '../utils/searchFocusBridge'

/**
 * Acciones del Command Palette y lógica compartida (una sola fuente de verdad).
 * @param {object} ctx
 * @param {import('vue').Ref<boolean>} ctx.showHistory
 * @param {import('vue').Ref<boolean>} ctx.showHelp
 * @param {import('vue').Ref} ctx.commandPalette - composable con .open/.close
 * @param {import('vue').Ref} ctx.configModal - useModal
 * @param {import('vue').Ref} ctx.router
 * @param {() => void} ctx.onNewAnime - abre alta (registrado por Home/Calendar)
 */
export function createAppCommandHandlers(ctx) {
  const {
    showHistory,
    showHelp,
    configModal,
    router,
    onNewAnime
  } = ctx

  function handleCommand(action) {
    switch (action) {
      case 'search':
        requestMainSearchFocus()
        break
      case 'new-anime':
        onNewAnime?.()
        break
      case 'calendar':
        router.push('/calendar')
        break
      case 'stats':
        router.push('/stats')
        break
      case 'config':
        configModal.open()
        break
      case 'history':
        showHistory.value = true
        break
      case 'help':
        showHelp.value = true
        break
      default:
        break
    }
  }

  return { handleCommand }
}
