import { ref } from 'vue'

export function useSuccessPopup() {
  const show = ref(false)
  const title = ref('Éxito')
  const message = ref('')
  const duration = ref(3000)
  
  const showSuccess = (msg, successTitle = 'Éxito', autoCloseDuration = 3000) => {
    message.value = msg
    title.value = successTitle
    duration.value = autoCloseDuration
    show.value = true
  }

  const close = () => {
    show.value = false
  }

  return {
    show,
    title,
    message,
    duration,
    showSuccess,
    close
  }
}

