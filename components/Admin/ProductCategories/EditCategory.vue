<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
    </div>
    <CategoryForm
      v-else-if="showModal"
      :show="showModal"
      :category="categoryData"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="onClose"
    />
  </div>
</template>

<script setup>
import CategoryForm from './ProductCategoryForm.vue'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'
import { adminEndpoints } from '@/api/endpoints'

const { apiClient } = useApiClient()

// Lifecycle hooks
onMounted(() => {
  // Component mounted
})

onUnmounted(() => {
  // Component unmounted
})

const props = defineProps({
  show: Boolean,
  category: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['updated', 'close'])

const showModal = ref(false)
const categoryData = ref(null)
const loading = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
  if (newValue) {
    if (props.category?.id) {
      fetchDetails()
    }
  } else {
    categoryData.value = null
    loading.value = false
  }
}, { immediate: true })

async function fetchDetails() {
  if (!props.category?.id) {
    return
  }
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.productCategories.show(props.category.id))
    categoryData.value = response.data?.data || response.data
  } catch (e) {
    categoryData.value = props.category
  } finally {
    loading.value = false
  }
}

async function handleSubmit(formData) {
  emit('updated', formData)
}

function onClose() {
  emit('close')
}
</script>
