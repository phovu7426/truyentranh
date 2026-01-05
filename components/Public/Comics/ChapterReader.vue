<template>
  <div class="min-h-screen bg-white" data-chapter-reader="true">
    <!-- Chapter Reader - Hiển thị khi có chapter -->
    <div v-if="chapter" class="relative">
      <!-- Header Bar - Auto hide khi scroll -->
      <div 
        :class="[
          'fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-50 px-4 py-3 transition-transform duration-300',
          showHeader ? 'translate-y-0' : '-translate-y-full'
        ]"
        @mouseenter="showHeader = true"
      >
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
              <h1 class="font-semibold">{{ chapter.title || `Chương ${chapter.chapter_index}` }}</h1>
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
              @click="goToChapter(prevChapter.chapter_index)"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
              title="Chương trước (←)"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              v-if="nextChapter"
              @click="goToChapter(nextChapter.chapter_index)"
              class="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center"
              title="Chương sau (→)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <!-- Bookmark Button -->
            <BookmarkButton
              v-if="chapter.id"
              :chapter-id="chapter.id"
              :page-number="currentPage"
              :initial-bookmark="initialBookmark"
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

      <!-- Hover Zone - Hiện header khi hover vào đầu trang -->
      <div
        v-if="!showHeader"
        @mouseenter="showHeader = true"
        class="fixed top-0 left-0 right-0 h-20 z-40"
      ></div>

      <!-- Pages - Không có padding, ảnh bắt đầu từ đầu trang -->
      <div class="w-full">
        <!-- Loading Pages -->
        <div v-if="pagesLoading" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-gray-700 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
            <p>Đang tải danh sách trang...</p>
          </div>
        </div>

        <!-- Error Loading Pages -->
        <div v-else-if="pagesError" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-gray-700 text-center max-w-md mx-auto px-4">
            <svg class="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 class="text-lg font-medium mb-2 text-gray-900">{{ pagesError }}</h3>
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
          <div class="text-gray-700 text-center max-w-md mx-auto px-4">
            <svg class="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="text-lg font-medium mb-2 text-gray-900">Chương này chưa có trang nào</h3>
            <NuxtLink
              :to="`/home/comics/${comicSlug}`"
              class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </NuxtLink>
          </div>
        </div>

        <!-- Pages Content - Ảnh liên tiếp, không có khung -->
        <template v-else>
          <div
            v-if="readingMode === 'vertical'"
            ref="verticalScrollContainer"
            class="w-full"
          >
            <img
              v-for="(page, index) in pages"
              :key="page.id"
              :ref="el => setPageRef(el, index)"
              :src="page.image_url"
              :alt="`Trang ${page.page_number}`"
              class="w-full h-auto block"
              @error="handleImageError"
              @load="handleImageLoad"
            />
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

      <!-- Comments Section -->
      <div class="bg-white min-h-screen pt-24 pb-8">
        <div class="max-w-4xl mx-auto px-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Bình luận</h2>
          <CommentList
            v-if="chapter"
            :comic-id="chapter.comic_id || comicId"
            :chapter-id="chapter.id"
          />
        </div>
      </div>
    </div>

    <!-- Loading Chapter State -->
    <div v-else-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-gray-700 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
        <p>Đang tải thông tin chương...</p>
      </div>
    </div>

    <!-- Chapter Not Found Error State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-gray-700 text-center">
        <svg class="mx-auto h-12 w-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h3 class="text-lg font-medium mb-2 text-gray-900">Không tìm thấy chương</h3>
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
import { useSeo } from '@/composables/seo'
import { useAuthStore } from '@/stores/auth'
import BookmarkButton from '@/components/Public/Comics/BookmarkButton.vue'
import CommentList from '@/components/Public/Comics/CommentList.vue'
import ChapterSelector from '@/components/Public/Comics/ChapterSelector.vue'
import { debounce } from '~/utils/debounce'

const route = useRoute()
const router = useRouter()
const { apiClient } = useGlobalApiClient()
const authStore = useAuthStore()

// State
// Bắt đầu ở trạng thái loading để tránh nháy "Không tìm thấy chương" trước khi dữ liệu được load
const loading = ref(true)
const pagesLoading = ref(false)
const pagesError = ref<string | null>(null)
const chapter = ref<any>(null)
const comic = ref<any>(null)
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
const readingHistoryCreated = ref(false)
const verticalScrollContainer = ref<HTMLElement | null>(null)
const horizontalScrollContainer = ref<HTMLElement | null>(null)
const showHeader = ref(true)
const lastScrollY = ref(0)
const scrollTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const initialBookmark = ref<any | null>(null)

