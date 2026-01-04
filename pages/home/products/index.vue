<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Product Page Banner (same style as Home) -->
    <section class="relative w-full overflow-hidden mb-8">
      <ClientOnly>
        <BannerSlider
          location-code="product_page_banner"
          height-class="h-[500px] md:h-[600px]"
          :autoplay="true"
          :interval="5000"
          :show-arrows="true"
          :show-indicators="true"
        />
        <template #fallback>
          <div class="h-[500px] md:h-[600px] bg-gray-200 animate-pulse" />
        </template>
      </ClientOnly>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Page Header with breadcrumb -->
      <div class="mb-8">
        <nav class="flex mb-4" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <a href="/home" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Trang chủ
              </a>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">Sản phẩm</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Compact Filter Section with Dropdowns -->
      <div class="bg-white rounded-xl shadow-lg p-4 mb-8">
        <!-- Filter Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <h2 class="text-lg font-bold text-gray-900">Bộ lọc</h2>
          </div>
          <button
            @click="resetAllFilters"
            class="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Đặt lại
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <input
              :value="searchQuery"
              @input="handleSearchInput"
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              class="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="clearSearch" class="text-gray-400 hover:text-gray-600">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Dropdowns -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <!-- Category Dropdown -->
          <div class="relative">
            <button
              @click="toggleCategoryDropdown"
              class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="truncate">Danh mục</span>
                <span v-if="selectedCategory" class="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {{ getSelectedCategoryName() }}
                </span>
              </div>
              <svg class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Category Dropdown Content -->
            <div v-if="showCategoryDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <!-- Render hierarchical categories -->
              <template v-for="category in categories" :key="category.id">
                <CategoryTreeItem
                  :category="category"
                  :selected-category="selectedCategory"
                  :level="0"
                  @select-category="selectCategoryFromDropdown"
                />
              </template>
              <button
                @click="selectCategoryFromDropdown('')"
                :class="selectedCategory === '' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'"
                class="w-full text-left px-4 py-2 text-sm transition-colors border-t border-gray-100"
              >
                Tất cả danh mục
              </button>
            </div>
          </div>

          <!-- Sort Dropdown -->
          <div class="relative">
            <button
              @click="toggleSortDropdown"
              class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                </svg>
                <span class="truncate">{{ getSelectedSortName() }}</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': showSortDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Sort Dropdown Content -->
            <div v-if="showSortDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                v-for="option in sortOptions"
                :key="option.value"
                @click="selectSortFromDropdown(option.value)"
                :class="sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'"
                class="w-full text-left px-4 py-2 text-sm transition-colors flex items-center"
              >
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                </svg>
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Price Range Dropdown -->
          <div class="relative">
            <button
              @click="togglePriceDropdown"
              class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-between"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="truncate">Khoảng giá</span>
                <span v-if="minPrice || maxPrice" class="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {{ formatPriceRange() }}
                </span>
              </div>
              <svg class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': showPriceDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Price Dropdown Content -->
            <div v-if="showPriceDropdown" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Giá tối thiểu</label>
                    <input
                      v-model="tempMinPrice"
                      type="number"
                      placeholder="Tối thiểu"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Giá tối đa</label>
                    <input
                      v-model="tempMaxPrice"
                      type="number"
                      placeholder="Tối đa"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="setPriceRangeFromDropdown(0, 100000)"
                    class="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    Dưới 100k
                  </button>
                  <button
                    @click="setPriceRangeFromDropdown(100000, 500000)"
                    class="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    100k-500k
                  </button>
                  <button
                    @click="setPriceRangeFromDropdown(500000, 1000000)"
                    class="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    500k-1M
                  </button>
                  <button
                    @click="setPriceRangeFromDropdown(1000000, null)"
                    class="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                  >
                    Trên 1M
                  </button>
                </div>
                <div class="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    @click="showPriceDropdown = false"
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    @click="applyPriceRangeFromDropdown"
                    class="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Featured Filter Toggle -->
          <button
            @click="toggleFeaturedFilter"
            :class="featuredOnly ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-100 text-gray-700 border-gray-300'"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border"
          >
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Nổi bật
          </button>
        </div>
      </div>

      <!-- Featured Products Slider -->
      <div class="mb-8">
        <BaseSlider
          title="Sản phẩm nổi bật"
          subtitle="Những sản phẩm được yêu thích nhất"
          icon="product"
          :show-view-all="true"
          @viewAll="viewFeaturedProducts"
        >
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            :is-slider="true"
            @view-product="viewProduct"
            @add-to-cart="quickAddToCart"
          />
        </BaseSlider>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length > 0">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ searchQuery || selectedCategory ? 'Kết quả tìm kiếm' : 'Tất cả sản phẩm' }}
            </h2>
            <p class="text-lg text-gray-600 font-normal mt-1">{{ pagination.totalItems }} sản phẩm</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Hiển thị:</span>
            <select
              v-model="pageSize"
              @change="handlePageSizeChange"
              class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="12">12</option>
              <option value="20">20</option>
              <option value="36">36</option>
              <option value="48">48</option>
            </select>
            <span class="text-sm text-gray-500">sản phẩm/trang</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :is-slider="false"
            @view-product="viewProduct"
            @add-to-cart="quickAddToCart"
          />
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex justify-center">
          <Pagination
            :current-page="pagination.page"
            :total-pages="pagination.totalPages"
            :total-items="pagination.totalItems"
            :loading="loading"
            :enable-url-sync="false"
            @page-change="handlePageChange"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
          <svg class="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p class="text-gray-600 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
        <button
          @click="resetAllFilters"
          class="btn-hover-effect px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors focus-ring"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApiClient } from '@/composables/api/useApiClient'
