<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
      
      <!-- Command Palette -->
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <!-- Search Input -->
        <div class="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            :value="query"
            @input="$emit('update:query', $event.target.value)"
            type="text"
            placeholder="Buscar comandos... (Ctrl+K)"
            class="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
            @keydown.enter="handleEnter"
            @keydown.arrow-down.prevent="selectNext"
            @keydown.arrow-up.prevent="selectPrevious"
            @keydown.escape="close"
            autofocus
          />
          <kbd class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 rounded border border-gray-300">
            ESC
          </kbd>
        </div>

        <!-- Commands List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="commands.length === 0" class="px-4 py-8 text-center text-gray-500">
            No se encontraron comandos
          </div>
          <button
            v-for="(command, index) in commands"
            :key="command.id"
            @click="handleCommand(command)"
            :class="[
              'w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-purple-50 transition-colors',
              selectedIndex === index ? 'bg-purple-50 border-l-4 border-purple-600' : ''
            ]"
          >
            <span class="text-xl">{{ command.icon }}</span>
            <span class="flex-1 text-gray-800 font-medium">{{ command.label }}</span>
            <kbd v-if="selectedIndex === index" class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-200 rounded">
              ENTER
            </kbd>
          </button>
        </div>

        <!-- Footer -->
        <div class="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
              <kbd class="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑</kbd>
              <kbd class="px-1.5 py-0.5 bg-white rounded border border-gray-300">↓</kbd>
              <span>Navegar</span>
            </span>
            <span class="flex items-center space-x-1">
              <kbd class="px-1.5 py-0.5 bg-white rounded border border-gray-300">Enter</kbd>
              <span>Seleccionar</span>
            </span>
          </div>
          <span>{{ commands.length }} comando{{ commands.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  query: String,
  selectedIndex: Number,
  commands: Array
})

const emit = defineEmits(['close', 'command', 'update:query', 'select-next', 'select-previous'])

const handleCommand = (command) => {
  emit('command', command.action)
  emit('close')
}

const handleEnter = () => {
  if (props.commands[props.selectedIndex]) {
    handleCommand(props.commands[props.selectedIndex])
  }
}

const close = () => {
  emit('close')
}

const selectNext = () => {
  emit('select-next')
}

const selectPrevious = () => {
  emit('select-previous')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
