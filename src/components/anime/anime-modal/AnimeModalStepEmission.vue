<template>
  <section class="bg-elevated rounded-card p-4 border border-border-subtle shadow-card">
    <h3 class="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold"
      >{{ stepOrder('emission') }}</span>
      Agenda de episodios
    </h3>
    <p class="text-xs text-ink-muted mb-3">Frecuencia y recordatorios de episodios (opcional).</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="text-xs font-medium text-ink-muted">Frecuencia</label>
        <select
          v-model="formData.episodio_frecuencia"
          class="w-full mt-1 px-3 py-2 text-sm border-2 border-border-subtle rounded-lg bg-elevated text-ink"
        >
          <option v-for="opt in episodioFrecuencias" :key="opt.id" :value="opt.id">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="text-xs font-medium text-ink-muted">Próximo episodio</label>
        <input
          v-model="formData.proximo_episodio_fecha"
          type="date"
          class="w-full mt-1 px-3 py-2 text-sm border-2 border-border-subtle rounded-lg bg-elevated text-ink"
        >
      </div>
    </div>
    <div class="mt-3">
      <span class="text-xs font-medium text-ink-muted">Días de emisión</span>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <label
          v-for="d in diasSemana"
          :key="d.v"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium cursor-pointer transition-colors"
          :class="formData.episodio_dias_semana.includes(d.v) ? 'border-accent bg-accent-muted text-accent-hover' : 'border-border-subtle'"
        >
          <input
            v-model="formData.episodio_dias_semana"
            type="checkbox"
            class="rounded border-border-strong text-accent"
            :value="d.v"
          >
          {{ d.label }}
        </label>
      </div>
    </div>
    <label class="flex items-center gap-2 mt-3 cursor-pointer">
      <input
        v-model="formData.monitoreo_activo"
        type="checkbox"
        class="rounded border-border-strong text-accent"
      >
      <span class="text-xs text-ink">Monitorear actividad de esta serie</span>
    </label>
  </section>
</template>

<script setup>
import { EPISODIO_FRECUENCIAS, DIAS_SEMANA } from '../../../constants/episodioAgenda'

defineProps({
  stepOrder: { type: Function, required: true }
})

const formData = defineModel('formData', { type: Object, required: true })

const episodioFrecuencias = EPISODIO_FRECUENCIAS
const diasSemana = DIAS_SEMANA
</script>
