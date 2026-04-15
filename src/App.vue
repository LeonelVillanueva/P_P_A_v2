<template>
  <div id="app" class="min-h-screen bg-surface">
    <!-- Skip Link para accesibilidad -->
    <a 
      href="#main-content" 
      class="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-ring"
    >
      Saltar al contenido principal
    </a>

    <!-- Mostrar loading mientras verifica autenticación (solo en carga inicial) -->
    <div
      v-if="authStore.checkingAuth"
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-hover via-violet-950 to-slate-900"
      role="status"
      aria-live="polite"
      aria-label="Verificando autenticación"
      aria-busy="true"
    >
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-accent-hover rounded-full mb-4 animate-pulse" aria-hidden="true">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-white text-sm">Verificando autenticación...</p>
      </div>
    </div>
    
    <!-- Mostrar login si no está autenticado y ya verificó -->
    <LoginModal v-else-if="!authStore.isAuthenticated" />
    
    <!-- Mostrar aplicación si está autenticado -->
    <template v-else>
      <main id="main-content" role="main">
        <router-view />
      </main>

      <!-- Shell global: comandos, config, historial, ayuda (sin duplicar en vistas) -->
      <CommandPalette
        :is-open="appShell.commandPalette.isOpen"
        :query="appShell.commandPalette.query"
        :selected-index="appShell.commandPalette.selectedIndex"
        :commands="appShell.commandPalette.commands"
        @close="appShell.commandPalette.close()"
        @command="appShell.handleCommand"
        @update:query="appShell.commandPalette.query = $event"
        @select-next="appShell.commandPalette.selectNext()"
        @select-previous="appShell.commandPalette.selectPrevious()"
      />
      <ActivityHistory
        :show="appShell.showHistory"
        :history="appShell.activityHistory.history"
        @close="appShell.showHistory = false"
        @clear="appShell.activityHistory.clearHistory()"
      />
      <ConfigSection
        :show="appShell.configModal.isOpen"
        :estados="animeStore.estados"
        :estados-paso-seguimiento="animeStore.estadosPasoSeguimiento"
        :temporadas="animeStore.temporadas"
        :saving="appShell.savingConfig"
        @close="appShell.configModal.close()"
        @save-estados="appShell.handleSaveEstados"
        @save-temporadas="appShell.handleSaveTemporadas"
        @export-essential="appShell.handleExportAnimeEssential"
      />
      <SuccessPopup
        :show="appShell.successPopup.show"
        :title="appShell.successPopup.title"
        :message="appShell.successPopup.message"
        :duration="appShell.successPopup.duration"
        @close="appShell.successPopup.close"
      />
      <ShortcutsHelpModal
        :show="appShell.showHelp"
        @close="appShell.showHelp = false"
      />
      
      <!-- Notificación de Error (Toast) -->
      <ErrorNotification
        v-if="errorStore.errors.length > 0"
        :error="errorStore.errors[0]"
        @dismiss="errorStore.removeError(errorStore.errors[0].id)"
      />

      <!-- Transición login → app (canvas; solo tras login con contraseña) -->
      <LoginRevealOverlay
        v-if="authStore.postLoginRevealPending"
        @complete="authStore.completePostLoginReveal()"
      />
    </template>
    
    <!-- Vercel Analytics (siempre activo) -->
    <Analytics />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useErrorStore } from './stores/errorStore'
import { useAuthStore } from './stores/authStore'
import { useAnimeStore } from './stores/animeStore'
import ErrorNotification from './components/errors/ErrorNotification.vue'
import LoginModal from './components/auth/LoginModal.vue'
import LoginRevealOverlay from './components/auth/LoginRevealOverlay.vue'
import { useSupabaseKeepAlive } from './composables/useSupabaseKeepAlive'
import { provideAuthenticatedAppShell } from './composables/useAuthenticatedAppShell'

const CommandPalette = defineAsyncComponent(() => import('./components/common/CommandPalette.vue'))
const ActivityHistory = defineAsyncComponent(() => import('./components/common/ActivityHistory.vue'))
const ConfigSection = defineAsyncComponent(() => import('./components/config/ConfigSection.vue'))
const SuccessPopup = defineAsyncComponent(() => import('./components/common/SuccessPopup.vue'))
const ShortcutsHelpModal = defineAsyncComponent(() => import('./components/common/ShortcutsHelpModal.vue'))

const errorStore = useErrorStore()
const authStore = useAuthStore()
const animeStore = useAnimeStore()
const appShell = provideAuthenticatedAppShell()

// Keep-alive cliente: pings frecuentes mientras la app está abierta
useSupabaseKeepAlive({
  interval: 2 * 60 * 1000, // 2 minutos (además del cron en Vercel)
  enabled: true
})

// Mantener el setup limpio: el render ahora depende solo de checkingAuth/isAuthenticated.
</script>

