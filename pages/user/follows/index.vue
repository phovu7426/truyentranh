<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Truyện đang theo dõi</h1>
        <p class="text-gray-600">Danh sách truyện bạn đang theo dõi</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow animate-pulse">
          <div class="h-64 bg-gray-200 rounded-t-lg"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Follows List -->
      <div v-else-if="follows.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ComicCard
          v-for="follow in follows"
          :key="follow.id"
          :comic="follow.comic"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa theo dõi truyện nào</h3>
        <p class="text-gray-600 mb-6">Bắt đầu theo dõi các truyện bạn yêu thích để không bỏ lỡ chương mới</p>
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
import ComicCard from '@/components/Public/Comics/ComicCard.vue'

definePageMeta({
  layout: 'home',
  requiresAuth: true
})

const { apiClient } = useGlobalApiClient()
const { showError } = useToast()
const authStore = useAuthStore()
const router = useRouter()

// State
const loading = ref(false)
const follows = ref<any[]>([])

// Check auth
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  await loadFollows()
})

async function loadFollows() {
  loading.value = true
  try {
    const response = await apiClient.get(userEndpoints.follows.list)
    if (response.data?.success) {
      follows.value = response.data.data || []
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      router.push('/auth/login')
    } else {
      showError('Không thể tải danh sách truyện đang theo dõi')
    }
  } finally {
    loading.value = false
  }
}
</script>



