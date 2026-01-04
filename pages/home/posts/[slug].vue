<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <LoadingSpinner size="lg" />
        <p class="mt-4 text-gray-600">Đang tải bài viết...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="max-w-md w-full mx-auto text-center">
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <!-- Error Icon -->
          <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          
          <!-- Error Message -->
          <h3 class="text-xl font-bold text-gray-900 mb-2">Không thể tải bài viết</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink 
              to="/home/posts"
              class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Quay lại danh sách
            </NuxtLink>
            
            <button 
              @click="loadPost"
              class="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="bg-white">
      <!-- Hero Section -->
      <div class="relative h-96 lg:h-[500px]">
        <img 
          :src="getPostImage(post)" 
          :alt="post.title || 'Bài viết'"
          class="w-full h-full object-cover"
          @error="handleImageError"
        >
        <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center text-white max-w-4xl mx-auto px-4">
            <div class="flex items-center justify-center space-x-4 mb-4">
              <span v-if="postCategory" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                {{ postCategory.name }}
              </span>
              <time :datetime="post.created_at" class="text-sm">{{ formatDate(post.created_at) }}</time>
              <span class="text-sm">{{ post.read_time || '5 phút đọc' }}</span>
            </div>
            <h1 class="text-4xl lg:text-6xl font-bold mb-4 leading-tight">{{ post.title }}</h1>
            <p v-if="post.excerpt" class="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">{{ post.excerpt }}</p>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Author Info -->
        <div class="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
          <div class="flex items-center space-x-4">
            <img 
              :src="post.author?.avatar || '/avatar-placeholder.jpg'" 
              :alt="post.author?.name || 'Admin'"
              class="h-12 w-12 rounded-full"
            >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ post.author?.name || 'Admin' }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(post.created_at) }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-6 text-sm text-gray-500">
            <span class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              {{ post.views || post.view_count || 0 }} lượt xem
            </span>
            <button class="flex items-center hover:text-red-500 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              {{ post.likes || post.like_count || 0 }} lượt thích
            </button>
            <button class="flex items-center hover:text-blue-500 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>

        <!-- Post Content -->
        <div class="prose prose-lg max-w-none mb-12">
          <HtmlContent :content="post.content || post.body || ''" />
        </div>

        <!-- Tags -->
        <div v-if="postTags && postTags.length > 0" class="border-t border-gray-200 pt-6 mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Tags:</h3>
          <div class="flex flex-wrap gap-2">
            <NuxtLink 
              v-for="tag in postTags" 
              :key="tag.id"
              :to="`/home/posts/tag/${tag.slug || tag.id}`"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              #{{ tag.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between border-t border-gray-200 pt-6">
          <NuxtLink 
            v-if="previousPost"
            :to="`/home/posts/${previousPost.slug || previousPost.id}`"
            class="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span class="hidden sm:inline">Bài viết trước</span>
            <span class="sm:hidden">Trước</span>
          </NuxtLink>
          <div v-else></div>

          <NuxtLink 
            to="/home/posts"
            class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Danh sách bài viết
          </NuxtLink>

          <NuxtLink 
            v-if="nextPost"
            :to="`/home/posts/${nextPost.slug || nextPost.id}`"
            class="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span class="hidden sm:inline">Bài viết tiếp theo</span>
            <span class="sm:hidden">Tiếp</span>
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
          <div v-else></div>
        </div>
      </div>

      <!-- Related Posts -->
      <div class="bg-gray-50 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Bài viết liên quan</h2>
          
          <!-- Có bài viết liên quan -->
          <div v-if="relatedPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article 
              v-for="relatedPost in relatedPosts" 
              :key="relatedPost.id"
              class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <img 
                :src="getPostImage(relatedPost)" 
                :alt="relatedPost.title || 'Bài viết'"
                class="w-full h-48 object-cover"
                @error="handleImageError"
              >
              <div class="p-6">
                <div class="flex items-center text-sm text-gray-500 mb-2">
                  <span v-if="relatedPost.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                    {{ relatedPost.category.name }}
                  </span>
                  <time :datetime="relatedPost.created_at">
                    {{ formatDate(relatedPost.created_at) }}
                  </time>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  <NuxtLink 
                    :to="`/home/posts/${relatedPost.slug || relatedPost.id}`"
                    class="hover:text-blue-600 transition-colors"
                  >
                    {{ relatedPost.title || 'Không có tiêu đề' }}
                  </NuxtLink>
                </h3>
                <p class="text-gray-600 line-clamp-3">
                  {{ relatedPost.excerpt || relatedPost.description || (relatedPost.content ? formatExcerpt(relatedPost.content) : '') || 'Không có mô tả' }}
                </p>
              </div>
            </article>
          </div>
          
          <!-- Không có bài viết liên quan -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết liên quan</h3>
            <p class="text-gray-600 mb-6">Hiện tại chưa có bài viết nào khác trong danh mục này.</p>
            <NuxtLink 
              to="/home/posts"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Xem tất cả bài viết
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalApiClient } from '~/composables/api'
import { publicEndpoints } from '~/api/endpoints'
import HtmlContent from '@/components/Core/Content/HtmlContent.vue'
import LoadingSpinner from '~/components/Core/Loading/LoadingSpinner.vue'
import { formatDate } from '@/utils/formatters'
import { useSeo } from '@/composables/seo'

