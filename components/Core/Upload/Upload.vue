<template>
  <div class="upload-component">
    <!-- Upload Area -->
    <div
      class="upload-area"
      :class="{
        'upload-area-dragging': isDragging,
        'upload-area-disabled': disabled || uploading,
        'upload-area-has-file': hasFile
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled || uploading"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="upload-content">
        <!-- Icon -->
        <div class="upload-icon">
          <svg
            v-if="!uploading && !hasFile"
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div
            v-else-if="uploading"
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
          ></div>
          <svg
            v-else-if="hasFile"
            xmlns="http://www.w3.org/2000/svg"
            class="w-12 h-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Text -->
        <div class="upload-text">
          <p v-if="!uploading && !hasFile" class="text-gray-700 font-medium">
            {{ dragText }}
          </p>
          <p v-else-if="uploading" class="text-blue-600 font-medium">
            Đang upload...
          </p>
          <p v-else-if="hasFile" class="text-green-600 font-medium">
            Upload thành công!
          </p>
          <p v-if="!uploading && !hasFile" class="text-sm text-gray-500 mt-1">
            {{ hintText }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div v-if="uploading && progress > 0" class="w-full mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1 text-center">{{ progress }}%</p>
        </div>
      </div>
    </div>

    <!-- File List (Multiple files) -->
    <div v-if="multiple && uploadedFiles.length > 0" class="mt-4 space-y-2">
      <div
        v-for="(file, index) in uploadedFiles"
        :key="index"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
      >
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ file.filename }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(file.size) }} • {{ file.mimetype }}
            </p>
          </div>
        </div>
        <button
          v-if="!disabled"
          type="button"
          @click.stop="removeFile(index)"
          class="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition"
          title="Xóa file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Single File Info -->
    <div v-else-if="!multiple && uploadedFile" class="mt-4">
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ uploadedFile.filename }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatFileSize(uploadedFile.size) }} • {{ uploadedFile.mimetype }}
            </p>
            <a
              :href="getFileUrl(uploadedFile.url || uploadedFile.path)"
              target="_blank"
              class="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
            >
              Xem file
            </a>
          </div>
        </div>
        <button
          v-if="!disabled"
          type="button"
          @click="removeFile"
          class="ml-3 flex-shrink-0 text-red-500 hover:text-red-700 transition"
          title="Xóa file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="mt-2 text-xs text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { useRuntimeConfig } from '#app'
import { useUpload } from '@/composables/upload'
import type { UploadResponse } from '@/composables/upload'

const props = defineProps({
  /**
   * Model value - URL string hoặc array of URLs
   */
  modelValue: {
    type: [String, Array] as PropType<string | string[] | null>,
    default: null,
    required: false
  },
  /**
   * Cho phép upload nhiều files
   */
  multiple: {
    type: Boolean as PropType<boolean>,
    default: false,
    required: false
  },
  /**
   * Accept file types (MIME types hoặc extensions)
   * Ví dụ: 'image/*', '.pdf,.doc', 'image/jpeg,image/png'
   */
  accept: {
    type: String as PropType<string>,
    default: '',
    required: false
  },
  /**
   * Kích thước file tối đa (bytes)
   * Mặc định: 10MB
   */
  maxSize: {
    type: Number as PropType<number>,
    default: 10 * 1024 * 1024,
    required: false
  },
  /**
   * Disable upload
   */
  disabled: {
    type: Boolean as PropType<boolean>,
    default: false,
    required: false
  },
  /**
   * Text hiển thị khi drag & drop
   */
  dragText: {
    type: String as PropType<string>,
    default: 'Kéo thả file vào đây hoặc click để chọn',
    required: false
  },
  /**
   * Hint text
   */
  hintText: {
    type: String as PropType<string>,
    default: '',
    required: false
  },
  /**
   * Help text
   */
  helpText: {
    type: String as PropType<string>,
    default: '',
    required: false
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error', 'remove'])

const config = useRuntimeConfig()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadedFile = ref<UploadResponse | null>(null)
const uploadedFiles = ref<UploadResponse[]>([])

const { uploadFile, uploadFiles, uploading, error, progress } = useUpload()

/**
 * Lấy URL đầy đủ để hiển thị/tải file
 */
function getFileUrl(path: string | undefined): string | null {
  if (!path) return null

  // Nếu đã là URL đầy đủ (http/https)
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path
  }

  // Nếu là path từ API, chỉ thêm base URL
  if (typeof path === 'string' && path.startsWith('/')) {
    return `${config.public.apiBase}${path}`
  }

  return path || null
}

/**
 * Computed: hasFile
 */
const hasFile = computed(() => {
  return props.multiple
    ? uploadedFiles.value.length > 0
    : uploadedFile.value !== null
})

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Trigger file input
 */
function triggerFileInput() {
  if (props.disabled || uploading.value) return
  fileInputRef.value?.click()
}

/**
 * Handle file select
 */
async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length === 0) return

  await processFiles(files)

  // Reset input
  target.value = ''
}

