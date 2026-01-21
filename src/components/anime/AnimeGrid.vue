<template>
  <div>
    <!-- Header móvil -->
    <div class="sm:hidden mb-3 px-1">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">
          {{ sectionName }}
        </h2>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {{ count }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header web -->
    <div class="hidden sm:block mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ sectionName }}
          </h2>
          <span class="text-sm text-gray-500">
            {{ count }} {{ formatAnimeCount(count) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Vista: Cards (por defecto) -->
    <div v-if="viewMode === 'cards'">
      <!-- Lista móvil (diseño diferente) -->
      <div class="sm:hidden space-y-0">
        <AnimeCard 
          v-for="anime in animes" 
          :key="anime.id"
          :anime="anime"
          :section-id="sectionId"
          @open="$emit('open-anime', anime)"
          @edit="$emit('edit', anime)"
          @delete="$emit('delete', anime)"
          @hover="$emit('hover', $event, anime)"
          @leave="$emit('leave')"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        />
      </div>

      <!-- Grid web (diseño original) -->
      <div class="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimeCard 
          v-for="anime in animes" 
          :key="anime.id"
          :anime="anime"
          :section-id="sectionId"
          @open="$emit('open-anime', anime)"
          @edit="$emit('edit', anime)"
          @delete="$emit('delete', anime)"
          @hover="$emit('hover', $event, anime)"
          @leave="$emit('leave')"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        />
      </div>
    </div>

    <!-- Vista: Lista con imagen -->
    <div v-else-if="viewMode === 'list-image'">
      <AnimeListImageView
        :animes="animes"
        :section-id="sectionId"
        @open="$emit('open-anime', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </div>

    <!-- Vista: Lista (solo texto) -->
    <div v-else-if="viewMode === 'list'">
      <AnimeListView
        :animes="animes"
        :section-id="sectionId"
        @open="$emit('open-anime', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AnimeCard from './AnimeCard.vue'
import AnimeListView from './AnimeListView.vue'
import AnimeListImageView from './AnimeListImageView.vue'
import { formatAnimeCount } from '../../utils/formatters'

const props = defineProps({
  animes: Array,
  sectionName: String,
  count: Number,
  sectionId: String,
  viewMode: {
    type: String,
    default: 'cards',
    validator: (value) => ['cards', 'list', 'list-image'].includes(value)
  }
})

const emit = defineEmits(['open-anime', 'edit', 'delete', 'drag-start', 'drag-end'])

const handleDragStart = (event, anime) => {
  emit('drag-start', event, anime)
}

const handleDragEnd = (event) => {
  emit('drag-end', event)
}
</script>

