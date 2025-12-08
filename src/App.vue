<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Mostrar loading mientras verifica autenticación -->
    <div v-if="authStore.checkingAuth" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 animate-pulse">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-white text-sm">Verificando autenticación...</p>
      </div>
    </div>
    
    <!-- Mostrar login si no está autenticado -->
    <LoginModal v-else-if="!authStore.isAuthenticated" />
    
    <!-- Mostrar aplicación si está autenticado -->
    <template v-else>
      <router-view />
      
      <!-- Notificación de Error (Toast) -->
      <ErrorNotification
        v-if="errorStore.errors.length > 0"
        :error="errorStore.errors[0]"
        @dismiss="errorStore.removeError(errorStore.errors[0].id)"
      />
    </template>
  </div>
</template>

<script setup>
import { useErrorStore } from './stores/errorStore'
import { useAuthStore } from './stores/authStore'
import ErrorNotification from './components/errors/ErrorNotification.vue'
import LoginModal from './components/auth/LoginModal.vue'

const errorStore = useErrorStore()
const authStore = useAuthStore()
</script>

