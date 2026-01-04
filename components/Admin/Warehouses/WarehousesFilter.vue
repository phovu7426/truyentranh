<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sortBy"
    sort-order-field="sortOrder"
    search-field="search"
    search-placeholder="Tìm theo mã, tên kho..."
    :has-advanced-filters="false"
    @update:filters="handleUpdateFilters"
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
  { value: 'name:asc', label: 'Tên (A-Z)' },
  { value: 'name:desc', label: 'Tên (Z-A)' },
  { value: 'code:asc', label: 'Mã (A-Z)' },
  { value: 'code:desc', label: 'Mã (Z-A)' },
  { value: 'priority:desc', label: 'Độ ưu tiên (cao nhất)' },
  { value: 'priority:asc', label: 'Độ ưu tiên (thấp nhất)' },
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' }
]

function handleFilterChange() {
  // Có thể debounce ở đây nếu cần
}

function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}
</script>

