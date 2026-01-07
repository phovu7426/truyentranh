<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ parentId ? 'Trả lời bình luận' : 'Viết bình luận' }}
    </h3>

    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <textarea
            v-model="content"
            rows="4"
            placeholder="Nhập bình luận của bạn..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.content }"
            @input="clearError('content')"
          />
          <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
        </div>

        <div class="flex items-center justify-between">
          <button
            v-if="parentId"
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Hủy
          </button>
          <div v-else></div>
          <button
            type="submit"
            :disabled="submitting || !content.trim()"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Đang gửi...' : 'Gửi bình luận' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'

interface Props {
  comicId: number
  chapterId?: number | null
  parentId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  chapterId: null,
  parentId: null
})

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const content = ref('')
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

watch(() => props.parentId, (newVal) => {
  if (!newVal) {
    content.value = ''
    errors.value = {}
  }
})

function clearError(field: string) {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

async function handleSubmit() {
  if (!content.value.trim()) {
    errors.value.content = 'Nội dung bình luận không được để trống'
    return
  }

  submitting.value = true
  errors.value = {}

  try {
    const response = await apiClient.post(userEndpoints.comments.create, {
      comic_id: props.comicId,
      chapter_id: props.chapterId || null,
      parent_id: props.parentId || null,
      content: content.value.trim()
    })

    if (response.data?.success) {
      showSuccess('Bình luận thành công')
      content.value = ''
      emit('created')
    } else {
      showError(response.data?.message || 'Không thể gửi bình luận')
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
      showError(error.response?.data?.message || 'Không thể gửi bình luận')
    }
  } finally {
    submitting.value = false
  }
}
</script>



