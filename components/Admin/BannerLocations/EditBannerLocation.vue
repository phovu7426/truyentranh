<template>
  <div>
    <!-- Hiển thị loading overlay khi đang tải dữ liệu -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-700">Đang tải thông tin vị trí banner...</p>
      </div>
    </div>
    
    <!-- Hiển thị form chỉ khi không loading -->
    <BannerLocationForm
      v-if="showModal && !loading"
      :show="showModal"
      :location="locationData"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      @updated="handleUpdated"
      @cancel="onClose"
    />
  </div>
</template>

<script setup>
import BannerLocationForm from './BannerLocationForm.vue'
import { ref, watch } from 'vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'

const props = defineProps({
  show: Boolean,
  locationId: {
    type: [String, Number],
    required: true
  },
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['updated'])

const showModal = ref(false)
const loading = ref(false)
const locationData = ref(null)
const { apiClient } = useGlobalApiClient()

watch(() => props.show, (newValue) => {
  showModal.value = newValue
  if (newValue && props.locationId) {
    fetchLocationData()
  }
}, { immediate: true })

async function fetchLocationData() {
  if (!props.locationId) return
  
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.bannerLocations.show(props.locationId))
    if (response.data?.success) {
      locationData.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching location:', error)
  } finally {
    loading.value = false
  }
}

async function handleUpdated(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>
