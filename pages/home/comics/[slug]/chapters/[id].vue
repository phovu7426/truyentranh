<template>
  <div class="min-h-screen bg-gray-900" data-chapter-reader="true">
    <!-- Chapter Reader - Hiển thị khi có chapter (có thể chưa có pages) -->
    <div v-if="chapter" class="relative">
      <!-- Header Bar -->
      <div class="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink
              :to="`/home/comics/${comicSlug}`"
              class="text-white hover:text-blue-400 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </NuxtLink>
            <div class="text-white">
              <h1 class="font-semibold">{{ chapter.title }}</h1>
              <p class="text-sm text-gray-300">{{ comicTitle }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Chapter Selector Dropdown -->
            <ChapterSelector
              v-if="allChapters.length > 0"
              :chapters="allChapters"
              :selected-chapter-id="chapter?.id"
              :dark="true"
              @change="handleChapterChange"
            />

            <!-- Chapter Navigation -->
            <button
              v-if="prevChapter"
              @click="goToChapter(prevChapter.id)"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
              title="Chương trước (←)"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              v-if="nextChapter"
              @click="goToChapter(nextChapter.id)"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
              title="Chương sau (→)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <!-- Bookmark Button -->
            <BookmarkButton
              :chapter-id="chapter.id"
              :page-number="currentPage"
            />

            <!-- Settings -->
            <button
              @click="showSettings = !showSettings"
              class="p-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div
        v-if="showSettings"
        class="fixed top-16 right-4 bg-white rounded-lg shadow-xl p-4 z-40 min-w-[200px]"
      >
        <h3 class="font-semibold text-gray-900 mb-3">Cài đặt</h3>
        <div class="space-y-2">
          <label class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Chế độ đọc</span>
            <select
              v-model="readingMode"
              class="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="vertical">Dọc</option>
              <option value="horizontal">Ngang</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Pages -->
      <div class="pt-16 pb-8">
        <!-- Loading Pages -->
        <div v-if="pagesLoading" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-white text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Đang tải danh sách trang...</p>
          </div>
        </div>

        <!-- Error Loading Pages -->
        <div v-else-if="pagesError" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-white text-center max-w-md mx-auto px-4">
            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 class="text-lg font-medium mb-2">{{ pagesError }}</h3>
            <button
              @click="loadPages()"
              class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>

        <!-- No Pages -->
        <div v-else-if="pages.length === 0" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-white text-center max-w-md mx-auto px-4">
            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="text-lg font-medium mb-2">Chương này chưa có trang nào</h3>
            <NuxtLink
              :to="`/home/comics/${comicSlug}`"
              class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </NuxtLink>
          </div>
        </div>

        <!-- Pages Content -->
        <template v-else>
          <div
            v-if="readingMode === 'vertical'"
            ref="verticalScrollContainer"
            class="max-w-4xl mx-auto space-y-4 overflow-y-auto"
            style="max-height: calc(100vh - 200px);"
            @scroll="handleVerticalScroll"
          >
            <div
              v-for="(page, index) in pages"
              :key="page.id"
              :ref="el => setPageRef(el, index)"
              class="page-container"
            >
              <img
                :src="page.image_url"
                :alt="`Trang ${page.page_number}`"
                class="w-full h-auto"
                @error="handleImageError"
                @load="handleImageLoad"
              />
            </div>
          </div>

          <div
            v-else
            ref="horizontalScrollContainer"
            class="flex overflow-x-auto snap-x snap-mandatory h-screen"
            @scroll="handleHorizontalScroll"
          >
            <img
              v-for="page in pages"
              :key="page.id"
              :src="page.image_url"
              :alt="`Trang ${page.page_number}`"
              class="w-screen h-full object-contain snap-center flex-shrink-0"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
        </template>
      </div>

      <!-- Bottom Navigation -->
      <div class="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 px-4 py-3">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <button
            v-if="prevChapter"
            @click="goToChapter(prevChapter.id)"
            class="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
            title="Chương trước (←)"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Chương trước
          </button>
          <div class="text-white text-sm font-medium">
            <span v-if="pages.length > 0">Trang {{ currentPage }} / {{ pages.length }}</span>
            <span v-else>Đang tải...</span>
          </div>
          <button
            v-if="nextChapter"
            @click="goToChapter(nextChapter.id)"
            class="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
            title="Chương sau (→)"
          >
            Chương sau
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="bg-white min-h-screen pt-24 pb-8">
        <div class="max-w-4xl mx-auto px-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Bình luận</h2>
          <CommentList
            v-if="chapter"
            :comic-id="chapter.comic_id"
            :chapter-id="chapter.id"
          />
        </div>
      </div>
    </div>

    <!-- Loading Chapter State -->
    <div v-else-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-white text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Đang tải thông tin chương...</p>
      </div>
    </div>

    <!-- Chapter Not Found Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-white text-center">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h3 class="text-lg font-medium mb-2">Không tìm thấy chương</h3>
        <NuxtLink
          :to="`/home/comics/${comicSlug}`"
          class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navigateTo } from '#app'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints, userEndpoints } from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth'
