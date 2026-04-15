<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="modal-dialog-shell flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-2xl"
        @click.stop
      >
        <!-- Header -->
        <div
          class="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface-muted/90 px-5 py-4 sm:px-6"
        >
          <h2 class="font-display flex items-center gap-2 text-lg font-semibold text-ink sm:text-xl">
            <svg class="h-6 w-6 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Historial de actividad</span>
          </h2>
          <button
            type="button"
            class="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            @click="$emit('close')"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filtros -->
        <div class="shrink-0 border-b border-border-subtle bg-surface-muted/40 p-4">
          <div class="flex flex-wrap gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar en historial…"
              class="min-w-[200px] flex-1 rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
            <select
              v-model="filterType"
              class="rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            >
              <option value="">Todos los tipos</option>
              <option value="create">Crear</option>
              <option value="update">Actualizar</option>
              <option value="delete">Eliminar</option>
              <option value="move">Mover</option>
            </select>
            <button
              v-if="hasFilters"
              type="button"
              class="rounded-lg bg-surface-muted px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-border-subtle"
              @click="clearFilters"
            >
              Limpiar
            </button>
          </div>
        </div>

        <!-- Lista de actividad -->
        <div class="min-h-0 flex-1 overflow-y-auto bg-surface-muted/20 p-4">
          <div v-if="filteredHistory.length === 0" class="py-12 text-center text-ink-muted">
            <p>No hay actividad registrada</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="entry in filteredHistory"
              :key="entry.id"
              class="flex items-start space-x-4 rounded-xl border border-border-subtle bg-elevated p-4 shadow-card transition-colors hover:bg-surface-muted/80"
            >
              <div class="flex-shrink-0">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                  :class="getTypeColor(entry.type)"
                >
                  {{ getTypeIcon(entry.type) }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-ink">{{ entry.action }}</p>
                <p v-if="entry.details.anime" class="mt-1 text-sm text-ink-muted">
                  {{ entry.details.anime }}
                </p>
                <p v-if="entry.details.details" class="mt-1 text-xs text-ink-muted">
                  {{ entry.details.details }}
                </p>
                <p class="mt-2 text-xs text-ink-muted">
                  {{ formatDateTime(entry.timestamp) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex shrink-0 items-center justify-between border-t border-border-subtle bg-surface-muted/90 p-4"
        >
          <div class="text-sm text-ink-muted">
            {{ filteredHistory.length }} de {{ history.length }} actividades
          </div>
          <button
            type="button"
            class="rounded-lg bg-danger-muted px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-red-100"
            @click="clearAllHistory"
          >
            Limpiar historial
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDateTime } from '../../utils/formatters'

const props = defineProps({
  show: Boolean,
  history: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'clear'])

const searchQuery = ref('')
const filterType = ref('')

const filteredHistory = computed(() => {
  let filtered = [...props.history]

  if (searchQuery.value.trim()) {
    const searchLower = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (entry) =>
        entry.action.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.details).toLowerCase().includes(searchLower)
    )
  }

  if (filterType.value) {
    filtered = filtered.filter((entry) => entry.type === filterType.value)
  }

  return filtered
})

const hasFilters = computed(() => !!(searchQuery.value.trim() || filterType.value))

function clearFilters() {
  searchQuery.value = ''
  filterType.value = ''
}

function clearAllHistory() {
  if (confirm('¿Seguro que quieres borrar todo el historial?')) {
    emit('clear')
  }
}

function getTypeIcon(type) {
  const icons = {
    create: '+',
    update: '↻',
    delete: '×',
    move: '→',
    other: '•'
  }
  return icons[type] || icons.other
}

function getTypeColor(type) {
  const colors = {
    create: 'bg-emerald-600',
    update: 'bg-sky-600',
    delete: 'bg-red-600',
    move: 'bg-accent',
    other: 'bg-ink-muted'
  }
  return colors[type] || colors.other
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-dialog-shell,
.modal-leave-active .modal-dialog-shell {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-enter-from .modal-dialog-shell,
.modal-leave-to .modal-dialog-shell {
  transform: scale(0.95);
  opacity: 0;
}
</style>
