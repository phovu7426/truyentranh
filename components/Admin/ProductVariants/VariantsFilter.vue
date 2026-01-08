<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="search"
    search-placeholder="Tìm theo tên biến thể, SKU..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Bao gồm đã xóa -->
      <div>
        <SelectFilter
          v-model="filters['filters[include_deleted]']"
          :options="includeDeletedOptions"
          placeholder="Bao gồm đã xóa"
          @update:model-value="onChange"
        />
      </div>

      <!-- Lọc theo tồn kho thấp -->
      <div>
        <SelectFilter
          v-model="filters['filters[low_stock_only]']"
          :options="booleanOptions"
          placeholder="Chỉ tồn kho thấp"
          @update:model-value="onChange"
        />
      </div>

      <!-- Theo dõi tồn kho -->
      <div>
        <SelectFilter
          v-model="filters['filters[track_inventory]']"
          :options="booleanOptions"
          placeholder="Theo dõi tồn kho"
          @update:model-value="onChange"
        />
      </div>
    </template>

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

      <!-- Sản phẩm cha -->
      <div class="min-w-[180px]">
        <SelectFilter
          v-model="filters['filters[product_id]']"
          :options="productOptions"
          placeholder="Chọn sản phẩm"
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
  productEnums: {
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

const productOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả sản phẩm' }]
  if (props.productEnums && Array.isArray(props.productEnums)) {
    props.productEnums.forEach(item => {
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

const booleanOptions = [
  { value: '', label: 'Mặc định' },
  { value: 'true', label: 'Có' },
  { value: 'false', label: 'Không' }
]

const sortOptions = [
  { value: 'name:asc', label: 'Tên (A-Z)' },
  { value: 'name:desc', label: 'Tên (Z-A)' },
  { value: 'price:asc', label: 'Giá tăng dần' },
  { value: 'price:desc', label: 'Giá giảm dần' },
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