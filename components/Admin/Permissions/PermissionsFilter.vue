<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort_by"
    search-field="search"
    search-placeholder="Tìm theo mã code, tên quyền..."
    :has-advanced-filters="true"
    @update:filters="applyFilters"
    @filter-change="handleFilterChange"
  >
    <template #advanced-filters="{ filters, onChange }">
      <!-- Trạng thái -->
      <SelectFilter
        v-model="filters.status"
        :options="statusOptions"
        placeholder="Tất cả trạng thái"
        @update:model-value="onChange"
      />
    </template>
  </AdminFilter>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  statusEnums: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters'])

// Options for select filters
const statusOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  if (props.statusEnums && Array.isArray(props.statusEnums)) {
    props.statusEnums.forEach(item => {
      options.push({
        value: item.value,
        label: item.label || item.name
      })
    })
  }
  return options
})

const sortOptions = [
  { value: 'code:asc', label: 'Mã code (A-Z)' },
  { value: 'code:desc', label: 'Mã code (Z-A)' },
  { value: 'name:asc', label: 'Tên (A-Z)' },
  { value: 'name:desc', label: 'Tên (Z-A)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' }
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