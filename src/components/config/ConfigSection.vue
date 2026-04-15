<template>
  <Transition name="modal">
    <div 
      v-if="show" 
      ref="overlayRef"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-sm"
      @mousedown="handleOverlayMouseDown"
      @mouseup="handleOverlayMouseUp"
    >
      <div 
        ref="modalContentRef"
        class="modal-dialog-shell bg-elevated flex max-h-[min(92vh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-subtle shadow-2xl"
        @mousedown.stop
        @mouseup.stop
      >
        <!-- Header -->
        <div class="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/90 px-3 py-2.5 sm:px-5 sm:py-3">
          <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 sm:h-10 sm:w-10">
              <svg class="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="font-display truncate text-base font-semibold text-ink sm:text-lg">Configuración</h2>
              <p class="mt-0.5 line-clamp-1 text-[11px] text-ink-muted sm:text-xs">Estados, seguimiento en el modal y temporadas</p>
            </div>
          </div>
          <button 
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="min-h-0 flex-1 overflow-y-auto bg-surface-muted/30 p-3 sm:p-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

            <!-- Estados -->
            <div class="bg-elevated rounded-xl shadow-card p-3 sm:p-4 border border-border-subtle">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                  <svg class="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-ink">Estados</h3>
              </div>
              <p class="text-xs text-ink-muted mb-2">Estados disponibles para tus animes.</p>
              <p class="text-[11px] text-ink-muted mb-3 leading-snug">
                La casilla <span class="font-medium text-ink-muted">Seg.</span> define si ese estado tendrá el paso extra «Seguimiento» (información de revisión) al crear o editar. Si todas están marcadas, se guarda como «todos» (igual que antes).
              </p>
              <div class="space-y-2 mb-3">
                <div 
                  v-for="(estado, index) in estadosLocales" 
                  :key="index"
                  class="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted/60 p-2 transition-all hover:border-accent/35"
                >
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-xs font-bold text-accent">
                    {{ index + 1 }}
                  </div>
                  <label
                    class="flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-accent-border bg-elevated px-1.5 py-1 text-[10px] font-semibold text-accent hover:bg-accent-muted"
                    :title="'Paso Seguimiento en el modal para: ' + (estadosLocales[index] || '(vacío)')"
                  >
                    <input
                      v-model="seguimientoLocales[index]"
                      type="checkbox"
                      class="h-3.5 w-3.5 rounded border-border-strong text-accent focus:ring-accent"
                    />
                    <span class="ml-0.5 hidden sm:inline">Seg.</span>
                  </label>
                  <input 
                    v-model="estadosLocales[index]"
                    type="text"
                    class="min-w-0 flex-1 rounded-md border border-border-subtle bg-elevated px-2.5 py-1.5 text-sm text-ink outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/25"
                    placeholder="Ej: Vistos, En curso…"
                  />
                  <button 
                    type="button"
                    class="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Eliminar estado"
                    @click="removeEstado(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  type="button"
                  class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent/40 px-3 py-2 text-sm font-medium text-accent transition-all hover:border-accent/60 hover:bg-accent-muted"
                  @click="addEstado"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar estado</span>
                </button>
              </div>
              <button 
                type="button"
                :disabled="saving"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-hover px-3 py-2 text-sm font-semibold text-accent-foreground shadow-card transition hover:brightness-110 disabled:opacity-50"
                @click="saveEstados"
              >
                <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar estados' }}</span>
              </button>
            </div>

            <!-- Temporadas -->
            <div class="bg-elevated rounded-xl shadow-card p-3 sm:p-4 border border-border-subtle">
              <div class="mb-2 flex items-center gap-2">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                  <svg class="h-4 w-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-ink">Temporadas</h3>
              </div>
              <p class="text-xs text-ink-muted mb-3">Temporadas disponibles al crear o editar</p>
              <div class="space-y-2 mb-3">
                <div 
                  v-for="(temp, index) in temporadasLocales" 
                  :key="index"
                  class="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted/60 p-2 transition-all hover:border-emerald-400/50"
                >
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
                    {{ index + 1 }}
                  </div>
                  <input 
                    v-model="temporadasLocales[index]"
                    type="text"
                    class="min-w-0 flex-1 rounded-md border border-border-subtle bg-elevated px-2.5 py-1.5 text-sm text-ink outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
                    placeholder="Ej: Temporada 1, Movie, OVA"
                  />
                  <button 
                    type="button"
                    class="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Eliminar temporada"
                    @click="removeTemporada(index)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button 
                  type="button"
                  class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-emerald-400/60 px-3 py-2 text-sm font-medium text-emerald-800 transition-all hover:bg-emerald-50"
                  @click="addTemporada"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar temporada</span>
                </button>
              </div>
              <button 
                type="button"
                :disabled="saving"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-white shadow-card transition hover:brightness-110 disabled:opacity-50"
                @click="saveTemporadas"
              >
                <svg v-if="!saving" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ saving ? 'Guardando...' : 'Guardar temporadas' }}</span>
              </button>
            </div>
          </div>

          <!-- Exportar lista esencial -->
          <div class="mt-3 sm:mt-4 bg-elevated rounded-xl shadow-card p-3 sm:p-4 border border-border-subtle">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="min-w-0">
                <div class="mb-1 flex items-center gap-2">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                    <svg class="h-4 w-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <h3 class="text-base sm:text-lg font-semibold text-ink">Exportar datos</h3>
                </div>
                <p class="pl-0 text-xs text-ink-muted sm:pl-10">
                  Descarga un CSV con <strong class="font-medium text-ink">título original</strong>, <strong class="font-medium text-ink">título de entrega</strong>, <strong class="font-medium text-ink">temporadas</strong> y <strong class="font-medium text-ink">estado</strong> (UTF-8, compatible con Excel).
                </p>
              </div>
              <button
                type="button"
                :disabled="saving"
                class="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition hover:brightness-110 disabled:opacity-50"
                @click="$emit('export-essential')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const overlayRef = ref(null)
