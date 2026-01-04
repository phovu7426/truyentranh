<template>
  <div class="banner-grid" :class="containerClass">
    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-4">
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-3 bg-gray-300 rounded mb-2"></div>
          <div class="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <div class="text-center">
        <div class="text-red-500 text-xl mb-2">⚠️</div>
        <p class="text-gray-600">{{ error }}</p>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!banners || banners.length === 0" class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <p class="text-gray-500">Không có banner nào</p>
    </div>
    
    <!-- Banner grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="banner in banners" 
        :key="banner.id"
        class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <!-- Banner image -->
        <div class="relative h-48 overflow-hidden">
          <img 
            :src="getImageUrl(banner.image)" 
            :alt="banner.title"
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            @error="handleImageError"
          >
          
          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-4 left-4 right-4">
              <a 
                v-if="banner.link"
                :href="banner.link"
                :target="banner.link_target || '_self'"
                class="inline-flex items-center px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Xem chi tiết
                <svg 
                  v-if="banner.link_target === '_blank'"
                  class="w-4 h-4 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Banner content -->
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {{ banner.title }}
          </h3>
          <p v-if="banner.subtitle" class="text-sm text-gray-600 mb-3 line-clamp-2">
            {{ banner.subtitle }}
          </p>
          <p v-if="banner.description" class="text-xs text-gray-500 mb-4 line-clamp-3">
            {{ banner.description }}
          </p>
          
          <!-- Banner button -->
          <a 
            v-if="banner.button_text && banner.link"
            :href="banner.link"
            :target="banner.link_target || '_self'"
            class="inline-flex items-center w-full px-4 py-2 rounded-lg font-medium text-center transition-all duration-200 hover:scale-105"
            :style="{ 
              backgroundColor: banner.button_color || '#3B82F6',
              color: banner.text_color || '#ffffff'
            }"
          >
            {{ banner.button_text }}
            <svg 
              v-if="banner.link_target === '_blank'"
              class="w-4 h-4 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { publicEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'

const props = defineProps({
  locationCode: {
    type: String,
    required: true
  },
  containerClass: {
    type: String,
    default: ''
  }
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

// State
const banners = ref([])
const loading = ref(false)
const error = ref(null)

// Methods
async function fetchBanners() {
  if (!props.locationCode) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await apiClient.get(publicEndpoints.banners.getByLocation(props.locationCode))
    
    // Check if response has success flag
    if (response.data?.success && response.data?.data) {
      banners.value = Array.isArray(response.data.data) ? response.data.data : []
    } else if (Array.isArray(response.data)) {
      banners.value = response.data
    } else {
      banners.value = []
    }
  } catch (err) {
    console.error('Error fetching banners:', err)
    error.value = 'Không thể tải banner'
    banners.value = []
  } finally {
    loading.value = false
  }
}

function getImageUrl(path) {
  if (!path) return null
  
  // Nếu đã là URL đầy đủ (http/https), trả về trực tiếp
  if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
    return path
  }

  // Nếu là path từ API response, chỉ thêm base URL
  if (typeof path === 'string' && path.startsWith('/')) {
    return `${config.public.apiBase}${path}`
  }

  return path
}

function handleImageError(e) {
  e.target.onerror = null
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMDAiIHZpZXdCb3g9IjAgMCA0MDAgMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjRGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzI2Mi4wNjMgMTAwIDIwMCAwIDIwMCAwQzAgMCAwIDYyLjA2MyAwIDEwMCAxMDBDMCAxMzcuMDYzIDYyLjA2MyAyMDAgMjAwIDIwMFoiIHN0cm9rZT0iIzlBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2Zz4='
}

// Watch for location code changes
watch(() => props.locationCode, (newCode) => {
  if (newCode) {
    fetchBanners()
  }
}, { immediate: true })
</script>

<style scoped>
.banner-grid {
  /* Custom styles if needed */
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .banner-grid .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .banner-grid .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>