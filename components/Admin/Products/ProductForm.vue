<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      
      <!-- Basic Information Section -->
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Thông tin cơ bản
          </h3>
          <p class="text-sm text-gray-600 mt-1">Nhập thông tin cơ bản của sản phẩm</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tên sản phẩm -->
          <div class="md:col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Nhập tên sản phẩm"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ apiErrors.name[0] }}</p>
          </div>

          <!-- SKU -->
          <div>
            <label for="sku" class="block text-sm font-medium text-gray-700 mb-2">
              SKU <span class="text-red-500">*</span>
            </label>
            <input
              id="sku"
              v-model="formData.sku"
              type="text"
              placeholder="Mã sản phẩm duy nhất"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.sku || (apiErrors && apiErrors.sku) }"
            />
            <p v-if="validationErrors.sku" class="mt-2 text-sm text-red-600">{{ validationErrors.sku }}</p>
            <p v-else-if="apiErrors && apiErrors.sku" class="mt-2 text-sm text-red-600">{{ apiErrors.sku[0] }}</p>
          </div>

          <!-- Category -->
          <div>
            <MultipleSelectEnhanced
              v-model="formData.category_ids"
              :search-api="adminEndpoints.productCategories?.list || '/api/admin/product-categories'"
              label="Danh mục"
              label-field="name"
              value-field="id"
              placeholder="-- Chọn danh mục --"
              :error="validationErrors.category_ids || (apiErrors && apiErrors.category_ids)"
              help-text="Chọn một hoặc nhiều danh mục cho sản phẩm"
              required="required"
              @options-loaded="(options) => categoryOptions.value = options"
            />
          </div>
        </div>

        <!-- Mô tả ngắn -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
          <div @click.stop>
            <CKEditor
              id="short_description"
              v-model="formData.short_description"
              placeholder="Mô tả ngắn về sản phẩm..."
              :height="'150px'"
              :show-word-count="true"
              :show-char-count="false"
              :upload-url="'/api/admin/upload/image'"
              :max-file-size="5 * 1024 * 1024"
              :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :auto-save="false"
              :language="'vi'"
              @change="onShortDescriptionChange"
              @ready="onEditorReady"
              @error="onEditorError"
            />
          </div>
          <p v-if="validationErrors.short_description" class="mt-2 text-sm text-red-600">{{ validationErrors.short_description }}</p>
          <p v-else-if="apiErrors && apiErrors.short_description" class="mt-2 text-sm text-red-600">{{ apiErrors.short_description[0] }}</p>
        </div>

        <!-- Mô tả chi tiết -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
          <div @click.stop>
            <CKEditor
              id="description"
              v-model="formData.description"
              placeholder="Mô tả chi tiết về sản phẩm..."
              :height="'300px'"
              :should-group-when-full="false"
              :show-word-count="true"
              :show-char-count="true"
              :upload-url="'/api/admin/upload/image'"
              :max-file-size="5 * 1024 * 1024"
              :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :auto-save="false"
              :language="'vi'"
              @change="onDescriptionChange"
              @ready="onEditorReady"
              @error="onEditorError"
            />
          </div>
          <p v-if="validationErrors.description" class="mt-2 text-sm text-red-600">{{ validationErrors.description }}</p>
          <p v-else-if="apiErrors && apiErrors.description" class="mt-2 text-sm text-red-600">{{ apiErrors.description[0] }}</p>
        </div>
      </div>

      <!-- Product Configuration Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Cấu hình sản phẩm
          </h3>
          <p class="text-sm text-gray-600 mt-1">Tùy chỉnh cách sản phẩm hoạt động</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Product Variations -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <input
                v-model="formData.is_variable"
                type="checkbox"
                id="is_variable"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_variable" class="ml-2 text-sm font-medium text-gray-700">Sản phẩm có biến thể</label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Tạo nhiều phiên bản với thuộc tính khác nhau</p>
          </div>

          <!-- Digital Product -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <input
                v-model="formData.is_digital"
                type="checkbox"
                id="is_digital"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_digital" class="ml-2 text-sm font-medium text-gray-700">Sản phẩm số</label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Sản phẩm không cần vận chuyển</p>
          </div>

          <!-- Featured Product -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <input
                v-model="formData.is_featured"
                type="checkbox"
                id="is_featured"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_featured" class="ml-2 text-sm font-medium text-gray-700">Sản phẩm nổi bật</label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Hiển thị ưu tiên trên trang chủ</p>
          </div>
        </div>

        <!-- Stock Configuration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Download Limit (for digital products) -->
          <div v-if="formData.is_digital">
            <label for="download_limit" class="block text-sm font-medium text-gray-700 mb-2">
              Giới hạn tải xuống
            </label>
            <input
              id="download_limit"
              v-model="formData.download_limit"
              type="number"
              min="0"
              placeholder="Không giới hạn"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.download_limit || (apiErrors && apiErrors.download_limit) }"
            />
            <p v-if="validationErrors.download_limit" class="mt-2 text-sm text-red-600">{{ validationErrors.download_limit }}</p>
            <p v-else-if="apiErrors && apiErrors.download_limit" class="mt-2 text-sm text-red-600">{{ apiErrors.download_limit[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Số lần tải tối đa (để trống = không giới hạn)</p>
          </div>

          <!-- Minimum Stock Level -->
          <div>
            <label for="min_stock_level" class="block text-sm font-medium text-gray-700 mb-2">
              Mức tồn kho tối thiểu
            </label>
            <input
              id="min_stock_level"
              v-model="formData.min_stock_level"
              type="number"
              min="0"
              placeholder="10"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.min_stock_level || (apiErrors && apiErrors.min_stock_level) }"
            />
            <p v-if="validationErrors.min_stock_level" class="mt-2 text-sm text-red-600">{{ validationErrors.min_stock_level }}</p>
            <p v-else-if="apiErrors && apiErrors.min_stock_level" class="mt-2 text-sm text-red-600">{{ apiErrors.min_stock_level[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Cảnh báo khi tồn kho dưới mức này</p>
          </div>
        </div>
      </div>

      <!-- Images Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Hình ảnh sản phẩm
          </h3>
          <p class="text-sm text-gray-600 mt-1">Thêm hình ảnh để sản phẩm nổi bật hơn</p>
        </div>

        <!-- Main Image -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh chính</label>
          <ImageUploader
            v-model="formData.image"
            :default-url="imageUrl"
            @remove="formData.image = null"
          />
          <p v-if="validationErrors.image" class="mt-2 text-sm text-red-600">{{ validationErrors.image }}</p>
          <p v-else-if="apiErrors && apiErrors.image && Array.isArray(apiErrors.image)" class="mt-2 text-sm text-red-600">{{ apiErrors.image[0] }}</p>
        </div>

        <!-- Gallery Images -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Thư viện hình ảnh</label>
          <ImageUploader
            v-model="formData.gallery"
            :multiple="true"
            :default-urls="imageUrls"
            @remove="removeImage"
          />
          <p v-if="validationErrors.gallery" class="mt-2 text-sm text-red-600">{{ validationErrors.gallery }}</p>
          <p v-else-if="apiErrors && apiErrors.gallery && Array.isArray(apiErrors.gallery)" class="mt-2 text-sm text-red-600">{{ apiErrors.gallery[0] }}</p>
          <p class="text-xs text-gray-500 mt-1">Có thể chọn nhiều hình ảnh để tạo gallery</p>
        </div>
      </div>

      <!-- Status and SEO Section -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            Trạng thái và SEO
          </h3>
          <p class="text-sm text-gray-600 mt-1">Cài đặt trạng thái và tối ưu hóa SEO</p>
        </div>

        <!-- Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SingleSelectEnhanced
              v-model="formData.status"
              :search-api="statusApi"
              label="Trạng thái"
              label-field="label"
              value-field="value"
              placeholder="-- Chọn trạng thái --"
              :error="validationErrors.status || (apiErrors && apiErrors.status)"
              help-text="Trạng thái hoạt động của sản phẩm"
              required="required"
            />
          </div>
        </div>

        <!-- SEO Configuration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Meta Title -->
          <div>
            <label for="meta_title" class="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              id="meta_title"
              v-model="formData.meta_title"
              type="text"
              placeholder="Tiêu đề SEO"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.meta_title || (apiErrors && apiErrors.meta_title) }"
            />
            <p v-if="validationErrors.meta_title" class="mt-2 text-sm text-red-600">{{ validationErrors.meta_title }}</p>
            <p v-else-if="apiErrors && apiErrors.meta_title" class="mt-2 text-sm text-red-600">{{ apiErrors.meta_title[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Tiêu đề hiển thị trên công cụ tìm kiếm</p>
          </div>

          <!-- Canonical URL -->
          <div>
            <label for="canonical_url" class="block text-sm font-medium text-gray-700 mb-2">
              Canonical URL
            </label>
            <input
              id="canonical_url"
              v-model="formData.canonical_url"
              type="url"
              placeholder="https://example.com/product-url"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.canonical_url || (apiErrors && apiErrors.canonical_url) }"
            />
            <p v-if="validationErrors.canonical_url" class="mt-2 text-sm text-red-600">{{ validationErrors.canonical_url }}</p>
            <p v-else-if="apiErrors && apiErrors.canonical_url" class="mt-2 text-sm text-red-600">{{ apiErrors.canonical_url[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">URL chính thức để tránh nội dung trùng lặp</p>
          </div>
        </div>

        <!-- Meta Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
          <CKEditor
            id="meta_description"
            v-model="formData.meta_description"
            placeholder="Mô tả SEO"
            :height="'120px'"
            :should-group-when-full="false"
            :show-word-count="true"
            :show-char-count="false"
            :upload-url="'/api/admin/upload/image'"
            :max-file-size="5 * 1024 * 1024"
            :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
            :auto-save="false"
            :language="'vi'"
            @change="onMetaDescriptionChange"
            @ready="onEditorReady"
            @error="onEditorError"
          />
          <p v-if="validationErrors.meta_description" class="mt-2 text-sm text-red-600">{{ validationErrors.meta_description }}</p>
          <p v-else-if="apiErrors && apiErrors.meta_description" class="mt-2 text-sm text-red-600">{{ apiErrors.meta_description[0] }}</p>
          <p class="text-xs text-gray-500 mt-1">Mô tả hiển thị trên công cụ tìm kiếm</p>
        </div>

        <!-- Open Graph -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- OG Title -->
          <div>
            <label for="og_title" class="block text-sm font-medium text-gray-700 mb-2">
              OG Title
            </label>
            <input
              id="og_title"
              v-model="formData.og_title"
              type="text"
              placeholder="Tiêu đề mạng xã hội"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.og_title || (apiErrors && apiErrors.og_title) }"
            />
            <p v-if="validationErrors.og_title" class="mt-2 text-sm text-red-600">{{ validationErrors.og_title }}</p>
            <p v-else-if="apiErrors && apiErrors.og_title" class="mt-2 text-sm text-red-600">{{ apiErrors.og_title[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Tiêu đề khi chia sẻ lên mạng xã hội</p>
          </div>

          <!-- OG Image -->
          <div>
            <label for="og_image" class="block text-sm font-medium text-gray-700 mb-2">
              OG Image
            </label>
            <input
              id="og_image"
              v-model="formData.og_image"
              type="url"
              placeholder="https://example.com/og-image.jpg"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.og_image || (apiErrors && apiErrors.og_image) }"
            />
            <p v-if="validationErrors.og_image" class="mt-2 text-sm text-red-600">{{ validationErrors.og_image }}</p>
            <p v-else-if="apiErrors && apiErrors.og_image" class="mt-2 text-sm text-red-600">{{ apiErrors.og_image[0] }}</p>
            <p class="text-xs text-gray-500 mt-1">Hình ảnh khi chia sẻ lên mạng xã hội</p>
          </div>
        </div>

        <!-- OG Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">OG Description</label>
          <CKEditor
            id="og_description"
            v-model="formData.og_description"
            placeholder="Mô tả mạng xã hội"
            :height="'100px'"
            :show-word-count="true"
            :show-char-count="false"
            :auto-save="false"
            :language="'vi'"
            @change="onOgDescriptionChange"
            @ready="onEditorReady"
            @error="onEditorError"
          />
          <p v-if="validationErrors.og_description" class="mt-2 text-sm text-red-600">{{ validationErrors.og_description }}</p>
          <p v-else-if="apiErrors && apiErrors.og_description" class="mt-2 text-sm text-red-600">{{ apiErrors.og_description[0] }}</p>
          <p class="text-xs text-gray-500 mt-1">Mô tả khi chia sẻ lên mạng xã hội</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="onClose"
          class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow transition-all duration-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">
            <span class="inline-block animate-spin mr-2">&#8635;</span>
            Đang xử lý...
          </span>
          <span v-else>{{ product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import MultipleSelectEnhanced from '@/components/Core/Select/MultipleSelectEnhanced.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

// CKEditor event handlers
const onDescriptionChange = (content) => {
  // Handle description change
}

const onShortDescriptionChange = (content) => {
  // Handle short description change
}

const onMetaDescriptionChange = (content) => {
  // Handle meta description change
}

const onOgDescriptionChange = (content) => {
  // Handle OG description change
}

const onEditorReady = (editor) => {
  // Handle editor ready
}

const onEditorError = (error) => {
}

const props = defineProps({
  show: Boolean,
  product: Object,
  categories: {
    type: Array,
    default: () => []
  },
  statusEnums: {
    type: Array,
    default: () => []
  },
  categoryEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

// Watch for product prop changes
watch(() => props.product, (newVal) => {
  // Product prop changed
}, { immediate: true })

const emit = defineEmits(['submit', 'cancel', 'created', 'updated'])

// API cho enum trạng thái
const statusApi = adminEndpoints.enums.byName('product_status')

// Form title
const formTitle = computed(() => props.product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Image URLs for ImageUploader
const imageUrl = computed(() => {
  if (props.product?.image) {
    return props.product.image
  }
  return null
})

const imageUrls = computed(() => {
  if (props.product?.images && Array.isArray(props.product.images)) {
    return props.product.images
  }
  return []
})

// Form data
const formData = reactive({
  name: '',
  sku: '',
  description: '',
  short_description: '',
  min_stock_level: '',
  image: null,
  gallery: [],
  status: 'active',
  category_ids: [],
  is_featured: false,
  is_variable: true,
  is_digital: false,
  download_limit: null,
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  og_title: '',
  og_description: '',
  og_image: ''
})

// Tạo ref để theo dõi dữ liệu gốc từ API
const originalData = ref({})

// Lưu trữ các tùy chọn danh mục để hiển thị tên
const categoryOptions = ref([])

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  name: [
    { required: 'Tên sản phẩm là bắt buộc' }
  ],
  sku: [
    { required: 'SKU là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Extract categories from API response
const productCategories = computed(() => {
  if (props.product && props.product.categories && Array.isArray(props.product.categories)) {
    return props.product.categories.map(cat => ({
      id: cat.product_category_id || cat.id,
      name: cat.name || cat.category_name
    }))
  }
  return []
})

// Watch for product and categories props changes
watch([() => props.product, () => props.categories], async ([newProduct, newCategories]) => {
  if (newProduct) {
    // Save original data for comparison
    originalData.value = JSON.parse(JSON.stringify(newProduct))
    
    // Process category_ids - prioritize the correct data source
    let categoryIds = []
    
    // Priority 1: Use categories relationship array (most reliable)
    if (newProduct.categories && Array.isArray(newProduct.categories) && newProduct.categories.length > 0) {
      categoryIds = newProduct.categories.map(cat => {
        const catId = cat.product_category_id || cat.id
        return String(catId)
      })
      
      // Update categoryOptions with data from product categories
      categoryOptions.value = newProduct.categories.map(cat => ({
        id: cat.product_category_id || cat.id,
        name: cat.name || cat.category_name
      }))
    }
    // Priority 2: Use category_ids from product response if available
    else if (newProduct.category_ids && Array.isArray(newProduct.category_ids) && newProduct.category_ids.length > 0) {
      categoryIds = newProduct.category_ids.map(id => String(id))
    }
    // Priority 3: If categories from separate prop
    else if (newCategories && Array.isArray(newCategories) && newCategories.length > 0) {
      categoryIds = newCategories.map(cat => {
        const catId = cat.product_category_id || cat.id
        return String(catId)
      })
      
      // Update categoryOptions with data from prop categories
      categoryOptions.value = newCategories.map(cat => ({
        id: cat.product_category_id || cat.id,
        name: cat.name || cat.category_name
      }))
    }
    // Fallback: use single category_id if available
    else if (newProduct.category_id) {
      categoryIds = [String(newProduct.category_id)]
    }
    
    // Force update form data - ensure all fields are updated
    Object.assign(formData, {
      name: newProduct.name || '',
      sku: newProduct.sku || '',
      description: newProduct.description || '',
      short_description: newProduct.short_description || '',
      min_stock_level: newProduct.min_stock_level || '',
      image: (newProduct.image && !newProduct.image.includes('via.placeholder')) ? newProduct.image : null,
      gallery: newProduct.gallery && Array.isArray(newProduct.gallery) ? newProduct.gallery.filter(img => !img.includes('via.placeholder')) : [],
      status: newProduct.status || 'active',
      category_ids: categoryIds,
      is_featured: newProduct.is_featured || false,
      is_variable: newProduct.is_variable !== undefined ? newProduct.is_variable : true,
      is_digital: newProduct.is_digital || false,
      download_limit: newProduct.download_limit || null,
      meta_title: newProduct.meta_title || '',
      meta_description: newProduct.meta_description || '',
      canonical_url: newProduct.canonical_url || '',
      og_title: newProduct.og_title || '',
      og_description: newProduct.og_description || '',
      og_image: newProduct.og_image || ''
    })
    
    // Ensure DOM is updated
    await nextTick()
  } else {
    // When creating new, set default values
    resetForm()
    clearErrors()
    originalData.value = {}
  }
}, { immediate: true, deep: true })

// Watch category_ids changes
watch(() => formData.category_ids, (newVal, oldVal) => {
  // Handle category_ids changes
}, { immediate: true })

// Watch to sync category_ids when options are loaded
watch([() => formData.category_ids, () => categoryOptions.value], ([categoryIds, options]) => {
  // Handle sync between categoryIds and options
}, { immediate: true })

// Watch categoryOptions to update display when options are loaded
watch(() => categoryOptions.value, (newOptions) => {
  // Handle categoryOptions changes
}, { immediate: true })


// Reset form
function resetForm() {
  formData.name = ''
  formData.sku = ''
  formData.description = ''
  formData.short_description = ''
  formData.min_stock_level = ''
  formData.image = null
  formData.gallery = []
  formData.status = 'active'
  formData.category_ids = []
  formData.is_featured = false
  formData.is_variable = true
  formData.is_digital = false
  formData.download_limit = null
  formData.meta_title = ''
  formData.meta_description = ''
  formData.canonical_url = ''
  formData.og_title = ''
  formData.og_description = ''
  formData.og_image = ''
}

// Remove image from gallery
function removeImage(index) {
  if (formData.gallery && Array.isArray(formData.gallery)) {
    formData.gallery.splice(index, 1)
  }
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Create submit data - only send fields with valid values
    const submitData = {}
    
    // Always include required fields
    submitData.name = formData.name
    submitData.sku = formData.sku
    submitData.status = formData.status
    
    // Only include changed or valid fields
    if (formData.description !== undefined && formData.description !== null && formData.description !== '') {
      submitData.description = formData.description
    }
    
    if (formData.short_description !== undefined && formData.short_description !== null && formData.short_description !== '') {
      submitData.short_description = formData.short_description
    }
    
    if (formData.min_stock_level !== undefined && formData.min_stock_level !== null && formData.min_stock_level !== '') {
      submitData.min_stock_level = parseInt(formData.min_stock_level)
    }
    
    if (formData.image !== null && formData.image !== undefined) {
      submitData.image = formData.image
    }
    
    if (formData.gallery && Array.isArray(formData.gallery) && formData.gallery.length > 0) {
      submitData.gallery = formData.gallery
    }
    
    if (formData.category_ids && Array.isArray(formData.category_ids) && formData.category_ids.length > 0) {
      submitData.category_ids = formData.category_ids
    }
    
    submitData.is_featured = formData.is_featured
    submitData.is_variable = formData.is_variable
    submitData.is_digital = formData.is_digital
    
    if (formData.download_limit !== null && formData.download_limit !== undefined) {
      submitData.download_limit = parseInt(formData.download_limit)
    }
    
    if (formData.meta_title !== undefined && formData.meta_title !== null && formData.meta_title !== '') {
      submitData.meta_title = formData.meta_title
    }
    
    if (formData.meta_description !== undefined && formData.meta_description !== null && formData.meta_description !== '') {
      submitData.meta_description = formData.meta_description
    }
    
    if (formData.canonical_url !== undefined && formData.canonical_url !== null && formData.canonical_url !== '') {
      submitData.canonical_url = formData.canonical_url
    }
    
    if (formData.og_title !== undefined && formData.og_title !== null && formData.og_title !== '') {
      submitData.og_title = formData.og_title
    }
    
    if (formData.og_description !== undefined && formData.og_description !== null && formData.og_description !== '') {
      submitData.og_description = formData.og_description
    }
    
    if (formData.og_image !== undefined && formData.og_image !== null && formData.og_image !== '') {
      submitData.og_image = formData.og_image
    }
    
    // Emit appropriate event for create or update
    if (props.product) {
      // Editing - emit updated event
      emit('updated', submitData)
    } else {
      // Creating - emit created event
      emit('created', submitData)
    }
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}

// Close modal
function onClose() {
  emit('cancel')
}
</script>

<style scoped>
/* Enhanced styling for the modal */
:deep(.modal-container) {
  @apply bg-gradient-to-br from-white to-gray-50;
}

:deep(.modal-header) {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-0;
}

:deep(.modal-title) {
  @apply text-xl font-bold text-white;
}

:deep(.modal-close) {
  @apply text-white hover:text-gray-200;
}

/* Enhanced form styling */
:deep(.form-field) {
  @apply mb-4;
}

:deep(.form-field input),
:deep(.form-field textarea),
:deep(.form-field select) {
  @apply border-gray-300 rounded-lg shadow-sm transition-all duration-200;
}

:deep(.form-field input:focus),
:deep(.form-field textarea:focus),
:deep(.form-field select:focus) {
  @apply border-blue-500 ring-2 ring-blue-200 shadow-md;
}

:deep(.form-field.has-error input),
:deep(.form-field.has-error textarea),
:deep(.form-field.has-error select) {
  @apply border-red-500 ring-2 ring-red-200;
}

/* Enhanced checkbox styling */
:deep(.form-field input[type="checkbox"]) {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
}

/* Enhanced button styling */
button[type="submit"] {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105;
}

button[type="button"]:not([type="submit"]) {
  @apply bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-200;
}

/* Section styling */
.section-header {
  @apply bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-blue-500;
}

/* Grid improvements */
.grid > div {
  @apply transition-all duration-200;
}

.grid > div:hover {
  @apply transform scale-[1.02];
}

/* Enhanced input fields */
input[type="text"],
input[type="url"],
input[type="number"],
textarea {
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Background sections */
.bg-gray-50 {
  @apply hover:bg-gray-100 transition-colors duration-200;
}
</style>