definePageMeta({
  layout: 'home'
})

const route = useRoute()
const { apiClient } = useGlobalApiClient()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const post = ref<any>(null)
const postCategory = ref<any>(null)
const postTags = ref<any[]>([])
const relatedPosts = ref<any[]>([])
const previousPost = ref<any>(null)
const nextPost = ref<any>(null)

// Computed
const postSlug = computed(() => route.params.slug as string)

// Hàm format excerpt đơn giản
const formatExcerpt = (text: string, maxLength: number = 150) => {
  if (!text) return ''
  const cleanText = text.replace(/<[^>]*>/g, '') // Remove HTML tags
  return cleanText.length > maxLength 
    ? cleanText.substring(0, maxLength) + '...'
    : cleanText
}

// Fetch post by slug
const fetchPostBySlug = async (slug: string) => {
  try {
    const response = await apiClient.get(publicEndpoints.posts.showBySlug(slug))
    
    if (!response || !response.data) {
      return null
    }

    const responseData = response.data
    
    // Handle API response format: { success: true, data: {...}, ... }
    let data: any = null
    
    if (responseData.success === false) {
      throw new Error(responseData.message || 'Không thể tải bài viết')
    }
    
    // Extract post data from response
    if (responseData.data) {
      data = responseData.data
    } else if (responseData.id || responseData.slug || responseData.title) {
      data = responseData
    } else {
      return null
    }

    return data
  } catch (err: any) {
    console.error('Error fetching post:', err)
    return null
  }
}

// Fetch related posts
const fetchRelatedPosts = async (postId: number, categorySlug?: string, limit: number = 3) => {
  try {
    const params: any = {
      limit: limit + 1 // Fetch one extra to exclude current post
    }
    
    if (categorySlug) {
      params.category_slug = categorySlug
    }

    const response = await apiClient.get(publicEndpoints.posts.list, { params })
    
    if (!response || !response.data) {
      return []
    }

    const responseData = response.data
    let posts: any[] = []
    
    if (responseData.success === false) {
      return []
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      posts = responseData.data
    } else if (Array.isArray(responseData)) {
      posts = responseData
    }

    // Filter out current post
    return posts.filter(p => p.id !== postId).slice(0, limit)
  } catch (err) {
    console.error('Error fetching related posts:', err)
    return []
  }
}

