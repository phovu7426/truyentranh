<template>
  <div class="bg-white p-4 rounded-lg shadow-md mb-6">
    <!-- Bộ lọc chính - hiển thị trên 1 hàng -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- Dropdown cho các bộ lọc nâng cao - chỉ icon -->
      <div class="relative" v-if="hasAdvancedFilters">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          title="Bộ lọc nâng cao"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <div v-if="showAdvancedFilters" class="absolute left-0 mt-2 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-4">
          <div class="space-y-4">
            <slot name="advanced-filters" :filters="localFilters" :on-change="handleFilterChange"></slot>
          </div>
        </div>
      </div>

      <!-- Icon sắp xếp -->
      <div class="relative" v-if="hasSortOptions">
        <button
          @click="showSortOptions = !showSortOptions"
          class="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          title="Sắp xếp"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
          </svg>
        </button>
        
        <!-- Dropdown menu sắp xếp -->
        <div v-if="showSortOptions" class="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-2">
          <div class="space-y-1">
            <div
              v-for="option in sortOptions"
              :key="option.value"
              @click="selectSortOption(option.value)"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
              :class="{ 'bg-gray-100': localFilters && localFilters[props.sortField] === option.value }"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Các bộ lọc chính -->
      <slot name="main-filters" :filters="localFilters" :on-change="handleFilterChange"></slot>

      <!-- Tìm kiếm - đặt ở cuối cùng -->
      <div class="flex-1 min-w-[200px]" v-if="showSearch && !$slots.mainFilters">
        <TextFilter
          v-if="localFilters"
          v-model="localFilters[props.searchField]"
          :placeholder="searchPlaceholder"
          @update:model-value="handleFilterChange"
        />
      </div>

      <!-- Nút hành động - chuyển thành icon và căn phải -->
      <div class="flex items-center gap-2 ml-auto">
        <!-- Nút đặt lại - icon refresh -->
        <button
          @click="resetFilters"
          class="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          title="Đặt lại"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <!-- Nút áp dụng bộ lọc - icon kính lúp -->
        <button
          @click="applyFilters"
          class="p-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          title="Áp dụng bộ lọc"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Additional content slot -->
    <slot name="additional-content"></slot>
    
    <!-- Content slot -->
    <slot name="content"></slot>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import TextFilter from '@/components/Core/Filter/TextFilter.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
  sortOptions: {
    type: Array,
    default: () => [],
  },
  sortField: {
    type: String,
    default: 'sort',
  },
  searchField: {
    type: String,
    default: 'search',
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  hasAdvancedFilters: {
    type: Boolean,
    default: false,
  },
  hasSortOptions: {
    type: Boolean,
    default: true,
  },
  resetFunction: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['update:filters', 'filter-change'])
const route = useRoute()

// Local filters state - initialize from route query params
const localFilters = computed(() => {
  const initial = {
    [props.searchField]: '',
    [props.sortField]: '',
    ...(props.initialFilters || {}),
  }
  
  // Merge with route query params if they exist and are valid
  const routeQuery = route.query
  if (routeQuery && typeof routeQuery === 'object' && !Array.isArray(routeQuery)) {
    const filteredQuery = {}
    Object.keys(routeQuery).forEach(key => {
      // Only include non-empty values and avoid null/undefined
      if (routeQuery[key] !== null && routeQuery[key] !== undefined && routeQuery[key] !== '') {
        filteredQuery[key] = routeQuery[key]
      }
    })
    return {
      ...initial,
      ...filteredQuery
    }
  }
  
  return initial
})

// State for dropdowns
const showAdvancedFilters = ref(false)
const showSortOptions = ref(false)

// Watch for changes in props
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    // Only update if the new filters are different from current
    const current = localFilters.value
    const hasChanges = Object.keys(newFilters).some(key =>
      current[key] !== newFilters[key]
    )
    if (hasChanges) {
      localFilters.value = { ...current, ...newFilters }
    }
  }
}, { deep: true })

// Handle filter changes
function handleFilterChange() {
  emit('filter-change')
}

// Handle sort option selection
function selectSortOption(value) {
  if (localFilters.value) {
    localFilters.value[props.sortField] = value
    showSortOptions.value = false
    handleFilterChange()
  }
}

// Apply filters
function applyFilters() {
  // Clean up empty values
  const cleanFilters = {}
  if (localFilters.value) {
    Object.keys(localFilters.value).forEach(key => {
      const value = localFilters.value[key]
      if (value !== '' && value !== null && value !== undefined) {
        cleanFilters[key] = value
      }
    })
  }
  
  emit('update:filters', cleanFilters)
}

// Reset filters
function resetFilters() {
  if (props.resetFunction) {
    props.resetFunction()
  } else {
    localFilters.value = {
      [props.searchField]: '',
      [props.sortField]: ''
    }
    applyFilters()
  }
}

// Expose functions for parent component
defineExpose({
  localFilters,
  showAdvancedFilters,
  showSortOptions,
  handleFilterChange,
  applyFilters,
  resetFilters
})
</script>