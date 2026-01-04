<template>
  <div class="w-full">
    <BaseSlider
      title="Danh mục sản phẩm"
      subtitle="Khám phá các danh mục sản phẩm đa dạng"
      icon="category"
      :item-width="{
        mobile: 110,
        small: 120,
        medium: 130,
        large: 140
      }"
      navigation-button-class="md:-translate-y-1/2 translate-y-0"
      container-class="pb-2"
    >
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
        :style="getItemStyle()"
        @click="selectCategory(category)"
      >
        <div class="w-12 h-12 mb-2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-200">
          <img 
            v-if="category.image" 
            :src="category.image" 
            :alt="category.name"
            class="w-8 h-8 object-cover rounded-full"
            @error="handleImageError"
          />
          <svg 
            v-else
            xmlns="http://www.w3.org/2000/svg" 
            class="h-6 w-6 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span class="text-xs font-medium text-gray-700 text-center group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
          {{ category.name }}
        </span>
        <span v-if="category.product_count !== undefined" class="text-xs text-gray-500 mt-1">
          {{ category.product_count }} sản phẩm
        </span>
      </div>
    </BaseSlider>
  </div>
</template>

<script setup lang="ts">
import BaseSlider from '@/components/Common/UI/BaseSlider.vue'

interface Category {
  id: string | number
  name: string
  slug?: string
  image?: string
  product_count?: number
}

interface Props {
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  categorySelected: [category: Category]
  viewAllCategories: []
}>()

const selectCategory = (category: Category) => {
  emit('categorySelected', category)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const getItemStyle = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  
  if (width < 640) {
    return { width: '110px', minWidth: '110px' }
  } else if (width < 768) {
    return { width: '120px', minWidth: '120px' }
  } else if (width < 1024) {
    return { width: '130px', minWidth: '130px' }
  } else {
    return { width: '140px', minWidth: '140px' }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>