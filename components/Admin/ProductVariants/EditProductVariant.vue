<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
    </div>
    <ProductVariantForm 
      v-else-if="showModal"
      :show="showModal"
      :variant="variantData"
      :status-enums="statusEnums"
      :product-enums="productEnums"
      :attribute-enums="attributeEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import ProductVariantForm from './ProductVariantForm.vue'
import { ref, watch } from 'vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'

const { apiClient } = useApiClient()

const props = defineProps({
  show: Boolean,
  variant: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  productEnums: {
    type: Array,
    default: () => []
  },
  attributeEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['updated'])

const showModal = ref(false)
const variantData = ref(null)
const loading = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
  if (newValue) {
    // Luôn fetch dữ liệu chi tiết từ API khi mở modal
    if (props.variant?.id) {
      fetchVariantDetails()
    }
  } else {
    variantData.value = null // Reset data khi đóng modal
    loading.value = false
  }
}, { immediate: true })

async function fetchVariantDetails() {
  if (!props.variant?.id) return
  
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.productVariants.show(props.variant.id))
    
    variantData.value = response.data.data || response.data
  } catch (error) {
    // Fallback về dữ liệu từ list view nếu API lỗi
    variantData.value = props.variant
  } finally {
    loading.value = false
  }
}

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>