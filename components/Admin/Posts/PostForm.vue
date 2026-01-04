<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl">
    <form @submit.prevent="validateAndSubmit" class="space-y-8" @click.stop>
      <!-- Thông tin cơ bản -->
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">Thông tin bài viết</h3>
          <p class="text-sm text-gray-600 mt-1">Điền tiêu đề và nội dung chính</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Tiêu đề <span class="text-red-500">*</span></label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || apiErrorsSafe.name }"
              placeholder="Nhập tiêu đề bài viết"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrorsSafe.name" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.name }}</p>
          </div>

          <div class="md:col-span-1">
            <label for="published_at" class="block text-sm font-medium text-gray-700 mb-2">Ngày xuất bản</label>
            <input
              id="published_at"
              v-model="formData.published_at"
              type="datetime-local"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.published_at || apiErrorsSafe.published_at }"
            />
            <p v-if="validationErrors.published_at" class="mt-2 text-sm text-red-600">{{ validationErrors.published_at }}</p>
            <p v-else-if="apiErrorsSafe.published_at" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.published_at }}</p>
          </div>

          <div class="md:col-span-1">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              id="status"
              v-model="formData.status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.status || apiErrorsSafe.status }"
            >
              <option value="">-- Chọn trạng thái --</option>
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="validationErrors.status" class="mt-2 text-sm text-red-600">{{ validationErrors.status }}</p>
            <p v-else-if="apiErrorsSafe.status" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.status }}</p>
          </div>

          <div class="md:col-span-1">
            <label for="post_type" class="block text-sm font-medium text-gray-700 mb-2">Loại bài viết</label>
            <select
              id="post_type"
              v-model="formData.post_type"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.post_type || apiErrorsSafe.post_type }"
            >
              <option value="text">Văn bản</option>
              <option v-for="opt in postTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p v-if="validationErrors.post_type" class="mt-2 text-sm text-red-600">{{ validationErrors.post_type }}</p>
            <p v-else-if="apiErrorsSafe.post_type" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.post_type }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Tóm tắt</label>
          <CKEditor
            v-model="formData.excerpt"
            :height="'220px'"
            :placeholder="'Nhập tóm tắt bài viết...'"
            :upload-url="'/api/upload/image'"
            :max-file-size="5242880"
            :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
            :toolbar="[
              'heading', '|',
              'bold', 'italic', 'underline', '|',
              'bulletedList', 'numberedList', '|',
              'link', '|',
              'imageUpload', '|',
              'undo', 'redo'
            ]"
            :enable-full-screen="true"
            :show-word-count="true"
            class="w-full"
          />
          <p v-if="validationErrors.excerpt" class="mt-1 text-sm text-red-600">{{ validationErrors.excerpt }}</p>
          <p v-else-if="apiErrorsSafe.excerpt" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.excerpt }}</p>
        </div>

        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">Ảnh bìa</label>
          <div class="border border-dashed border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <ImageUploader
              v-model="formData.cover_image"
              :defaultUrl="coverImageUrl"
              @remove="formData.cover_image = null"
            />
            <p class="text-xs text-gray-500 mt-2">Định dạng: jpg, png, webp. Kích thước khuyến nghị 1200x630.</p>
          </div>
          <p v-if="validationErrors.cover_image" class="mt-1 text-sm text-red-600">{{ validationErrors.cover_image }}</p>
          <p v-else-if="apiErrorsSafe.cover_image" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.cover_image }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
            <ImageUploader
              v-model="formData.image"
              :defaultUrl="imageUrl"
              @remove="formData.image = null"
            />
            <p v-if="validationErrors.image" class="mt-1 text-sm text-red-600">{{ validationErrors.image }}</p>
            <p v-else-if="apiErrorsSafe.image" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.image }}</p>
          </div>
        </div>
      </div>

      <!-- Nội dung chi tiết -->
      <div class="space-y-4">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">Nội dung & media</h3>
          <p class="text-sm text-gray-600 mt-1">Soạn thảo nội dung đầy đủ cho bài viết</p>
        </div>
        <div>
          <CKEditor
            v-model="formData.content"
            :height="'400px'"
            :placeholder="'Nhập nội dung bài viết...'"
            :upload-url="'/api/upload/image'"
            :max-file-size="5242880"
            :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
            :show-word-count="true"
            :max-word-count="10000"
            :auto-save="true"
            :auto-save-interval="10000"
            :enable-full-screen="true"
            :toolbar-mode="'full'"
            class="w-full"
          />
          <p v-if="validationErrors.content" class="mt-1 text-sm text-red-600">{{ validationErrors.content }}</p>
          <p v-else-if="apiErrorsSafe.content" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.content }}</p>
        </div>

        <!-- Video URL (hiển thị khi post_type = video) -->
        <div v-if="formData.post_type === 'video'" class="space-y-3">
          <div class="border-b border-gray-200 pb-2">
            <label class="block text-sm font-medium text-gray-700">Video URL</label>
            <p class="text-xs text-gray-500 mt-1">Nhập URL video hoặc upload file video</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                v-model="formData.video_url"
                type="url"
                placeholder="https://example.com/video.mp4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.video_url || apiErrorsSafe.video_url }"
              />
              <p v-if="validationErrors.video_url" class="mt-1 text-sm text-red-600">{{ validationErrors.video_url }}</p>
              <p v-else-if="apiErrorsSafe.video_url" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.video_url }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload Video File</label>
              <Upload
                v-model="formData.video_url"
                :accept="'video/*'"
                :max-size="100 * 1024 * 1024"
                :multiple="false"
                drag-text="Kéo thả video vào đây"
                hint-text="Hoặc click để chọn file (MP4, WebM, MOV - tối đa 100MB)"
              />
            </div>
          </div>
          <div v-if="formData.video_url" class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm text-blue-800">
              <strong>Video URL hiện tại:</strong>
              <a :href="formData.video_url" target="_blank" class="text-blue-600 underline ml-1">{{ formData.video_url }}</a>
            </p>
          </div>
        </div>

        <!-- Audio URL (hiển thị khi post_type = audio) -->
        <div v-if="formData.post_type === 'audio'" class="space-y-3">
          <div class="border-b border-gray-200 pb-2">
            <label class="block text-sm font-medium text-gray-700">Audio URL</label>
            <p class="text-xs text-gray-500 mt-1">Nhập URL audio hoặc upload file audio</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                v-model="formData.audio_url"
                type="url"
                placeholder="https://example.com/audio.mp3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.audio_url || apiErrorsSafe.audio_url }"
              />
              <p v-if="validationErrors.audio_url" class="mt-1 text-sm text-red-600">{{ validationErrors.audio_url }}</p>
              <p v-else-if="apiErrorsSafe.audio_url" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.audio_url }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload Audio File</label>
              <Upload
                v-model="formData.audio_url"
                :accept="'audio/*'"
                :max-size="50 * 1024 * 1024"
                :multiple="false"
                drag-text="Kéo thả audio vào đây"
                hint-text="Hoặc click để chọn file (MP3, WAV, OGG - tối đa 50MB)"
              />
            </div>
          </div>
          <div v-if="formData.audio_url" class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-sm text-blue-800">
              <strong>Audio URL hiện tại:</strong>
              <a :href="formData.audio_url" target="_blank" class="text-blue-600 underline ml-1">{{ formData.audio_url }}</a>
            </p>
          </div>
        </div>
      </div>

      <!-- Phân loại & trạng thái -->
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900">Phân loại & hiển thị</h3>
          <p class="text-sm text-gray-600 mt-1">Thiết lập danh mục, thẻ và hiển thị</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SingleSelectEnhanced
              v-model="formData.primary_postcategory_id"
              :search-api="adminEndpoints.postCategories?.list || '/api/admin/post-categories'"
              label="Danh mục chính"
              label-field="name"
              value-field="id"
              placeholder="Chọn danh mục chính"
              :error="validationErrors.primary_postcategory_id || apiErrorsSafe.primary_postcategory_id"
            />
            <p v-if="validationErrors.primary_postcategory_id" class="mt-1 text-sm text-red-600">{{ validationErrors.primary_postcategory_id }}</p>
            <p v-else-if="apiErrorsSafe.primary_postcategory_id" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.primary_postcategory_id }}</p>
          </div>

          <div>
            <MultipleSelectEnhanced
              v-model="formData.category_ids"
              :search-api="adminEndpoints.postCategories?.list || '/api/admin/post-categories'"
              label="Danh mục"
              label-field="name"
              value-field="id"
              placeholder="Chọn danh mục"
              :error="validationErrors.category_ids || apiErrorsSafe.category_ids"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <MultipleSelectEnhanced
              v-model="formData.tag_ids"
              :search-api="adminEndpoints.postTags?.list || '/api/admin/post-tags'"
              label="Thẻ"
              label-field="name"
              value-field="id"
              placeholder="Chọn thẻ"
              :error="validationErrors.tag_ids || apiErrorsSafe.tag_ids"
            />
          </div>
        </div>

        <!-- Tùy chọn hiển thị -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Bài viết nổi bật -->
          <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <input
                v-model="formData.is_featured"
                type="checkbox"
                id="is_featured"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_featured" class="ml-2 text-sm font-medium text-gray-700">Bài viết nổi bật</label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Hiển thị ưu tiên trên trang chủ</p>
          </div>

          <!-- Bài viết ghim -->
          <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div class="flex items-center">
              <input
                v-model="formData.is_pinned"
                type="checkbox"
                id="is_pinned"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_pinned" class="ml-2 text-sm font-medium text-gray-700">Bài viết ghim</label>
            </div>
            <p class="text-xs text-gray-500 mt-1">Ghim bài viết lên đầu danh sách</p>
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div class="space-y-6 mt-8">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            SEO
          </h3>
          <p class="text-sm text-gray-600 mt-1">Tối ưu hiển thị trên công cụ tìm kiếm và mạng xã hội</p>
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
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.meta_title || apiErrorsSafe.meta_title }"
            />
            <p v-if="validationErrors.meta_title" class="mt-2 text-sm text-red-600">{{ validationErrors.meta_title }}</p>
            <p v-else-if="apiErrorsSafe.meta_title" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.meta_title }}</p>
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
              placeholder="https://example.com/page"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.canonical_url || apiErrorsSafe.canonical_url }"
            />
            <p v-if="validationErrors.canonical_url" class="mt-2 text-sm text-red-600">{{ validationErrors.canonical_url }}</p>
            <p v-else-if="apiErrorsSafe.canonical_url" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.canonical_url }}</p>
            <p class="text-xs text-gray-500 mt-1">URL chính thức để tránh nội dung trùng lặp</p>
          </div>
        </div>

        <!-- Meta Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
          <div @click.stop>
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
            />
          </div>
          <p v-if="validationErrors.meta_description" class="mt-2 text-sm text-red-600">{{ validationErrors.meta_description }}</p>
          <p v-else-if="apiErrorsSafe.meta_description" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.meta_description }}</p>
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
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.og_title || apiErrorsSafe.og_title }"
            />
            <p v-if="validationErrors.og_title" class="mt-2 text-sm text-red-600">{{ validationErrors.og_title }}</p>
            <p v-else-if="apiErrorsSafe.og_title" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.og_title }}</p>
            <p class="text-xs text-gray-500 mt-1">Tiêu đề khi chia sẻ lên mạng xã hội</p>
          </div>

          <!-- OG Image -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
            <ImageUploader
              v-model="formData.og_image"
              :default-url="ogImageUrl"
              @remove="formData.og_image = null"
            />
            <p class="text-xs text-gray-500 mt-1">Hình ảnh hiển thị khi chia sẻ (khuyến nghị 1200x630px)</p>
            <p v-if="validationErrors.og_image" class="mt-1 text-sm text-red-600">{{ validationErrors.og_image }}</p>
            <p v-else-if="apiErrorsSafe.og_image" class="mt-1 text-sm text-red-600">{{ apiErrorsSafe.og_image }}</p>
          </div>
        </div>

        <!-- OG Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">OG Description</label>
          <div @click.stop>
            <CKEditor
              id="og_description"
              v-model="formData.og_description"
              placeholder="Mô tả mạng xã hội"
              :height="'120px'"
              :should-group-when-full="false"
              :show-word-count="true"
              :show-char-count="false"
              :upload-url="'/api/admin/upload/image'"
              :max-file-size="5 * 1024 * 1024"
              :allowed-image-types="['image/jpeg', 'image/png', 'image/gif', 'image/webp']"
              :auto-save="false"
              :language="'vi'"
            />
          </div>
          <p v-if="validationErrors.og_description" class="mt-2 text-sm text-red-600">{{ validationErrors.og_description }}</p>
          <p v-else-if="apiErrorsSafe.og_description" class="mt-2 text-sm text-red-600">{{ apiErrorsSafe.og_description }}</p>
          <p class="text-xs text-gray-500 mt-1">Mô tả khi chia sẻ lên mạng xã hội</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          @click="onClose"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Hủy
        </button>
        <button
          type="submit"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Đang xử lý...' : (post ? 'Cập nhật' : 'Thêm mới') }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import MultipleSelectEnhanced from '@/components/Core/Select/MultipleSelectEnhanced.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import CKEditor from '@/components/Core/Content/CKEditor.vue'
