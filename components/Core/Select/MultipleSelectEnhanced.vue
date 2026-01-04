<template>
  <div class="multiple-select-enhanced">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <!-- Dropdown trigger -->
      <div
        ref="triggerRef"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer min-h-[42px] flex flex-wrap gap-1 items-center hover:border-gray-400 transition-all duration-200 relative"
        :class="[
          error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md'
        ]"
        @click="toggleDropdown"
      >
        <span v-if="selectedOptions.length === 0" class="text-gray-500 text-sm">{{ placeholder }}</span>
        <span
          v-for="option in selectedOptions"
          :key="option[valueField]"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
        >
          {{ option[labelField] }}
          <button
            type="button"
            @click.stop="removeOption(option[valueField])"
            class="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </span>
        
        <!-- Dropdown arrow -->
        <div class="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
          <svg
            class="w-5 h-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': open }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      <!-- Dropdown panel -->
      <DropdownPortal
        v-model="open"
        :options="options"
        :selected-values="modelValue"
        :label-field="labelField"
        :value-field="valueField"
        :trigger-element="triggerRef"
        :loading="isLoading"
        @select="toggleOption"
        @close="open = false"
      />
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
    
    <!-- Help text -->
    <div v-if="helpText" class="text-gray-500 text-xs mt-1">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useApiClient } from '@/composables/api'
import DropdownPortal from './DropdownPortal.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  searchApi: {
    type: String,
    default: ''
  },
  labelField: {
    type: String,
    default: 'label'
  },
  valueField: {
    type: String,
    default: 'value'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '-- Chọn --'
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: String,
    default: ''
  },
  // Allow passing options directly
  options: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'options-loaded'])

const { apiClient } = useApiClient()
const localOptions = ref([])
const isLoading = ref(false)
const open = ref(false)
const search = ref('')
const dropdownPanel = ref(null)
const triggerRef = ref(null)

// Computed options - either from props or fetched
const options = computed(() => {
  return props.options.length > 0 ? props.options : localOptions.value
})

// Computed selected options for display
const selectedOptions = computed(() => {
  // Handle Proxy array by converting to real array first
  const modelValueArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  
  // Normalize modelValue to array of strings for consistent comparison
  const normalizedModelValue = modelValueArray.map(val => String(val))
  
  const selected = options.value.filter(option => {
    const optionValue = String(option[props.valueField])
    const isSelected = normalizedModelValue.includes(optionValue)
    return isSelected
  })
  
  return selected
})

// Filtered options based on search
const filteredOptions = computed(() => {
  if (!search.value) return options.value
  const searchTerm = search.value.toLowerCase()
  return options.value.filter(option =>
    String(option[props.labelField]).toLowerCase().includes(searchTerm)
  )
})

// Fetch options if searchApi is provided and no options in props
onMounted(async () => {
  if (props.searchApi && props.options.length === 0) {
    await fetchOptions()
  }
  
  // Nếu có giá trị đã chọn nhưng chưa có options, load options để hiển thị
  if (props.modelValue && props.modelValue.length > 0 && localOptions.value.length === 0) {
    await fetchOptions()
  }
})

async function fetchOptions() {
  if (!props.searchApi) return
  
  isLoading.value = true
  try {
    const response = await apiClient.get(props.searchApi)
    if (response.data?.success) {
      localOptions.value = response.data.data || []
      // Emit event when options are loaded
      emit('options-loaded', localOptions.value)
    }
  } catch (error) {
    localOptions.value = []
  } finally {
    isLoading.value = false
  }
}

function toggleDropdown() {
  if (props.disabled || props.loading) return
  open.value = !open.value
  
  // Position dropdown after opening
  if (open.value) {
    nextTick(() => {
      positionDropdown()
    })
  }
}

