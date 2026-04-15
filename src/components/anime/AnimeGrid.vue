<template>
  <div>
    <!-- Header móvil -->
    <div class="mb-3 px-1 sm:hidden">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">
          {{ sectionName }}
        </h2>
        <div class="flex items-center space-x-2">
          <span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
            {{ headerCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- Header web -->
    <div class="mb-6 hidden sm:block">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ sectionName }}
          </h2>
          <span class="text-sm text-gray-500">
            {{ headerCount }} {{ formatAnimeCount(headerCount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Vista: Cards — una card por obra si hay series agrupadas -->
    <div v-if="viewMode === 'cards'">
      <template v-if="useSerieCards">
        <div class="space-y-3 sm:hidden">
          <AnimeSerieGridCard
            v-for="serie in series"
            :key="serie.titulo_original"
            :serie="serie"
            :section-id="sectionId"
            @open="$emit('open-serie', $event)"
            @edit="$emit('edit-serie', $event)"
            @hover="(e, anime) => $emit('hover', e, anime)"
            @leave="$emit('leave')"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
          />
        </div>
        <div class="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimeSerieGridCard
            v-for="serie in series"
            :key="'d-' + serie.titulo_original"
            :serie="serie"
            :section-id="sectionId"
            @open="$emit('open-serie', $event)"
            @edit="$emit('edit-serie', $event)"
            @hover="(e, anime) => $emit('hover', e, anime)"
            @leave="$emit('leave')"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
          />
        </div>
      </template>
      <template v-else>
        <div class="space-y-0 sm:hidden">
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
        <div class="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-3 xl:grid-cols-4">
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
      </template>
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
import AnimeSerieGridCard from './AnimeSerieGridCard.vue'
import AnimeListView from './AnimeListView.vue'
import AnimeListImageView from './AnimeListImageView.vue'
import { formatAnimeCount } from '../../utils/formatters'

const props = defineProps({
  animes: { type: Array, default: () => [] },
  /** Si viene con datos, la vista cuadrícula muestra una card por obra */
  series: { type: Array, default: null },
  sectionName: { type: String, default: '' },
  count: { type: Number, default: 0 },
  sectionId: { type: String, default: '' },
  viewMode: {
    type: String,
    default: 'cards',
    validator: (value) => ['cards', 'list', 'list-image'].includes(value)
  }
})

const emit = defineEmits([
  'open-anime',
  'open-serie',
  'edit-serie',
  'edit',
  'delete',
  'drag-start',
  'drag-end',
  'hover',
  'leave'
])

const useSerieCards = computed(
  () => props.viewMode === 'cards' && Array.isArray(props.series) && props.series.length > 0
)

const headerCount = computed(() => {
  if (useSerieCards.value) return props.series.length
  return props.count
})

const handleDragStart = (event, anime) => {
  emit('drag-start', event, anime)
}

const handleDragEnd = (event) => {
  emit('drag-end', event)
}
</script>
