import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Home from '../views/Home.vue'
import Calendar from '../views/Calendar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
      meta: { requiresAuth: true }
    }
  ]
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Si está verificando, permitir pasar (App.vue manejará el estado)
    if (authStore.checkingAuth) {
      next()
      return
    }
    
    // Verificar si está autenticado
    if (!authStore.isAuthenticated) {
      // No está autenticado, pero permitir navegar
      // App.vue mostrará el LoginModal automáticamente
      next()
    } else {
      // Está autenticado, permitir acceso
      next()
    }
  } else {
    // Ruta pública, permitir acceso
    next()
  }
})

export default router

