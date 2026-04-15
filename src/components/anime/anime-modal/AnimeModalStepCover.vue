<template>
  <section class="bg-elevated rounded-card p-4 border border-border-subtle shadow-card">
    <h3 class="text-sm font-semibold text-ink mb-1 flex items-center gap-2">
      <span
        class="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-accent text-xs font-bold"
      >{{ stepOrder('cover') }}</span>
      Portada
    </h3>
    <p class="text-xs text-ink-muted mb-3">Puedes omitir este paso si la imagen actual te vale.</p>
    <div class="flex flex-col gap-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div
          v-if="formData.imagen_url || previewImage"
          class="w-full sm:w-28 h-36 sm:h-28 shrink-0 rounded-lg overflow-hidden border-2 border-accent-border bg-surface-muted"
        >
          <img
            :src="previewImage || formData.imagen_url"
            alt=""
            class="w-full h-full object-cover"
            @error="$emit('image-error', $event)"
          >
        </div>
        <label
          class="flex flex-1 flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-accent-border rounded-card cursor-pointer bg-accent-muted/40 hover:bg-accent-muted transition-colors px-3 py-3"
        >
          <svg class="w-8 h-8 text-accent mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs font-medium text-ink-muted text-center">Subir imagen (PNG, JPG, WEBP)</span>
          <input type="file" accept="image/*" class="hidden" @change="$emit('image-change', $event)">
        </label>
      </div>
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-card border-2 border-accent-border bg-elevated px-3 py-2.5 text-sm font-medium text-accent-hover shadow-card transition-colors hover:bg-accent-muted focus:outline-none focus:ring-2 focus:ring-accent-ring"
        title="Abrir búsqueda Jikan y usar la imagen del resultado"
        @click="$emit('open-search-cover')"
      >
        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Buscar portada en la API
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  previewImage: { type: [String, null], default: null },
  stepOrder: { type: Function, required: true }
})

const formData = defineModel('formData', { type: Object, required: true })

defineEmits(['image-change', 'image-error', 'open-search-cover'])
</script>
