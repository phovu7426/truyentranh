<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :show-search="false"
    @update:filters="emitFilters"
  >
    <template #main-filters="{ filters, onChange }">
      <div class="flex flex-1 items-center gap-4 w-full flex-wrap md:flex-nowrap">
        <div class="flex-1 min-w-[180px]">
          <TextFilter
            v-model="filters.search"
            placeholder="Tìm kiếm theo giá trị..."
            @update:model-value="value => handleFieldChange(filters, 'search', value, onChange)"
          />
        </div>
        <div class="flex-1 min-w-[160px]">
          <SelectFilter
            v-model="filters['filters[product_attribute_id]']"
            :options="attributeOptions"
            placeholder="Thuộc tính"
            @update:model-value="value => handleFieldChange(filters, 'filters[product_attribute_id]', value, onChange)"
          />
        </div>
        <div class="flex-1 min-w-[160px]">
          <SelectFilter
            v-model="filters['filters[status]']"
            :options="statusOptionsInternal"
            placeholder="Trạng thái"
            @update:model-value="value => handleFieldChange(filters, 'filters[status]', value, onChange)"
          />
        </div>
        <div class="flex-1 min-w-[160px]">
          <SelectFilter
            v-model="filters['filters[include_deleted]']"
            :options="includeDeletedOptions"
            placeholder="Chọn dữ liệu"
            @update:model-value="value => handleFieldChange(filters, 'filters[include_deleted]', value, onChange)"
          />
        </div>
      </div>
    </template>
  </AdminFilter>
</template>

<script setup>
import { computed } from 'vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'
import TextFilter from '@/components/Core/Filter/TextFilter.vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  attributeEnums: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters'])

const attributeOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả thuộc tính' }]
  if (props.attributeEnums && Array.isArray(props.attributeEnums)) {
    props.attributeEnums.forEach(item => {
      options.push({
        value: item.id,
        label: item.name
      })
    })
  }
  return options
})

const statusOptionsInternal = computed(() => {
  if (!props.statusOptions || !props.statusOptions.length) {
    return [
      { value: '', label: 'Tất cả trạng thái' },
      { value: 'active', label: 'Hoạt động' },
      { value: 'inactive', label: 'Ngưng hoạt động' }
    ]
  }
  return [{ value: '', label: 'Tất cả trạng thái' }, ...props.statusOptions]
})

const includeDeletedOptions = [
  { value: '', label: 'Chỉ bản đang hoạt động' },
  { value: 'true', label: 'Bao gồm bản đã xóa' }
]

function handleFieldChange(filterState, key, value, onChange) {
  if (!filterState) return
  filterState[key] = value
  if (typeof onChange === 'function') {
    onChange()
  }
}

function emitFilters(cleanFilters) {
  emit('update:filters', cleanFilters)
}
</script>
