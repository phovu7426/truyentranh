<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors group">
    <!-- Comment Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            v-if="comment.user?.avatar"
            :src="comment.user.avatar"
            :alt="comment.user.username"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <span v-else class="text-gray-600 font-medium text-sm">
            {{ comment.user?.username?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-semibold text-gray-900 text-sm">{{ comment.user?.username || 'Anonymous' }}</span>
          </div>
          <div class="text-xs text-gray-500">
            {{ formatDate(comment.created_at) }}
          </div>
        </div>
      </div>

      <!-- Actions (if owner) -->
      <div v-if="isOwner" class="flex items-center space-x-1 ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
          title="Sửa bình luận"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        <button
          @click="handleDelete"
          :disabled="deleting"
          class="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="deleting ? 'Đang xóa...' : 'Xóa bình luận'"
        >
          <svg v-if="!deleting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Comment Content -->
    <div v-if="!isEditing" class="text-gray-800 mb-3 leading-relaxed">
      <p class="whitespace-pre-wrap break-words text-sm">{{ comment.content }}</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="mb-3">
      <textarea
        v-model="editContent"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
        placeholder="Nhập nội dung bình luận..."
      />
      <div class="flex justify-end space-x-2 mt-2">
        <button
          @click="cancelEdit"
          class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Hủy
        </button>
        <button
          @click="handleUpdate"
          :disabled="updating"
          class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ updating ? 'Đang lưu...' : 'Lưu' }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-4 pt-3 border-t border-gray-100">
      <button
        @click="handleReplyClick"
        class="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
        </svg>
        Trả lời
      </button>
    </div>

    <!-- Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 ml-8 space-y-3 border-l-2 border-gray-200 pl-4">
      <div
        v-for="reply in comment.replies"
        :key="reply.id"
        class="bg-gray-50 rounded p-3"
      >
        <div class="flex items-start space-x-2">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="reply.user?.avatar"
              :src="reply.user.avatar"
              :alt="reply.user.username"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <span v-else class="text-gray-600 text-xs font-medium">
              {{ reply.user?.username?.charAt(0).toUpperCase() || 'U' }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-semibold text-xs text-gray-900">{{ reply.user?.username || 'Anonymous' }}</span>
              <span class="text-xs text-gray-500">{{ formatDate(reply.created_at) }}</span>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{{ reply.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reply Form -->
    <div v-if="showReplyForm" class="mt-4 ml-8">
      <CommentForm
        :comic-id="comicId"
        :chapter-id="chapterId"
        :parent-id="comment.id"
        @created="handleReplyCreated"
        @cancel="showReplyForm = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'
import CommentForm from './CommentForm.vue'

interface Props {
  comment: {
    id: number
    user_id: number
    content: string
    created_at: string
    updated_at?: string
    user?: {
      id: number
      username: string
      avatar?: string
    }
    replies?: any[]
  }
  comicId: number
  chapterId?: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleted: []
  updated: []
  reply: [parentId: number]
}>()

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const authStore = useAuthStore()

const isOwner = computed(() => authStore.user?.id === props.comment.user_id)
const isEditing = ref(false)
const editContent = ref(props.comment.content)
const updating = ref(false)
const deleting = ref(false)
const showReplyForm = ref(false)

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Vừa xong'
  
  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Vừa xong'
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // If date is in the future, return "Vừa xong"
    if (diff < 0) {
      return 'Vừa xong'
    }
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  if (weeks < 4) return `${weeks} tuần trước`
  if (months < 12) return `${months} tháng trước`
  
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  } catch (error) {
    return 'Vừa xong'
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = props.comment.content
}

async function handleUpdate() {
  if (!editContent.value.trim()) {
    showError('Nội dung không được để trống')
    return
  }

  updating.value = true
  try {
    const response = await apiClient.put(userEndpoints.comments.update(props.comment.id), {
      content: editContent.value.trim()
    })

    if (response.data?.success) {
      showSuccess('Cập nhật bình luận thành công')
      isEditing.value = false
      emit('updated')
    } else {
      showError(response.data?.message || 'Không thể cập nhật bình luận')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể cập nhật bình luận')
  } finally {
    updating.value = false
  }
}

async function handleDelete() {
  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return

  deleting.value = true
  try {
    const response = await apiClient.delete(userEndpoints.comments.delete(props.comment.id))

    if (response.data?.success) {
      showSuccess('Xóa bình luận thành công')
      emit('deleted')
    } else {
      showError(response.data?.message || 'Không thể xóa bình luận')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể xóa bình luận')
  } finally {
    deleting.value = false
  }
}

function handleReplyClick() {
  showReplyForm.value = true
  emit('reply', props.comment.id)
}

function handleReplyCreated() {
  showReplyForm.value = false
  emit('updated')
}
</script>

