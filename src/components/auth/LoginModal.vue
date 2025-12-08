<template>
  <div 
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-title"
    aria-describedby="login-description"
  >
    <div 
      ref="modalRef"
      class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 border-2 border-purple-200"
      @keydown.esc="handleEscape"
    >
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4" aria-hidden="true">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 id="login-title" class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Anime Saver</h1>
        <p id="login-description" class="text-sm sm:text-base text-gray-600">Acceso Privado</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="password-input" class="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password-input"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
              :class="{ 'border-red-500': error }"
              :aria-invalid="error ? 'true' : 'false'"
              :aria-describedby="error ? 'password-error' : undefined"
              autofocus
              required
              aria-required="true"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
          <p 
            v-if="error" 
            id="password-error"
            class="mt-2 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {{ error }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading || !password"
          :aria-busy="loading"
          class="w-full px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ loading ? 'Verificando...' : 'Acceder' }}</span>
        </button>
      </form>

      <p class="mt-6 text-xs text-center text-gray-500">
        Esta aplicación es de acceso privado
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useFocusTrap } from '../../composables/useFocusTrap'

const authStore = useAuthStore()
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const modalRef = ref(null)
const isOpen = ref(true)

// Focus trap para accesibilidad
const { initFocusTrap, restoreFocus } = useFocusTrap(modalRef, isOpen, null)

// Manejar Escape key
const handleEscape = () => {
  // El login modal no se puede cerrar con Escape (requiere contraseña)
  // Pero mantenemos la función por si se necesita en el futuro
}

onMounted(() => {
  initFocusTrap()
})

onUnmounted(() => {
  restoreFocus()
})

const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = 'Por favor ingresa una contraseña'
    return
  }

  loading.value = true
  error.value = ''

  // Pequeño delay para UX (siempre el mismo tiempo para evitar timing attacks)
  const startTime = Date.now()
  const minDelay = 500 // Delay mínimo para evitar timing attacks

  try {
    const result = await authStore.login(password.value)
    
    // Asegurar delay mínimo
    const elapsed = Date.now() - startTime
    if (elapsed < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
    }

    if (!result.success) {
      error.value = result.error || 'Contraseña incorrecta'
      password.value = ''
      
      // Mostrar intentos restantes si están disponibles
      if (result.remainingAttempts !== undefined) {
        error.value += ` (${result.remainingAttempts} intentos restantes)`
      }
      
      console.error('❌ Login fallido:', result.error)
    } else {
      // Login exitoso - el store ya estableció isAuthenticated
      console.log('✅ Login exitoso')
      password.value = ''
      
      // El modal se ocultará automáticamente porque authStore.isAuthenticated es true
      // No necesitamos delay ni verificaciones adicionales
    }
  } catch (err) {
    error.value = 'Error de autenticación. Intenta de nuevo.'
    console.error('❌ Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

