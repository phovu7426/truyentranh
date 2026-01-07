<template>
  <ClientOnly>
    <button
      v-if="isAuthenticated"
      @click="handleToggleBookmark"
      :disabled="saving"
      class="p-2 rounded-lg transition-colors"
      :class="isBookmarked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'"
      :title="isBookmarked ? 'Xóa bookmark' : 'Đánh dấu trang này'"
    >
      <svg
        v-if="!saving"
        class="w-5 h-5"
        :fill="isBookmarked ? 'currentColor' : 'none'"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </button>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'

interface Bookmark {
  id: number
  page_number: number
}

interface Props {
  chapterId: number
  pageNumber: number
  initialBookmark?: Bookmark | null
}

const props = defineProps<Props>()

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const saving = ref(false)
const currentBookmark = ref<Bookmark | null>(props.initialBookmark ?? null)

const isBookmarked = computed(() => !!currentBookmark.value)

onMounted(() => {
  // Trạng thái bookmark ban đầu được truyền từ ChapterReader qua props.initialBookmark
})

async function handleToggleBookmark() {
  if (!isAuthenticated.value) return

  saving.value = true

  try {
    if (isBookmarked.value && currentBookmark.value) {
      // Delete bookmark
      await apiClient.delete(userEndpoints.bookmarks.delete(currentBookmark.value.id))
      currentBookmark.value = null
      showSuccess('Đã xóa bookmark')
    } else {
      // Create bookmark
      const response = await apiClient.post(userEndpoints.bookmarks.create, {
        chapter_id: props.chapterId,
        page_number: props.pageNumber
      })
      if (response.data?.success) {
        currentBookmark.value = response.data.data as Bookmark
        showSuccess('Đã đánh dấu trang này')
      }
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể cập nhật bookmark')
  } finally {
    saving.value = false
  }
}
</script>



