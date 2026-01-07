<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tiêu đề chương..."
    :has-advanced-filters="false"
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

      <!-- Truyện -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters['filters[comic_id]']"
          :options="comicOptions"
          placeholder="Chọn truyện"
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
  comicEnums: {
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

const comicOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  if (props.comicEnums && Array.isArray(props.comicEnums)) {
    props.comicEnums.forEach(item => {
      options.push({
        value: item.id,
        label: item.title || item.name
      })
    })
  }
  return options
})

const sortOptions = [
  { value: 'chapter_index:ASC', label: 'Số chương (tăng dần)' },
  { value: 'chapter_index:DESC', label: 'Số chương (giảm dần)' },
  { value: 'created_at:DESC', label: 'Mới nhất' },
  { value: 'created_at:ASC', label: 'Cũ nhất' },
  { value: 'title:ASC', label: 'Tiêu đề (A-Z)' },
  { value: 'title:DESC', label: 'Tiêu đề (Z-A)' }
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



