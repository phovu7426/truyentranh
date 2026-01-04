<template>
  <div>
    <button
      @click="selectCategory(category.id)"
      :class="selectedCategory === category.id ? 'bg-blue-100 text-blue-700 border-blue-200' : 'hover:bg-gray-100'"
      class="w-full text-left px-3 py-2 text-sm transition-colors rounded-md flex items-center border border-transparent"
      :style="getPaddingStyle()"
    >
      <svg class="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
      <span class="flex-1 truncate">{{ category.name }}</span>
      <span v-if="category.product_count" class="text-xs text-gray-500 ml-2 flex-shrink-0">({{ category.product_count }})</span>
    </button>
    
    <!-- Render children recursively -->
    <template v-if="category.children && category.children.length > 0">
      <CategoryTreeItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :selected-category="selectedCategory"
        :level="level + 1"
        @select-category="selectCategory"
      />
    </template>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  selectedCategory: {
    type: [String, Number],
    default: ''
  },
  level: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select-category'])

const selectCategory = (categoryId) => {
  emit('select-category', categoryId)
}

const getPaddingStyle = () => {
  return {
    paddingLeft: `${(props.level * 20) + 8}px`
  }
}

</script>