/**
 * Handle drag over
 */
function handleDragOver(event: DragEvent) {
  if (props.disabled || uploading.value) return
  isDragging.value = true
}

/**
 * Handle drag leave
 */
function handleDragLeave() {
  isDragging.value = false
}

/**
 * Handle drop
 */
async function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (props.disabled || uploading.value) return

  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length === 0) return

  await processFiles(files)
}

/**
 * Process files
 */
async function processFiles(files: File[]) {
  try {
    if (props.multiple) {
      // Upload nhiều files
      const responses = await uploadFiles(files, {
        maxSize: props.maxSize,
        onProgress: () => {
          // Progress được handle tự động
        }
      })

      uploadedFiles.value = [...uploadedFiles.value, ...responses]

      // Emit modelValue với URL từ API (không thay đổi)
      const urls = uploadedFiles.value.map(f => f.url || f.path)
      emit('update:modelValue', urls)
      emit('uploaded', responses)
    } else {
      // Upload một file
      const file = files[0]
      if (!file) return
      const response = await uploadFile(file, {
        maxSize: props.maxSize,
        onProgress: () => {
          // Progress được handle tự động
        }
      })

      uploadedFile.value = response

      // Emit modelValue với URL từ API (không thay đổi)
      const urlToEmit = response.url || response.path
      emit('update:modelValue', urlToEmit)
      emit('uploaded', response)
    }
  } catch (err) {
    emit('error', err)
  }
}

/**
 * Remove file
 */
function removeFile(index?: number) {
  if (props.multiple) {
    if (typeof index === 'number') {
      uploadedFiles.value.splice(index, 1)
      const urls = uploadedFiles.value.map(f => f.url || f.path)
      emit('update:modelValue', urls.length > 0 ? urls : null)
      emit('remove', index)
    }
  } else {
    uploadedFile.value = null
    emit('update:modelValue', null)
    emit('remove')
  }
}

/**
 * Watch modelValue để sync với props
 */
watch(
  () => props.modelValue,
  (value) => {
    // Nếu modelValue thay đổi từ bên ngoài, cần sync lại
    // Nhưng để đơn giản, component này chủ yếu là one-way từ user input
    // Có thể mở rộng sau nếu cần
  },
  { immediate: true }
)

// Set default hint text nếu không có
if (!props.hintText) {
  const maxSizeMB = (props.maxSize / 1024 / 1024).toFixed(2)
  const hint = props.multiple
    ? `Tối đa 10 files, mỗi file tối đa ${maxSizeMB}MB`
    : `Kích thước tối đa ${maxSizeMB}MB`
  // Không thể thay đổi props, chỉ có thể set default trong prop definition
}
</script>

<style scoped>
.upload-component {
  @apply w-full;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200;
  @apply hover:border-blue-400 hover:bg-blue-50;
}

.upload-area-dragging {
  @apply border-blue-500 bg-blue-100;
}

.upload-area-disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply hover:border-gray-300 hover:bg-transparent;
}

.upload-area-has-file {
  @apply border-green-300 bg-green-50;
}

.upload-content {
  @apply flex flex-col items-center justify-center;
}

.upload-icon {
  @apply mb-4;
}

.upload-text {
  @apply flex flex-col items-center;
}
</style>
