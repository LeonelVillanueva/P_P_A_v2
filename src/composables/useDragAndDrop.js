import { ref } from 'vue'

export function useDragAndDrop(onDrop) {
  const draggedItem = ref(null)
  const dragOverSection = ref(null)

  const handleDragStart = (event, item) => {
    draggedItem.value = item
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', '')
    
    // Agregar clase visual al elemento arrastrado
    if (event.target) {
      event.target.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (event) => {
    if (event.target) {
      event.target.style.opacity = '1'
    }
    draggedItem.value = null
    dragOverSection.value = null
  }

  const handleDragOver = (event, sectionId) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    dragOverSection.value = sectionId
  }

  const handleDragLeave = () => {
    dragOverSection.value = null
  }

  const handleDrop = async (event, targetSectionId) => {
    event.preventDefault()
    
    if (!draggedItem.value) return
    
    const sourceSectionId = draggedItem.value.sectionId
    
    // Solo procesar si se movió a una sección diferente
    if (sourceSectionId !== targetSectionId) {
      await onDrop(draggedItem.value, targetSectionId)
    }
    
    draggedItem.value = null
    dragOverSection.value = null
  }

  return {
    draggedItem,
    dragOverSection,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}

