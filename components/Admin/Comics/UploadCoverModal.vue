<template>
  <Modal v-model="modalVisible" title="Upload ảnh bìa" :loading="uploading" size="md">
    <div class="space-y-4">
      <div v-if="comic" class="mb-4">
        <p class="text-sm text-gray-600">
          Upload ảnh bìa cho truyện: <strong>{{ comic.title }}</strong>
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Chọn ảnh</label>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg"
          @change="handleFileChange"
        />
        <p class="text-xs text-gray-500">Chấp nhận: JPG, PNG, WEBP</p>
      </div>

      <div v-if="previewUrl" class="mt-4">
        <p class="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
        <img :src="previewUrl" alt="Preview" class="max-w-full h-48 object-contain rounded-lg border border-gray-300" />
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
          :disabled="!selectedFile || uploading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ uploading ? 'Đang upload...' : 'Upload' }}
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
  comic: Object
})

const emit = defineEmits(['close', 'uploaded'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploading = ref(false)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function handleUpload() {
  if (!selectedFile.value || !props.comic) return

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await apiClient.post(
      adminEndpoints.comics.uploadCover(props.comic.id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.data?.success) {
      showSuccess('Upload ảnh bìa thành công')
      emit('uploaded')
      resetForm()
    } else {
      showError(response.data?.message || 'Upload ảnh bìa thất bại')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Upload ảnh bìa thất bại')
  } finally {
    uploading.value = false
  }
}

function resetForm() {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onClose() {
  resetForm()
  emit('close')
}
</script>

