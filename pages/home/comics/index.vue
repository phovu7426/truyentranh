<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Banner Section -->
    <section class="relative w-full overflow-hidden mb-8">
      <ClientOnly>
        <BannerSlider
          location-code="comic_page_banner"
          height-class="h-[400px] md:h-[500px]"
          :autoplay="true"
          :interval="5000"
          :show-arrows="true"
          :show-indicators="true"
        />
        <template #fallback>
          <div class="h-[400px] md:h-[500px] bg-gray-200 animate-pulse" />
        </template>
      </ClientOnly>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <NuxtLink to="/home" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </NuxtLink>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">Truyện tranh</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Truyện Tranh</h1>
        <p class="text-gray-600">Khám phá thế giới truyện tranh đa dạng</p>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-xl shadow-lg p-4 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm truyện..."
                class="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="handleSearch"
              >
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="w-full md:w-64">
            <select
              v-model="selectedCategory"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
            >
              <option value="">Tất cả danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.slug">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Sort -->
          <div class="w-full md:w-48">
            <select
              v-model="sortBy"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="handleFilterChange"
            >
              <option value="created_at:DESC">Mới nhất</option>
              <option value="view_count:DESC">Xem nhiều nhất</option>
              <option value="title:ASC">Tên A-Z</option>
              <option value="title:DESC">Tên Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow animate-pulse">
          <div class="h-64 bg-gray-200 rounded-t-lg"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Comics Grid -->
      <div v-else-if="comics.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <ComicCard
          v-for="comic in comics"
          :key="comic.id"
          :comic="comic"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Không tìm thấy truyện</h3>
        <p class="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="pagination.totalPages > 1"
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :total-items="pagination.total"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints } from '@/api/endpoints'
import { usePagination } from '@/composables/ui'
import ComicCard from '@/components/Public/Comics/ComicCard.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import BannerSlider from '@/components/Public/Banners/BannerSlider.vue'
import { debounce } from '~/utils/debounce'

definePageMeta({
  layout: 'home'
})

const route = useRoute()
const router = useRouter()
const { apiClient } = useGlobalApiClient()

// State
const loading = ref(false)
const comics = ref<any[]>([])
const categories = ref<any[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('created_at:DESC')

// Pagination
const { pagination, changePage: changePageBase } = usePagination()

// Load categories
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadComics()
  ])
})

// Watch route query
watch(() => route.query, async (newQuery) => {
  searchQuery.value = (newQuery.search as string) || ''
  selectedCategory.value = (newQuery.category as string) || ''
  sortBy.value = (newQuery.sort as string) || 'created_at:DESC'
  pagination.page = parseInt((newQuery.page as string) || '1')
  await loadComics()
}, { immediate: true })

async function loadCategories() {
  try {
    const response = await apiClient.get(publicEndpoints.comicCategories.list)
    if (response.data?.success) {
      categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

async function loadComics() {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (selectedCategory.value) {
      params['filters[category_slug]'] = selectedCategory.value
    }

    if (sortBy.value) {
      params.sort = sortBy.value
    }

    const response = await apiClient.get(publicEndpoints.comics.list, { params })
    
    if (response.data?.success) {
      comics.value = response.data.data || []
      pagination.total = response.data.meta?.total || 0
      pagination.totalPages = response.data.meta?.totalPages || 1
    }
  } catch (error) {
    console.error('Failed to load comics:', error)
    comics.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  updateUrl()
  loadComics()
}, 500)

function handleFilterChange() {
  pagination.page = 1
  updateUrl()
  loadComics()
}

function handlePageChange(page: number) {
  changePageBase(page)
  updateUrl()
  loadComics()
}

function updateUrl() {
  const query: any = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedCategory.value) query.category = selectedCategory.value
  if (sortBy.value !== 'created_at:DESC') query.sort = sortBy.value
  if (pagination.page > 1) query.page = pagination.page.toString()

  router.push({ query })
}
</script>