const modalContentRef = ref(null)
const mouseDownTarget = ref(null)

// Manejar mousedown en el overlay
const handleOverlayMouseDown = (event) => {
  // Guardar dónde comenzó el mousedown
  mouseDownTarget.value = event.target
}

// Manejar mouseup en el overlay
const handleOverlayMouseUp = (event) => {
  // Solo cerrar si tanto el mousedown como el mouseup fueron en el overlay
  // (no en el contenido del modal)
  if (
    mouseDownTarget.value === overlayRef.value && 
    event.target === overlayRef.value &&
    !props.saving
  ) {
    emit('close')
  }
  // Resetear el flag
  mouseDownTarget.value = null
}

const props = defineProps({
  show: Boolean,
  estados: { type: Array, default: () => [] },
  /** null = todos marcados; [] = ninguno */
  estadosPasoSeguimiento: {
    default: null,
    validator: (v) => v === null || Array.isArray(v)
  },
  temporadas: { type: Array, default: () => [] },
  saving: Boolean
})

const emit = defineEmits(['close', 'save-estados', 'save-temporadas', 'export-essential'])

const estadosLocales = ref([...props.estados])
const temporadasLocales = ref([...props.temporadas])

function seguimientoDefaultParaNombre(nombre) {
  const name = (nombre || '').trim()
  if (!name) return true
  const cfg = props.estadosPasoSeguimiento
  if (cfg == null) return true
  if (cfg.length === 0) return false
  return cfg.includes(name)
}

const seguimientoLocales = ref(props.estados.map((e) => seguimientoDefaultParaNombre(e)))

watch(
  () => [props.estados, props.estadosPasoSeguimiento],
  () => {
    estadosLocales.value = [...props.estados]
    seguimientoLocales.value = estadosLocales.value.map((e) => seguimientoDefaultParaNombre(e))
  },
  { deep: true }
)

watch(() => props.temporadas, (newVal) => {
  temporadasLocales.value = [...newVal]
}, { deep: true })

const addEstado = () => {
  estadosLocales.value.push('')
  seguimientoLocales.value.push(true)
}

const removeEstado = (index) => {
  estadosLocales.value.splice(index, 1)
  seguimientoLocales.value.splice(index, 1)
}

const addTemporada = () => {
  temporadasLocales.value.push('')
}

const removeTemporada = (index) => {
  temporadasLocales.value.splice(index, 1)
}

function buildEstadosPasoSeguimientoPayload() {
  const rows = estadosLocales.value.map((e, i) => ({
    name: (e || '').trim(),
    on: !!seguimientoLocales.value[i]
  })).filter((r) => r.name)
  if (rows.length === 0) return null
  if (rows.every((r) => r.on)) return null
  if (rows.every((r) => !r.on)) return []
  return rows.filter((r) => r.on).map((r) => r.name)
}

const saveEstados = () => {
  const estadosFiltrados = estadosLocales.value.filter((e) => e.trim() !== '')
  emit('save-estados', {
    estados: estadosFiltrados,
    estadosPasoSeguimiento: buildEstadosPasoSeguimientoPayload()
  })
}

const saveTemporadas = () => {
  const temporadasFiltradas = temporadasLocales.value.filter(t => t.trim() !== '')
  emit('save-temporadas', temporadasFiltradas)
}

// Cerrar con Escape
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.show && !props.saving) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog-shell,
.modal-leave-active .modal-dialog-shell {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-dialog-shell,
.modal-leave-to .modal-dialog-shell {
  transform: scale(0.95);
  opacity: 0;
}
</style>

