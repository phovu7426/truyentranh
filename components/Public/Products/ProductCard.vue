<template>
  <div
    class="product-card group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer card-shadow"
    :class="[
      isSlider
        ? 'flex-shrink-0 w-[220px] min-w-[220px] sm:w-[250px] sm:min-w-[250px] md:w-[270px] md:min-w-[270px] lg:w-[280px] lg:min-w-[280px]'
        : ''
    ]"
    @click="viewProduct(product)"
  >
    <!-- Product Image -->
    <div class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="h-64 w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        @error="handleImageError"
        loading="lazy"
      >
      <img
        v-else
        src="/default.svg"
        alt="Không có hình ảnh"
        class="h-64 w-full object-contain object-center"
        loading="lazy"
      >
      <!-- Featured Badge -->
      <div v-if="product.featured || product.is_featured" class="absolute top-3 right-3">
        <span class="px-3 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
          Nổi bật
        </span>
      </div>
      <!-- Overlay gradient -->
      <div class="product-overlay absolute inset-0"></div>
    </div>

    <!-- Product Info -->
    <div class="p-4">
      <!-- Product Name -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{{ product.name }}</h3>
      
      <!-- Categories -->
      <div v-if="product.categories && product.categories.length > 0" class="mb-2">
        <span
          v-for="category in product.categories.slice(0, 1)"
          :key="category.id"
          class="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- Price -->
      <div class="price-display mb-3">
        <div class="flex items-baseline space-x-2">
          <span v-if="getProductPriceInfo(product).sale_price" class="text-xl font-bold text-red-600">
            {{ formatCurrency(getProductPriceInfo(product).sale_price) }}
            <span class="sale-badge">-{{ Math.round((1 - getProductPriceInfo(product).sale_price! / getProductPriceInfo(product).price) * 100) }}%</span>
          </span>
          <span
            v-else
            class="text-xl font-bold text-gray-900"
          >
            {{ formatCurrency(getProductPriceInfo(product).price) }}
          </span>
          <span v-if="getProductPriceInfo(product).sale_price" class="text-sm text-gray-500 line-through">
            {{ formatCurrency(getProductPriceInfo(product).price) }}
          </span>
        </div>
      </div>

      <!-- Stock Status -->
      <div class="flex items-center justify-between">
        <div class="text-sm">
          <span
            :class="{
              'stock-status stock-in': getTotalStockQuantity(product) > 10,
              'stock-status stock-low': getTotalStockQuantity(product) > 0 && getTotalStockQuantity(product) <= 10,
              'stock-status stock-out': getTotalStockQuantity(product) === 0
            }"
          >
            {{ getStockText(getTotalStockQuantity(product)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="px-4 pb-4">
      <button
        @click.stop="addToCart(product)"
        class="btn-hover-effect w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus-ring"
        :disabled="getTotalStockQuantity(product) === 0"
      >
        <span v-if="getTotalStockQuantity(product) === 0">Hết hàng</span>
        <span v-else>Thêm vào giỏ</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, getLowestProductPrice, getTotalStockQuantity } from '@/utils/formatters'

interface Product {
  id: string | number
  name: string
  slug?: string
  price: number
  sale_price?: number
  image?: string
  short_description?: string
  featured?: boolean
  is_featured?: boolean
  rating?: number
  reviews_count?: number
  categories?: Array<{id: string | number, name: string}>
  variants?: Array<{id: string | number, stock_quantity: number}>
  stock_quantity?: number
}

interface Props {
  product: Product
  isSlider?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewProduct: [product: Product]
  addToCart: [product: Product]
}>()

const viewProduct = (product: Product) => {
  emit('viewProduct', product)
}

const addToCart = (product: Product) => {
  emit('addToCart', product)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
  img.className = 'h-64 w-full object-contain object-center p-4'
}

// Get product price info (lowest price from variants or product price)
const getProductPriceInfo = (product: Product) => {
  const priceInfo = getLowestProductPrice(product as any) || { price: 0, sale_price: null }
  return priceInfo
}

const getStockText = (stockQuantity: number) => {
  if (stockQuantity === 0) {
    return 'Hết hàng'
  } else if (stockQuantity <= 10) {
    return `Chỉ còn ${stockQuantity} sản phẩm`
  } else {
    return 'Còn hàng'
  }
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