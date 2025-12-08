<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-purple-200">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Anime Saver</h1>
        <p class="text-gray-600">Acceso Privado</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
            :class="{ 'border-red-500': error }"
            autofocus
          />
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading || !password"
          class="w-full px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!password.value.trim()) {
    error.value = 'Por favor ingresa una contraseña'
    return
  }

  loading.value = true
  error.value = ''

  // Simular verificación (pequeño delay para UX)
  await new Promise(resolve => setTimeout(resolve, 300))

  const success = authStore.login(password.value)

  if (!success) {
    error.value = 'Contraseña incorrecta'
    password.value = ''
    loading.value = false
  } else {
    // El store manejará el cambio de estado
    loading.value = false
  }
}
</script>

