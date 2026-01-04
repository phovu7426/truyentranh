<template>
  <div>
    <div v-if="previewUrl" class="mb-2 relative inline-block">
      <img
        :src="previewUrl"
        alt="preview"
        class="w-20 h-20 object-cover rounded-full border"
        :crossorigin="previewUrl && previewUrl.startsWith('http') ? 'anonymous' : null"
        @load="onImgLoad"
        @error="onImgError"
      />
      <button
        type="button"
        @click="removeImage"
        class="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition"
        style="transform: translate(40%, -40%);"
        title="Xóa ảnh"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div v-else class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full border text-gray-400">
      <span>No Image</span>
    </div>
    <input 
      type="file" 
      @change="onFileChange" 
      accept="image/*"
      :disabled="uploading"
      class="mt-2 text-sm"
    />
    <div v-if="uploading" class="text-xs text-gray-500 mt-1">
      Đang upload ảnh... {{ progress > 0 ? `${progress}%` : '' }}
    </div>
    <div v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useUpload } from '@/composables/upload'
import { useRuntimeConfig } from '#app'

const props = defineProps({
  modelValue: {
    type: [File, String],
    default: null
  },
  defaultUrl: {
    type: String,
    default: null
  },
  /**
   * Kích thước file tối đa (bytes)
   * Mặc định: 10MB
   */
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024
  },
  /**
   * Tự động upload khi chọn file
   * Nếu false, chỉ lưu File object để upload sau (khi submit form)
   * Mặc định: true (tự động upload ngay)
   */
  autoUpload: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'remove', 'uploaded', 'error'])

const config = useRuntimeConfig()
const { uploadFile, uploading, error, progress } = useUpload()

const previewUrl = ref(null)
const isUploadingFromUser = ref(false) // Flag để biết đang upload từ user action
const selectedFile = ref(null) // Lưu File object khi không auto upload

/**
 * Lấy URL đầy đủ của image
 * Hiển thị đúng URL từ API, chỉ thêm base URL nếu cần
 */
function getImageUrl(path) {
  if (!path) return null
  
  // Nếu đã là URL đầy đủ (http/https), trả về trực tiếp
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path
  }

  // Nếu là path từ API response, chỉ thêm base URL
  if (typeof path === 'string') {
    // Nếu path bắt đầu bằng /, chỉ cần thêm base URL
    if (path.startsWith('/')) {
      return `${config.public.apiBase}${path}`
    }
    // Nếu không, giữ nguyên (có thể là relative path)
    return path
  }

  return null
}

/**
 * Cleanup blob URL
 */
function revokeBlobUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url)
    } catch (e) {
      // Ignore errors when revoking
    }
  }
}

/**
 * Watch modelValue để cập nhật preview
 * Chỉ update nếu không phải đang upload từ user action
 */
watch(() => props.modelValue, (val, oldVal) => {
  // Nếu đang upload từ user, bỏ qua watch này (sẽ được xử lý trong onFileChange)
  if (isUploadingFromUser.value) {
    return
  }

  // Revoke blob URL cũ nếu có
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    revokeBlobUrl(previewUrl.value)
  }

  if (val instanceof File) {
    // Nếu là File object, tạo preview từ URL.createObjectURL
    previewUrl.value = URL.createObjectURL(val)
  } else if (typeof val === 'string' && val) {
    // Nếu là string (URL hoặc path), dùng getImageUrl - hiển thị đúng như API trả về
    previewUrl.value = getImageUrl(val)
  } else {
    // Fallback về defaultUrl nếu có
    previewUrl.value = props.defaultUrl ? getImageUrl(props.defaultUrl) : null
  }
}, { immediate: true })

/**
 * Xử lý khi user chọn file
 */