function positionDropdown() {
  if (!dropdownPanel.value || !triggerRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const dropdown = dropdownPanel.value
  
  // Set width to match trigger
  dropdown.style.width = triggerRect.width + 'px'
  
  // Position below trigger
  dropdown.style.left = triggerRect.left + 'px'
  dropdown.style.top = (triggerRect.bottom + 4) + 'px'
  
  // Check if dropdown would go off screen
  const dropdownRect = dropdown.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth
  
  // Adjust vertical position if needed
  if (dropdownRect.bottom > windowHeight) {
    dropdown.style.top = (triggerRect.top - dropdownRect.height - 4) + 'px'
  }
  
  // Adjust horizontal position if needed
  if (dropdownRect.right > windowWidth) {
    dropdown.style.left = (triggerRect.right - dropdownRect.width) + 'px'
  }
}

function toggleOption(value) {
  if (props.disabled) return
  
  const stringValue = String(value)
  // Handle Proxy array by converting to real array first
  const modelValueArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  // Normalize modelValue to strings for consistent comparison
  const normalizedModelValue = modelValueArray.map(val => String(val))
  
  const newValues = normalizedModelValue.includes(stringValue)
    ? modelValueArray.filter(v => String(v) !== stringValue)
    : [...modelValueArray, stringValue]
  
  emit('update:modelValue', newValues)
  emit('change', newValues)
  
  // Keep dropdown open after selection for multiple select
  // Don't close dropdown here - let user close manually or click outside
}

function isSelected(value) {
  // Handle Proxy array by converting to real array first
  const modelValueArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  // Normalize both values to strings for comparison
  const stringValue = String(value)
  const normalizedModelValue = modelValueArray.map(val => String(val))
  return normalizedModelValue.includes(stringValue)
}

function removeOption(value) {
  if (props.disabled) return
  
  // Handle Proxy array by converting to real array first
  const modelValueArray = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const stringValue = String(value)
  // Filter out the value by comparing normalized strings
  const newValues = modelValueArray.filter(v => String(v) !== stringValue)
  emit('update:modelValue', newValues)
  emit('change', newValues)
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  const clickedInsideDropdown = dropdownPanel.value && dropdownPanel.value.contains(event.target)
  const clickedInsideTrigger = triggerRef.value && triggerRef.value.contains(event.target)
  
  if (!clickedInsideDropdown && !clickedInsideTrigger) {
    open.value = false
  }
}

// Handle window resize
function handleResize() {
  if (open.value) {
    positionDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
})

// Watch for searchApi changes
watch(() => props.searchApi, () => {
  if (props.searchApi && props.options.length === 0) {
    fetchOptions()
  }
})

// Watch modelValue changes để cập nhật selected state và load options nếu cần
watch(() => props.modelValue, async (newValue) => {
  // Nếu có giá trị nhưng chưa có options, load options
  if (newValue && newValue.length > 0 && localOptions.value.length === 0 && props.searchApi) {
    await fetchOptions()
  }
}, { immediate: true, deep: true })

// Reset search when dropdown closes
watch(open, (isOpen) => {
  if (!isOpen) {
    search.value = ''
  } else {
    // Position dropdown when opening
    nextTick(() => {
      positionDropdown()
    })
  }
})
</script>

<style scoped>
.multiple-select-enhanced {
  @apply w-full relative;
  isolation: isolate; /* Tạo stacking context riêng */
}

/* Ensure dropdown is always on top */
.multiple-select-enhanced .dropdown-panel {
  position: absolute !important;
  z-index: 9999 !important;
  will-change: transform, opacity; /* Tối ưu hiệu suất */
  transform: translateZ(0); /* Force hardware acceleration */
  backface-visibility: hidden; /* Tối ưu render */
  -webkit-backface-visibility: hidden;
  -moz-backface-visibility: hidden;
  -ms-backface-visibility: hidden;
}

/* Prevent overflow issues */
.multiple-select-enhanced .dropdown-panel {
  contain: layout style paint; /* Giới hạn layout calculations */
}

/* Smooth animations */
.multiple-select-enhanced .dropdown-panel {
  transition: all 0.2s ease-out;
  transform-origin: top;
}

.multiple-select-enhanced .dropdown-panel[style*="display: none"] {
  transform: scaleY(0.95);
  opacity: 0;
}

.multiple-select-enhanced .dropdown-panel:not([style*="display: none"]) {
  transform: scaleY(1);
  opacity: 1;
}

/* Dropdown trigger styling */
.multiple-select-enhanced .dropdown-trigger {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer min-h-[42px] flex flex-wrap gap-1 items-center hover:border-gray-400 transition-all duration-200;
}

.multiple-select-enhanced .dropdown-trigger:focus-within {
  @apply outline-none ring-2 ring-blue-500 border-blue-500 shadow-md;
}

.multiple-select-enhanced .dropdown-trigger.has-error {
  @apply border-red-500 ring-2 ring-red-200;
}

/* Selected tags styling */
.multiple-select-enhanced .selected-tag {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200;
}

.multiple-select-enhanced .selected-tag button {
  @apply ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors;
}

.multiple-select-enhanced .selected-tag button:hover {
  @apply bg-blue-200;
}

/* Dropdown panel styling */
.multiple-select-enhanced .dropdown-panel {
  @apply absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden;
}

.multiple-select-enhanced .dropdown-panel .search-box {
  @apply p-2 border-b border-gray-200 bg-gray-50;
}

.multiple-select-enhanced .dropdown-panel .search-box input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.multiple-select-enhanced .dropdown-panel .options-list {
  @apply max-h-48 overflow-y-auto;
}

.multiple-select-enhanced .dropdown-panel .option-item {
  @apply px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150;
}

.multiple-select-enhanced .dropdown-panel .option-item:hover {
  @apply bg-blue-50;
}

.multiple-select-enhanced .dropdown-panel .option-item.selected {
  @apply bg-blue-100;
}

.multiple-select-enhanced .dropdown-panel .option-item input[type="checkbox"] {
  @apply mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

.multiple-select-enhanced .dropdown-panel .option-item .option-label {
  @apply text-sm text-gray-700;
}

/* Empty state */
.multiple-select-enhanced .dropdown-panel .empty-state {
  @apply px-3 py-4 text-center text-gray-500 text-sm;
}

/* Loading state */
.multiple-select-enhanced .dropdown-panel .loading-state {
  @apply px-3 py-4 text-center text-gray-500 text-sm;
}

.multiple-select-enhanced .dropdown-panel .loading-state .spinner {
  @apply inline-flex items-center;
}

.multiple-select-enhanced .dropdown-panel .loading-state .spinner-icon {
  @apply animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2;
}

/* Dropdown arrow animation */
.multiple-select-enhanced .dropdown-arrow {
  @apply w-5 h-5 text-gray-400 transition-transform duration-200;
}

.multiple-select-enhanced .dropdown-arrow.rotate {
  @apply transform rotate-180;
}

/* Error and help text */
.multiple-select-enhanced .error-text {
  @apply text-red-500 text-sm mt-2;
}

.multiple-select-enhanced .help-text {
  @apply text-gray-500 text-xs mt-1;
}

/* Custom scrollbar */
.multiple-select-enhanced .dropdown-panel .options-list::-webkit-scrollbar {
  width: 6px;
}

.multiple-select-enhanced .dropdown-panel .options-list::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.multiple-select-enhanced .dropdown-panel .options-list::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded;
}

.multiple-select-enhanced .dropdown-panel .options-list::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>