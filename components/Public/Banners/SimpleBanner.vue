<template>
  <div v-if="banner" class="simple-banner relative overflow-hidden rounded-lg shadow-md" :class="containerClass">
    <!-- Banner image -->
    <div class="relative">
      <img 
        :src="getImageUrl(banner.image)" 
        :alt="banner.title"
        class="w-full h-auto object-cover"
        @error="handleImageError"
      >
      
      <!-- Overlay content -->
      <div 
        v-if="banner.title || banner.subtitle || banner.button_text"
        class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"
      >
        <div class="p-6 text-white w-full">
          <h2 v-if="banner.title" class="text-2xl md:text-3xl font-bold mb-2">
            {{ banner.title }}
          </h2>
          <p v-if="banner.subtitle" class="text-lg mb-4 opacity-90">
            {{ banner.subtitle }}
          </p>
          <p v-if="banner.description" class="text-sm mb-4 opacity-80">
            {{ banner.description }}
          </p>
          <a 
            v-if="banner.button_text && banner.link"
            :href="banner.link"
            :target="banner.link_target || '_self'"
            class="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
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
  
  <!-- Loading state -->
  <div v-else-if="loading" class="simple-banner bg-gray-100 rounded-lg animate-pulse" :class="containerClass">
    <div class="h-48 bg-gray-200"></div>
  </div>
  
  <!-- Error state -->
  <div v-else-if="error" class="simple-banner bg-red-50 border border-red-200 rounded-lg p-4 text-red-800" :class="containerClass">
    {{ error }}
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
  index: {
    type: Number,
    default: 0
  },
  containerClass: {
    type: String,
    default: ''
  }
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

// State
const banner = ref(null)
const loading = ref(false)
const error = ref(null)

// Methods
async function fetchBanner() {
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
    
    if (bannersData.length > 0) {
      // Get banner at specified index or first banner
      banner.value = bannersData[props.index] || bannersData[0]
    } else {
      banner.value = null
    }
  } catch (err) {
    console.error('Error fetching banner:', err)
    error.value = 'Không thể tải banner'
    banner.value = null
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
    fetchBanner()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  fetchBanner()
})
</script>

<style scoped>
.simple-banner {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .simple-banner .absolute.inset-0 {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }
}
</style>
