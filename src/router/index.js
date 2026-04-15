import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/Calendar.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/Stats.vue'),
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

