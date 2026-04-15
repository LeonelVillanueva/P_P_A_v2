<template>
  <div
    class="login-shell fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
    aria-labelledby="login-title"
    aria-describedby="login-description"
  >
    <!-- Fondo WebGL (aurora) + velado para legibilidad del formulario -->
    <LoginShaderBackground />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/90"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.22),transparent_55%)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] motion-reduce:opacity-0"
      aria-hidden="true"
      style="background-image: linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 48px 48px;"
    />

    <div
      ref="modalRef"
      class="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-card-lg border border-white/10 bg-elevated/95 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_80px_-20px_rgba(147,51,234,0.35),0_20px_50px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl motion-safe:transition motion-safe:duration-300 lg:max-w-4xl lg:flex-row lg:rounded-2xl motion-reduce:transition-none"
      @keydown.esc="handleEscape"
    >
      <!-- Panel de marca (split hero — solo lg; UI UX Pro Max: jerarquía + espacio en blanco) -->
      <aside
        class="relative hidden min-h-[200px] flex-col justify-between border-b border-white/10 bg-gradient-to-br from-slate-900/90 via-violet-950/80 to-slate-950/95 p-8 text-white lg:flex lg:w-[42%] lg:border-b-0 lg:border-r lg:min-h-[440px]"
        aria-hidden="true"
      >
        <div class="flex flex-1 flex-col justify-center">
          <p class="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            Colección privada
          </p>
          <p class="font-display mt-3 text-3xl font-bold leading-tight tracking-tight">
            {{ appBrandName }}
          </p>
        </div>
        <div
          class="mt-8 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"
          aria-hidden="true"
        >
          <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </aside>

      <!-- Formulario -->
      <div class="flex flex-1 flex-col p-6 sm:p-8">
        <div class="mb-6 text-center lg:text-left">
          <div
            class="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-hover shadow-card-lg ring-2 ring-accent-border/60 lg:mx-0"
            aria-hidden="true"
          >
            <svg class="h-7 w-7 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 id="login-title" class="font-display text-2xl font-bold tracking-tight text-ink sm:text-page-title">
            {{ appBrandName }}
          </h1>
        </div>

        <div
          id="login-description"
          class="mb-6 flex gap-3 rounded-xl border-2 border-accent/35 bg-gradient-to-br from-accent-muted/90 to-accent-muted/40 px-4 py-3.5 shadow-sm ring-1 ring-accent-border/40"
          role="status"
        >
          <div class="mt-0.5 shrink-0 text-accent" aria-hidden="true">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p class="text-base font-semibold leading-snug text-ink sm:text-[1.05rem]">
            Esta aplicación es de acceso privado
          </p>
        </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label for="password-input" class="block text-sm font-semibold text-ink mb-2">
            Contraseña
          </label>
          <div class="relative">
            <input
              id="password-input"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              class="w-full px-4 py-3 pr-12 border-2 border-border-subtle rounded-card transition-all outline-none bg-elevated text-ink focus:border-accent focus:ring-2 focus:ring-accent-ring"
              :class="{ 'border-red-500': error }"
              :aria-invalid="error ? 'true' : 'false'"
              :aria-describedby="error ? 'password-error' : undefined"
              autofocus
              required
              aria-required="true"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-ink-muted transition-colors duration-200 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent-ring focus:ring-offset-2"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
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

        <div v-if="showSessionPicker">
          <label for="session-duration" class="block text-sm font-semibold text-ink mb-2">
            Mantener sesión
          </label>
          <select
            id="session-duration"
            v-model.number="sessionDays"
            class="w-full px-4 py-3 border-2 border-border-subtle rounded-card transition-all outline-none bg-elevated text-ink focus:border-accent focus:ring-2 focus:ring-accent-ring"
            :disabled="loading"
            aria-describedby="session-duration-hint"
          >
            <option v-for="d in sessionDayOptions" :key="d" :value="d">
              {{ d === 1 ? '1 día (predeterminado)' : `${d} días` }}
            </option>
          </select>
          <p id="session-duration-hint" class="mt-1.5 text-xs text-ink-subtle">
            Máximo 7 días. El navegador recordará el acceso hasta esa fecha.
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading || !password"
          :aria-busy="loading"
          class="login-cta group relative flex w-full cursor-pointer items-center justify-center space-x-2 overflow-hidden rounded-card bg-gradient-to-r from-accent to-accent-hover px-6 py-3 font-semibold text-accent-foreground shadow-card-lg transition-[transform,box-shadow,filter] duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-elevated disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl motion-safe:hover:brightness-110"
        >
          <svg v-if="loading" class="h-5 w-5 animate-spin motion-reduce:animate-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ loading ? 'Verificando...' : 'Acceder' }}</span>
        </button>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LoginShaderBackground from './LoginShaderBackground.vue'
import { useAuthStore } from '../../stores/authStore'
import { useFocusTrap } from '../../composables/useFocusTrap'
import {
  shouldShowSessionPicker,
  getLastSessionDaysForLogin
} from '../../services/authService'

/** Nombre de marca en pantalla de acceso (único punto de cambio visual). */
const appBrandName = 'Hanare'

const authStore = useAuthStore()
const password = ref('')
/** Si false, se reutiliza la última duración extendida hasta la fecha acordada. */
const showSessionPicker = ref(shouldShowSessionPicker())
/** 1–7 días; el servidor firma el JWT con esa vigencia. */
const sessionDays = ref(showSessionPicker.value ? 1 : getLastSessionDaysForLogin())
const sessionDayOptions = [1, 2, 3, 4, 5, 6, 7]
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
    const result = await authStore.login(password.value, sessionDays.value)
    
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