import { useUrlListSync } from '@/composables/utils/useUrlListSync'
import { publicEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'
import { formatCurrency, getLowestProductPrice, getTotalStockQuantity } from '@/utils/formatters'
import { useCart } from '~/composables/cart/index'
import LoadingSpinner from '@/components/Core/Loading/LoadingSpinner.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import ProductCard from '@/components/Public/Products/ProductCard.vue'
import BaseSlider from '@/components/Common/UI/BaseSlider.vue'
import { debounce } from '@/utils/debounce'
import CategoryTreeItem from '@/components/Public/Products/CategoryTreeItem.vue'
import SimpleBanner from '@/components/Public/Banners/SimpleBanner.vue'
import { useSeo } from '@/composables/seo'

definePageMeta({
  layout: 'home'
})

// SEO configuration
useSeo({
  title: 'Sản phẩm',
  description: 'Khám phá bộ sưu tập sản phẩm đa dạng với chất lượng cao và giá cả hợp lý. Tìm kiếm và lọc sản phẩm theo danh mục, giá cả và nhiều tiêu chí khác.',
  type: 'website',
  url: '/home/products'
})

const router = useRouter()
const { apiClient } = useApiClient()
const { showSuccess, showError } = useToast()
const cart = useCart({ immediate: true })

// Sử dụng useUrlListSync cho products
const {
  items: products,
  loading,
  error,
  pagination,
  filters,
  updateFilters,
  changePage,
  updateSort,
  resetFilters: resetUrlFilters
} = useUrlListSync({
  endpoint: publicEndpoints.products.list
})

// State cho categories
const categories = ref([])
const featuredProducts = ref([])

// Search và filters - lấy từ URL thông qua composable
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('created_at desc')
const minPrice = ref('')
const maxPrice = ref('')
const featuredOnly = ref(false)
const pageSize = ref('20')

// Đồng bộ state với URL
watch(() => filters.value, (newFilters) => {
  searchQuery.value = newFilters?.search || ''
  selectedCategory.value = newFilters?.category_id?.toString() || ''
  
  const sortByField = newFilters?.sort_by || 'created_at'
  const sortOrder = newFilters?.sort_order || 'desc'
  sortBy.value = `${sortByField} ${sortOrder}`
  
  minPrice.value = newFilters?.min_price?.toString() || ''
  maxPrice.value = newFilters?.max_price?.toString() || ''
  featuredOnly.value = newFilters?.featured === 'true' || newFilters?.featured === true
  pageSize.value = (newFilters?.limit || 20).toString()
}, { immediate: true, deep: true })

// Computed property để kiểm tra có bộ lọc nào đang hoạt động không
const hasActiveFilters = computed(() => {
  return searchQuery.value ||
         selectedCategory.value ||
         minPrice.value ||
         maxPrice.value ||
         featuredOnly.value
})


// Hàm fetch categories - sử dụng tree endpoint để lấy cấu trúc cha-con
const fetchCategories = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.productCategories.tree)
    if (response.data?.success) {
      categories.value = response.data.data || []
    }
  } catch (error) {
    categories.value = []
  }
}

