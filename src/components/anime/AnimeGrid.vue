<template>
  <div>
    <!-- Header móvil (oculto) -->
    <div class="sm:hidden mb-3 px-1">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">
          {{ sectionName }}
        </h2>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {{ count }}
        </span>
      </div>
    </div>

    <!-- Header web (visible) -->
    <div class="hidden sm:block mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ sectionName }}
      </h2>
      <span class="text-sm text-gray-500">
        {{ count }} {{ formatAnimeCount(count) }}
      </span>
    </div>

    <!-- Lista móvil (diseño diferente) -->
    <div class="sm:hidden space-y-0">
      <AnimeCard 
        v-for="anime in animes" 
        :key="anime.id"
        :anime="anime"
        @open="$emit('open-anime', anime)"
        @edit="$emit('edit', anime)"
        @delete="$emit('delete', anime)"
      />
    </div>

    <!-- Grid web (diseño original) -->
    <div class="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <AnimeCard 
        v-for="anime in animes" 
        :key="anime.id"
        :anime="anime"
        @open="$emit('open-anime', anime)"
        @edit="$emit('edit', anime)"
        @delete="$emit('delete', anime)"
      />
    </div>
  </div>
</template>

<script setup>
import AnimeCard from './AnimeCard.vue'
import { formatAnimeCount } from '../../utils/formatters'

defineProps({
  animes: Array,
  sectionName: String,
  count: Number
})

defineEmits(['open-anime', 'edit', 'delete'])
</script>

