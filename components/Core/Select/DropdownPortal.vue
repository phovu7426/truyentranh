<template>
  <Teleport to="body">
    <div 
      v-if="modelValue" 
      class="dropdown-portal fixed bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-hidden"
      :style="portalStyle"
      ref="portalElement"
    >
      <!-- Search box -->
      <div class="p-2 border-b border-gray-200 bg-gray-50">
        <input
          v-model="search"
          type="text"
          placeholder="Tìm kiếm..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @click.stop
        >
      </div>
      
      <!-- Options list -->
      <div class="max-h-48 overflow-y-auto">
        <div
          v-for="option in filteredOptions"
          :key="String(option[valueField])"
          @click="handleOptionClick(option[valueField])"
          class="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150"
          :class="{ 'bg-blue-100': isSelected(option[valueField]) }"
        >
          <input
            type="checkbox"
            class="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            :checked="isSelected(option[valueField])"
            @click.stop
          >
          <span class="text-sm text-gray-700">{{ option[labelField] }}</span>
        </div>
        
        <div v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
          Không có dữ liệu
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="px-3 py-4 text-center text-gray-500 text-sm">
        <div class="inline-flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Đang tải...
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array,
    default: () => []
  },
  selectedValues: {
    type: Array,
    default: () => []
  },
  labelField: {
    type: String,
    default: 'label'
  },
  valueField: {
    type: String,
    default: 'value'
  },
  triggerElement: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select', 'close'])

const search = ref('')
const portalElement = ref(null)
const portalStyle = ref({})

// Filtered options based on search
const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const searchTerm = search.value.toLowerCase()
  return props.options.filter(option =>
    String(option[props.labelField]).toLowerCase().includes(searchTerm)
  )
})

function isSelected(value) {
  // Handle Proxy array by converting to real array first
  const selectedValuesArray = Array.isArray(props.selectedValues) ? [...props.selectedValues] : []
  // Normalize to strings for comparison
  const normalizedSelectedValues = selectedValuesArray.map(val => String(val))
  return normalizedSelectedValues.includes(String(value))
}

function handleOptionClick(value) {
  // Prevent event bubbling
  event.stopPropagation()
  emit('select', value)
}

function updatePosition() {
  if (!props.triggerElement || !portalElement.value) return
  
  const triggerRect = props.triggerElement.getBoundingClientRect()
  const dropdown = portalElement.value
  
  // Reset styles
  portalStyle.value = {
    left: triggerRect.left + 'px',
    top: (triggerRect.bottom + 4) + 'px',
    width: triggerRect.width + 'px',
    zIndex: '99999'
  }
  
  // Force DOM update
  nextTick(() => {
    const dropdownRect = dropdown.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    
    // Adjust if goes off screen
    const newStyle = { ...portalStyle.value }
    
    if (dropdownRect.bottom > windowHeight) {
      newStyle.top = (triggerRect.top - dropdownRect.height - 4) + 'px'
    }
    
    if (dropdownRect.right > windowWidth) {
      newStyle.left = (triggerRect.right - dropdownRect.width) + 'px'
    }
    
    portalStyle.value = newStyle
  })
}

// Watch for visibility changes
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      updatePosition()
    })
  } else {
    search.value = ''
  }
})

// Watch for trigger element changes
watch(() => props.triggerElement, () => {
  if (props.modelValue) {
    updatePosition()
  }
})

// Handle click outside - improved logic
function handleClickOutside(event) {
  if (!props.modelValue) return
  
  const clickedInsideDropdown = portalElement.value && portalElement.value.contains(event.target)
  const clickedInsideTrigger = props.triggerElement && props.triggerElement.contains(event.target)
  const clickedCheckbox = event.target && event.target.type === 'checkbox'
  const clickedOption = event.target && event.target.closest('.option-item')
  
  // Don't close if:
  // 1. Clicking inside dropdown (including options and checkboxes)
  // 2. Clicking on trigger element
  if (clickedInsideDropdown || clickedInsideTrigger || clickedCheckbox || clickedOption) {
    return // Keep dropdown open
  }
  
  // Close only if clicking completely outside
  emit('update:modelValue', false)
  emit('close')
}

// Handle resize and scroll
function handleResize() {
  if (props.modelValue) {
    updatePosition()
  }
}

// Setup event listeners
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleResize)
  }
})

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
})
</script>

<style scoped>
.dropdown-portal {
  position: fixed !important;
  z-index: 99999 !important;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
  contain: layout style paint;
  transition: all 0.2s ease-out;
  transform-origin: top;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 2px solid #e5e7eb;
}

/* Ensure this is above everything */
.dropdown-portal {
  isolation: isolate;
  /* Higher than CKEditor's z-index (usually 1000-9999) */
  z-index: 99999 !important;
}

/* Custom scrollbar */
.dropdown-portal ::-webkit-scrollbar {
  width: 6px;
}

.dropdown-portal ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-portal ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-portal ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>