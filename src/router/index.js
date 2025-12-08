import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    }
  ]
})

// Guard de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Verificar si está autenticado
    if (!authStore.isAuthenticated) {
      // No está autenticado, permanecer en la página actual
      // El componente App.vue mostrará el LoginModal
      next(false)
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

