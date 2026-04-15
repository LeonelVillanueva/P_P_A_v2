<template>
  <div class="space-y-2">
    <!-- Con título fijado: solo lectura + cambiar obra (abre panel lateral) -->
    <div v-if="tituloFijado" class="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div
        class="min-h-[42px] flex-1 rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900"
        aria-readonly="true"
      >
        {{ modelValue }}
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg border-2 border-purple-200 bg-white px-3 py-2 text-sm font-medium text-purple-800 transition-colors hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        @click="iniciarCambioObra"
      >
        Cambiar obra
      </button>
    </div>

    <!-- Sin título: abrir panel con la lista -->
    <div v-else class="space-y-2">
      <button
        v-if="!panelOpen"
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/60 px-4 py-3.5 text-sm font-semibold text-purple-900 shadow-sm transition-colors hover:border-purple-400 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        @click="abrirPanel"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
        Elegir obra de la lista…
      </button>
      <p
        v-else
        class="rounded-lg border border-purple-100 bg-purple-50/90 px-3 py-2 text-center text-xs leading-snug text-purple-900"
      >
        Usa el panel que se abrió a la derecha (o debajo en móvil) para buscar o escribir el nombre.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  panelOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:panelOpen'])

const tituloFijado = computed(() => !!(props.modelValue || '').trim())

function abrirPanel() {
  emit('update:panelOpen', true)
}

function iniciarCambioObra() {
  emit('update:modelValue', '')
  emit('update:panelOpen', true)
}
</script>