const comicSlug = computed(() => route.params.slug as string)
const chapterIndex = computed(() => (route.params as any).chapter_index as string)
const comicTitle = computed(() => comic.value?.title || chapter.value?.comic?.title || '')
const comicId = computed(() => chapter.value?.comic_id || chapter.value?.comic?.id || comic.value?.id)

// Load data
onMounted(async () => {
  // Setup keyboard navigation
  window.addEventListener('keydown', handleKeyPress)
  
  await loadData()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('scroll', handleWindowScroll)
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})

watch(() => (route.params as any).chapter_index, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    // Reset state
    loading.value = true
    chapter.value = null
    comic.value = null
    pages.value = []
    prevChapter.value = null
    nextChapter.value = null
    viewTracked.value = false
    currentPage.value = 1
    pageRefs.value = []
    
    await loadData()
  }
})

watch(() => readingMode.value, (newMode) => {
  if (newMode === 'vertical') {
    window.addEventListener('scroll', handleWindowScroll, { passive: true })
    // Reset scroll position tracking
    lastScrollY.value = window.pageYOffset || document.documentElement.scrollTop
  } else {
    window.removeEventListener('scroll', handleWindowScroll)
    // Show header khi chuyển sang horizontal mode
    showHeader.value = true
  }
})

// Watch chapter và comic để update SEO khi data thay đổi
watch([chapter, comic], ([newChapter, newComic]) => {
  if (newChapter && newComic) {
    useSeo({
      title: `${newChapter.title || `Chương ${newChapter.chapter_index}`} - ${newComic.title}`,
      description: `Đọc ${newChapter.title || `Chương ${newChapter.chapter_index}`} của ${newComic.title}`,
      image: newComic.cover_image,
      type: 'article'
    })
  }
}, { immediate: true })

async function loadData() {
  await Promise.all([
    loadChapter(),
    loadAllChapters()
  ])
  
  // Load pages after chapter is loaded
  if (chapter.value?.id) {
    await loadPages()
    await loadNavigation()
    
    // Setup scroll listener after pages are loaded
    await nextTick()
    if (readingMode.value === 'vertical') {
      window.addEventListener('scroll', handleWindowScroll, { passive: true })
      // Initialize scroll position
      lastScrollY.value = window.pageYOffset || document.documentElement.scrollTop
    }
    
    // Track view
    trackView()
    // Lưu lịch sử đọc (chỉ theo chapter, gọi 1 lần khi vào chapter)
    await updateReadingHistory()
    
    // Check for page query param hoặc bookmark (không gọi lại reading-history)
    await checkAndScrollToPage()
  }
}

async function loadChapter() {
  loading.value = true
  try {
    // First, get chapters list to find chapter by index
    const chaptersResponse = await apiClient.get(publicEndpoints.comics.getChapters(comicSlug.value), {
      params: {
        chapter_index: chapterIndex.value,
        limit: 1
      }
    })
    
    if (chaptersResponse.data?.success && chaptersResponse.data.data?.length > 0) {
      const foundChapter = chaptersResponse.data.data[0]
      
      // Load full chapter details
      const response = await apiClient.get(publicEndpoints.chapters.show(foundChapter.id.toString()), {
        params: {
          include: 'comic,prev,next'
        }
      })
      
      if (response.data?.success) {
        chapter.value = response.data.data
        comic.value = chapter.value?.comic || null
        prevChapter.value = chapter.value?.prev_chapter || null
        nextChapter.value = chapter.value?.next_chapter || null
        
        if (chapter.value && comic.value) {
          useSeo({
            title: `${chapter.value.title || `Chương ${chapter.value.chapter_index}`} - ${comic.value.title}`,
            description: `Đọc ${chapter.value.title || `Chương ${chapter.value.chapter_index}`} của ${comic.value.title}`,
            image: comic.value.cover_image,
            type: 'article'
          })
        }
      }
    }
  } catch (error: any) {
    console.error('Failed to load chapter:', error)
  } finally {
    loading.value = false
  }
}

