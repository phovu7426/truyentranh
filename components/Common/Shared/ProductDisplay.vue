<template>
  <div class="flex items-start space-x-4" :class="containerClass">
    <!-- Product Image -->
    <div class="flex-shrink-0">
      <div class="relative group">
        <OptimizedImage
          v-if="item.product_image"
          :src="item.product_image"
          :alt="item.product_name"
          :class="imageClass"
        />
        <img
          v-else
          src="/default.svg"
          alt="Không có hình ảnh"
          :class="[imageClass, 'object-contain p-2']"
        />
        
        <!-- Quantity Badge (for cart items) -->
        <div
          v-if="showQuantityBadge && item.quantity"
          class="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-white"
        >
          {{ item.quantity }}
        </div>
        
        <!-- Hover overlay for cart items -->
        <div
          v-if="variant === 'cart'"
          class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-xl"
        ></div>
      </div>
    </div>

    <!-- Product Details -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3
            :class="titleClass"
            @click="handleProductClick"
            class="transition-colors duration-200"
          >
            {{ item.product_name }}
          </h3>
          <p v-if="item.variant_name" :class="variantClass">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            {{ item.variant_name }}
          </p>
          
          <!-- Price Display -->
          <div :class="priceContainerClass">
            <p :class="priceClass">
              {{ formatCurrency(getDisplayPrice(item)) }}
            </p>
            <p
              v-if="getOriginalPrice(item) && getOriginalPrice(item) > getDisplayPrice(item)"
              :class="originalPriceClass"
            >
              {{ formatCurrency(getOriginalPrice(item)) }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="flex-shrink-0 flex items-center space-x-2">
          <slot name="actions" :item="item">
            <button
              v-if="showEditButton"
              @click="$emit('edit', item)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
            >
              Sửa
            </button>
            <button
              v-if="showDeleteButton"
              @click="$emit('delete', item)"
              class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
            >
              Xóa
            </button>
            <button
              v-if="showRemoveButton"
              @click="$emit('remove', item.id)"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              title="Xóa sản phẩm"
            >
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </slot>
        </div>
      </div>

      <!-- Quantity Selector (for cart items) -->
      <!-- Mobile: stack để tránh tràn ngang; >= sm: giữ 2 cột -->
      <div
        v-if="showQuantitySelector"
        class="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0"
      >
        <div class="flex items-center justify-between sm:justify-start gap-3 flex-wrap min-w-0">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Số lượng:</label>
          <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
            <button
              @click="handleDecreaseQuantity"
              :disabled="item.quantity <= 1"
              class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            
            <div class="px-3 py-1 bg-gray-50 min-w-[56px] text-center">
              <span class="font-semibold text-gray-900">{{ item.quantity }}</span>
            </div>
            
            <button
              @click="handleIncreaseQuantity"
              :disabled="item.quantity >= 99"
              class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Item Total -->
        <div class="sm:text-right min-w-0">
          <p class="text-sm text-gray-600 mb-1">Thành tiền:</p>
          <p class="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
            {{ formatCurrency(item.total_price || (item.price * item.quantity)) }}
          </p>
          <p v-if="item.savings && item.savings > 0" class="text-sm text-green-600 font-medium mt-1 flex items-center justify-end">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Tiết kiệm: {{ formatCurrency(item.savings) }}
          </p>
        </div>
      </div>

      <!-- Simple Item Info (for order items) -->
      <div v-else-if="showSimpleInfo" class="flex items-center mt-1">
        <span class="text-sm text-gray-900">
          {{ formatCurrency(item.price) }}
        </span>
        <span class="mx-2 text-gray-300">×</span>
        <span class="text-sm text-gray-900">
          {{ item.quantity }}
        </span>
      </div>
    </div>

    <!-- Simple Total (for order items) -->
    <div v-if="showSimpleTotal" class="flex-shrink-0 text-right">
      <p class="text-sm font-medium text-gray-900">
        {{ formatCurrency(item.price * item.quantity) }}
      </p>
      <p v-if="showItemId" class="text-xs text-gray-500 mt-1">
        ID: {{ item.id }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatCurrency, getLowestProductPrice } from '~/utils/formatters'
import OptimizedImage from '~/components/Core/Image/OptimizedImage.vue'

interface ProductItem {
  id: string | number
  product_name: string
  product_slug?: string
  product_image?: string
  variant_name?: string
  price: number
  original_price?: number
  quantity: number
  total_price?: number
  savings?: number
  variant?: {
    id: string | number
    price: number
    sale_price?: number
    stock_quantity: number
  }
  variants?: Array<{
    id: string | number
    price: number
    sale_price?: number
    stock_quantity: number
  }>
}

interface Props {
  item: ProductItem
  variant?: 'cart' | 'order' | 'compact'
  showActions?: boolean
  showEditButton?: boolean
  showDeleteButton?: boolean
  showRemoveButton?: boolean
  showQuantityBadge?: boolean
  showQuantitySelector?: boolean
  showSimpleInfo?: boolean
  showSimpleTotal?: boolean
  showItemId?: boolean
}

interface Emits {
  (e: 'edit', item: ProductItem): void
  (e: 'delete', item: ProductItem): void
  (e: 'remove', itemId: string | number): void
  (e: 'update-quantity', itemId: string | number, quantity: number): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cart',
  showActions: false,
  showEditButton: false,
  showDeleteButton: false,
  showRemoveButton: false,
  showQuantityBadge: false,
  showQuantitySelector: false,
  showSimpleInfo: false,
  showSimpleTotal: false,
  showItemId: false
})

