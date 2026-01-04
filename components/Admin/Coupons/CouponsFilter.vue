<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sortBy"
    sort-order-field="sortOrder"
    search-field="search"
    search-placeholder="Tìm theo mã, tên..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Các bộ lọc chính -->
    <template #main-filters="{ filters, onChange }">
      <!-- Trạng thái -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Chọn trạng thái"
          @update:model-value="onChange"
        />
      </div>

      <!-- Loại -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.type"
          :options="typeOptions"
          placeholder="Chọn loại"
          @update:model-value="onChange"
        />
      </div>
    </template>
  </AdminFilter>
</template>

<script setup>
import { computed } from 'vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  statusEnums: {
    type: Array,
    default: () => []
  },
  typeEnums: {
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

const typeOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  if (props.typeEnums && Array.isArray(props.typeEnums)) {
    props.typeEnums.forEach(item => {
      options.push({
        value: item.value,
        label: item.label || item.name
      })
    })
  }
  return options
})

const sortOptions = [
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'code:asc', label: 'Mã (A-Z)' },
  { value: 'code:desc', label: 'Mã (Z-A)' },
  { value: 'name:asc', label: 'Tên (A-Z)' },
  { value: 'name:desc', label: 'Tên (Z-A)' },
  { value: 'used_count:desc', label: 'Sử dụng nhiều nhất' },
  { value: 'used_count:asc', label: 'Sử dụng ít nhất' }
]

function handleFilterChange() {
  // Có thể debounce ở đây nếu cần
}

function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}
</script>

