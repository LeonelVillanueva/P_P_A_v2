<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ sectionName }}
      </h2>
      <span class="text-sm text-gray-500">
        {{ count }} {{ formatAnimeCount(count) }}
      </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <AnimeCard 
        v-for="anime in animes" 
        :key="anime.id"
        :anime="anime"
        @open="$emit('open-anime', anime)"
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

defineEmits(['open-anime'])
</script>