// Hàm fetch featured products
const fetchFeaturedProducts = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        is_featured: true,
        limit: 8
      }
    })
    if (response.data?.success) {
      featuredProducts.value = response.data.data || []
    }
  } catch (error) {
    featuredProducts.value = []
  }
}

// Handle page size change
const handlePageSizeChange = () => {
  updateFilters({ limit: parseInt(pageSize.value, 10) })
}

// Handle filter changes - gọi API khi user thay đổi filter
const handleFilterChange = () => {
  const [sortByField, sortOrder] = sortBy.value.split(' ')
  
  const newFilters = {
    search: searchQuery.value,
    category_id: selectedCategory.value,
    min_price: minPrice.value,
    max_price: maxPrice.value,
    is_featured: featuredOnly.value ? 'true' : 'false',
    sort_by: sortByField,
    sort_order: sortOrder.toLowerCase(),
    limit: parseInt(pageSize.value, 10)
  }
  
  updateFilters(newFilters)
}

// Debounced version cho search input
const debouncedFilterChange = debounce(handleFilterChange, 500)

// Handle page change
const handlePageChange = (page) => {
  changePage(page)
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// View product details
function viewProduct(product) {
  router.push(`/home/products/${product.slug}`)
}

// Get stock text
function getStockText(stockQuantity) {
  if (stockQuantity === 0) {
    return 'Hết hàng'
  } else if (stockQuantity <= 10) {
    return `Chỉ còn ${stockQuantity} sản phẩm`
  } else {
    return 'Còn hàng'
  }
}

// Get product price info (lowest price from variants or product price)
function getProductPriceInfo(product) {
  return getLowestProductPrice(product) || { price: 0, sale_price: null }
}

// Quick add to cart
async function quickAddToCart(product) {
  if (getTotalStockQuantity(product) === 0) return

  try {
    // Find the cheapest variant with stock
    let selectedVariantId = null
    if (product.variants && product.variants.length > 0) {
      const inStockVariants = product.variants.filter(v => v.stock_quantity > 0)
      if (inStockVariants.length > 0) {
        const cheapestVariant = inStockVariants.reduce((cheapest, current) => {
          const currentPrice = current.sale_price || current.price
          const cheapestPrice = cheapest.sale_price || cheapest.price
          return currentPrice < cheapestPrice ? current : cheapest
        })
        selectedVariantId = cheapestVariant.id
      } else {
        // If no variants in stock, use the first variant
        selectedVariantId = product.variants[0].id
      }
    }

    const cartItem = {
      product_id: product.id,
      product_variant_id: selectedVariantId,
      quantity: 1
    }

    await cart.addToCart(cartItem)
    showSuccess(`Đã thêm "${product.name}" vào giỏ hàng thành công!`)
  } catch (error) {
    showError('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!')
  }
}


// Additional functions for new features
const viewAllCategories = () => {
  // Không còn trang danh mục sản phẩm riêng biệt
  // Người dùng có thể lọc sản phẩm theo danh mục ngay trên trang này
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const selectCategory = (categoryId) => {
  updateFilters({ category_id: categoryId })
}

const toggleFeaturedFilter = () => {
  featuredOnly.value = !featuredOnly.value
  debouncedFilterChange()
}

const resetAllFilters = () => {
  resetUrlFilters()
}

const performSearch = () => {
  handleFilterChange()
}

const handleSearchInput = (event) => {
  searchQuery.value = event.target.value
  debouncedFilterChange()
}

const clearSearch = () => {
  searchQuery.value = ''
  debouncedFilterChange()
}

const setPriceRange = (min, max) => {
  minPrice.value = min || ''
  maxPrice.value = max || ''
  debouncedFilterChange()
}

// Modal state
// Dropdown state
const showCategoryDropdown = ref(false)
const showSortDropdown = ref(false)
const showPriceDropdown = ref(false)
const tempMinPrice = ref('')
const tempMaxPrice = ref('')

// Sort options
const sortOptions = [
  { value: 'created_at desc', label: 'Mới nhất' },
  { value: 'created_at asc', label: 'Cũ nhất' },
  { value: 'name asc', label: 'Tên A-Z' },
  { value: 'name desc', label: 'Tên Z-A' },
  { value: 'price asc', label: 'Giá tăng dần' },
  { value: 'price desc', label: 'Giá giảm dần' }
]

// Dropdown toggle functions
const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  showSortDropdown.value = false
  showPriceDropdown.value = false
}

const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
  showCategoryDropdown.value = false
  showPriceDropdown.value = false
}

