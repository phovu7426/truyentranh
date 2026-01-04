<template>
  <!-- Main content -->
  <div>
  <!-- Hero Banner Slider -->
  <section class="relative w-full overflow-hidden mb-12">
    <ClientOnly>
      <BannerSlider 
        location-code="home_slider"
        height-class="h-[500px] md:h-[600px]"
        :autoplay="true"
        :interval="5000"
        :show-arrows="true"
        :show-indicators="true"
      />
      <template #fallback>
        <!-- Placeholder để tránh "nháy" nội dung rồi biến mất khi BannerSlider mount -->
        <div class="h-[500px] md:h-[600px] bg-gray-200 animate-pulse" />
      </template>
    </ClientOnly>
  </section>

  <!-- Featured Products Section -->
  <section ref="featuredProductsSection" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="featuredProductsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCardSkeleton v-for="i in 4" :key="i" />
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="featuredProducts.length > 0">
        <FeaturedProductsSlider
          :products="featuredProducts"
          title="Sản phẩm nổi bật"
          subtitle="Những sản phẩm được yêu thích nhất hiện nay"
          :show-view-all="false"
          @view-product="viewProduct"
          @add-to-cart="addToCart"
        />
      </template>
    </div>
  </section>

  <!-- New Arrivals / Latest Products Section -->
  <section ref="newProductsSection" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="newProductsLoading" class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm mới nhất</h2>
        <p class="text-xl text-gray-600">Những sản phẩm vừa được thêm vào cửa hàng</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          <ProductCardSkeleton v-for="i in 4" :key="i" />
        </div>
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="newProducts.length > 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm mới nhất</h2>
          <p class="text-xl text-gray-600">Những sản phẩm vừa được thêm vào cửa hàng</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in newProducts"
            :key="product.id"
            :product="product"
            @view-product="viewProduct"
            @add-to-cart="addToCart"
          />
        </div>
        <div class="text-center mt-12">
          <NuxtLink
            to="/home/products?sort_by=created_at&sort_order=DESC"
            :prefetch="false"
            class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem tất cả sản phẩm mới
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>

  <!-- Best Sellers / Top Products Section -->
  <section ref="bestSellersSection" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="bestSellersLoading" class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
        <p class="text-xl text-gray-600">Những sản phẩm được yêu thích và mua nhiều nhất</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          <ProductCardSkeleton v-for="i in 4" :key="i" />
        </div>
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="bestSellers.length > 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm bán chạy</h2>
          <p class="text-xl text-gray-600">Những sản phẩm được yêu thích và mua nhiều nhất</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in bestSellers"
            :key="product.id"
            :product="product"
            @view-product="viewProduct"
            @add-to-cart="addToCart"
          />
        </div>
        <div class="text-center mt-12">
          <NuxtLink
            to="/home/products?sort_by=view_count&sort_order=DESC"
            :prefetch="false"
            class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem tất cả sản phẩm bán chạy
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>

  <!-- On Sale / Discount Products Section -->
  <section ref="onSaleProductsSection" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="onSaleProductsLoading" class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm đang giảm giá</h2>
        <p class="text-xl text-gray-600">Ưu đãi đặc biệt - Giảm giá lên đến 50%</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          <ProductCardSkeleton v-for="i in 4" :key="i" />
        </div>
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="onSaleProducts.length > 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Sản phẩm đang giảm giá</h2>
          <p class="text-xl text-gray-600">Ưu đãi đặc biệt - Giảm giá lên đến 50%</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in onSaleProducts"
            :key="product.id"
            :product="product"
            @view-product="viewProduct"
            @add-to-cart="addToCart"
          />
        </div>
        <div class="text-center mt-12">
          <NuxtLink
            to="/home/products"
            :prefetch="false"
            class="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Xem tất cả sản phẩm giảm giá
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>

  <!-- Latest Blog Posts Section -->
  <section ref="latestPostsSection" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="latestPostsLoading" class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Tin tức mới nhất</h2>
        <p class="text-xl text-gray-600">Cập nhật tin tức và khuyến mãi mới nhất</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <PostCardSkeleton v-for="i in 3" :key="i" />
        </div>
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="latestPosts.length > 0">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Tin tức mới nhất</h2>
          <p class="text-xl text-gray-600">Cập nhật tin tức và khuyến mãi mới nhất</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="post in latestPosts"
            :key="post.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
            @click="viewPost(post)"
          >
            <img
              v-if="post.cover_image || post.image"
              :src="post.cover_image || post.image"
              :alt="post.name"
              class="w-full h-64 object-cover"
              @error="handleImageError"
              loading="lazy"
            />
            <img
              v-else
              src="/default.svg"
              :alt="post.name"
              class="w-full h-64 object-cover"
              loading="lazy"
            />
            <div class="p-6">
              <div v-if="post.primary_category" class="mb-2">
                <span class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ post.primary_category.name }}
                </span>
              </div>
              <h3 class="text-2xl font-bold mb-2 line-clamp-2">{{ post.name }}</h3>
              <p v-if="post.excerpt" class="text-gray-600 mb-4 line-clamp-3">{{ formatExcerpt(post.excerpt) }}</p>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span v-if="post.published_at">{{ formatDate(post.published_at) }}</span>
                <span v-if="post.view_count">{{ post.view_count }} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-12">
          <NuxtLink
            to="/home/posts"
            :prefetch="false"
            class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem tất cả tin tức
          </NuxtLink>
        </div>
      </template>
    </div>
  </section>

  <!-- Featured Blog Posts Section -->
  <section ref="featuredPostsSection" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Show skeleton while loading -->
      <div v-if="featuredPostsLoading" class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Bài viết nổi bật</h2>
        <p class="text-xl text-gray-600">Những bài viết được đánh giá cao và nhiều người đọc</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <PostCardSkeleton v-for="i in 3" :key="i" />
        </div>
      </div>
      
      <!-- Show actual content when loaded -->
      <template v-else-if="featuredPosts.length > 0">
        <FeaturedPostsSlider
          :posts="featuredPosts"
          title="Bài viết nổi bật"
          subtitle="Những bài viết được đánh giá cao và nhiều người đọc"
          :show-view-all="false"
          @view-post="viewPost"
        />
      </template>
    </div>
  </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { definePageMeta } from '#imports'
