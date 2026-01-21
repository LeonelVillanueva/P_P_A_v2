<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Skip Link para accesibilidad -->
    <a 
      href="#main-content" 
      class="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      Saltar al contenido principal
    </a>

    <!-- Mostrar loading mientras verifica autenticación (solo en carga inicial) -->
    <div 
      v-if="authStore.checkingAuth && !hasCheckedOnce" 
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
      role="status"
      aria-live="polite"
      aria-label="Verificando autenticación"
      aria-busy="true"
    >
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4 animate-pulse" aria-hidden="true">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-white text-sm">Verificando autenticación...</p>
      </div>
    </div>
    
    <!-- Mostrar login si no está autenticado y ya verificó -->
    <LoginModal v-if="!authStore.isAuthenticated && hasCheckedOnce && !authStore.checkingAuth" />
    
    <!-- Mostrar aplicación si está autenticado -->
    <template v-if="authStore.isAuthenticated">
      <main id="main-content" role="main">
        <router-view />
      </main>
      
      <!-- Notificación de Error (Toast) -->
      <ErrorNotification
        v-if="errorStore.errors.length > 0"
        :error="errorStore.errors[0]"
        @dismiss="errorStore.removeError(errorStore.errors[0].id)"
      />
    </template>
    
    <!-- Vercel Analytics (siempre activo) -->
    <Analytics />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useErrorStore } from './stores/errorStore'
import { useAuthStore } from './stores/authStore'
import ErrorNotification from './components/errors/ErrorNotification.vue'
import LoginModal from './components/auth/LoginModal.vue'
import { useSupabaseKeepAlive } from './composables/useSupabaseKeepAlive'

const errorStore = useErrorStore()
const authStore = useAuthStore()
const hasCheckedOnce = ref(false)

// Activar sistema de keep-alive para evitar que Supabase se pause por inactividad
// Los pings se ejecutan cada 5 minutos automáticamente
useSupabaseKeepAlive({
  interval: 5 * 60 * 1000, // 5 minutos
  enabled: true
})

// Marcar que ya se verificó una vez cuando checkingAuth cambia a false
watch(() => authStore.checkingAuth, (checking) => {
  if (!checking) {
    hasCheckedOnce.value = true
  }
})

// También marcar cuando isAuthenticated cambia a true (después de login exitoso)
watch(() => authStore.isAuthenticated, (authenticated) => {
  if (authenticated) {
    hasCheckedOnce.value = true
  }
})

// También marcar después de un tiempo para evitar bloqueos infinitos
onMounted(() => {
  setTimeout(() => {
    if (!hasCheckedOnce.value) {
      hasCheckedOnce.value = true
    }
  }, 3000) // Máximo 3 segundos de espera
})
</script>