async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  // Validate file type (chỉ image)
  if (!file.type.startsWith('image/')) {
    error.value = 'Chỉ chấp nhận file ảnh'
    emit('error', new Error('Chỉ chấp nhận file ảnh'))
    return
  }

  // Validate file size
  if (file.size > props.maxSize) {
    const maxSizeMB = (props.maxSize / 1024 / 1024).toFixed(2)
    error.value = `File vượt quá kích thước tối đa ${maxSizeMB}MB`
    emit('error', new Error(`File vượt quá kích thước tối đa ${maxSizeMB}MB`))
    return
  }

  // Set flag để watch không trigger
  isUploadingFromUser.value = true

  // Lưu file
  selectedFile.value = file

  // Hiển thị preview ngay lập tức từ file local
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    revokeBlobUrl(previewUrl.value)
  }
  const blobUrl = URL.createObjectURL(file)
  previewUrl.value = blobUrl

  // Nếu autoUpload = true, upload ngay lên server và lấy URL từ API
  if (props.autoUpload) {
    try {
      await uploadImage(file, blobUrl)
    } catch (err) {
      // Giữ blob URL để user vẫn thấy preview nếu upload thất bại
      // Không cần xử lý thêm vì error đã được handle trong uploadImage
      // Reset flag ngay cả khi lỗi
      isUploadingFromUser.value = false
    }
  } else {
    // Nếu không auto upload, chỉ emit File object
    emit('update:modelValue', file)
    // Reset flag
    isUploadingFromUser.value = false
  }

  // Reset input
  e.target.value = ''
}

/**
 * Upload image lên server
 * Có thể gọi từ parent component khi submit form
 */
async function uploadImage(file, blobUrlToRevoke) {
  const fileToUpload = file || selectedFile.value
  if (!fileToUpload) {
    throw new Error('Không có file để upload')
  }

  const blobUrl = blobUrlToRevoke || previewUrl.value

  try {
    // Upload file lên server
    const response = await uploadFile(fileToUpload, {
      maxSize: props.maxSize,
      allowedTypes: ['image/*'],
      onProgress: () => {
        // Progress được handle tự động bởi composable
      }
    })

    // Lấy URL từ response (response.url hoặc response.path) - đúng như API trả về
    const urlToEmit = response.url || response.path
    
    // Hiển thị đúng URL từ API, chỉ thêm base URL
    const serverUrl = getImageUrl(urlToEmit)
    
    // Revoke blob URL cũ trước
    if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
      revokeBlobUrl(blobUrl)
    }
    
    // Set previewUrl TRƯỚC khi emit để đảm bảo không bị watch overwrite
    // Flag isUploadingFromUser vẫn đang true nên watch sẽ skip
    previewUrl.value = serverUrl
    
    // Clear selected file
    selectedFile.value = null
    
    // Emit URL gốc từ API (watch sẽ skip vì isUploadingFromUser = true)
    emit('update:modelValue', urlToEmit)
    emit('uploaded', response)
    
    // Đợi nextTick để đảm bảo previewUrl đã được render
    await nextTick()
    
    // Reset flag sau khi đã set xong và đã render
    setTimeout(() => {
      isUploadingFromUser.value = false
    }, 300)

    return response
    } catch (err) {
    // Lỗi đã được handle bởi composable
    emit('error', err)
    throw err
  }
}

/**
 * Xóa image
 */
function removeImage() {
  // Revoke object URL nếu có
  revokeBlobUrl(previewUrl.value)
  
  // Clear selected file
  selectedFile.value = null
  
  previewUrl.value = null
  emit('update:modelValue', null)
  emit('remove')
}

/**
 * Xử lý khi image load thành công
 */
function onImgLoad() {
  // Image loaded successfully
}

/**
 * Xử lý lỗi khi load image
 */
function onImgError(e) {
  e.target.onerror = null // Ngăn vòng lặp lỗi
  
  // Nếu là blob URL bị lỗi, có thể blob đã bị revoke
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    // Fallback về defaultUrl hoặc null
    previewUrl.value = props.defaultUrl ? getImageUrl(props.defaultUrl) : null
  }
}

/**
 * Cleanup khi component unmount
 */
onBeforeUnmount(() => {
  revokeBlobUrl(previewUrl.value)
})

// Expose methods để parent component có thể gọi
defineExpose({
  upload: uploadImage,
  getFile: () => selectedFile.value
})
</script> 