import { useGlobalSystemConfig } from '~/composables/system-config'
import { useSeo } from '@/composables/seo'
import { useApiClient } from '~/composables/api'
import { useCart } from '~/composables/cart'
import { publicEndpoints } from '@/api/endpoints'
// Lazy load non-critical components để giảm initial bundle size
const ProductCard = defineAsyncComponent(() => import('~/components/Public/Products/ProductCard.vue'))
const FeaturedProductsSlider = defineAsyncComponent(() => import('~/components/Common/UI/FeaturedProductsSlider.vue'))
const FeaturedPostsSlider = defineAsyncComponent(() => import('~/components/Common/UI/FeaturedPostsSlider.vue'))
// Keep skeleton components synchronous for better UX
import ProductCardSkeleton from '@/components/Common/UI/Skeleton/ProductCardSkeleton.vue'
import PostCardSkeleton from '@/components/Common/UI/Skeleton/PostCardSkeleton.vue'
// BannerSlider is critical (above fold), keep synchronous
import BannerSlider from '@/components/Public/Banners/BannerSlider.vue'

// Initialize composables
const router = useRouter()
const { systemInfo } = useGlobalSystemConfig()
const { apiClient } = useApiClient({ preventDuplicateCalls: true })
const { addToCart: addToCartAction } = useCart()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Sử dụng useSeo composable để lấy SEO từ system config
useSeo({
  type: 'website'
})

// State
const error = ref<string | null>(null)

// Data state
const featuredProducts = ref<any[]>([])
const newProducts = ref<any[]>([])
const bestSellers = ref<any[]>([])
const onSaleProducts = ref<any[]>([])
const latestPosts = ref<any[]>([])
const featuredPosts = ref<any[]>([])

// Loading states
const featuredProductsLoading = ref(false)
const newProductsLoading = ref(false)
const bestSellersLoading = ref(false)
const onSaleProductsLoading = ref(false)
const latestPostsLoading = ref(false)
const featuredPostsLoading = ref(false)

// Loaded flags to prevent re-fetching
const featuredProductsLoaded = ref(false)
const newProductsLoaded = ref(false)
const bestSellersLoaded = ref(false)
const onSaleProductsLoaded = ref(false)
const latestPostsLoaded = ref(false)
const featuredPostsLoaded = ref(false)

// Section refs for lazy loading
const featuredProductsSection = ref<HTMLElement | null>(null)
const newProductsSection = ref<HTMLElement | null>(null)
const bestSellersSection = ref<HTMLElement | null>(null)
const onSaleProductsSection = ref<HTMLElement | null>(null)
const latestPostsSection = ref<HTMLElement | null>(null)
const featuredPostsSection = ref<HTMLElement | null>(null)

// Store observers for cleanup
const observers = ref<IntersectionObserver[]>([])

// Helper functions
const formatExcerpt = (text: string, maxLength = 150): string => {
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
    month: 'long',
    day: 'numeric'
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
}

