<template>
  <Modal :show="show" :on-close="onClose" size="lg">
    <div class="p-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Chi tiết liên hệ</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">ID: #{{ contactData?.id }}</span>
            <span 
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="getStatusClass(contactData?.status)"
            >
              {{ getStatusLabel(contactData?.status) }}
            </span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Thông tin cơ bản -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-600">Họ và tên:</label>
                <p class="text-gray-900">{{ contactData?.name || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Email:</label>
                <p class="text-gray-900">
                  <a :href="`mailto:${contactData?.email}`" class="text-blue-600 hover:text-blue-800">
                    {{ contactData?.email }}
                  </a>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Số điện thoại:</label>
                <p class="text-gray-900">
                  <a v-if="contactData?.phone" :href="`tel:${contactData?.phone}`" class="text-blue-600 hover:text-blue-800">
                    {{ contactData?.phone }}
                  </a>
                  <span v-else class="text-gray-400">N/A</span>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Chủ đề:</label>
                <p class="text-gray-900">{{ contactData?.subject || 'Không có chủ đề' }}</p>
              </div>
            </div>
          </div>

          <!-- Thông tin hệ thống -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-600">Ngày tạo:</label>
                <p class="text-gray-900">{{ formatDate(contactData?.created_at) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Cập nhật lần cuối:</label>
                <p class="text-gray-900">{{ formatDate(contactData?.updated_at) }}</p>
              </div>
              <div v-if="contactData?.replied_at">
                <label class="text-sm font-medium text-gray-600">Ngày phản hồi:</label>
                <p class="text-gray-900">{{ formatDate(contactData?.replied_at) }}</p>
              </div>
              <div v-if="contactData?.replied_by">
                <label class="text-sm font-medium text-gray-600">Người phản hồi:</label>
                <p class="text-gray-900">ID: {{ contactData?.replied_by }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Nội dung tin nhắn -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Nội dung tin nhắn</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <pre class="text-gray-900 whitespace-pre-wrap break-words text-sm leading-6">{{ contactData?.message || 'N/A' }}</pre>
          </div>
        </div>

        <!-- Phản hồi từ admin -->
        <div v-if="contactData?.reply" class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Phản hồi từ admin</h3>
          <div class="bg-green-50 rounded-lg p-4 border border-green-200">
            <pre class="text-gray-900 whitespace-pre-wrap break-words text-sm leading-6">{{ contactData.reply }}</pre>
            <div v-if="contactData.replied_at" class="mt-2 text-xs text-gray-500">
              Phản hồi lúc: {{ formatDate(contactData.replied_at) }}
            </div>
          </div>
        </div>

        <!-- Footer: Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
          <div class="flex space-x-2">
            <button
              v-if="contactData?.status === 'pending'"
              @click="handleMarkAsRead"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Đánh dấu đã đọc
            </button>
            <button
              v-if="contactData?.status !== 'replied' && contactData?.status !== 'closed'"
              @click="handleReply"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Phản hồi
            </button>
            <button
              v-if="contactData?.status !== 'closed'"
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Đóng
            </button>
          </div>
          <button
            @click="onClose"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Đóng
          </button>
        </div>
      </template>
    </div>
  </Modal>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  contact: {
    type: Object,
    default: null
  },
  statusEnums: {
    type: Array,
    default: () => []
  },
  onClose: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits(['reply', 'mark-as-read', 'close-contact'])

// State
const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()
const loading = ref(false)
const contactData = ref(null)

// Methods
function getStatusLabel(status) {
  const found = (props.statusEnums || []).find(s => s.value === status)
  return found?.label || found?.name || status || 'Không xác định'
}

function getStatusClass(status) {
  const found = (props.statusEnums || []).find(s => s.value === status)
  const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  
  return found?.class || found?.badge_class || found?.color_class || statusColors[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(date) {
  if (!date) return 'N/A'
  
  // Sử dụng UTC để đảm bảo nhất quán giữa server và client
  // Format: DD/MM/YYYY HH:mm
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'N/A'
  
  // Sử dụng UTC methods để tránh hydration mismatch do timezone
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function handleReply() {
  emit('reply', contactData.value)
}

function handleMarkAsRead() {
  emit('mark-as-read', contactData.value)
}

function handleClose() {
  emit('close-contact', contactData.value)
}

// Load contact details when modal opens
watch(() => props.show, async (val) => {
  if (val && props.contact?.id) {
    await fetchContactDetails()
  } else if (val && props.contact) {
    // Use provided contact data if no ID
    contactData.value = props.contact
  }
}, { immediate: true })

async function fetchContactDetails() {
  if (!props.contact?.id) return
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.contacts.show(props.contact.id))
    if (response.data?.success) {
      contactData.value = response.data.data
    } else {
      contactData.value = props.contact
    }
  } catch (error) {
    contactData.value = props.contact
  } finally {
    loading.value = false
  }
}
</script>
