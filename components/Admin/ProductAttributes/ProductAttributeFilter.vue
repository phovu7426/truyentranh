<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    @update:filters="applyFilters"
    @filter-change="handleFilterChange"
  >
    <template #advanced-filters="{ filters, onChange }">
      <!-- Bắt buộc -->
      <SelectFilter
        v-model="filters['filters[is_required]']"
        :options="requiredOptions"
        placeholder="Tất cả"
        @update:model-value="onChange"
      />
      
      <!-- Là biến thể -->
      <SelectFilter
        v-model="filters['filters[is_variation]']"
        :options="variationOptions"
        placeholder="Là biến thể"
        @update:model-value="onChange"
      />
      
      <!-- Kèm giá trị -->
      <SelectFilter
        v-model="filters['filters[include_values]']"
        :options="includeValuesOptions"
        placeholder="Kèm giá trị"
        @update:model-value="onChange"
      />
    </template>
    
    <template #main-filters="{ filters, onChange }">
      <!-- Trạng thái -->
      <SelectFilter
        v-model="filters['filters[status]']"
        :options="statusOptions"
        label-field="label"
        value-field="value"
        placeholder="Tất cả trạng thái"
        @update:model-value="onChange"
      />

      <!-- Loại -->
      <SelectFilter
        v-model="filters['filters[type]']"
        :options="typeOptions"
        label-field="label"
        value-field="value"
        placeholder="Tất cả loại"
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
  },
  typeEnums: {
    type: Array,
    default: () => []
  }
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

const requiredOptions = [
	{ value: '', label: 'Tất cả' },
	{ value: 'true', label: 'Bắt buộc' },
	{ value: 'false', label: 'Không bắt buộc' }
]

const variationOptions = [
	{ value: '', label: 'Tất cả' },
	{ value: 'true', label: 'Có' },
	{ value: 'false', label: 'Không' }
]

const includeValuesOptions = [
	{ value: '', label: 'Tất cả' },
	{ value: 'true', label: 'Có kèm giá trị' },
	{ value: 'false', label: 'Không kèm giá trị' }
]

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

// Apply filters
function applyFilters(cleanFilters) {
  emit('update:filters', cleanFilters)
}
</script>
