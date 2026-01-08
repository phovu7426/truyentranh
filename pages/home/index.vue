<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Featured Comics Slider -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Truyện nổi bật</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ currentFeaturedIndex + 1 }} / {{ featuredComics.length }}</span>
            <button
              @click="prevFeatured"
              :disabled="currentFeaturedIndex === 0"
              class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              @click="nextFeatured"
              :disabled="currentFeaturedIndex === featuredComics.length - 1"
              class="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div class="flex space-x-6">
            <div class="w-32 h-48 bg-gray-200 rounded"></div>
            <div class="flex-1">
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div class="flex flex-wrap gap-2 mb-4">
                <div class="h-6 bg-gray-200 rounded w-20"></div>
                <div class="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="featuredComics.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div
            v-for="(comic, index) in featuredComics"
            :key="comic.id"
            v-show="index === currentFeaturedIndex"
            class="flex flex-col md:flex-row cursor-pointer hover:bg-gray-50 transition-colors"
            @click="goToComic(comic.slug)"
          >
            <div class="md:w-48 flex-shrink-0">
              <img
                :src="comic.cover_image || '/default.svg'"
                :alt="comic.title"
                class="w-full h-64 md:h-full object-cover"
                @error="handleImageError"
              />
            </div>
            <div class="flex-1 p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ comic.title }}</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="category in (comic.categories || []).slice(0, 5)"
                  :key="category.id"
                  class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {{ category.name }}
                </span>
              </div>
              <!-- Last Chapter -->
              <div v-if="comic.last_chapter" class="mb-4">
                <NuxtLink
                  :to="`/home/comics/${comic.slug}/chapters/${comic.last_chapter.id}`"
                  class="text-blue-600 hover:text-blue-700 font-medium text-sm block"
                  @click.stop
                >
                  {{ comic.last_chapter.title || `Chương ${comic.last_chapter.chapter_index}` }}
                </NuxtLink>
                <span v-if="comic.last_chapter.created_at" class="text-xs text-gray-500">
                  {{ formatDate(comic.last_chapter.created_at) }}
                </span>
              </div>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ formatNumber(comic.stats?.view_count || 0) }} lượt xem</span>
                <span>{{ comic.stats?.chapter_count || 0 }} chương</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filter Buttons -->
      <section class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Phân loại</h2>
          <NuxtLink
            to="/home/comics"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Tìm kiếm nâng cao
          </NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories.slice(0, 8)"
            :key="category.id"
            @click="filterByCategory(category.id)"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            {{ category.name }}
          </button>
          <NuxtLink
            to="/home/comics"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            Xem thêm
          </NuxtLink>
        </div>
      </section>

      <!-- Comics Grid -->
      <section class="mb-8">
        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="i in 12" :key="i" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="aspect-[3/4] bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="trendingComics.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ComicCard
            v-for="comic in trendingComics.slice(0, 30)"
            :key="comic.id"
            :comic="comic"
          />
        </div>
      </section>

      <!-- Latest Updates -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Mới Cập Nhật</h2>
          <NuxtLink
            to="/home/comics?sort_by=updated_at&sort_order=DESC"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            Xem tất cả
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <div v-if="loading" class="bg-white rounded-lg shadow-md p-4 space-y-3">
          <div v-for="i in 10" :key="i" class="flex items-center space-x-4 animate-pulse">
            <div class="w-16 h-24 bg-gray-200 rounded flex-shrink-0"></div>
            <div class="flex-1">
              <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>

        <div v-else-if="recentUpdateComics.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
          <div
            v-for="comic in recentUpdateComics.slice(0, 10)"
            :key="comic.id"
            class="flex items-center space-x-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer group"
            @click="goToComic(comic.slug)"
          >
            <img
              :src="comic.cover_image || '/default.svg'"
              :alt="comic.title"
              class="w-16 h-24 object-cover rounded flex-shrink-0"
              @error="handleImageError"
            />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                {{ comic.title }}
              </h3>
              <NuxtLink
                v-if="comic.last_chapter"
                :to="`/home/comics/${comic.slug}/chapters/${comic.last_chapter.id}`"
                class="text-blue-600 hover:text-blue-700 font-medium text-sm block mb-1"
                @click.stop
              >
                {{ comic.last_chapter.title || `Chương ${comic.last_chapter.chapter_index}` }}
              </NuxtLink>
              <div class="flex items-center space-x-3 text-xs text-gray-500">
                <span v-if="comic.last_chapter?.created_at">{{ formatDate(comic.last_chapter.created_at) }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                {{ formatNumber(comic.stats?.view_count || 0) }}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {{ comic.stats?.chapter_count || 0 }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Popular Comics -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Truyện Hot</h2>
          <NuxtLink
            to="/home/comics?sort_by=view_count&sort_order=DESC"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            Xem tất cả
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="i in 12" :key="i" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="aspect-[3/4] bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="popularComics.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ComicCard
            v-for="comic in popularComics.slice(0, 30)"
            :key="comic.id"
            :comic="comic"
          />
        </div>
      </section>

      <!-- Newest Comics -->
      <section class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900">Truyện Mới</h2>
          <NuxtLink
            to="/home/comics?sort_by=created_at&sort_order=DESC"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            Xem tất cả
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </NuxtLink>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="i in 12" :key="i" class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="aspect-[3/4] bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="newestComics.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <ComicCard
            v-for="comic in newestComics.slice(0, 30)"
            :key="comic.id"
            :comic="comic"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints } from '@/api/endpoints'
import { useSeo } from '@/composables/seo'
import { useGlobalSystemConfig } from '~/composables/system-config'
import ComicCard from '@/components/Public/Comics/ComicCard.vue'

definePageMeta({
  layout: 'home'
})

const router = useRouter()
const { apiClient } = useGlobalApiClient()
const { systemInfo } = useGlobalSystemConfig()

// SEO
useSeo({
  title: systemInfo.value?.name || 'Đọc Truyện Tranh Online',
  description: 'Khám phá hàng ngàn truyện tranh hay nhất, mới nhất. Đọc truyện tranh online miễn phí.',
  type: 'website',
  url: '/home'
})

// State
const featuredComics = ref<any[]>([]) // top_viewed_comics
const trendingComics = ref<any[]>([])
const popularComics = ref<any[]>([])
const newestComics = ref<any[]>([])
const recentUpdateComics = ref<any[]>([]) // Comics có chapter mới cập nhật
const categories = ref<any[]>([])
const currentFeaturedIndex = ref(0)

// Loading state - chỉ cần một loading state cho tất cả
const loading = ref(false)

// Load data - Gọi một API duy nhất
onMounted(async () => {
  await loadHomepageData()
})

// Load tất cả dữ liệu từ một API duy nhất
async function loadHomepageData() {
  loading.value = true
  try {
    const response = await apiClient.get(publicEndpoints.homepage)
    
    if (response.data?.success) {
      const data = response.data.data
      
      // Comics data - Structure mới: flat, không nested
      featuredComics.value = data.top_viewed_comics || []
      trendingComics.value = data.trending_comics || []
      popularComics.value = data.popular_comics || []
      newestComics.value = data.newest_comics || []
      recentUpdateComics.value = data.recent_update_comics || []
      
      // Categories data
      categories.value = data.comic_categories || []
    }
  } catch (error) {
    console.error('Failed to load homepage data:', error)
  } finally {
    loading.value = false
  }
}

function prevFeatured() {
  if (currentFeaturedIndex.value > 0) {
    currentFeaturedIndex.value--
  }
}

function nextFeatured() {
  if (currentFeaturedIndex.value < featuredComics.value.length - 1) {
    currentFeaturedIndex.value++
  }
}

function filterByCategory(categoryId: number) {
  router.push({
    path: '/home/comics',
    query: { category: categoryId }
  })
}

function goToComic(slug: string) {
  router.push(`/home/comics/${slug}`)
}

// Function này không còn cần thiết vì đã chuyển sang hiển thị comics thay vì chapters

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
