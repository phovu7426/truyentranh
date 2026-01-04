<template>
  <div class="space-y-6">
    <!-- Review Form (if authenticated) -->
    <ClientOnly>
      <ReviewForm
        v-if="isAuthenticated"
        :comic-id="comicId"
        :my-review="myReview"
        @created="handleReviewCreated"
        @updated="handleReviewUpdated"
        @deleted="handleReviewDeleted"
      />
    </ClientOnly>

    <!-- Reviews List -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Đánh giá ({{ pagination.total || 0 }})
        </h3>
        <div v-if="computedAverageRating" class="flex items-center space-x-2">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span class="ml-1 font-semibold text-gray-900">{{ computedAverageRating.toFixed(1) }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="p-4 bg-gray-50 rounded-lg animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Reviews -->
      <div v-else-if="reviews.length > 0" class="space-y-4">
        <ReviewItem
          v-for="review in reviews"
          :key="review.id"
          :review="review"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 text-gray-500">
        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
      </div>

      <!-- Pagination -->
      <Pagination
        v-if="pagination.totalPages > 1"
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :total-items="pagination.total"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints, userEndpoints } from '@/api/endpoints'
import { usePagination } from '@/composables/ui'
import ReviewForm from './ReviewForm.vue'
import ReviewItem from './ReviewItem.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'

interface Props {
  comicId: number
  averageRating?: number | null
}

const props = defineProps<Props>()

const { apiClient } = useGlobalApiClient()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const loading = ref(false)
const reviews = ref<any[]>([])
const myReview = ref<any>(null)
const computedAverageRating = ref<number | null>(props.averageRating || null)

const { pagination, changePage } = usePagination()

onMounted(async () => {
  await Promise.all([
    loadReviews(),
    loadMyReview()
  ])
})

watch(() => props.comicId, async () => {
  await Promise.all([
    loadReviews(),
    loadMyReview()
  ])
})

async function loadReviews() {
  loading.value = true
  try {
    const response = await apiClient.get(publicEndpoints.reviews.getByComic(props.comicId), {
      params: {
        page: pagination.page,
        limit: pagination.limit
      }
    })
    if (response.data?.success) {
      reviews.value = response.data.data || []
      pagination.total = response.data.meta?.total || 0
      pagination.totalPages = response.data.meta?.totalPages || 1
      
      // Use provided average rating or calculate from reviews
      if (!props.averageRating && reviews.value.length > 0) {
        const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
        computedAverageRating.value = sum / reviews.value.length
      } else if (props.averageRating) {
        computedAverageRating.value = props.averageRating
      }
    }
  } catch (error) {
    console.error('Failed to load reviews:', error)
    reviews.value = []
  } finally {
    loading.value = false
  }
}

async function loadMyReview() {
  if (!isAuthenticated.value) return

  try {
    const response = await apiClient.get(userEndpoints.reviews.list)
    if (response.data?.success) {
      const allReviews = response.data.data || []
      myReview.value = allReviews.find((r: any) => r.comic_id === props.comicId) || null
    }
  } catch (error) {
    // Silent fail
  }
}

function handleReviewCreated() {
  loadReviews()
  loadMyReview()
}

function handleReviewUpdated() {
  loadReviews()
  loadMyReview()
}

function handleReviewDeleted() {
  myReview.value = null
  loadReviews()
}

function handlePageChange(page: number) {
  changePage(page)
  loadReviews()
}
</script>

