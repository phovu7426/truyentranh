<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Đánh dấu của tôi</h1>
        <p class="text-gray-600">Danh sách các trang đã đánh dấu</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-lg shadow p-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Bookmarks List -->
      <div v-else-if="bookmarks.length > 0" class="space-y-4">
        <div
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <img
                  v-if="bookmark.chapter?.comic?.cover_image"
                  :src="bookmark.chapter.comic.cover_image"
                  :alt="bookmark.chapter.comic.title"
                  class="w-16 h-24 object-cover rounded"
                />
                <div class="flex-1">
                  <NuxtLink
                    :to="`/home/comics/${bookmark.chapter?.comic?.slug}`"
                    class="text-lg font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {{ bookmark.chapter?.comic?.title }}
                  </NuxtLink>
                  <div class="mt-1">
                    <NuxtLink
                      :to="`/home/comics/${bookmark.chapter?.comic?.slug}/chapters/${bookmark.chapter_id}?page=${bookmark.page_number}`"
                      class="text-blue-600 hover:text-blue-700"
                    >
                      {{ bookmark.chapter?.title || `Chương ${bookmark.chapter?.chapter_index}` }}
                    </NuxtLink>
                    <span class="text-gray-500 ml-2">- Trang {{ bookmark.page_number }}</span>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    Đánh dấu {{ formatDate(bookmark.created_at) }}
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="deleteBookmark(bookmark.id)"
              :disabled="deleting === bookmark.id"
              class="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có bookmark nào</h3>
        <p class="text-gray-600 mb-6">Bắt đầu đọc truyện và đánh dấu các trang bạn muốn quay lại sau</p>
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
const bookmarks = ref<any[]>([])
const deleting = ref<number | null>(null)

// Check auth
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  await loadBookmarks()
})

async function loadBookmarks() {
  loading.value = true
  try {
    const response = await apiClient.get(userEndpoints.bookmarks.list)
    if (response.data?.success) {
      bookmarks.value = response.data.data || []
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      router.push('/auth/login')
    } else {
      showError('Không thể tải danh sách bookmark')
    }
  } finally {
    loading.value = false
  }
}

async function deleteBookmark(bookmarkId: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa bookmark này?')) return

  deleting.value = bookmarkId
  try {
    const response = await apiClient.delete(userEndpoints.bookmarks.delete(bookmarkId))
    if (response.data?.success) {
      showSuccess('Đã xóa bookmark')
      await loadBookmarks()
    } else {
      showError('Không thể xóa bookmark')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể xóa bookmark')
  } finally {
    deleting.value = null
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>



