<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tên, slug, mô tả"
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Danh mục cha -->
      <div>
        <SelectFilter
          v-model="filters.parent_id"
          :options="parentOptions"
          label-field="name"
          value-field="id"
          placeholder="Tất cả danh mục cha"
          @update:model-value="onChange"
        />
      </div>
    </template>

    <!-- Các bộ lọc chính -->
    <template #main-filters="{ filters, onChange }">
      <!-- Tìm kiếm -->
      <div class="min-w-[200px]">
        <TextFilter
          v-model="filters.search"
          placeholder="Tìm theo tên, slug, mô tả"
          @update:model-value="onChange"
        />
      </div>
      <!-- Trạng thái -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.status"
          :options="statusOptions"
          label-field="label"
          value-field="value"
          placeholder="Tất cả trạng thái"
          @update:model-value="onChange"
        />
      </div>
    </template>
  </AdminFilter>
</template>

<script setup>
import { ref, computed } from 'vue'
import TextFilter from '@/components/Core/Filter/TextFilter.vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'

const props = defineProps({
  initialFilters: { type: Object, default: () => ({}) },
  statusEnums: { type: Array, default: () => [] },
  parentCategories: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:filters'])

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

const parentOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả danh mục cha', id: null }]
  // Thêm các danh mục gốc làm tùy chọn
  if (props.parentCategories && Array.isArray(props.parentCategories)) {
    props.parentCategories.forEach(item => {
      options.push({
        value: item.id,
        label: item.name,
        id: item.id
      })
    })
  }
  return options
})

const sortOptions = [
  { value: 'name:asc', label: 'Tên (A-Z)' },
  { value: 'name:desc', label: 'Tên (Z-A)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'sort_order:asc', label: 'Thứ tự (tăng dần)' },
  { value: 'sort_order:desc', label: 'Thứ tự (giảm dần)' }
]

// Handle filter changes
function handleFilterChange() {
  // Debounce could be added here if needed
}

// Handle update filters
function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}

// Nếu cần custom reset có thể emit filters rỗng từ parent, hiện tại dùng reset mặc định của AdminFilter
</script>