async function loadPages() {
  if (!chapter.value?.id) return
  
  pagesLoading.value = true
  pagesError.value = null
  try {
    const endpoint = publicEndpoints.chapters.getPages(chapter.value.id.toString())
    const response = await apiClient.get(endpoint)
    
    if (response.data?.success) {
      pages.value = response.data.data || []
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
  if (!chapter.value?.id) return
  
  try {
    const [prevResponse, nextResponse] = await Promise.all([
      apiClient.get(publicEndpoints.chapters.getPrev(chapter.value.id.toString())),
      apiClient.get(publicEndpoints.chapters.getNext(chapter.value.id.toString()))
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
  // Find chapter by ID to get chapter_index
  const selectedChapter = allChapters.value.find(c => c.id === chapterId)
  if (selectedChapter) {
    goToChapter(selectedChapter.chapter_index)
  }
}

async function trackView() {
  if (viewTracked.value || !chapter.value?.id) return

  try {
    await apiClient.post(publicEndpoints.chapters.trackView(chapter.value.id.toString()))
    viewTracked.value = true
  } catch (error) {
    // Silent fail for view tracking
  }
}

async function goToChapter(index: number | string) {
  if (!comicSlug.value) return
  try {
    await navigateTo(`/home/comics/${comicSlug.value}/chapters/${index}`)
  } catch (err: any) {
    console.error('Navigation error:', err)
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft' && prevChapter.value) {
    goToChapter(prevChapter.value.chapter_index)
  } else if (event.key === 'ArrowRight' && nextChapter.value) {
    goToChapter(nextChapter.value.chapter_index)
  }
}

function handleHorizontalScroll(event: Event) {
  const container = event.target as HTMLElement
  if (!container || pages.value.length === 0) return
  
  const scrollLeft = container.scrollLeft
  const pageWidth = container.clientWidth
  
  const pageIndex = Math.round(scrollLeft / pageWidth)
  const newPage = Math.min(Math.max(pageIndex + 1, 1), pages.value.length)
  
  if (newPage !== currentPage.value) {
    currentPage.value = newPage
  }
}

function setPageRef(el: HTMLElement | null, index: number) {
  if (el) {
    pageRefs.value[index] = el
  }
}

function handleVerticalScroll(event: Event) {
  // Legacy handler for container scroll (not used anymore but kept for compatibility)
  handleWindowScroll()
}

function handleWindowScroll() {
  if (readingMode.value !== 'vertical' || pages.value.length === 0) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const viewportCenter = scrollTop + windowHeight / 2
  
  // Luôn hiện header khi ở đầu trang
  if (scrollTop < 100) {
    showHeader.value = true
    lastScrollY.value = scrollTop
    return
  }
  
  // Auto-hide header khi scroll
  const scrollDelta = scrollTop - lastScrollY.value
  const scrollThreshold = 10 // Ngưỡng scroll để trigger hide/show
  
  // Ẩn header khi scroll xuống, hiện khi scroll lên
  if (Math.abs(scrollDelta) > scrollThreshold) {
    if (scrollDelta > 0) {
      // Scroll xuống - ẩn header
      showHeader.value = false
    } else if (scrollDelta < 0) {
      // Scroll lên - hiện header
      showHeader.value = true
    }
    lastScrollY.value = scrollTop
  }
  
  // Auto-show header sau 3 giây không scroll (để người dùng có thể thao tác)
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
  scrollTimeout.value = setTimeout(() => {
    if (scrollTop > 100) {
      showHeader.value = true
    }
  }, 3000)
  
  // Track current page
  let closestIndex = 0
  let closestDistance = Infinity
  
  for (let i = 0; i < pageRefs.value.length; i++) {
    const pageEl = pageRefs.value[i]
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect()
      const pageTop = rect.top + scrollTop
      const pageHeight = rect.height
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
  }
}

function handleImageLoad() {
  // Image loaded
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
  
  // Check for bookmark (only if authenticated)
  if (authStore.isAuthenticated && chapter.value) {
    try {
      const response = await apiClient.get(userEndpoints.bookmarks.list, {
        params: {
          comic_id: comicId.value,
          chapter_id: chapter.value.id
        }
      })
      if (response.data?.success) {
        const data = response.data.data
        const bookmark = Array.isArray(data) ? (data[0] || null) : data
        initialBookmark.value = bookmark
        if (bookmark && bookmark.page_number) {
          await nextTick()
          scrollToPage(bookmark.page_number)
        }
      }
    } catch (error) {
      // Silent fail
    }
  }
}

function scrollToPage(pageNumber: number) {
  if (readingMode.value === 'vertical') {
    const pageIndex = pageNumber - 1
    const pageEl = pageRefs.value[pageIndex]
    if (pageEl) {
      // Scroll window to page
      const rect = pageEl.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const targetY = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2)
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      })
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
  // Chỉ lưu 1 lần / chapter, không lưu last_page nữa
  if (
    readingHistoryCreated.value ||
    !authStore.isAuthenticated ||
    !comicId.value ||
    !chapter.value?.id ||
    historyUpdatePending.value
  ) {
    return
  }

  historyUpdatePending.value = true

  try {
    await apiClient.post(userEndpoints.readingHistory.create, {
      comic_id: comicId.value,
      chapter_id: chapter.value.id
    })
    readingHistoryCreated.value = true
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