// API fetch functions
const fetchFeaturedProducts = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        is_featured: true,
        status: 'active',
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'DESC'
      }
    })
    return response.data?.data || []
  } catch (err) {
    console.error('Error fetching featured products:', err)
    return []
  }
}

const fetchNewProducts = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        status: 'active',
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'DESC'
      }
    })
    return response.data?.data || []
  } catch (err) {
    console.error('Error fetching new products:', err)
    return []
  }
}

const fetchBestSellers = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        status: 'active',
        limit: 12,
        sort: 'view_count:DESC'
      }
    })
    return response.data?.data || []
  } catch (err) {
    console.error('Error fetching best sellers:', err)
    return []
  }
}

const fetchOnSaleProducts = async () => {
  try {
    // Fetch more products to filter on sale
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        status: 'active',
        limit: 50
      }
    })
    const allProducts = response.data?.data || []
    
    // Filter products with sale_price < price
    const onSale = allProducts
      .filter((p: any) => {
        const salePrice = p.sale_price || (p.variants && p.variants.length > 0 
          ? Math.min(...p.variants.map((v: any) => v.sale_price || v.price))
          : null)
        const price = p.price || (p.variants && p.variants.length > 0 
          ? Math.min(...p.variants.map((v: any) => v.price))
          : 0)
        return salePrice && salePrice < price
      })
      .sort((a: any, b: any) => {
        const discountA = a.discount_percentage || 0
        const discountB = b.discount_percentage || 0
        return discountB - discountA
      })
      .slice(0, 12)
    
    return onSale
  } catch (err) {
    console.error('Error fetching on sale products:', err)
    return []
  }
}

const fetchLatestPosts = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.posts.list, {
      params: {
        status: 'published',
        limit: 6,
        sort: 'created_at:DESC'
      }
    })
    return response.data?.data || []
  } catch (err) {
    console.error('Error fetching latest posts:', err)
    return []
  }
}

const fetchFeaturedPosts = async () => {
  try {
    const response = await apiClient.get(publicEndpoints.posts.list, {
      params: {
        status: 'published',
        is_featured: true,
        limit: 6,
        sort: 'view_count:DESC'
      }
    })
    return response.data?.data || []
  } catch (err) {
    console.error('Error fetching featured posts:', err)
    return []
  }
}

// Load data with lazy loading
const loadFeaturedProducts = async () => {
  if (featuredProductsLoaded.value || featuredProductsLoading.value) return
  
  featuredProductsLoading.value = true
  try {
    const data = await fetchFeaturedProducts()
    featuredProducts.value = data
    featuredProductsLoaded.value = true
  } catch (err) {
    console.error('Error fetching featured products:', err)
  } finally {
    featuredProductsLoading.value = false
  }
}

const loadNewProducts = async () => {
  if (newProductsLoaded.value || newProductsLoading.value) return
  
  newProductsLoading.value = true
  try {
    const data = await fetchNewProducts()
    newProducts.value = data
    newProductsLoaded.value = true
  } catch (err) {
    console.error('Error fetching new products:', err)
  } finally {
    newProductsLoading.value = false
  }
}

const loadBestSellers = async () => {
  if (bestSellersLoaded.value || bestSellersLoading.value) return
  
  bestSellersLoading.value = true
  try {
    const data = await fetchBestSellers()
    bestSellers.value = data
    bestSellersLoaded.value = true
  } catch (err) {
    console.error('Error fetching best sellers:', err)
  } finally {
    bestSellersLoading.value = false
  }
}

const loadOnSaleProducts = async () => {
  if (onSaleProductsLoaded.value || onSaleProductsLoading.value) return
  
  onSaleProductsLoading.value = true
  try {
    const data = await fetchOnSaleProducts()
    onSaleProducts.value = data
    onSaleProductsLoaded.value = true
  } catch (err) {
    console.error('Error fetching on sale products:', err)
  } finally {
    onSaleProductsLoading.value = false
  }
}

const loadLatestPosts = async () => {
  if (latestPostsLoaded.value || latestPostsLoading.value) return
  
  latestPostsLoading.value = true
  try {
    const data = await fetchLatestPosts()
    latestPosts.value = data
    latestPostsLoaded.value = true
  } catch (err) {
    console.error('Error fetching latest posts:', err)
  } finally {
    latestPostsLoading.value = false
  }
}

const loadFeaturedPosts = async () => {
  if (featuredPostsLoaded.value || featuredPostsLoading.value) return
  
  featuredPostsLoading.value = true
  try {
    const data = await fetchFeaturedPosts()
    featuredPosts.value = data
    featuredPostsLoaded.value = true
  } catch (err) {
    console.error('Error fetching featured posts:', err)
  } finally {
    featuredPostsLoading.value = false
  }
}

