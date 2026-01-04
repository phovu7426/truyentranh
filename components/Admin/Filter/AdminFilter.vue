<template>
  <BaseFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    :sort-field="sortField"
    :search-field="searchField"
    :search-placeholder="searchPlaceholder"
    :show-search="showSearch"
    :has-advanced-filters="hasAdvancedFilters"
    :has-sort-options="hasSortOptions"
    :reset-function="resetFunction"
    @update:filters="emit('update:filters', $event)"
    @filter-change="emit('filter-change')"
  >
    <template #advanced-filters="slotProps">
      <slot name="advanced-filters" v-bind="slotProps" />
    </template>
    <template #main-filters="slotProps">
      <slot name="main-filters" v-bind="slotProps" />
    </template>
    <template #additional-content>
      <slot name="additional-content" />
    </template>
    <template #content>
      <slot name="content" />
    </template>
  </BaseFilter>
</template>

<script setup>
import BaseFilter from '@/components/Admin/Filter/BaseFilter.vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
  sortOptions: {
    type: Array,
    default: () => [],
  },
  sortField: {
    type: String,
    default: 'sort',
  },
  searchField: {
    type: String,
    default: 'search',
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  hasAdvancedFilters: {
    type: Boolean,
    default: false,
  },
  hasSortOptions: {
    type: Boolean,
    default: true,
  },
  resetFunction: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['update:filters', 'filter-change'])
</script>