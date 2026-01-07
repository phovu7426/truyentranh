<template>
  <Modal v-model="modalVisible" title="Quản lý trang ảnh" :loading="loading || saving" size="xl">
    <div class="space-y-4">
      <div v-if="chapter" class="mb-4">
        <p class="text-sm text-gray-600">
          Quản lý trang ảnh cho chương: <strong>{{ chapter.title }}</strong>
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Đang tải danh sách trang...</p>
      </div>

      <!-- Pages list -->
      <div v-else class="space-y-4">
        <div class="flex justify-between items-center">
          <p class="text-sm font-medium text-gray-700">
            Tổng số trang: {{ pages.length }}
          </p>
          <button
            type="button"
            @click="addNewPage"
            class="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Thêm trang
          </button>
        </div>

        <div class="border border-gray-200 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(page, index) in pages"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="space-y-3">
                <!-- Header: Số thứ tự và nút xóa -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <label class="text-xs font-medium text-gray-700">Số thứ tự:</label>
                    <input
                      v-model.number="page.page_order"
                      type="number"
                      min="1"
                      :max="pages.length"
                      class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      @change="sortPagesByOrder"
                    />
                  </div>
                  <button
                    type="button"
                    @click="removePage(index)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Xóa trang"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <!-- Ảnh preview và upload -->
                <div class="relative">
                  <div
                    v-if="page.image_url"
                    class="relative group"
                  >
                    <img
                      :src="page.image_url"
                      :alt="`Page ${page.page_order || index + 1}`"
                      class="w-full h-48 object-contain bg-gray-50 rounded-lg border border-gray-300"
                      @error="handleImageError"
                      @load="(e) => detectImageSize(e, index)"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <label
                        class="px-4 py-2 bg-white text-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-gray-50 text-sm font-medium"
                      >
                        <input
                          :ref="el => setFileInputRef(el, index)"
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="(e) => handleImageChange(e, index)"
                        />
                        Sửa ảnh
                      </label>
                    </div>
                  </div>
                  <div
                    v-else
                    class="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer"
                    @click="() => triggerFileInput(index)"
                  >
                    <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="text-sm text-gray-500">Click để chọn ảnh</span>
                    <input
                      :ref="el => setFileInputRef(el, index)"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e) => handleImageChange(e, index)"
                    />
                  </div>
                  <div
                    v-if="uploadingIndex === index"
                    class="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center"
                  >
                    <div class="text-white text-sm">Đang upload...</div>
                  </div>
                </div>

                <!-- Kích thước ảnh -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                    <input
                      v-model.number="page.width"
                      type="number"
                      min="0"
                      placeholder="Tự động"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                    <input
                      v-model.number="page.height"
                      type="number"
                      min="0"
                      placeholder="Tự động"
                      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pages.length === 0" class="text-center py-12 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p>Chưa có trang nào. Nhấn "Thêm trang" để thêm.</p>
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
          @click="handleSave"
          :disabled="saving || !isValid"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { useToast } from '@/composables/ui/useToast'
import { useUpload } from '@/composables/upload'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  chapter: Object
})

const emit = defineEmits(['close', 'updated'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const { uploadFile } = useUpload()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const pages = ref<Array<{
  image_url: string
  width?: number
  height?: number
  file_size?: number
  page_order?: number
}>>([])
const loading = ref(false)
const saving = ref(false)
const uploadingIndex = ref<number | null>(null)
const fileInputRefs = ref<Array<HTMLInputElement | null>>([])

const isValid = computed(() => {
  return pages.value.length > 0 && pages.value.every(page => page.image_url && page.image_url.trim() !== '')
})

// Watch for modal show changes
watch(() => props.show, async (newShow, oldShow) => {
  if (newShow && !oldShow && props.chapter?.id) {
    await fetchPages()
  }
})

// Watch for chapter changes when modal is open
watch(() => props.chapter?.id, async (newChapterId, oldChapterId) => {
  if (props.show && newChapterId && newChapterId !== oldChapterId) {
    await fetchPages()
  }
})

// Also call fetchPages when component is mounted if modal is already shown
onMounted(() => {
  if (props.show && props.chapter?.id) {
    fetchPages()
  }
})

async function fetchPages() {
  if (!props.chapter || !props.chapter.id) {
    console.warn('ManagePagesModal: Cannot fetch pages - chapter or chapter.id is missing')
    return
  }

  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.chapters.getPages(props.chapter.id))
    if (response.data?.success) {
      const fetchedPages = (response.data.data || []).map((page: any, index: number) => ({
        image_url: page.image_url || '',
        width: page.width || undefined,
        height: page.height || undefined,
        file_size: page.file_size || undefined,
        page_order: page.page_order || page.order || (index + 1)
      }))
      // Sắp xếp theo page_order
      pages.value = fetchedPages.sort((a, b) => (a.page_order || 0) - (b.page_order || 0))
    } else {
      pages.value = []
      if (response.data?.message) {
        showError(response.data.message)
      }
    }
  } catch (error: any) {
    console.error('ManagePagesModal: Error fetching pages', error)
    pages.value = []
    showError(error.response?.data?.message || 'Không thể tải danh sách trang')
  } finally {
    loading.value = false
  }
}

