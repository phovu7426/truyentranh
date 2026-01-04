<template>
  <div class="sidebar-banner space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg animate-pulse">
        <div class="h-32 bg-gray-200 rounded-t-lg"></div>
        <div class="p-3">
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
      {{ error }}
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!banners || banners.length === 0" class="bg-gray-50 rounded-lg p-4 text-gray-500 text-sm text-center">
      Không có banner
    </div>
    
    <!-- Banners list -->
    <div v-else class="space-y-4">
      <div 
        v-for="banner in banners" 
        :key="banner.id"
        class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        <!-- Banner image -->
        <div class="relative">
          <img 
            :src="getImageUrl(banner.image)" 
            :alt="banner.title"
            class="w-full h-32 object-cover"
            @error="handleImageError"
          >
          
          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <a 
              v-if="banner.link"
              :href="banner.link"
              :target="banner.link_target || '_self'"
              class="text-white text-sm font-medium px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem chi tiết
            </a>
          </div>
        </div>
        
        <!-- Banner content -->
        <div class="p-3">
          <h3 class="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
            {{ banner.title }}
          </h3>
          <p v-if="banner.subtitle" class="text-xs text-gray-600 line-clamp-2">
            {{ banner.subtitle }}
          </p>
          
          <!-- Banner button -->
          <a 
            v-if="banner.button_text && banner.link"
            :href="banner.link"
            :target="banner.link_target || '_self'"
            class="inline-flex items-center w-full px-3 py-2 mt-2 rounded-lg text-xs font-medium text-center transition-all duration-200 hover:scale-105"
            :style="{ 
              backgroundColor: banner.button_color || '#3B82F6',
              color: banner.text_color || '#ffffff'
            }"
          >
            {{ banner.button_text }}
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
  limit: {
    type: Number,
    default: 3
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
    
    let bannersData = []
    // Check if response has success flag
    if (response.data?.success && response.data?.data) {
      bannersData = Array.isArray(response.data.data) ? response.data.data : []
    } else if (Array.isArray(response.data)) {
      bannersData = response.data
    }
    
    // Limit the number of banners
    banners.value = bannersData.slice(0, props.limit)
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

// Lifecycle
onMounted(() => {
  fetchBanners()
})
</script>

<style scoped>
.sidebar-banner {
  /* Custom styles if needed */
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
