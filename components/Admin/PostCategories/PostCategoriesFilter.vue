<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort_by"
    search-field="search"
    search-placeholder="Tìm theo tên danh mục..."
    :has-advanced-filters="true"
    @update:filters="applyFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Các bộ lọc chính -->
    <template #main-filters="{ filters, onChange }">
      <!-- Trạng thái -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters['filters[status]']"
          :options="statusOptions"
          placeholder="Chọn trạng thái"
          @update:model-value="onChange"
        />
      </div>
    </template>

    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Có thể thêm các filter nâng cao khác ở đây nếu cần -->
    </template>
  </AdminFilter>
</template>

<script setup>
import { computed } from 'vue'
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
  { value: 'created_at_desc', label: 'Mới nhất' },
  { value: 'created_at_asc', label: 'Cũ nhất' },
  { value: 'name_asc', label: 'Tên (A-Z)' },
  { value: 'name_desc', label: 'Tên (Z-A)' }
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