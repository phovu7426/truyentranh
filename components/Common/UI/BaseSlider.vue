<template>
  <div class="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <!-- Icon -->
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg v-if="icon === 'category'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <svg v-else-if="icon === 'product'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h2 v-if="title" class="text-xl font-bold text-gray-900">{{ title }}</h2>
            <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- View All Button -->
        <button
          v-if="showViewAll"
          type="button"
          @click="$emit('viewAll')"
          class="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-200 group px-4 py-2 rounded-lg hover:bg-blue-50"
        >
          <span>Xem tất cả</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <!-- Navigation Buttons -->
        <div class="flex items-center space-x-2">
          <button
            v-if="showNavigation"
            type="button"
            @click="scrollLeft"
            :disabled="!canScrollLeft"
            class="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
            :class="navigationButtonClass"
            aria-label="Cuộn sang trái"
            title="Cuộn sang trái"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            v-if="showNavigation"
            type="button"
            @click="scrollRight"
            :disabled="!canScrollRight"
            class="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
            :class="navigationButtonClass"
            aria-label="Cuộn sang phải"
            title="Cuộn sang phải"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Slider Container -->
    <div class="relative w-full">
      <div
        ref="sliderContainer"
        class="relative overflow-x-auto overflow-y-hidden scrollbar-hide"
        :class="[containerClass, 'scroll-smooth']"
        @scroll="handleScroll"
      >
        <div 
          class="flex gap-4 py-2"
          :style="{ width: 'max-content' }"
        >
          <!-- Slot for items -->
          <slot></slot>
        </div>
      </div>

      <!-- Gradient Edges -->
      <div v-if="canScrollLeft" class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
      <div v-if="canScrollRight" class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
    </div>

    <!-- Progress Indicator -->
    <div v-if="showProgress" class="flex justify-center mt-6 space-x-2">
      <div
        v-for="(_, index) in progressDots"
        :key="index"
        class="h-2 rounded-full transition-all duration-300 cursor-pointer"
        :class="[
          index === currentProgressIndex 
            ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600' 
            : 'w-2 bg-gray-300 hover:bg-gray-400'
        ]"
        @click="scrollToIndex(index)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: 'category' | 'product' | 'default'
  showNavigation?: boolean
  showViewAll?: boolean
  showProgress?: boolean
  navigationButtonClass?: string
  containerClass?: string
  itemWidth?: {
    mobile?: number
    small?: number
    medium?: number
    large?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'default',
  showNavigation: true,
  showViewAll: false,
  showProgress: false,
  navigationButtonClass: '',
  containerClass: '',
  itemWidth: () => ({
    mobile: 160,
    small: 170,
    medium: 180,
    large: 200
  })
})

const emit = defineEmits<{
  viewAll: []
}>()

const sliderContainer = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const currentProgressIndex = ref(0)

const progressDots = computed(() => {
  if (!sliderContainer.value || !props.showProgress) return 0
  
  const container = sliderContainer.value
  const content = container.firstElementChild
  if (!content) return 0
  
  const containerWidth = container.clientWidth
  const itemWidth = getItemWidth()
  const gap = 16 // 1rem = 16px gap
  
  return Math.ceil((content.scrollWidth - containerWidth) / (itemWidth + gap)) + 1
})

const scrollLeft = () => {
  if (!sliderContainer.value || !canScrollLeft.value) return
  
  const scrollAmount = getItemWidth()
  sliderContainer.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  })
  
  updateProgressIndex()
}

const scrollRight = () => {
  if (!sliderContainer.value || !canScrollRight.value) return
  
  const scrollAmount = getItemWidth()
  sliderContainer.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  })
  
  updateProgressIndex()
}

const scrollToIndex = (index: number) => {
  if (!sliderContainer.value) return
  
  const itemWidth = getItemWidth()
  const gap = 16
  const targetScroll = index * (itemWidth + gap)
  
  sliderContainer.value.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  })
  
  currentProgressIndex.value = index
}

const getItemWidth = () => {
  if (!props.itemWidth) return 200
  
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  if (width < 640) return props.itemWidth.mobile || 160
  if (width < 768) return props.itemWidth.small || 170
  if (width < 1024) return props.itemWidth.medium || 180
  return props.itemWidth.large || 200
}

const handleScroll = () => {
  if (!sliderContainer.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = sliderContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
  
  updateProgressIndex()
}

const updateProgressIndex = () => {
  if (!sliderContainer.value || !props.showProgress) return
  
  const container = sliderContainer.value
  const itemWidth = getItemWidth()
  const gap = 16
  
  currentProgressIndex.value = Math.round(container.scrollLeft / (itemWidth + gap))
}

const checkScrollable = () => {
  if (!sliderContainer.value) return
  
  const { scrollWidth, clientWidth } = sliderContainer.value
  canScrollRight.value = scrollWidth > clientWidth
  
  // Also check if we can scroll left (initially false)
  canScrollLeft.value = false
}

onMounted(async () => {
  await nextTick()
  checkScrollable()
  
  // Add resize listener
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkScrollable)
  }
  
  // Also check after a short delay to ensure content is fully rendered
  setTimeout(checkScrollable, 100)
})

// Expose methods for parent components
defineExpose({
  scrollLeft,
  scrollRight,
  checkScrollable
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth scrolling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Enhanced button styles */
button:disabled {
  transform: none !important;
}

/* Progress indicator hover effect */
.h-2:hover {
  transform: scale(1.1);
}

/* Container shadow and border */
.bg-white {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Icon gradient */
.from-blue-500 {
  --tw-gradient-from: #3b82f6;
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}
</style>