<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
    
    <!-- Notificación de Error (Toast) -->
    <ErrorNotification
      v-if="errorStore.errors.length > 0"
      :error="errorStore.errors[0]"
      @dismiss="errorStore.removeError(errorStore.errors[0].id)"
    />
  </div>
</template>

<script setup>
import { useErrorStore } from './stores/errorStore'
import ErrorNotification from './components/errors/ErrorNotification.vue'

const errorStore = useErrorStore()
</script>

