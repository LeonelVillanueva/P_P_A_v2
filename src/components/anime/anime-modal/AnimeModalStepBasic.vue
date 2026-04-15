<template>
  <section class="bg-elevated rounded-card p-4 border border-border-subtle shadow-card">
    <h3 class="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-accent text-xs font-bold"
      >{{ stepOrder('basic') }}</span>
      Datos básicos
    </h3>
    <p class="text-xs text-ink-muted mb-3">
      La obra y la entrega (secuela o temporada con otro nombre) van juntas en el recuadro de abajo para no duplicar tarjetas por la misma serie. Abre el panel lateral para elegir la obra; el estado es obligatorio.
    </p>
    <div class="space-y-3">
      <div
        class="rounded-card border-2 border-accent-border/60 bg-gradient-to-br from-accent-muted/80 via-elevated to-elevated p-3 shadow-card sm:p-4"
      >
        <p class="mb-3 text-[11px] font-semibold uppercase tracking-wide text-accent-hover">
          Obra y esta entrega
        </p>
        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-ink">
              Título original (obra) <span class="text-danger">*</span>
            </label>
            <TituloObraField
              :key="tituloObraFieldKey"
              v-model="formData.titulo_original"
              v-model:panel-open="obrasListPanelOpen"
            />
          </div>
          <div class="border-t border-accent-border/50 pt-3">
            <label class="mb-1 block text-xs font-semibold text-ink">
              Título de esta entrega, secuela o temporada
            </label>
            <input
              v-model="formData.titulo_entrega"
              type="text"
              class="w-full rounded-lg border-2 border-border-subtle px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring bg-elevated text-ink"
              placeholder="Opcional: solo si esta ficha tiene otro nombre (ej. subtítulo de la temporada)"
            >
            <p class="mt-1.5 text-[11px] leading-snug text-ink-muted">
              Si es una nueva temporada o secuela de la misma obra, el título de la obra ya lo elegiste arriba; aquí va solo el nombre distintivo de esta entrega, si aplica.
            </p>
          </div>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-ink mb-1">Estado <span class="text-danger">*</span></label>
        <select
          v-model="formData.estado"
          required
          class="w-full px-3 py-2.5 text-sm border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring bg-elevated outline-none text-ink"
        >
          <option value="">Selecciona…</option>
          <option v-for="estado in estados" :key="estado" :value="estado">
            {{ estado }}
          </option>
        </select>
      </div>
      <div>
        <span class="block text-xs font-semibold text-ink mb-2">Temporadas</span>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="temp in temporadas"
            :key="temp"
            class="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all"
            :class="formData.temporadas.includes(temp) ? 'border-accent bg-accent-muted text-accent-hover' : 'border-border-subtle hover:border-accent-border'"
          >
            <input
              v-model="formData.temporadas"
              type="checkbox"
              :value="temp"
              class="w-3.5 h-3.5 text-accent border-border-strong rounded"
            >
            {{ temp }}
          </label>
        </div>
      </div>
    </div>
    <p v-if="stepError" class="mt-2 text-xs text-danger" role="alert">{{ stepError }}</p>
  </section>
</template>

<script setup>
import TituloObraField from '../TituloObraField.vue'

defineProps({
  estados: { type: Array, default: () => [] },
  temporadas: { type: Array, default: () => [] },
  tituloObraFieldKey: { type: Number, default: 0 },
  stepError: { type: String, default: '' },
  stepOrder: { type: Function, required: true }
})

const formData = defineModel('formData', { type: Object, required: true })
const obrasListPanelOpen = defineModel('obrasListPanelOpen', { type: Boolean, default: false })
</script>
