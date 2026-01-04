<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <!-- Comment Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            v-if="comment.user?.avatar"
            :src="comment.user.avatar"
            :alt="comment.user.username"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-gray-600 font-semibold">
            {{ comment.user?.username?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </div>
        <div>
          <div class="font-semibold text-gray-900">{{ comment.user?.username || 'Anonymous' }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</div>
        </div>
      </div>

      <!-- Actions (if owner) -->
      <div v-if="isOwner" class="flex items-center space-x-2">
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="text-sm text-blue-600 hover:text-blue-700"
        >
          Sửa
        </button>
        <button
          @click="handleDelete"
          :disabled="deleting"
          class="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {{ deleting ? 'Đang xóa...' : 'Xóa' }}
        </button>
      </div>
    </div>

    <!-- Comment Content -->
    <div v-if="!isEditing" class="text-gray-700 mb-3">
      <p class="whitespace-pre-wrap">{{ comment.content }}</p>
    </div>

    <!-- Edit Form -->
    <div v-else class="mb-3">
      <textarea
        v-model="editContent"
        rows="3"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <div class="flex justify-end space-x-2 mt-2">
        <button
          @click="cancelEdit"
          class="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
        >
          Hủy
        </button>
        <button
          @click="handleUpdate"
          :disabled="updating"
          class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ updating ? 'Đang lưu...' : 'Lưu' }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-4">
      <button
        @click="handleReplyClick"
        class="text-sm text-blue-600 hover:text-blue-700"
      >
        Trả lời
      </button>
    </div>

    <!-- Replies -->
    <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 ml-8 space-y-4 border-l-2 border-gray-200 pl-4">
      <div
        v-for="reply in comment.replies"
        :key="reply.id"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img
                v-if="reply.user?.avatar"
                :src="reply.user.avatar"
                :alt="reply.user.username"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-gray-600 text-xs font-semibold">
                {{ reply.user?.username?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
            <div>
              <div class="font-semibold text-sm text-gray-900">{{ reply.user?.username || 'Anonymous' }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(reply.created_at) }}</div>
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ reply.content }}</p>
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
  return date.toLocaleDateString('vi-VN')
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

