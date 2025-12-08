<template>
  <!-- Tabs Móvil (diseño diferente - selector dropdown) -->
  <div class="sm:hidden bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-4">
    <!-- Selector móvil -->
    <div class="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 relative">
      <select
        :value="activeTab"
        @change="$emit('change-tab', $event.target.value)"
        class="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl font-semibold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none pr-10"
      >
        <option v-for="seccion in sections" :key="seccion.id" :value="seccion.id">
          {{ seccion.nombre }} ({{ getCount(seccion.id) }})
        </option>
      </select>
      <div class="pointer-events-none absolute right-6 top-1/2 transform -translate-y-1/2">
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Tab Content Móvil -->
    <div class="p-3 min-h-[400px]">
      <slot :active-tab="activeTab" />
    </div>
  </div>

  <!-- Tabs Web (diseño original) -->
  <div class="hidden sm:block bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50/30">
      <div class="flex overflow-x-auto scrollbar-hide">
        <button
          v-for="seccion in sections"
          :key="seccion.id"
          @click="$emit('change-tab', seccion.id)"
          :class="[
            'px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap border-b-2 relative',
            activeTab === seccion.id
              ? 'text-purple-600 border-purple-600 bg-white'
              : 'text-gray-600 border-transparent hover:text-purple-500 hover:bg-white/50'
          ]"
        >
          <div class="flex items-center space-x-2">
            <span>{{ seccion.nombre }}</span>
            <span 
              :class="[
                'px-2 py-0.5 rounded-full text-xs font-bold',
                activeTab === seccion.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ getCount(seccion.id) }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px]">
      <slot :active-tab="activeTab" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
  sections: Array,
  getCount: Function
})

defineEmits(['change-tab'])
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

