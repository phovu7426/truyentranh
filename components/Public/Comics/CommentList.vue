<template>
  <div class="space-y-6">
    <!-- Comment Form (if authenticated) -->
    <ClientOnly>
      <CommentForm
        v-if="isAuthenticated"
        :comic-id="comicId"
        :chapter-id="chapterId"
        @created="handleCommentCreated"
      />
      <div v-else class="p-4 bg-gray-50 rounded-lg text-center">
        <p class="text-gray-600 mb-2">Đăng nhập để bình luận</p>
        <NuxtLink
          to="/auth/login"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </NuxtLink>
      </div>
    </ClientOnly>

    <!-- Comments List -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <div v-else-if="comments.length > 0" class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :comic-id="comicId"
        :chapter-id="chapterId"
        @deleted="handleCommentDeleted"
        @updated="handleCommentUpdated"
        @reply="handleReply"
      />
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="total"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints } from '@/api/endpoints'
import { usePagination } from '@/composables/ui'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'

interface Props {
  comicId: number
  chapterId?: number | null
}

const props = defineProps<Props>()

const { apiClient } = useGlobalApiClient()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const loading = ref(false)
const comments = ref<any[]>([])

const { currentPage, perPage, total, totalPages, setPage, setTotal } = usePagination()

const endpoint = computed(() => {
  if (props.chapterId) {
    return publicEndpoints.comments.getByChapter(props.chapterId)
  }
  return publicEndpoints.comments.getByComic(props.comicId)
})

onMounted(async () => {
  await loadComments()
})

watch(() => [props.comicId, props.chapterId], async () => {
  await loadComments()
})

async function loadComments() {
  loading.value = true
  try {
    const response = await apiClient.get(endpoint.value, {
      params: {
        page: currentPage.value || 1,
        limit: perPage.value || 10
      }
    })
    if (response.data?.success) {
      comments.value = response.data.data || []
      setTotal(response.data.meta?.total || 0)
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
    comments.value = []
  } finally {
    loading.value = false
  }
}

function handleCommentCreated() {
  loadComments()
}

function handleCommentDeleted() {
  loadComments()
}

function handleCommentUpdated() {
  loadComments()
}

function handleReply(parentId: number) {
  // Scroll to comment form and set parent_id
  // This will be handled by CommentForm component
}

function handlePageChange(page: number) {
  setPage(page)
  loadComments()
}
</script>



