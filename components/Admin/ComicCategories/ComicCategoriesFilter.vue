<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tên danh mục..."
    :has-advanced-filters="false"
    @update:filters="applyFilters"
    @filter-change="handleFilterChange"
  >
  </AdminFilter>
</template>

<script setup>
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:filters'])

const sortOptions = [
  { value: 'created_at:DESC', label: 'Mới nhất' },
  { value: 'created_at:ASC', label: 'Cũ nhất' },
  { value: 'name:ASC', label: 'Tên (A-Z)' },
  { value: 'name:DESC', label: 'Tên (Z-A)' }
]

// Handle filter changes
function handleFilterChange() {
  // Debounce could be added here if needed
}

// Apply filters
function applyFilters(cleanFilters) {
  emit('update:filters', cleanFilters)
}
</script>



