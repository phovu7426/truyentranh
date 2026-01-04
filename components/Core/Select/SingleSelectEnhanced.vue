<template>
  <div class="single-select-enhanced">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <select
        :value="modelValue || ''"
        @change="updateValue"
        :disabled="disabled || loading"
        :class="[
          'w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200',
          error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md',
          'appearance-none cursor-pointer'
        ]"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <template v-for="option in options" :key="String(option?.[valueField] ?? '')">
          <option
            v-if="option != null"
            :value="String(option?.[valueField] ?? '')"
          >
            {{ option?.[labelField] ?? '' }}
          </option>
        </template>
      </select>
      
      <!-- Enhanced dropdown arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="loading" class="absolute inset-y-0 right-8 flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    </div>
    
    <!-- Error message -->
    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
    
    <!-- Help text -->
    <div v-if="helpText" class="text-gray-500 text-xs mt-1">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useApiClient } from '@/composables/api'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
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

const emit = defineEmits(['update:modelValue'])

const { apiClient } = useApiClient()
const localOptions = ref([])
const isLoading = ref(false)

// Computed options - either from props or fetched
const options = computed(() => {
  const propOptions = Array.isArray(props.options) ? props.options : []
  return propOptions.length > 0 ? propOptions : localOptions.value
})

// Fetch options if searchApi is provided and no options in props
onMounted(async () => {
  if (props.searchApi && props.options.length === 0) {
    await fetchOptions()
  }
  
  // Nếu có giá trị đã chọn nhưng chưa có options, load options để hiển thị
  if (props.modelValue && localOptions.value.length === 0) {
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
    }
  } catch (error) {
    localOptions.value = []
  } finally {
    isLoading.value = false
  }
}

function updateValue(event) {
  // Xử lý giá trị rỗng thành null, ngược lại convert sang number nếu là số
  const rawValue = event.target.value
  if (!rawValue || rawValue === '') {
    emit('update:modelValue', null)
  } else {
    // Giữ nguyên kiểu dữ liệu (string hoặc number) dựa trên valueField
    const selectedOption = options.value.find(opt => String(opt[props.valueField]) === String(rawValue))
    if (selectedOption) {
      // Giữ nguyên kiểu dữ liệu của option value
      emit('update:modelValue', selectedOption[props.valueField])
    } else {
      // Fallback: convert sang number nếu có thể
      const numValue = Number(rawValue)
      emit('update:modelValue', isNaN(numValue) ? rawValue : numValue)
    }
  }
}

// Watch for searchApi changes
watch(() => props.searchApi, () => {
  if (props.searchApi && props.options.length === 0) {
    fetchOptions()
  }
})

// Watch modelValue để load options nếu có giá trị nhưng chưa có options
watch(() => props.modelValue, async (newValue) => {
  if (newValue && localOptions.value.length === 0 && props.searchApi && props.options.length === 0) {
    await fetchOptions()
  }
}, { immediate: true })
</script>

<style scoped>
.single-select-enhanced {
  @apply w-full;
}

/* Enhanced select styling */
select {
  background-image: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Hover effects */
select:hover:not(:disabled) {
  @apply border-gray-400 shadow-sm;
}

/* Focus effects */
select:focus {
  @apply outline-none ring-2 ring-blue-500 border-blue-500 shadow-md;
}

/* Custom scrollbar for select options */
select::-webkit-scrollbar {
  width: 8px;
}

select::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

select::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded;
}

select::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Animation for dropdown arrow */
select:focus + .absolute svg {
  @apply text-blue-500 transform rotate-180 transition-transform duration-200;
}

/* Enhanced error state */
select.border-red-500 {
  @apply ring-2 ring-red-200;
}

select.border-red-500:focus {
  @apply ring-2 ring-red-500;
}
</style>