const emit = defineEmits<Emits>()
const router = useRouter()

// Computed classes based on variant
const containerClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'p-6 hover:bg-gray-50 transition-colors duration-200'
    case 'order':
      return 'py-3 border-b border-gray-200 last:border-b-0'
    case 'compact':
      return 'py-2'
    default:
      return ''
  }
})

const imageClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'w-24 h-24 object-cover rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all duration-300'
    case 'order':
      return 'h-16 w-16 rounded-lg object-cover'
    case 'compact':
      return 'h-12 w-12 rounded object-cover'
    default:
      return 'h-16 w-16 rounded-lg object-cover'
  }
})

const titleClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer'
    case 'order':
      return 'text-sm font-medium text-gray-900 truncate'
    case 'compact':
      return 'text-sm font-medium text-gray-900'
    default:
      return 'text-sm font-medium text-gray-900'
  }
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'text-sm text-gray-600 mt-1 bg-gray-100 px-2 py-1 rounded-lg inline-block'
    case 'order':
      return 'text-sm text-gray-500'
    case 'compact':
      return 'text-xs text-gray-500'
    default:
      return 'text-sm text-gray-500'
  }
})

const priceContainerClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'flex items-center mt-3 space-x-4'
    case 'order':
      return 'flex items-center mt-1'
    case 'compact':
      return 'flex items-center'
    default:
      return 'flex items-center'
  }
})

const priceClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'text-lg font-bold text-blue-600'
    case 'order':
      return 'text-sm text-gray-900'
    case 'compact':
      return 'text-sm text-gray-900'
    default:
      return 'text-sm text-gray-900'
  }
})

const originalPriceClass = computed(() => {
  switch (props.variant) {
    case 'cart':
      return 'text-sm text-gray-500 line-through'
    case 'order':
      return 'text-xs text-gray-500 line-through ml-2'
    case 'compact':
      return 'text-xs text-gray-500 line-through ml-1'
    default:
      return 'text-sm text-gray-500 line-through'
  }
})

// Event handlers
const handleProductClick = () => {
  if (props.item.product_slug) {
    router.push(`/home/products/${props.item.product_slug}`)
  }
}

const handleIncreaseQuantity = () => {
  if (props.item.quantity < 99) {
    const newQuantity = props.item.quantity + 1
    emit('update-quantity', props.item.id, newQuantity)
  }
}

const handleDecreaseQuantity = () => {
  if (props.item.quantity > 1) {
    const newQuantity = props.item.quantity - 1
    emit('update-quantity', props.item.id, newQuantity)
  }
}

// Get display price (lowest price from variants or item price)
function getDisplayPrice(item: ProductItem): number {
  if (item.variants && item.variants.length > 0) {
    const priceInfo = getLowestProductPrice({
      id: item.id,
      variants: item.variants
    })
    return priceInfo ? (priceInfo.sale_price || priceInfo.price) : item.price
  }
  return item.price
}

// Get original price for comparison
function getOriginalPrice(item: ProductItem): number {
  // If we have variant data with price, use that as original price
  if (item.variant && item.variant.price) {
    return item.variant.price
  }
  
  // Fallback to variants array
  if (item.variants && item.variants.length > 0) {
    const priceInfo = getLowestProductPrice({
      id: item.id,
      variants: item.variants
    })
    return priceInfo ? priceInfo.price : item.original_price || item.price
  }
  
  // Fallback to original_price or current price
  return item.original_price || item.price
}
</script>