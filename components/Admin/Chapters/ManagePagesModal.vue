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

        <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
          <div class="space-y-3">
            <div
              v-for="(page, index) in pages"
              :key="index"
              class="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex-shrink-0">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                  {{ index + 1 }}
                </span>
              </div>

              <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">URL ảnh *</label>
                  <input
                    v-model="page.image_url"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                  <input
                    v-model.number="page.width"
                    type="number"
                    placeholder="800"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                  <input
                    v-model.number="page.height"
                    type="number"
                    placeholder="1200"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div class="flex-shrink-0">
                <button
                  type="button"
                  @click="removePage(index)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="pages.length === 0" class="text-center py-8 text-gray-500">
              Chưa có trang nào. Nhấn "Thêm trang" để thêm.
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="pages.length > 0" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Xem trước (3 trang đầu):</p>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(page, index) in pages.slice(0, 3)"
              :key="index"
              class="relative"
            >
              <img
                v-if="page.image_url"
                :src="page.image_url"
                :alt="`Page ${index + 1}`"
                class="w-full h-32 object-cover rounded border border-gray-300"
                @error="handleImageError"
              />
              <div v-else class="w-full h-32 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-400">
                Chưa có ảnh
              </div>
              <div class="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                {{ index + 1 }}
              </div>
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
import { ref, computed, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { useToast } from '@/composables/ui/useToast'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  chapter: Object
})

const emit = defineEmits(['close', 'updated'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const pages = ref<Array<{
  image_url: string
  width?: number
  height?: number
  file_size?: number
}>>([])
const loading = ref(false)
const saving = ref(false)

const isValid = computed(() => {
  return pages.value.length > 0 && pages.value.every(page => page.image_url && page.image_url.trim() !== '')
})

watch(() => props.show, async (newValue) => {
  if (newValue && props.chapter) {
    await fetchPages()
  }
})

async function fetchPages() {
  if (!props.chapter) return

  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.chapters.getPages(props.chapter.id))
    if (response.data?.success) {
      pages.value = (response.data.data || []).map((page: any) => ({
        image_url: page.image_url || '',
        width: page.width || undefined,
        height: page.height || undefined,
        file_size: page.file_size || undefined
      }))
    } else {
      pages.value = []
    }
  } catch (error) {
    pages.value = []
  } finally {
    loading.value = false
  }
}

function addNewPage() {
  pages.value.push({
    image_url: '',
    width: undefined,
    height: undefined,
    file_size: undefined
  })
}

function removePage(index: number) {
  pages.value.splice(index, 1)
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
        pages: pages.value.map(page => ({
          image_url: page.image_url.trim(),
          width: page.width || undefined,
          height: page.height || undefined,
          file_size: page.file_size || undefined
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
  emit('close')
}
</script>

