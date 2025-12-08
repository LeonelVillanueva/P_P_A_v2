import { ref } from 'vue'

export function useConfirmDialog() {
  const show = ref(false)
  const title = ref('Confirmar acción')
  const message = ref('')
  const type = ref('danger')
  const confirmText = ref('Confirmar')
  const cancelText = ref('Cancelar')
  
  let resolvePromise = null

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      show.value = true
      title.value = options.title || 'Confirmar acción'
      message.value = options.message || '¿Estás seguro?'
      type.value = options.type || 'danger'
      confirmText.value = options.confirmText || 'Confirmar'
      cancelText.value = options.cancelText || 'Cancelar'
      
      resolvePromise = resolve
    })
  }

  const onConfirm = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const onCancel = () => {
    show.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    show,
    title,
    message,
    type,
    confirmText,
    cancelText,
    confirm,
    onConfirm,
    onCancel
  }
}