// Cleanup observers
const cleanupObservers = () => {
  observers.value.forEach(observer => observer.disconnect())
  observers.value = []
}

// Setup intersection observers
const setupObservers = () => {
  // Clean up existing observers first
  cleanupObservers()

  nextTick(() => {
    // Observe new products section
    if (newProductsSection.value && !newProductsLoaded.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadNewProducts()
          }
        })
      }, { threshold: 0.1 })

      observer.observe(newProductsSection.value)
      observers.value.push(observer)
    }

    // Observe best sellers section
    if (bestSellersSection.value && !bestSellersLoaded.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadBestSellers()
          }
        })
      }, { threshold: 0.1 })

      observer.observe(bestSellersSection.value)
      observers.value.push(observer)
    }

    // Observe on sale products section
    if (onSaleProductsSection.value && !onSaleProductsLoaded.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadOnSaleProducts()
          }
        })
      }, { threshold: 0.1 })

      observer.observe(onSaleProductsSection.value)
      observers.value.push(observer)
    }

    // Observe latest posts section
    if (latestPostsSection.value && !latestPostsLoaded.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadLatestPosts()
          }
        })
      }, { threshold: 0.1 })

      observer.observe(latestPostsSection.value)
      observers.value.push(observer)
    }

    // Observe featured posts section
    if (featuredPostsSection.value && !featuredPostsLoaded.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadFeaturedPosts()
          }
        })
      }, { threshold: 0.1 })

      observer.observe(featuredPostsSection.value)
      observers.value.push(observer)
    }
  })
}

// Load critical data immediately, lazy load the rest
const loadHomePageData = async () => {
  try {
    error.value = null

    // Set up intersection observers for lazy loading
    setupObservers()
  } catch (err: any) {
    console.error('Error loading home page data:', err)
    error.value = 'Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.'
  }
}

// SSR: preload featured products để HTML có nội dung (tốt cho SEO + perceived performance)
const { data: featuredProductsSSR, pending: featuredProductsPending } = await useAsyncData(
  'home-featured-products',
  async () => {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        is_featured: true,
        status: 'active',
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'DESC'
      }
    })
    return response.data?.data || []
  }
)

watch(
  featuredProductsPending,
  (v) => {
    featuredProductsLoading.value = v
  },
  { immediate: true }
)

watch(
  featuredProductsSSR,
  (v) => {
    if (Array.isArray(v)) {
      featuredProducts.value = v
      featuredProductsLoaded.value = true
    }
  },
  { immediate: true }
)

// SSR: preload new products để section có nội dung indexable
const { data: newProductsSSR, pending: newProductsPending } = await useAsyncData(
  'home-new-products',
  async () => {
    const response = await apiClient.get(publicEndpoints.products.list, {
      params: {
        status: 'active',
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'DESC'
      }
    })
    return response.data?.data || []
  }
)

watch(
  newProductsPending,
  (v) => {
    newProductsLoading.value = v
  },
  { immediate: true }
)

watch(
  newProductsSSR,
  (v) => {
    if (Array.isArray(v)) {
      newProducts.value = v
      newProductsLoaded.value = true
    }
  },
  { immediate: true }
)

// SSR: preload latest posts để có text/link cho SEO
const { data: latestPostsSSR, pending: latestPostsPending } = await useAsyncData(
  'home-latest-posts',
  async () => {
    const response = await apiClient.get(publicEndpoints.posts.list, {
      params: {
        status: 'published',
        limit: 6,
        sort: 'created_at:DESC'
      }
    })
    return response.data?.data || []
  }
)

watch(
  latestPostsPending,
  (v) => {
    latestPostsLoading.value = v
  },
  { immediate: true }
)

watch(
  latestPostsSSR,
  (v) => {
    if (Array.isArray(v)) {
      latestPosts.value = v
      latestPostsLoaded.value = true
    }
  },
  { immediate: true }
)

// Event handlers
const viewProduct = (product: any) => {
  if (product.slug) {
    router.push(`/home/products/${product.slug}`)
  }
}

const addToCart = async (product: any) => {
  try {
    await addToCartAction({
      product_id: product.id,
      quantity: 1
    })
  } catch (err) {
    console.error('Error adding to cart:', err)
  }
}

const viewPost = (post: any) => {
  if (post.slug) {
    router.push(`/home/posts/${post.slug}`)
  }
}

// Fetch data on mount
onMounted(() => {
  loadHomePageData()
})

// Cleanup on unmount
onUnmounted(() => {
  cleanupObservers()
})

// Page meta
definePageMeta({
  layout: 'home',
  title: 'Trang chủ'
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>