// Fetch category by ID or slug
const fetchCategory = async (categoryId?: number, categorySlug?: string) => {
  if (!categoryId && !categorySlug) return null
  
  try {
    let response
    if (categorySlug) {
      response = await apiClient.get(publicEndpoints.postCategories.showBySlug(categorySlug))
    } else if (categoryId) {
      // Try to get from list first
      const listResponse = await apiClient.get(publicEndpoints.postCategories.list)
      if (listResponse?.data?.data) {
        const categories = listResponse.data.data
        return categories.find((c: any) => c.id === categoryId) || null
      }
    }
    
    if (response?.data?.data) {
      return response.data.data
    }
    return null
  } catch (err) {
    return null
  }
}

// Load post
const loadPost = async () => {
  loading.value = true
  error.value = null
  
  try {
    const slug = postSlug.value
    if (!slug) {
      error.value = 'Slug không hợp lệ'
      return
    }

    const fetchedPost = await fetchPostBySlug(slug)
    
    if (!fetchedPost) {
      error.value = 'Bài viết không tồn tại'
      return
    }
    
    post.value = fetchedPost

    // Fetch category
    if (fetchedPost.category_id) {
      postCategory.value = await fetchCategory(fetchedPost.category_id)
    } else if (fetchedPost.category?.slug) {
      postCategory.value = await fetchCategory(undefined, fetchedPost.category.slug)
    } else if (fetchedPost.category) {
      postCategory.value = fetchedPost.category
    }

    // Set tags
    if (fetchedPost.tags && Array.isArray(fetchedPost.tags)) {
      postTags.value = fetchedPost.tags
    } else {
      postTags.value = []
    }

    // Load related posts
    if (postCategory.value?.slug) {
      relatedPosts.value = await fetchRelatedPosts(
        fetchedPost.id,
        postCategory.value.slug,
        3
      )
    } else {
      relatedPosts.value = []
    }

    // SEO cho trang chi tiết bài viết
    const seoTitle =
      fetchedPost.meta_title ||
      fetchedPost.title ||
      'Bài viết'

    const seoDescription =
      fetchedPost.meta_description ||
      fetchedPost.excerpt ||
      (fetchedPost.content ? formatExcerpt(fetchedPost.content, 160) : '') ||
      'Đọc bài viết chi tiết trên blog của chúng tôi.'

    const seoImage = getPostImage(fetchedPost)

    useSeo({
      title: seoTitle,
      description: seoDescription,
      image: seoImage,
      type: 'article',
      url: `/home/posts/${fetchedPost.slug || slug}`,
      publishedTime: fetchedPost.created_at,
      modifiedTime: fetchedPost.updated_at || fetchedPost.created_at,
      author: fetchedPost.author?.name,
      tags: Array.isArray(fetchedPost.tags) ? fetchedPost.tags.map((t: any) => t.name) : undefined
    })

  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || 'Không thể tải bài viết. Vui lòng thử lại sau.'
    error.value = errorMessage
  } finally {
    loading.value = false
  }
}

// Helper function để lấy ảnh với fallback
const getPostImage = (post: any): string => {
  if (!post) return '/default.svg'
  
  // Thử các trường có thể chứa ảnh
  const imageUrl = post.featured_image || 
                   post.image || 
                   post.thumbnail || 
                   post.cover_image ||
                   ''
  
  // Nếu có URL và hợp lệ, trả về
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
    return imageUrl
  }
  
  // Trả về ảnh mặc định
  return '/default.svg'
}

// Xử lý lỗi ảnh
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target && target.src !== '/default.svg') {
    target.src = '/default.svg'
  }
}

onMounted(async () => {
  await loadPost()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  @apply text-gray-900;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900 font-bold;
}

.prose p {
  @apply text-gray-700 leading-relaxed;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic text-gray-700;
}

.prose ul, .prose ol {
  @apply text-gray-700;
}

.prose li {
  @apply mb-2;
}

.prose img {
  @apply rounded-lg shadow-md;
}

.prose code {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto;
}
</style>
