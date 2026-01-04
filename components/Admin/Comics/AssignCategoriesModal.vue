<template>
  <Modal v-model="modalVisible" title="Gán danh mục" :loading="assigning" size="md">
    <div class="space-y-4">
      <div v-if="comic" class="mb-4">
        <p class="text-sm text-gray-600">
          Gán danh mục cho truyện: <strong>{{ comic.title }}</strong>
        </p>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Chọn danh mục</label>
        <MultipleSelectEnhanced
          v-model="selectedCategoryIds"
          :search-api="categorySearchApi"
          label-field="name"
          value-field="id"
          placeholder="Chọn danh mục..."
        />
        <p class="text-xs text-gray-500">Có thể chọn nhiều danh mục</p>
      </div>

      <div v-if="currentCategories.length > 0" class="mt-4">
        <p class="text-sm font-medium text-gray-700 mb-2">Danh mục hiện tại:</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="cat in currentCategories"
            :key="cat.id"
            class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
          >
            {{ cat.name }}
          </span>
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
          @click="handleAssign"
          :disabled="assigning"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ assigning ? 'Đang xử lý...' : 'Gán danh mục' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import MultipleSelectEnhanced from '@/components/Core/Select/MultipleSelectEnhanced.vue'
import { useGlobalApiClient } from '@/composables/api'
import { useToast } from '@/composables/ui/useToast'
import { adminEndpoints } from '@/api/endpoints'

const props = defineProps({
  show: Boolean,
  comic: Object,
  categoryEnums: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'assigned'])

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const selectedCategoryIds = ref<number[]>([])
const assigning = ref(false)

const currentCategories = computed(() => {
  return props.comic?.categories || []
})

const categorySearchApi = computed(() => {
  return adminEndpoints.comicCategories.list
})

watch(() => props.comic, (newComic) => {
  if (newComic?.categories) {
    selectedCategoryIds.value = newComic.categories.map((c: any) => c.id)
  } else {
    selectedCategoryIds.value = []
  }
}, { immediate: true })

async function handleAssign() {
  if (!props.comic) return

  assigning.value = true

  try {
    const response = await apiClient.post(
      adminEndpoints.comics.assignCategories(props.comic.id),
      {
        category_ids: selectedCategoryIds.value
      }
    )

    if (response.data?.success) {
      showSuccess('Gán danh mục thành công')
      emit('assigned')
    } else {
      showError(response.data?.message || 'Gán danh mục thất bại')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gán danh mục thất bại')
  } finally {
    assigning.value = false
  }
}

function onClose() {
  selectedCategoryIds.value = []
  emit('close')
}
</script>