const togglePriceDropdown = () => {
  showPriceDropdown.value = !showPriceDropdown.value
  showCategoryDropdown.value = false
  showSortDropdown.value = false
}

// Dropdown selection functions
const selectCategoryFromDropdown = (categoryId) => {
  selectedCategory.value = categoryId
  debouncedFilterChange()
  showCategoryDropdown.value = false
}

const selectSortFromDropdown = (sortValue) => {
  sortBy.value = sortValue
  debouncedFilterChange()
  showSortDropdown.value = false
}

const setPriceRangeFromDropdown = (min, max) => {
  tempMinPrice.value = min
  tempMaxPrice.value = max
}

const applyPriceRangeFromDropdown = () => {
  minPrice.value = tempMinPrice.value || ''
  maxPrice.value = tempMaxPrice.value || ''
  debouncedFilterChange()
  showPriceDropdown.value = false
}

const getSelectedCategoryName = () => {
  if (!selectedCategory.value) return ''
  
  // Tìm danh mục trong cấu trúc cây
  const findCategoryInTree = (categories, categoryId) => {
    for (const category of categories) {
      if (category.id == categoryId || category.id === categoryId) { // Sử dụng cả == và ===
        return category
      }
      if (category.children && category.children.length > 0) {
        const found = findCategoryInTree(category.children, categoryId)
        if (found) return found
      }
    }
    return null
  }
  
  const category = findCategoryInTree(categories.value, selectedCategory.value)
  return category ? category.name : ''
}

const getSelectedSortName = () => {
  const option = sortOptions.find(o => {
    const [optionSortBy, optionSortOrder] = o.value.split(' ')
    const [currentSortBy, currentSortOrder] = sortBy.value.split(' ')
    return optionSortBy === currentSortBy && optionSortOrder.toLowerCase() === currentSortOrder.toLowerCase()
  })
  return option ? option.label : 'Mới nhất'
}

const formatPriceRange = () => {
  if (!minPrice.value && !maxPrice.value) return ''
  if (!minPrice.value) return `Dưới ${formatCurrency(maxPrice.value)}`
  if (!maxPrice.value) return `Từ ${formatCurrency(minPrice.value)}`
  return `${formatCurrency(minPrice.value)} - ${formatCurrency(maxPrice.value)}`
}

// View featured products
const viewFeaturedProducts = () => {
  featuredOnly.value = true
  debouncedFilterChange()
}


onMounted(async () => {
  // Load categories trước
  await fetchCategories()
  
  // Load featured products
  await fetchFeaturedProducts()
  
  // Không cần gọi fetchProducts() ở đây vì useUrlListSync đã tự động gọi
})
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

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Smooth transitions */
.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
}

.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Loading skeleton animation */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Enhanced button hover effects */
.btn-hover-effect {
  position: relative;
  overflow: hidden;
}

.btn-hover-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-hover-effect:hover::before {
  left: 100%;
}

/* Improved focus states */
.focus-ring:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Enhanced card shadows */
.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.card-shadow:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Enhanced filter section */
.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #e5e7eb;
}

/* Improved breadcrumb */
.breadcrumb-link {
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #2563eb;
}

/* Category icon animation */
.category-icon {
  transition: all 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%);
}

/* Product image overlay */
.product-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

/* Enhanced price display */
.price-display {
  position: relative;
}

.sale-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 9999px;
  font-weight: 600;
}

/* Improved stock status */
.stock-status {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
}

.stock-in {
  background-color: #d1fae5;
  color: #065f46;
}

.stock-low {
  background-color: #fed7aa;
  color: #92400e;
}

.stock-out {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Dropdown styles */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* Dropdown animations */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Click outside to close dropdown */
@media (hover: hover) {
  .dropdown:hover .dropdown-content {
    display: block;
  }
}

/* Enhanced dropdown focus states */
.dropdown-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions for dropdown */
.dropdown-content {
  transition: all 0.2s ease;
  transform-origin: top;
}
</style>