<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Lịch sử đọc</h1>
        <p class="text-gray-600">Danh sách truyện bạn đã đọc</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="flex items-start space-x-4">
            <div class="w-24 h-32 bg-gray-200 rounded"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reading History List -->
      <div v-else-if="history.length > 0" class="space-y-4">
        <div
          v-for="item in history"
          :key="item.id"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start space-x-4">
            <!-- Cover Image -->
            <NuxtLink
              :to="`/home/comics/${item.comic?.slug}`"
              class="flex-shrink-0"
            >
              <img
                v-if="item.comic?.cover_image"
                :src="item.comic.cover_image"
                :alt="item.comic.title"
                class="w-24 h-32 object-cover rounded"
              />
              <div v-else class="w-24 h-32 bg-gray-200 rounded flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </NuxtLink>

            <!-- Content -->
            <div class="flex-1">
              <NuxtLink
                :to="`/home/comics/${item.comic?.slug}`"
                class="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2"
              >
                {{ item.comic?.title }}
              </NuxtLink>

              <div class="mb-3">
                <NuxtLink
                  :to="`/home/comics/${item.comic?.slug}/chapters/${item.chapter_id}${item.last_page ? `?page=${item.last_page}` : ''}`"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {{ item.chapter?.title || `Chương ${item.chapter?.chapter_index}` }}
                </NuxtLink>
                <span v-if="item.last_page" class="text-gray-500 ml-2">
                  - Trang {{ item.last_page }}
                </span>
              </div>

              <div class="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>Đọc lần cuối: {{ formatDate(item.updated_at) }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-3">
                <NuxtLink
                  :to="`/home/comics/${item.comic?.slug}/chapters/${item.chapter_id}${item.last_page ? `?page=${item.last_page}` : ''}`"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Tiếp tục đọc
                </NuxtLink>
                <button
                  @click="deleteHistory(item.id)"
                  :disabled="deleting === item.id"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                  {{ deleting === item.id ? 'Đang xóa...' : 'Xóa' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử đọc</h3>
        <p class="text-gray-600 mb-6">Bắt đầu đọc truyện để lưu lịch sử đọc của bạn</p>
        <NuxtLink
          to="/home/comics"
          class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Khám phá truyện
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'home',
  requiresAuth: true
})

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const authStore = useAuthStore()
const router = useRouter()

// State
const loading = ref(false)
const history = ref<any[]>([])
const deleting = ref<number | null>(null)

// Check auth
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  await loadHistory()
})

async function loadHistory() {
  loading.value = true
  try {
    const response = await apiClient.get(userEndpoints.readingHistory.list)
    if (response.data?.success) {
      history.value = response.data.data || []
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      router.push('/auth/login')
    } else {
      showError('Không thể tải lịch sử đọc')
    }
  } finally {
    loading.value = false
  }
}

async function deleteHistory(historyId: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa lịch sử đọc này?')) return

  deleting.value = historyId
  try {
    const response = await apiClient.delete(userEndpoints.readingHistory.delete(historyId))
    if (response.data?.success) {
      showSuccess('Đã xóa lịch sử đọc')
      await loadHistory()
    } else {
      showError('Không thể xóa lịch sử đọc')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể xóa lịch sử đọc')
  } finally {
    deleting.value = null
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>



