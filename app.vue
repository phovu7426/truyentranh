<template>
  <div id="app">
    <!-- Chặn render giao diện cho đến khi config OK -->
    <div
      v-if="systemConfigLoading"
      class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Đang tải cấu hình hệ thống...</p>
      </div>
    </div>

    <div
      v-else-if="systemConfigError"
      class="fixed inset-0 bg-white flex items-center justify-center z-50 p-6"
    >
      <div class="max-w-md w-full text-center">
        <h1 class="text-xl font-semibold text-gray-900 mb-2">Không thể tải cấu hình hệ thống</h1>
        <p class="text-gray-600 mb-6">Vui lòng thử lại. Nếu lỗi vẫn tiếp diễn, hãy kiểm tra kết nối backend API.</p>
        <div class="flex items-center justify-center gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            @click="retryLoad"
          >
            Thử lại
          </button>
        </div>
        <p class="text-xs text-gray-400 mt-4 break-words">{{ systemConfigErrorMessage }}</p>
      </div>
    </div>

    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useGlobalSystemConfig } from '~/composables/system-config'
import { useAppSEO } from '@/composables/app/useAppSEO'

// Sử dụng system config ở app level
const {
  loading: systemConfigLoading,
  systemInfo,
  error: systemConfigError,
  getData,
  clearCache
} = useGlobalSystemConfig()

// SSR: đảm bảo config được load xong trước khi render UI
// Force refresh để luôn gọi API mới mỗi lần load trang
await getData()

// Nếu fail ở SSR, trả về đúng status code thay vì render UI nửa vời
if (import.meta.server && systemConfigError.value) {
  throw createError({
    statusCode: 503,
    statusMessage: 'Không thể tải cấu hình hệ thống',
  })
}

const systemConfigErrorMessage = computed(() => {
  const err = systemConfigError.value as any
  return err?.message || err?.userMessage || 'Unknown error'
})

const retryLoad = async () => {
  // Force reload (bỏ qua cache) bằng cách clear cache rồi load lại
  clearCache()
  await getData()
}

// Setup SEO meta tags và tracking scripts từ system config
useAppSEO()
</script>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  overflow-x: hidden;
}

/* Remove any unnecessary preload styles */
</style> 
