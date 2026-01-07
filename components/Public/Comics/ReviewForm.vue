<template>
  <ClientOnly>
    <div v-if="isAuthenticated" class="bg-white rounded-lg p-4 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá' }}
      </h3>

      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Đánh giá *</label>
            <div class="flex items-center space-x-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="rating = star"
                class="focus:outline-none"
              >
                <svg
                  class="w-8 h-8 transition-colors"
                  :class="star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </button>
              <span class="text-sm text-gray-600 ml-2">{{ getRatingLabel(rating) }}</span>
            </div>
            <p v-if="errors.rating" class="mt-1 text-sm text-red-600">{{ errors.rating }}</p>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
            <textarea
              v-model="content"
              rows="4"
              placeholder="Chia sẻ suy nghĩ của bạn về truyện này..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.content }"
              @input="clearError('content')"
            />
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between">
            <button
              v-if="myReview"
              type="button"
              @click="handleDelete"
              :disabled="deleting"
              class="px-4 py-2 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {{ deleting ? 'Đang xóa...' : 'Xóa đánh giá' }}
            </button>
            <div v-else></div>
            <button
              type="submit"
              :disabled="submitting || rating === 0"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Đang gửi...' : myReview ? 'Cập nhật' : 'Gửi đánh giá' }}
            </button>
          </div>
        </div>
      </form>
    </div>
    <div v-else class="p-4 bg-gray-50 rounded-lg text-center">
      <p class="text-gray-600 mb-2">Đăng nhập để đánh giá truyện</p>
      <NuxtLink
        to="/auth/login"
        class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Đăng nhập
      </NuxtLink>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'

interface Props {
  comicId: number
  myReview?: {
    id: number
    rating: number
    content?: string
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  created: []
  updated: []
  deleted: []
}>()

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const rating = ref(0)
const content = ref('')
const submitting = ref(false)
const deleting = ref(false)
const errors = ref<Record<string, string>>({})

watch(() => props.myReview, (newReview) => {
  if (newReview) {
    rating.value = newReview.rating
    content.value = newReview.content || ''
  } else {
    rating.value = 0
    content.value = ''
  }
  errors.value = {}
}, { immediate: true })

function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Rất tệ',
    2: 'Tệ',
    3: 'Bình thường',
    4: 'Tốt',
    5: 'Rất tốt'
  }
  return labels[rating] || 'Chưa đánh giá'
}

function clearError(field: string) {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

async function handleSubmit() {
  if (rating.value === 0) {
    errors.value.rating = 'Vui lòng chọn điểm đánh giá'
    return
  }

  submitting.value = true
  errors.value = {}

  try {
    const response = await apiClient.post(userEndpoints.reviews.createOrUpdate(props.comicId), {
      rating: rating.value,
      content: content.value.trim() || null
    })

    if (response.data?.success) {
      showSuccess(props.myReview ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công')
      if (props.myReview) {
        emit('updated')
      } else {
        emit('created')
      }
    } else {
      showError(response.data?.message || 'Không thể gửi đánh giá')
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showError(error.response?.data?.message || 'Không thể gửi đánh giá')
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

  deleting.value = true
  try {
    const response = await apiClient.delete(userEndpoints.reviews.delete(props.comicId))

    if (response.data?.success) {
      showSuccess('Xóa đánh giá thành công')
      rating.value = 0
      content.value = ''
      emit('deleted')
    } else {
      showError(response.data?.message || 'Không thể xóa đánh giá')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể xóa đánh giá')
  } finally {
    deleting.value = false
  }
}
</script>



