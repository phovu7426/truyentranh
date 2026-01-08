<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sort"
    search-field="q"
    search-placeholder="Tìm theo tên, code..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Bộ lọc chính -->
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

      <!-- Hiển thị trong menu -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters['filters[show_in_menu]']"
          :options="showInMenuOptions"
          placeholder="Hiển thị trong menu"
          @update:model-value="onChange"
        />
      </div>
    </template>

    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Menu cha -->
      <div>
        <SelectFilter
          v-model="filters['filters[parent_id]']"
          :options="parentMenuOptions"
          placeholder="Chọn menu cha"
          @update:model-value="onChange"
        />
      </div>

      <!-- Loại menu -->
      <div>
        <SelectFilter
          v-model="filters['filters[type]']"
          :options="typeOptions"
          placeholder="Chọn loại menu"
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
  parentMenus: {
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

const parentMenuOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }, { value: 'null', label: 'Root (Không có menu cha)' }]
  if (props.parentMenus && Array.isArray(props.parentMenus)) {
    const flattenMenus = (menus, level = 0) => {
      const result = []
      menus.forEach(menu => {
        const prefix = '  '.repeat(level)
        result.push({
          value: menu.id,
          label: `${prefix}${menu.name}`
        })
        if (menu.children && menu.children.length > 0) {
          result.push(...flattenMenus(menu.children, level + 1))
        }
      })
      return result
    }
    options.push(...flattenMenus(props.parentMenus))
  }
  return options
})

const showInMenuOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Hiển thị' },
  { value: 'false', label: 'Ẩn' }
]

const typeOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'route', label: 'Route' },
  { value: 'group', label: 'Group' },
  { value: 'link', label: 'Link' }
]

const sortOptions = [
  { value: 'sort_order:ASC', label: 'Thứ tự (tăng dần)' },
  { value: 'sort_order:DESC', label: 'Thứ tự (giảm dần)' },
  { value: 'name:ASC', label: 'Tên (A-Z)' },
  { value: 'name:DESC', label: 'Tên (Z-A)' },
  { value: 'created_at:ASC', label: 'Ngày tạo (cũ nhất)' },
  { value: 'created_at:DESC', label: 'Ngày tạo (mới nhất)' }
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




