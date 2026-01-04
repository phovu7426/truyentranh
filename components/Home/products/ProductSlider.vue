<template>
  <div class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <!-- Icon -->
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
            <p class="text-sm text-gray-600 mt-1">Những sản phẩm được yêu thích nhất</p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Navigation Buttons -->
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="scrollLeft"
            :disabled="!canScrollLeft"
            class="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
            aria-label="Cuộn sang trái"
            title="Cuộn sang trái"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            type="button"
            @click="scrollRight"
            :disabled="!canScrollRight"
            class="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
            aria-label="Cuộn sang phải"
            title="Cuộn sang phải"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Slider Container -->
    <div class="relative w-full">
      <div
        ref="sliderContainer"
        class="relative overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
        @scroll="handleScroll"
      >
        <div
          class="flex gap-6 py-2"
          :style="{ width: 'max-content' }"
        >
          <!-- Product Cards using ProductCard component -->
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :is-slider="true"
            @view-product="viewProduct"
            @add-to-cart="addToCart"
          />
        </div>
      </div>

      <!-- Gradient Edges -->
      <div v-if="canScrollLeft" class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
      <div v-if="canScrollRight" class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '@/components/Public/Products/ProductCard.vue'

interface Product {
  id: string | number
  name: string
  slug?: string
  price: number
  sale_price?: number
  image?: string
  short_description?: string
  is_featured?: boolean
  rating?: number
  reviews_count?: number
  categories?: Array<{id: string | number, name: string}>
  variants?: Array<{id: string | number, stock_quantity: number}>
  stock_quantity?: number
}

interface Props {
  products: Product[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewProduct: [product: Product]
  addToCart: [product: Product]
}>()

const sliderContainer = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const scrollLeft = () => {
  if (!sliderContainer.value || !canScrollLeft.value) return
  
  const scrollAmount = getItemWidth()
  sliderContainer.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
}

const scrollRight = () => {
  if (!sliderContainer.value || !canScrollRight.value) return
  
  const scrollAmount = getItemWidth()
  sliderContainer.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

const getItemWidth = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  
  // Adjust width based on screen size for better responsiveness
  if (width < 640) {
    return 236 // 220px + 16px gap for mobile
  } else if (width < 768) {
    return 266 // 250px + 16px gap for tablet
  } else if (width < 1024) {
    return 286 // 270px + 16px gap for small laptop
  } else {
    return 296 // 280px + 16px gap for desktop
  }
}

const handleScroll = () => {
  if (!sliderContainer.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = sliderContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

const checkScrollable = () => {
  if (!sliderContainer.value) return
  
  const { scrollWidth, clientWidth } = sliderContainer.value
  canScrollRight.value = scrollWidth > clientWidth
}

const viewProduct = (product: Product) => {
  emit('viewProduct', product)
}

const addToCart = (product: Product) => {
  emit('addToCart', product)
}

import { onMounted, nextTick } from 'vue'

onMounted(async () => {
  await nextTick()
  
  // Add a small delay to ensure DOM is fully rendered
  setTimeout(() => {
    checkScrollable()
  }, 100)
  
  // Add resize listener
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkScrollable)
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scrolling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Product card styles */
.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-8px) scale(1.02);
}

/* Enhanced card shadows */
.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.card-shadow:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

/* Enhanced button styles */
button:disabled {
  transform: none !important;
}
</style>