import BookmarkButton from '@/components/Public/Comics/BookmarkButton.vue'
import CommentList from '@/components/Public/Comics/CommentList.vue'
import ChapterSelector from '@/components/Public/Comics/ChapterSelector.vue'
import { debounce } from '~/utils/debounce'

definePageMeta({
  layout: 'home',
  key: (route) => `chapter-${route.params.slug}-${route.params.id}`
})

const route = useRoute()
const router = useRouter()
const { apiClient } = useGlobalApiClient()
const authStore = useAuthStore()

// State
const loading = ref(false)
const pagesLoading = ref(false)
const pagesError = ref<string | null>(null)
const chapter = ref<any>(null)
const pages = ref<any[]>([])
const prevChapter = ref<any>(null)
const nextChapter = ref<any>(null)
const allChapters = ref<any[]>([])
const showSettings = ref(false)
const readingMode = ref<'vertical' | 'horizontal'>('vertical')
const currentPage = ref(1)
const viewTracked = ref(false)
const pageRefs = ref<(HTMLElement | null)[]>([])
const historyUpdatePending = ref(false)
const verticalScrollContainer = ref<HTMLElement | null>(null)
const horizontalScrollContainer = ref<HTMLElement | null>(null)

const comicSlug = computed(() => route.params.slug as string)
const comicTitle = computed(() => chapter.value?.comic?.title || '')
const comicId = computed(() => chapter.value?.comic_id || chapter.value?.comic?.id)

// Load data
async function loadData() {
  console.log('Loading data for chapter:', route.params.id, 'slug:', route.params.slug)
  await Promise.all([
    loadChapter(),
    loadPages(),
    loadNavigation(),
    loadAllChapters()
  ])
  
  // Track view
  trackView()
  
  // Check for page query param or bookmark
  await checkAndScrollToPage()
  
  // Update reading history
  updateReadingHistory()
}

onMounted(async () => {
  console.log('=== CHAPTER READER MOUNTED ===')
  console.log('Route path:', route.path)
  console.log('Route params:', route.params)
  console.log('Chapter ID:', route.params.id)
  console.log('Slug:', route.params.slug)
  console.log('Full route:', route)
  await loadData()
})

// Watch for route changes
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    console.log('Route changed, reloading data. Old ID:', oldId, 'New ID:', newId)
    // Reset state
    chapter.value = null
    pages.value = []
    prevChapter.value = null
    nextChapter.value = null
    viewTracked.value = false
    currentPage.value = 1
    await loadData()
    // Reload chapters list if needed
    if (allChapters.value.length === 0) {
      await loadAllChapters()
    }
  }
})

// Keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

