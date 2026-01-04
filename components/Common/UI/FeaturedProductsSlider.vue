<template>
  <BaseSlider
    :title="title"
    :subtitle="subtitle"
    icon="product"
    :show-navigation="true"
    :show-view-all="showViewAll"
    :show-progress="false"
    :item-width="{
      mobile: 220,
      small: 250,
      medium: 270,
      large: 280
    }"
    @view-all="$emit('viewAll')"
  >
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      :is-slider="true"
      @view-product="handleViewProduct"
      @add-to-cart="handleAddToCart"
    />
  </BaseSlider>
</template>

<script setup lang="ts">
import BaseSlider from './BaseSlider.vue'
import ProductCard from '@/components/Public/Products/ProductCard.vue'

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
  variants?: Array<{id: string | number, stock_quantity: number, price?: number, sale_price?: number}>
  stock_quantity?: number
}

interface Props {
  products: Product[]
  title?: string
  subtitle?: string
  showViewAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Sản phẩm nổi bật',
  subtitle: 'Những sản phẩm được yêu thích nhất hiện nay',
  showViewAll: true
})

const emit = defineEmits<{
  viewProduct: [product: Product]
  addToCart: [product: Product]
  viewAll: []
}>()

const handleViewProduct = (product: Product) => {
  emit('viewProduct', product)
}

const handleAddToCart = (product: Product) => {
  emit('addToCart', product)
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
