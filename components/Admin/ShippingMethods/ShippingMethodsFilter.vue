<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tên, mã code..."
    :has-advanced-filters="false"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Các bộ lọc chính -->
    <template #main-filters="{ filters, onChange }">
      <!-- Có thể thêm các filter khác ở đây nếu cần -->
    </template>
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
  { value: 'code:asc', label: 'Mã code (A-Z)' },
  { value: 'code:desc', label: 'Mã code (Z-A)' },
  { value: 'base_cost:asc', label: 'Chi phí tăng dần' },
  { value: 'base_cost:desc', label: 'Chi phí giảm dần' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'updated_at:asc', label: 'Ngày cập nhật (cũ nhất)' },
  { value: 'updated_at:desc', label: 'Ngày cập nhật (mới nhất)' }
]

function handleFilterChange() {
  // Có thể debounce ở đây nếu cần
}

function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}
</script>


