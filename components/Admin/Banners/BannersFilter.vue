<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tiêu đề..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Bao gồm đã xóa -->
      <div>
        <SelectFilter
          v-model="filters.include_deleted"
          :options="includeDeletedOptions"
          placeholder="Bao gồm đã xóa"
          @update:model-value="onChange"
        />
      </div>
    </template>

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

      <!-- Vị trí banner -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.location_id"
          :options="locationOptions"
          placeholder="Chọn vị trí"
          @update:model-value="onChange"
        />
      </div>
    </template>
  </AdminFilter>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  locationEnums: {
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

const locationOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  if (props.locationEnums && Array.isArray(props.locationEnums)) {
    props.locationEnums.forEach(item => {
      options.push({
        value: item.id,
        label: item.name
      })
    })
  }
  return options
})

const includeDeletedOptions = [
  { value: '', label: 'Mặc định' },
  { value: 'true', label: 'Bao gồm đã xóa' },
  { value: 'false', label: 'Chỉ chưa xóa' }
]

const sortOptions = [
  { value: 'title:asc', label: 'Tiêu đề (A-Z)' },
  { value: 'title:desc', label: 'Tiêu đề (Z-A)' },
  { value: 'sort_order:asc', label: 'Thứ tự (tăng dần)' },
  { value: 'sort_order:desc', label: 'Thứ tự (giảm dần)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'updated_at:asc', label: 'Ngày cập nhật (cũ nhất)' },
  { value: 'updated_at:desc', label: 'Ngày cập nhật (mới nhất)' }
]

// Handle filter changes
function handleFilterChange() {
  // Debounce could be added here if needed
}

// Handle update filters
function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}

// Nếu cần custom reset, có thể implement từ parent bằng cách truyền resetFunction cho AdminFilter
</script>