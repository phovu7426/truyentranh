<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">{{ error.statusCode || 500 }}</h1>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        {{ error.statusMessage || 'Đã xảy ra lỗi' }}
      </h2>
      <p class="text-gray-600 mb-6">
        {{ getUserFriendlyMessage() }}
      </p>
      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          @click="handleError"
        >
          {{ error.statusCode === 404 ? 'Về trang chủ' : 'Thử lại' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ErrorProps {
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}

const props = defineProps<ErrorProps>()

const handleError = () => {
  if (props.error.statusCode === 404) {
    return navigateTo('/')
  }
  clearError({ redirect: '/' })
}

const getUserFriendlyMessage = (): string => {
  const statusCode = props.error.statusCode

  if (statusCode === 404) {
    return 'Trang bạn đang tìm kiếm không tồn tại.'
  }

  if (statusCode === 503) {
    return 'Không thể tải cấu hình hệ thống. Vui lòng thử lại sau.'
  }

  if (statusCode === 500) {
    return 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.'
  }

  return props.error.message || 'Đã xảy ra lỗi không xác định.'
}
</script>



