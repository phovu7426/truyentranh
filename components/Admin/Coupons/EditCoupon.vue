<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
    </div>
    <CouponForm
      v-else-if="showModal"
      :show="showModal"
      :coupon="couponData"
      :type-enums="typeEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit"
      @cancel="onClose"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import CouponForm from './CouponForm.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'

const { apiClient } = useApiClient()

const props = defineProps({
  show: Boolean,
  coupon: Object,
  typeEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  onClose: Function
})

const emit = defineEmits(['updated'])

const showModal = ref(false)
const couponData = ref(null)
const loading = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
  if (newValue) {
    // Luôn fetch dữ liệu chi tiết từ API khi mở modal
    if (props.coupon?.id) {
      fetchCouponDetails()
    }
  } else {
    couponData.value = null // Reset data khi đóng modal
    loading.value = false
  }
}, { immediate: true })

async function fetchCouponDetails() {
  if (!props.coupon?.id) return
  
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.coupons.show(props.coupon.id))
    
    couponData.value = response.data.data || response.data
  } catch (error) {
    // Fallback về dữ liệu từ list view nếu API lỗi
    couponData.value = props.coupon
  } finally {
    loading.value = false
  }
}

function handleSubmit(formData) {
  emit('updated', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>

