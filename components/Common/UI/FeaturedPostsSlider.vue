<template>
  <BaseSlider
    :title="title"
    :subtitle="subtitle"
    icon="default"
    :show-navigation="true"
    :show-view-all="showViewAll"
    :show-progress="false"
    :item-width="{
      mobile: 300,
      small: 350,
      medium: 380,
      large: 400
    }"
    @view-all="$emit('viewAll')"
  >
    <div
      v-for="post in posts"
      :key="post.id"
      class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex-shrink-0"
      :style="getItemStyle()"
      @click="handleViewPost(post)"
    >
      <!-- Featured Badge -->
      <div v-if="post.is_featured || post.featured" class="absolute top-4 right-4 z-10">
        <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
          Nổi bật
        </span>
      </div>
      
      <!-- Post Image -->
      <div class="relative w-full h-48 overflow-hidden">
        <img
          v-if="post.cover_image || post.image"
          :src="post.cover_image || post.image"
          :alt="post.name"
          class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          @error="handleImageError"
          loading="lazy"
        />
        <img
          v-else
          src="/default.svg"
          alt="Không có hình ảnh"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <!-- Post Content -->
      <div class="p-5">
        <!-- Category Badge -->
        <div v-if="post.primary_category" class="mb-2">
          <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {{ post.primary_category.name }}
          </span>
        </div>
        
        <!-- Post Title -->
        <h3 class="text-lg font-bold mb-2 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors">
          {{ post.name }}
        </h3>
        
        <!-- Post Excerpt -->
        <p v-if="post.excerpt" class="text-sm text-gray-600 mb-4 line-clamp-3">
          {{ formatExcerpt(post.excerpt) }}
        </p>
        
        <!-- Post Meta -->
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span v-if="post.published_at">{{ formatDate(post.published_at) }}</span>
          <span v-if="post.view_count" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ post.view_count }}
          </span>
        </div>
      </div>
    </div>
  </BaseSlider>
</template>

<script setup lang="ts">
import BaseSlider from './BaseSlider.vue'

interface Post {
  id: string | number
  name: string
  slug?: string
  excerpt?: string
  cover_image?: string
  image?: string
  published_at?: string
  view_count?: number
  is_featured?: boolean
  featured?: boolean
  primary_category?: {
    id: string | number
    name: string
    slug?: string
  }
}

interface Props {
  posts: Post[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tin tức nổi bật',
  subtitle: 'Những bài viết được đánh giá cao và nhiều người đọc',
  showViewAll: true
})

const emit = defineEmits<{
  viewPost: [post: Post]
  viewAll: []
}>()

const formatExcerpt = (text: string, maxLength = 120): string => {
  if (!text) return ''
  const cleanText = text.replace(/<[^>]*>/g, '') // Remove HTML tags
  return cleanText.length > maxLength 
    ? cleanText.substring(0, maxLength) + '...'
    : cleanText
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
  img.className = 'w-full h-full object-cover'
}

const getItemStyle = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  
  if (width < 640) {
    return { width: '300px', minWidth: '300px' }
  } else if (width < 768) {
    return { width: '350px', minWidth: '350px' }
  } else if (width < 1024) {
    return { width: '380px', minWidth: '380px' }
  } else {
    return { width: '400px', minWidth: '400px' }
  }
}

const handleViewPost = (post: Post) => {
  emit('viewPost', post)
}
</script>

<style scoped>
/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