async function loadChapter() {
  loading.value = true
  try {
    console.log('Loading chapter:', route.params.id)
    const endpoint = publicEndpoints.chapters.show(route.params.id as string)
    console.log('Chapter API endpoint:', endpoint)
    const response = await apiClient.get(endpoint)
    console.log('Chapter API response:', response.data)
    if (response.data?.success) {
      chapter.value = response.data.data
      console.log('Chapter loaded:', chapter.value)
    } else {
      console.error('Chapter API returned error:', response.data?.message)
    }
  } catch (error: any) {
    console.error('Failed to load chapter:', error)
    console.error('Error details:', error.response?.data)
  } finally {
    loading.value = false
  }
}

async function loadPages() {
  pagesLoading.value = true
  pagesError.value = null
  try {
    console.log('Loading pages for chapter:', route.params.id)
    const endpoint = publicEndpoints.chapters.getPages(route.params.id as string)
    console.log('API endpoint:', endpoint)
    const response = await apiClient.get(endpoint)
    console.log('Pages API response:', response.data)
    if (response.data?.success) {
      pages.value = response.data.data || []
      console.log('Loaded pages:', pages.value.length)
      if (pages.value.length === 0) {
        pagesError.value = 'Chương này chưa có trang nào'
      }
    } else {
      pagesError.value = response.data?.message || 'Không thể tải danh sách trang'
      pages.value = []
    }
  } catch (error: any) {
    console.error('Failed to load pages:', error)
    pagesError.value = error.response?.data?.message || error.message || 'Lỗi khi tải danh sách trang'
    pages.value = []
  } finally {
    pagesLoading.value = false
  }
}

async function loadNavigation() {
  try {
    const [prevResponse, nextResponse] = await Promise.all([
      apiClient.get(publicEndpoints.chapters.getPrev(route.params.id as string)),
      apiClient.get(publicEndpoints.chapters.getNext(route.params.id as string))
    ])

    if (prevResponse.data?.success && prevResponse.data.data) {
      prevChapter.value = prevResponse.data.data
    }

    if (nextResponse.data?.success && nextResponse.data.data) {
      nextChapter.value = nextResponse.data.data
    }
  } catch (error) {
    console.error('Failed to load navigation:', error)
  }
}

async function loadAllChapters() {
  if (!comicSlug.value) return
  
  try {
    const response = await apiClient.get(publicEndpoints.comics.getChapters(comicSlug.value), {
      params: {
        sort: 'chapter_index:ASC',
        limit: 500
      }
    })
    if (response.data?.success) {
      allChapters.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load all chapters:', error)
    allChapters.value = []
  }
}

function handleChapterChange(chapterId: number) {
  goToChapter(chapterId)
}

async function trackView() {
  if (viewTracked.value) return

  try {
    await apiClient.post(publicEndpoints.chapters.trackView(route.params.id as string))
    viewTracked.value = true
  } catch (error) {
    // Silent fail for view tracking
  }
}

function goToChapter(chapterId: number) {
  if (!comicSlug.value) {
    console.error('Comic slug not available for navigation.')
    return
  }
  const url = `/home/comics/${comicSlug.value}/chapters/${chapterId}`
  console.log('Navigating to chapter:', url)
  navigateTo(url).catch((err) => {
    console.error('Navigation error:', err)
  })
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' && prevChapter.value) {
    goToChapter(prevChapter.value.id)
  } else if (event.key === 'ArrowRight' && nextChapter.value) {
    goToChapter(nextChapter.value.id)
  }
}

const handleHorizontalScrollDebounced = debounce(() => {
  updateReadingHistory()
}, 2000)

function handleHorizontalScroll(event: Event) {
  const container = event.target as HTMLElement
  if (!container || pages.value.length === 0) return
  
  const scrollLeft = container.scrollLeft
  const pageWidth = container.clientWidth
  
  // Calculate which page is currently in view
  const pageIndex = Math.round(scrollLeft / pageWidth)
  const newPage = Math.min(Math.max(pageIndex + 1, 1), pages.value.length)
  
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
    handleHorizontalScrollDebounced()
  }
}

