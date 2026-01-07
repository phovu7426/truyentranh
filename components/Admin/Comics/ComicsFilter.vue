<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tên truyện..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
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

      <!-- Danh mục -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters['filters[category_id]']"
          :options="categoryOptions"
          placeholder="Chọn danh mục"
          @update:model-value="onChange"
        />
      </div>
    </template>

    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Tác giả -->
      <div class="min-w-[150px]">
        <input
          v-model="filters['filters[author]']"
          type="text"
          placeholder="Tìm theo tác giả..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @input="onChange"
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
  categoryEnums: {
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

const categoryOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  if (props.categoryEnums && Array.isArray(props.categoryEnums)) {
    props.categoryEnums.forEach(item => {
      options.push({
        value: item.id,
        label: item.name
      })
    })
  }
  return options
})

const sortOptions = [
  { value: 'created_at:DESC', label: 'Mới nhất' },
  { value: 'created_at:ASC', label: 'Cũ nhất' },
  { value: 'title:ASC', label: 'Tên (A-Z)' },
  { value: 'title:DESC', label: 'Tên (Z-A)' }
]

// Handle filter changes
function handleFilterChange() {
  // Debounce could be added here if needed
}

// Handle update filters
function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}
</script>



