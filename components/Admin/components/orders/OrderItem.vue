<template>
  <ProductDisplay
    :item="normalizedItem"
    variant="order"
    :show-actions="showActions"
    :show-edit-button="showActions"
    :show-delete-button="showActions"
    :show-simple-info="true"
    :show-simple-total="true"
    :show-item-id="showActions"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderItem } from '~/types/orders'
import ProductDisplay from '@/components/Common/Shared/ProductDisplay.vue'

interface Props {
  item: OrderItem
  showActions?: boolean
}

interface Emits {
  (e: 'edit', item: OrderItem): void
  (e: 'delete', item: OrderItem): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false
})

const emit = defineEmits<Emits>()

const normalizedItem = computed(() => {
  const price = props.item.unit_price ? parseFloat(props.item.unit_price) : 0
  const total = props.item.total_price ? parseFloat(props.item.total_price) : price * props.item.quantity

  return {
    ...props.item,
    price,
    total_price: total,
    product_image: props.item.product?.image,
    variant_name: props.item.variant_name || props.item.variant?.name,
  }
})

const handleEdit = (item: any) => {
  emit('edit', item as OrderItem)
}

const handleDelete = (item: any) => {
  emit('delete', item as OrderItem)
}
</script>