function addNewPage() {
  const maxOrder = pages.value.length > 0 
    ? Math.max(...pages.value.map(p => p.page_order || 0)) 
    : 0
  pages.value.push({
    image_url: '',
    width: undefined,
    height: undefined,
    file_size: undefined,
    page_order: maxOrder + 1
  })
}

function removePage(index: number) {
  pages.value.splice(index, 1)
  // Cập nhật lại page_order
  pages.value.forEach((page, idx) => {
    if (!page.page_order) {
      page.page_order = idx + 1
    }
  })
}

function sortPagesByOrder() {
  // Sắp xếp lại theo page_order, nếu không có thì dùng index
  pages.value.sort((a, b) => {
    const orderA = a.page_order || 0
    const orderB = b.page_order || 0
    if (orderA !== orderB) {
      return orderA - orderB
    }
    return 0
  })
  // Đảm bảo page_order liên tục
  pages.value.forEach((page, idx) => {
    if (!page.page_order || page.page_order !== idx + 1) {
      page.page_order = idx + 1
    }
  })
}

function setFileInputRef(el: HTMLInputElement | null, index: number) {
  fileInputRefs.value[index] = el
}

function triggerFileInput(index: number) {
  const input = fileInputRefs.value[index]
  if (input) {
    input.click()
  }
}

async function handleImageChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Chỉ chấp nhận file ảnh')
    return
  }

  uploadingIndex.value = index
  
  try {
    // Upload file sử dụng composable
    const response = await uploadFile(file, {
      allowedTypes: ['image/*'],
      maxSize: 10 * 1024 * 1024, // 10MB
    })
    
    // Lấy URL từ response
    const imageUrl = response.url || response.path
    if (imageUrl) {
      pages.value[index].image_url = imageUrl
      pages.value[index].file_size = file.size
      
      // Tự động detect kích thước từ ảnh
      await detectImageSizeFromUrl(imageUrl, index)
      
      showSuccess('Upload ảnh thành công')
    } else {
      showError('Không nhận được URL ảnh từ server')
    }
  } catch (error: any) {
    console.error('Error uploading image:', error)
    showError(error.message || 'Upload ảnh thất bại')
  } finally {
    uploadingIndex.value = null
    // Reset input
    target.value = ''
  }
}

function detectImageSize(event: Event, index: number) {
  const img = event.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight && (!pages.value[index].width || !pages.value[index].height)) {
    pages.value[index].width = img.naturalWidth
    pages.value[index].height = img.naturalHeight
  }
}

async function detectImageSizeFromUrl(url: string, index: number): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (!pages.value[index].width || !pages.value[index].height) {
        pages.value[index].width = img.naturalWidth
        pages.value[index].height = img.naturalHeight
      }
      resolve()
    }
    img.onerror = () => resolve()
    img.src = url
  })
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

async function handleSave() {
  if (!props.chapter || !isValid.value) return

  saving.value = true

  try {
    const response = await apiClient.put(
      adminEndpoints.chapters.updatePages(props.chapter.id),
      {
        pages: pages.value.map((page, index) => ({
          image_url: page.image_url.trim(),
          width: page.width || undefined,
          height: page.height || undefined,
          file_size: page.file_size || undefined,
          page_order: page.page_order || (index + 1)
        }))
      }
    )

    if (response.data?.success) {
      showSuccess('Cập nhật trang thành công')
      emit('updated')
    } else {
      showError(response.data?.message || 'Cập nhật trang thất bại')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Cập nhật trang thất bại')
  } finally {
    saving.value = false
  }
}

function onClose() {
  pages.value = []
  fileInputRefs.value = []
  uploadingIndex.value = null
  emit('close')
}
</script>

