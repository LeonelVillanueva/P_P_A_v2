<template>
  <section
    class="bg-elevated rounded-card p-4 border border-border-subtle border-l-4 border-l-indigo-400 shadow-card"
  >
    <h3 class="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold"
      >{{ stepOrder('revision') }}</span>
      Seguimiento de información
    </h3>
    <p class="text-xs text-ink-muted mb-3">
      Opcional: cuándo revisaste anuncios o información oficial (trailers, fechas).
    </p>
    <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
      <div class="flex-1 min-w-0">
        <label class="text-xs font-medium text-ink-muted">Última revisión</label>
        <input
          v-model="formData.ultima_revision_info"
          type="date"
          class="w-full mt-1 px-3 py-2 text-sm border-2 border-border-subtle rounded-lg bg-elevated text-ink"
        >
      </div>
      <button
        type="button"
        class="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 whitespace-nowrap"
        @click="$emit('marcar-hoy')"
      >
        Hoy
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  stepOrder: { type: Function, required: true }
})

const formData = defineModel('formData', { type: Object, required: true })

defineEmits(['marcar-hoy'])
</script>