function setPageRef(el: HTMLElement | null, index: number) {
  if (el) {
    pageRefs.value[index] = el
  }
}

const handleVerticalScrollDebounced = debounce(() => {
  updateReadingHistory()
}, 2000)

function handleVerticalScroll(event: Event) {
  const container = event.target as HTMLElement
  if (!container || pages.value.length === 0) return
  
  const scrollTop = container.scrollTop
  const containerHeight = container.clientHeight
  const viewportCenter = scrollTop + containerHeight / 2
  
  // Find which page is closest to viewport center
  let closestIndex = 0
  let closestDistance = Infinity
  
  for (let i = 0; i < pageRefs.value.length; i++) {
    const pageEl = pageRefs.value[i]
    if (pageEl) {
      const pageTop = pageEl.offsetTop
      const pageHeight = pageEl.offsetHeight
      const pageCenter = pageTop + pageHeight / 2
      const distance = Math.abs(viewportCenter - pageCenter)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = i
      }
    }
  }
  
  const newPage = Math.min(Math.max(closestIndex + 1, 1), pages.value.length)
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
    handleVerticalScrollDebounced()
  }
}

function handleImageLoad() {
  // Image loaded, no need to track here
}

async function checkAndScrollToPage() {
  // Check query param first
  const pageParam = route.query.page
  if (pageParam) {
    const pageNum = parseInt(pageParam as string)
    if (pageNum > 0 && pageNum <= pages.value.length) {
      await nextTick()
      scrollToPage(pageNum)
      return
    }
  }
  
  // Check for reading history (only if authenticated)
  if (authStore.isAuthenticated && comicId.value) {
    try {
      const response = await apiClient.get(userEndpoints.readingHistory.list)
      if (response.data?.success) {
        const history = response.data.data || []
        const comicHistory = history.find((h: any) => h.comic_id === comicId.value)
        
        // If reading history exists and matches current chapter, scroll to last page
        if (comicHistory && comicHistory.chapter_id === chapter.value?.id && comicHistory.last_page) {
          await nextTick()
          scrollToPage(comicHistory.last_page)
          return
        }
      }
    } catch (error) {
      // Silent fail
    }
  }
  
  // Check for bookmark (only if authenticated)
  if (authStore.isAuthenticated && chapter.value) {
    try {
      const response = await apiClient.get(userEndpoints.bookmarks.list)
      if (response.data?.success) {
        const bookmarks = response.data.data || []
        const bookmark = bookmarks.find((b: any) => b.chapter_id === chapter.value?.id)
        if (bookmark && bookmark.page_number) {
          await nextTick()
          scrollToPage(bookmark.page_number)
        }
      }
    } catch (error) {
      // Silent fail - user might not have permission
    }
  }
}

function scrollToPage(pageNumber: number) {
  if (readingMode.value === 'vertical') {
    const pageIndex = pageNumber - 1
    const pageEl = pageRefs.value[pageIndex]
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      currentPage.value = pageNumber
    }
  } else {
    const container = document.querySelector('.flex.overflow-x-auto') as HTMLElement
    if (container) {
      const pageWidth = container.clientWidth
      container.scrollTo({
        left: (pageNumber - 1) * pageWidth,
        behavior: 'smooth'
      })
      currentPage.value = pageNumber
    }
  }
}

async function updateReadingHistory() {
  if (!authStore.isAuthenticated || !comicId.value || !chapter.value?.id || historyUpdatePending.value) {
    return
  }

  historyUpdatePending.value = true

  try {
    await apiClient.post(userEndpoints.readingHistory.create, {
      comic_id: comicId.value,
      chapter_id: chapter.value.id,
      last_page: currentPage.value
    })
  } catch (error) {
    // Silent fail - reading history is optional
  } finally {
    historyUpdatePending.value = false
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
}
</script>

<style scoped>
/* Hide scrollbar for horizontal mode */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

