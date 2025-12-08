<template>
  <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50/30">
      <div class="flex overflow-x-auto scrollbar-hide">
        <button
          v-for="seccion in sections"
          :key="seccion.id"
          @click="$emit('change-tab', seccion.id)"
          :class="[
            'px-6 py-4 font-semibold text-sm transition-all duration-200 whitespace-nowrap border-b-2 relative',
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
    <div class="p-6 min-h-[500px]">
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

