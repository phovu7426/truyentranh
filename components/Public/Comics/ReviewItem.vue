<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <!-- Review Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            v-if="review.user?.avatar"
            :src="review.user.avatar"
            :alt="review.user.username"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-gray-600 font-semibold">
            {{ review.user?.username?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </div>
        <div>
          <div class="font-semibold text-gray-900">{{ review.user?.username || 'Anonymous' }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</div>
        </div>
      </div>

      <!-- Rating Stars -->
      <div class="flex items-center space-x-1">
        <svg
          v-for="star in 5"
          :key="star"
          class="w-5 h-5"
          :class="star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      </div>
    </div>

    <!-- Review Content -->
    <div v-if="review.content" class="text-gray-700 whitespace-pre-wrap">
      {{ review.content }}
    </div>
    <div v-else class="text-gray-500 italic">
      Không có nội dung đánh giá
    </div>

    <!-- Updated Badge -->
    <div v-if="review.updated_at && review.updated_at !== review.created_at" class="mt-2 text-xs text-gray-500">
      Đã chỉnh sửa {{ formatDate(review.updated_at) }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  review: {
    id: number
    rating: number
    content?: string
    created_at: string
    updated_at?: string
    user?: {
      id: number
      username: string
      avatar?: string
    }
  }
}

defineProps<Props>()

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
</script>



