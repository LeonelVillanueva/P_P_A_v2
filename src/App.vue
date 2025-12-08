<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Mostrar login si no está autenticado -->
    <LoginModal v-if="!authStore.isAuthenticated" />
    
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

