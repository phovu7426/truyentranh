<template>
  <div class="banner-slider relative overflow-hidden rounded-lg" :class="containerClass">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center bg-gray-100" :class="heightClass">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center bg-gray-100" :class="heightClass">
      <div class="text-center">
        <div class="text-red-500 text-xl mb-2">⚠️</div>
        <p class="text-gray-600">{{ error }}</p>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!banners || banners.length === 0" class="flex items-center justify-center bg-gray-100" :class="heightClass">
      <p class="text-gray-500">Không có banner nào</p>
    </div>
    
    <!-- Banner slider -->
    <div v-else class="relative">
      <!-- Main banner display -->
      <div class="relative overflow-hidden" :class="heightClass">
        <transition name="fade" mode="out-in">
          <div 
            v-if="currentBanner" 
            :key="currentBanner.id"
            class="relative w-full h-full"
          >
            <!-- Banner image -->
            <img 
              :src="getImageUrl(currentBanner.image)" 
              :alt="currentBanner.title"
              class="w-full h-full object-cover"
              @error="handleImageError"
            >
            
            <!-- Overlay content -->
            <div 
              v-if="currentBanner.title || currentBanner.subtitle || currentBanner.button_text"
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"
            >
              <div class="p-6 text-white">
                <h2 v-if="currentBanner.title" class="text-2xl md:text-3xl font-bold mb-2">
                  {{ currentBanner.title }}
                </h2>
                <p v-if="currentBanner.subtitle" class="text-lg mb-4 opacity-90">
                  {{ currentBanner.subtitle }}
                </p>
                <p v-if="currentBanner.description" class="text-sm mb-4 opacity-80">
                  {{ currentBanner.description }}
                </p>
                <a 
                  v-if="currentBanner.button_text && currentBanner.link"
                  :href="currentBanner.link"
                  :target="currentBanner.link_target || '_self'"
                  :rel="currentBanner.link_target === '_blank' ? 'noopener noreferrer' : undefined"
                  class="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  :style="getCtaStyle(currentBanner)"
                >
                  {{ currentBanner.button_text }}
                  <svg 
                    v-if="currentBanner.link_target === '_blank'"
                    class="w-4 h-4 ml-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- Navigation arrows -->
      <button 
        v-if="banners.length > 1 && showArrows"
        type="button"
        @click="prevBanner"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
        :disabled="isTransitioning"
        aria-label="Banner trước"
        title="Banner trước"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button 
        v-if="banners.length > 1 && showArrows"
        type="button"
        @click="nextBanner"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
        :disabled="isTransitioning"
        aria-label="Banner tiếp theo"
        title="Banner tiếp theo"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      <!-- Indicators -->
      <div 
        v-if="banners.length > 1 && showIndicators"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1"
      >
        <button
          v-for="(banner, index) in banners"
          :key="banner.id"
          @click="goToBanner(index)"
          type="button"
          class="group w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
          :aria-label="`Đến banner ${index + 1}`"
          :title="`Đến banner ${index + 1}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
        >
          <span
            aria-hidden="true"
            class="block h-2 rounded-full transition-all duration-200"
            :class="index === currentIndex ? 'bg-white w-8' : 'bg-white/50 group-hover:bg-white/70 w-2'"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { publicEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'

const props = defineProps({
  locationCode: {
    type: String,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000 // 5 seconds
  },
  showArrows: {
    type: Boolean,
    default: true
  },
  showIndicators: {
    type: Boolean,
    default: true
  },
  containerClass: {
    type: String,
    default: ''
  },
  /**
   * Cho phép page quyết định chiều cao để tránh CLS.
   * Ví dụ: "h-[500px] md:h-[600px]"
   */
  heightClass: {
    type: String,
    default: 'h-64 md:h-96'
  }
})

const { apiClient } = useGlobalApiClient()
const config = useRuntimeConfig()

// State
const banners = ref([])
const loading = ref(false)
const error = ref(null)
const currentIndex = ref(0)
const isTransitioning = ref(false)
let autoplayInterval = null

// Computed
const currentBanner = computed(() => {
  return banners.value[currentIndex.value] || null
})

// ===== A11Y/CONTRAST HELPERS =====
function clamp01(n) {
  return Math.min(1, Math.max(0, n))
}

function parseHexColor(input) {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw.startsWith('#')) return null
  const hex = raw.slice(1)
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    if ([r, g, b].some((v) => Number.isNaN(v))) return null
    return { r, g, b }
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    if ([r, g, b].some((v) => Number.isNaN(v))) return null
    return { r, g, b }
  }
  return null
}

function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => v / 255)
  const lin = srgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrastRatio(l1, l2) {
  const a = Math.max(l1, l2)
  const b = Math.min(l1, l2)
  return (a + 0.05) / (b + 0.05)
}

function getAccessibleTextColor(background, preferredText) {
  const bg = parseHexColor(background)
  if (!bg) return preferredText || '#ffffff'

  const bgL = relativeLuminance(bg)
  const blackL = 0
  const whiteL = 1
  const blackRatio = contrastRatio(bgL, blackL)
  const whiteRatio = contrastRatio(bgL, whiteL)

  // Nếu preferred có đủ contrast (>= 4.5) thì giữ.
  const pref = parseHexColor(preferredText)
  if (pref) {
    const prefRatio = contrastRatio(bgL, relativeLuminance(pref))
    if (prefRatio >= 4.5) return preferredText
  }

  // Fallback chọn black/white có contrast cao hơn
  return whiteRatio >= blackRatio ? '#ffffff' : '#111827' // gray-900
}

function getCtaStyle(banner) {
  const bg = banner?.button_color || '#3B82F6'
  const text = getAccessibleTextColor(bg, banner?.text_color || '#ffffff')
  return {
    backgroundColor: bg,
    color: text
  }
}

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
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyNi4yMDYzIDIwIDMyIDMwIDMyIDBDMCAwIDYuMjkzNzQgNi4yOTM3NCAwIDEzLjI5MzcgMEMxMy4yOTM3IDYuMjkzNzQgMjAgMjAgMjBDMjAgMTMuNzA2MyAxMy43MDYzIDIwIDIwIDIwWiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2Zz4='
}

function nextBanner() {
  if (isTransitioning.value || banners.value.length <= 1) return
  
  isTransitioning.value = true
  currentIndex.value = (currentIndex.value + 1) % banners.value.length
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function prevBanner() {
  if (isTransitioning.value || banners.value.length <= 1) return
  
  isTransitioning.value = true
  currentIndex.value = currentIndex.value === 0 ? banners.value.length - 1 : currentIndex.value - 1
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function goToBanner(index) {
  if (isTransitioning.value || index === currentIndex.value) return
  
  isTransitioning.value = true
  currentIndex.value = index
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function startAutoplay() {
  if (!props.autoplay || banners.value.length <= 1) return
  
  stopAutoplay()
  autoplayInterval = setInterval(() => {
    nextBanner()
  }, props.interval)
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

// Watch for location code changes
watch(() => props.locationCode, (newCode) => {
  if (newCode) {
    fetchBanners()
  }
})

// Lifecycle
onMounted(() => {
  fetchBanners()
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

// Watch for autoplay prop changes
watch(() => props.autoplay, (newValue) => {
  if (newValue) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
})
</script>

<style scoped>
.banner-slider {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .banner-slider .absolute.left-4 {
    left: 1rem;
  }
  
  .banner-slider .absolute.right-4 {
    right: 1rem;
  }
  
  .banner-slider .absolute.bottom-4 {
    bottom: 1rem;
  }
}
</style>