import Upload from '@/components/Core/Upload/Upload.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useFormValidation } from '@/composables/utils/useFormValidation'

const props = defineProps({
  show: Boolean,
  post: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  postTypeEnums: {
    type: Array,
    default: () => []
  },
  categoryEnums: {
    type: Array,
    default: () => []
  },
  tagEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Ensure apiErrors is always an object to avoid null access in template
const apiErrorsSafe = computed(() => props.apiErrors || {})

// Prefer using provided enums to avoid refetching
const statusOptions = computed(() => (props.statusEnums || []).map(opt => ({
  value: opt.value,
  label: opt.label || opt.name || opt.value
})))

const postTypeOptions = computed(() => (props.postTypeEnums || []).map(opt => ({
  value: opt.value,
  label: opt.label || opt.name || opt.value
})))

// Form title
const formTitle = computed(() => props.post ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới')

// Modal visibility
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Image URLs for ImageUploader
const coverImageUrl = computed(() => {
  if (props.post?.cover_image) {
    return props.post.cover_image
  }
  return null
})

const imageUrl = computed(() => {
  if (props.post?.image) {
    return props.post.image
  }
  return null
})

const ogImageUrl = computed(() => {
  if (props.post?.og_image) {
    return props.post.og_image
  }
  return null
})

// Form data
const formData = reactive({
    name: '',
    excerpt: '',
    content: '',
    cover_image: null,
  image: null,
  post_type: 'text', // Mặc định text
  video_url: null,
  audio_url: null,
  status: 'draft', // Mặc định draft
  published_at: '',
  primary_postcategory_id: null, // null thay vì empty string
  category_ids: [],
  tag_ids: [],
    is_featured: false,
    is_pinned: false,
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  og_title: '',
  og_description: '',
  og_image: null
})

// Form state
const isSubmitting = ref(false)

// Validation rules
const validationRules = computed(() => ({
  name: [
    { required: 'Tiêu đề là bắt buộc' },
    { max: [255, 'Tiêu đề không được vượt quá 255 ký tự'] }
  ],
  content: [
    { required: 'Nội dung là bắt buộc' }
  ]
}))

// Use form validation composable
const { validationErrors, clearErrors, validateForm } = useFormValidation(ref(formData), validationRules)

// Watch post_type để reset video_url/audio_url khi thay đổi
watch(() => formData.post_type, (newType, oldType) => {
  if (newType !== oldType) {
    // Reset video_url nếu không phải video type
    if (newType !== 'video') {
      formData.video_url = null
    }
    // Reset audio_url nếu không phải audio type
    if (newType !== 'audio') {
      formData.audio_url = null
    }
  }
})

// Watch post prop to update form data
watch(() => props.post, async (newVal) => {
  if (newVal) {
    formData.name = newVal.name || ''
    formData.excerpt = newVal.excerpt || ''
    formData.content = newVal.content || ''

    // Xử lý ảnh - set URL vào v-model để ImageUploader hiển thị
    // Chỉ set ảnh nếu URL hợp lệ (không phải placeholder)
    formData.cover_image = (newVal.cover_image && !newVal.cover_image.includes('via.placeholder')) ? newVal.cover_image : null
    formData.image = (newVal.image && !newVal.image.includes('via.placeholder')) ? newVal.image : null
    formData.og_image = (newVal.og_image && !newVal.og_image.includes('via.placeholder')) ? newVal.og_image : null

    formData.post_type = newVal.post_type || 'text'
    formData.video_url = newVal.video_url || null
    formData.audio_url = newVal.audio_url || null
    formData.status = newVal.status || 'draft'
    formData.published_at = newVal.published_at ? formatDateTimeForInput(newVal.published_at) : ''
    formData.primary_postcategory_id = newVal.primary_postcategory_id ? Number(newVal.primary_postcategory_id) : null

    // Xử lý categories - đảm bảo là mảng số nguyên
    if (newVal.categories && Array.isArray(newVal.categories)) {
      formData.category_ids = newVal.categories
        .map(cat => {
          const id = cat.id || cat
          return id ? Number(id) : null
        })
        .filter(id => id !== null && !isNaN(id) && id > 0)
    } else {
      formData.category_ids = []
    }

    // Xử lý tags - đảm bảo là mảng số nguyên
    if (newVal.tags && Array.isArray(newVal.tags)) {
      formData.tag_ids = newVal.tags
        .map(tag => {
          const id = tag.id || tag
          return id ? Number(id) : null
        })
        .filter(id => id !== null && !isNaN(id) && id > 0)
    } else {
      formData.tag_ids = []
    }

    formData.is_featured = newVal.is_featured || false
    formData.is_pinned = newVal.is_pinned || false
    formData.meta_title = newVal.meta_title || ''
    formData.meta_description = newVal.meta_description || ''
    formData.canonical_url = newVal.canonical_url || ''
    formData.og_title = newVal.og_title || ''
    formData.og_description = newVal.og_description || ''

    // Đảm bảo DOM được cập nhật
    await nextTick()
  } else {
    // Khi tạo mới, set giá trị mặc định
    formData.name = ''
    formData.excerpt = ''
    formData.content = ''
    formData.cover_image = null
    formData.image = null
    formData.post_type = 'text'
    formData.video_url = null
    formData.audio_url = null
    formData.status = 'draft'
    formData.published_at = ''
    formData.primary_postcategory_id = null
    formData.category_ids = []
    formData.tag_ids = []
    formData.is_featured = false
    formData.is_pinned = false
    formData.meta_title = ''
    formData.meta_description = ''
    formData.canonical_url = ''
    formData.og_title = ''
    formData.og_description = ''
    formData.og_image = null
    clearErrors()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.name = ''
  formData.excerpt = ''
  formData.content = ''
  formData.cover_image = null
  formData.image = null
  formData.post_type = 'text'
  formData.video_url = null
  formData.audio_url = null
  formData.status = ''
  formData.published_at = ''
  formData.primary_postcategory_id = null
  formData.category_ids = []
  formData.tag_ids = []
  formData.is_featured = false
  formData.is_pinned = false
  formData.meta_title = ''
  formData.meta_description = ''
  formData.canonical_url = ''
  formData.og_title = ''
  formData.og_description = ''
  formData.og_image = null
  clearErrors()
}

// Format datetime for input (local datetime-local format)
function formatDateTimeForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Format datetime to ISO 8601 for API
function formatDateTimeToISO(dateTimeLocal) {
  if (!dateTimeLocal) return null
  // dateTimeLocal format: YYYY-MM-DDTHH:mm
  // Convert to ISO 8601: YYYY-MM-DDTHH:mm:ssZ
  const date = new Date(dateTimeLocal)
  if (isNaN(date.getTime())) return null
  return date.toISOString()
}

// Validate and submit form
function validateAndSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // Chuẩn hóa dữ liệu theo đúng format API yêu cầu
    const submitData = {
      // Bắt buộc
      name: formData.name.trim(),
      content: formData.content.trim(),

      // Optional strings - gửi null nếu rỗng
      excerpt: formData.excerpt?.trim() || null,
      image: formData.image || null,
      cover_image: formData.cover_image || null,
      og_image: formData.og_image || null,
      meta_title: formData.meta_title?.trim() || null,
      meta_description: formData.meta_description?.trim() || null,
      canonical_url: formData.canonical_url?.trim() || null,
      og_title: formData.og_title?.trim() || null,
      og_description: formData.og_description?.trim() || null,

      // Post type và media URLs
      post_type: formData.post_type || 'text',
      video_url: formData.video_url?.trim() || null,
      audio_url: formData.audio_url?.trim() || null,

      // Status - mặc định draft nếu rỗng
      status: formData.status || 'draft',

      // Boolean - đảm bảo là boolean
      is_featured: Boolean(formData.is_featured),
      is_pinned: Boolean(formData.is_pinned),

      // Number hoặc null
      primary_postcategory_id: formData.primary_postcategory_id ? Number(formData.primary_postcategory_id) : null,

      // Array of numbers - đảm bảo là mảng số nguyên
      category_ids: Array.isArray(formData.category_ids)
        ? formData.category_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0)
        : [],
      tag_ids: Array.isArray(formData.tag_ids)
        ? formData.tag_ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0)
        : [],

      // ISO 8601 date string hoặc null
      published_at: formatDateTimeToISO(formData.published_at)
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}

// Close modal
function onClose() {
  emit('cancel')
}

</script>
