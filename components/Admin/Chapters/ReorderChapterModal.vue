<template>
  <Modal v-model="modalVisible" title="Sắp xếp lại chương" :loading="reordering" size="md">
    <div class="space-y-4">
      <div v-if="chapter" class="mb-4">
        <p class="text-sm text-gray-600">
          Sắp xếp lại chương: <strong>{{ chapter.title }}</strong>
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Số thứ tự hiện tại: <strong>{{ chapter.chapter_index }}</strong>
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Số thứ tự mới *</label>
        <input
          v-model.number="newChapterIndex"
          type="number"
          min="1"
          placeholder="Nhập số thứ tự mới..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p class="text-xs text-gray-500">Số thứ tự phải lớn hơn hoặc bằng 1</p>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          @click="onClose"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="button"
          @click="handleReorder"
          :disabled="!newChapterIndex || newChapterIndex < 1 || reordering"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ reordering ? 'Đang xử lý...' : 'Sắp xếp lại' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { useToast } from '@/composables/ui/useToast'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  chapter: Object
})

const emit = defineEmits(['close', 'reordered'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const newChapterIndex = ref<number>(1)
const reordering = ref(false)

watch(() => props.chapter, (newChapter) => {
  if (newChapter) {
    newChapterIndex.value = newChapter.chapter_index || 1
  }
}, { immediate: true })

async function handleReorder() {
  if (!props.chapter || !newChapterIndex.value || newChapterIndex.value < 1) return

  reordering.value = true

  try {
    const response = await apiClient.put(
      adminEndpoints.chapters.reorder(props.chapter.id),
      {
        chapter_index: newChapterIndex.value
      }
    )

    if (response.data?.success) {
      showSuccess('Sắp xếp lại chương thành công')
      emit('reordered')
    } else {
      showError(response.data?.message || 'Sắp xếp lại chương thất bại')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Sắp xếp lại chương thất bại')
  } finally {
    reordering.value = false
  }
}

function onClose() {
  newChapterIndex.value = 1
  emit('close')
}
</script>

