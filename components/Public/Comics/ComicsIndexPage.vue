<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Menu -->
        <aside class="w-full lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Truyện tranh</h2>
            <nav class="space-y-2">
              <NuxtLink
                to="/home/comics"
                class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                :class="{ 'bg-blue-100 text-blue-700 font-medium': isActiveLink('/home/comics', {}) }"
              >
                Danh sách truyện
              </NuxtLink>
              <NuxtLink
                to="/home/comics?sort_by=view_count&sort_order=DESC"
                class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                :class="{ 'bg-blue-100 text-blue-700 font-medium': isActiveLink('/home/comics', { sort_by: 'view_count', sort_order: 'DESC' }) }"
              >
                Truyện hot
              </NuxtLink>
              <NuxtLink
                to="/home/comics?sort_by=created_at&sort_order=DESC"
                class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                :class="{ 'bg-blue-100 text-blue-700 font-medium': isActiveLink('/home/comics', { sort_by: 'created_at', sort_order: 'DESC' }) }"
              >
                Truyện mới
              </NuxtLink>
              <NuxtLink
                to="/home/comics?sort_by=updated_at&sort_order=DESC"
                class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                :class="{ 'bg-blue-100 text-blue-700 font-medium': isActiveLink('/home/comics', { sort_by: 'updated_at', sort_order: 'DESC' }) }"
              >
                Mới cập nhật
              </NuxtLink>
              <NuxtLink
                to="/home/comics?sort_by=follow_count&sort_order=DESC"
                class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                :class="{ 'bg-blue-100 text-blue-700 font-medium': isActiveLink('/home/comics', { sort_by: 'follow_count', sort_order: 'DESC' }) }"
              >
                Truyện phổ biến
              </NuxtLink>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
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
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ pageTitle }}</h1>
            <p class="text-gray-600">{{ pageDescription }}</p>
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
                @keyup.enter="handleSearchImmediate"
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
              <option value="updated_at:DESC">Mới cập nhật</option>
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
            v-if="!loading"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="total"
            :loading="loading"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints } from '@/api/endpoints'
import { usePagination } from '@/composables/ui'
import ComicCard from '@/components/Public/Comics/ComicCard.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import { debounce } from '~/utils/debounce'

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
const { 
  currentPage, 
  perPage, 
  total, 
  totalPages, 
  setPage, 
  setTotal 
} = usePagination({ current: 1, perPage: 20, total: 0 })

// Computed properties for page title and description based on query params
const pageTitle = computed(() => {
  const sortByParam = route.query.sort_by as string
  const sortOrderParam = route.query.sort_order as string
  
  if (sortByParam === 'updated_at' && sortOrderParam === 'DESC') {
    return 'Mới Cập Nhật'
  } else if (sortByParam === 'view_count' && sortOrderParam === 'DESC') {
    return 'Truyện Hot'
  } else if (sortByParam === 'created_at' && sortOrderParam === 'DESC') {
    return 'Truyện Mới'
  } else if (sortByParam === 'follow_count' && sortOrderParam === 'DESC') {
    return 'Truyện Phổ Biến'
  }
  return 'Danh Sách Truyện'
})

const pageDescription = computed(() => {
  const sortByParam = route.query.sort_by as string
  const sortOrderParam = route.query.sort_order as string
  
  if (sortByParam === 'updated_at' && sortOrderParam === 'DESC') {
    return 'Khám phá những truyện tranh được cập nhật mới nhất'
  } else if (sortByParam === 'view_count' && sortOrderParam === 'DESC') {
    return 'Những truyện tranh được xem nhiều nhất'
  } else if (sortByParam === 'created_at' && sortOrderParam === 'DESC') {
    return 'Những truyện tranh mới được thêm vào hệ thống'
  } else if (sortByParam === 'follow_count' && sortOrderParam === 'DESC') {
    return 'Những truyện tranh được theo dõi nhiều nhất'
  }
  return 'Khám phá thế giới truyện tranh đa dạng'
})

// Helper function to check if a link is active
function isActiveLink(path: string, query: Record<string, string>) {
  if (route.path !== path) return false
  
  // If query object is empty, check if route has no query params (except page and search/category)
  if (Object.keys(query).length === 0) {
    const allowedParams = ['page', 'search', 'category']
    const otherParams = Object.keys(route.query).filter(k => !allowedParams.includes(k))
    return otherParams.length === 0
  }
  
  // Check if all query parameters match
  for (const [key, value] of Object.entries(query)) {
    if (route.query[key] !== value) {
      return false
    }
  }
  
  // Check that no unexpected sort params exist
  const sortParams = ['sort_by', 'sort_order', 'sort']
  const hasOtherSortParams = sortParams.some(param => {
    if (query[param]) return false // This param is expected
    return route.query[param] !== undefined && route.query[param] !== query[param]
  })
  
  if (hasOtherSortParams) return false
  
  return true
}

// Load categories
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadComics()
  ])
})

// Watch route query
watch(() => route.query, async (newQuery, oldQuery) => {
  // Only update searchQuery if it changed in URL (not from input)
  const urlSearch = (newQuery.search as string) || ''
  if (urlSearch !== searchQuery.value) {
    searchQuery.value = urlSearch
  }
  
  selectedCategory.value = (newQuery.category as string) || ''
  
  // Handle both formats: sort (combined) or sort_by + sort_order (separate)
  if (newQuery.sort_by && newQuery.sort_order) {
    sortBy.value = `${newQuery.sort_by}:${newQuery.sort_order}`
  } else if (newQuery.sort) {
    sortBy.value = (newQuery.sort as string)
  } else {
    sortBy.value = 'created_at:DESC'
  }
  
  const page = parseInt((newQuery.page as string) || '1')
  setPage(page)
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
      page: currentPage.value,
      limit: perPage.value
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
      setTotal(response.data.meta?.total || 0)
      // totalPages is computed automatically from total and perPage
    }
  } catch (error) {
    console.error('Failed to load comics:', error)
    comics.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = debounce(() => {
  setPage(1)
  updateUrl()
}, 500)

function handleSearchImmediate() {
  setPage(1)
  updateUrl()
}

function handleFilterChange() {
  setPage(1)
  updateUrl()
}

function handlePageChange(page: number) {
  setPage(page)
  updateUrl()
  loadComics()
}

function updateUrl() {
  const query: any = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedCategory.value) query.category = selectedCategory.value
  
  // Convert sort format from "field:order" to sort_by and sort_order for consistency
  if (sortBy.value !== 'created_at:DESC') {
    const [field, order] = sortBy.value.split(':')
    query.sort_by = field
    query.sort_order = order || 'DESC'
  }
  
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  router.push({ query })
}
</script>


