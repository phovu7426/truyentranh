<template>
  <Modal v-model="modalVisible" title="Upload trang ảnh" :loading="uploading" size="lg">
    <div class="space-y-4">
      <div v-if="chapter" class="mb-4">
        <p class="text-sm text-gray-600">
          Upload trang ảnh cho chương: <strong>{{ chapter.title }}</strong>
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Tối đa 100 ảnh mỗi lần upload. Ảnh sẽ được sắp xếp theo thứ tự chọn.
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Chọn ảnh *</label>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          @change="handleFileChange"
        />
        <p class="text-xs text-gray-500">Chấp nhận: JPG, PNG, WEBP (tối đa 100 ảnh)</p>
      </div>

      <div v-if="selectedFiles.length > 0" class="mt-4">
        <p class="text-sm font-medium text-gray-700 mb-2">
          Đã chọn {{ selectedFiles.length }} ảnh:
        </p>
        <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="relative group"
            >
              <img
                :src="file.preview"
                :alt="`Preview ${index + 1}`"
                class="w-full h-24 object-cover rounded border border-gray-300"
              />
              <div class="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                {{ index + 1 }}
              </div>
              <button
                type="button"
                @click="removeFile(index)"
                class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
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
          @click="handleUpload"
          :disabled="selectedFiles.length === 0 || uploading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ uploading ? 'Đang upload...' : `Upload ${selectedFiles.length} ảnh` }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { useToast } from '@/composables/ui/useToast'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  chapter: Object
})

const emit = defineEmits(['close', 'uploaded'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<Array<{ file: File; preview: string }>>([])
const uploading = ref(false)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  // Limit to 100 files
  const filesArray = Array.from(files).slice(0, 100)
  
  selectedFiles.value = filesArray.map(file => {
    const preview = URL.createObjectURL(file)
    return { file, preview }
  })
}

function removeFile(index: number) {
  URL.revokeObjectURL(selectedFiles.value[index].preview)
  selectedFiles.value.splice(index, 1)
  
  // Update file input
  if (fileInput.value) {
    const dt = new DataTransfer()
    selectedFiles.value.forEach(({ file }) => dt.items.add(file))
    fileInput.value.files = dt.files
  }
}

async function handleUpload() {
  if (!props.chapter || selectedFiles.value.length === 0) return

  uploading.value = true

  try {
    const formData = new FormData()
    selectedFiles.value.forEach(({ file }) => {
      formData.append('files', file)
    })

    const response = await apiClient.post(
      adminEndpoints.chapters.uploadPages(props.chapter.id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.data?.success) {
      showSuccess(`Upload ${selectedFiles.value.length} trang thành công`)
      resetForm()
      emit('uploaded')
    } else {
      showError(response.data?.message || 'Upload trang thất bại')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Upload trang thất bại')
  } finally {
    uploading.value = false
  }
}

function resetForm() {
  selectedFiles.value.forEach(({ preview }) => {
    URL.revokeObjectURL(preview)
  })
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onClose() {
  resetForm()
  emit('close')
}
</script>

