<template>
  <section class="bg-elevated rounded-card p-4 border border-border-subtle shadow-card">
    <h3 class="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-accent text-xs font-bold"
      >{{ stepOrder('serie') }}</span>
      Serie y fechas
    </h3>
    <p v-if="mostrarTipoYNumeroTemporada" class="text-xs text-ink-muted mb-3">
      Opcional: tipo de entrada y número (solo cuando no tienes temporadas definidas en Configuración).
    </p>
    <p v-else class="text-xs text-ink-muted mb-3">
      Las temporadas ya elegiste en el paso anterior desde Configuración. Aquí solo la fecha de estreno si la necesitas.
    </p>
    <div v-if="mostrarTipoYNumeroTemporada" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-semibold text-ink mb-1">Tipo</label>
        <select
          v-model="formData.tipo_temporada"
          class="w-full px-3 py-2.5 text-sm border-2 border-border-subtle rounded-lg focus:ring-2 focus:ring-accent-ring bg-elevated outline-none text-ink"
        >
          <option value="Temporada">Temporada</option>
          <option value="Movie">Movie</option>
          <option value="OVA">OVA</option>
          <option value="Spin off">Spin off</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-ink mb-1">N.º temporada</label>
        <input
          v-model.number="formData.temporada_numero"
          type="number"
          min="1"
          class="w-full px-3 py-2.5 text-sm border-2 border-border-subtle rounded-lg outline-none bg-elevated text-ink"
          placeholder="1, 2, 3…"
        >
      </div>
    </div>
    <div :class="mostrarTipoYNumeroTemporada ? 'mt-3' : ''">
      <label class="block text-xs font-semibold text-ink mb-1">Fecha de estreno</label>
      <input
        v-model="formData.fecha_estreno"
        type="date"
        class="w-full px-3 py-2.5 text-sm border-2 border-border-subtle rounded-lg outline-none bg-elevated text-ink"
      >
      <p class="text-[11px] text-ink-muted mt-1">Útil si aún no ha salido o para recordatorios.</p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  mostrarTipoYNumeroTemporada: { type: Boolean, default: true },
  stepOrder: { type: Function, required: true }
})

const formData = defineModel('formData', { type: Object, required: true })
</script>
