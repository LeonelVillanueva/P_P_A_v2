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
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-subtle bg-elevated shadow-2xl"
      >
        <!-- Search Input -->
        <div class="flex items-center border-b border-border-subtle bg-surface-muted/90 px-4 py-3">
          <svg class="mr-3 h-5 w-5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            :value="query"
            type="text"
            placeholder="Buscar comandos… (Ctrl+K)"
            class="flex-1 bg-transparent text-ink outline-none placeholder:text-ink-muted"
            autofocus
            @input="$emit('update:query', $event.target.value)"
            @keydown.enter="handleEnter"
            @keydown.arrow-down.prevent="selectNext"
            @keydown.arrow-up.prevent="selectPrevious"
            @keydown.escape="close"
          />
          <kbd
            class="rounded border border-border-subtle bg-surface-muted px-2 py-1 text-xs font-semibold text-ink-muted"
          >
            ESC
          </kbd>
        </div>

        <!-- Commands List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="commands.length === 0" class="px-4 py-8 text-center text-ink-muted">
            No se encontraron comandos
          </div>
          <button
            v-for="(command, index) in commands"
            :key="command.id"
            :class="[
              'flex w-full items-center space-x-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted',
              selectedIndex === index ? 'border-l-4 border-accent bg-accent/10' : 'border-l-4 border-transparent'
            ]"
            @click="handleCommand(command)"
          >
            <span class="text-xl">{{ command.icon }}</span>
            <span class="flex-1 font-medium text-ink">{{ command.label }}</span>
            <kbd
              v-if="selectedIndex === index"
              class="rounded bg-surface-muted px-2 py-1 text-xs font-semibold text-ink-muted"
            >
              ENTER
            </kbd>
          </button>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-border-subtle bg-surface-muted/50 px-4 py-2 text-xs text-ink-muted"
        >
          <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
              <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5">↑</kbd>
              <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5">↓</kbd>
              <span>Navegar</span>
            </span>
            <span class="flex items-center space-x-1">
              <kbd class="rounded border border-border-subtle bg-elevated px-1.5 py-0.5">Enter</kbd>
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
  query: { type: String, default: '' },
  selectedIndex: { type: Number, default: 0 },
  commands: { type: Array, default: () => [] }
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
