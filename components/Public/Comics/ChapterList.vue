<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded animate-pulse"></div>
    </div>

    <!-- Chapters List -->
    <div v-else-if="chapters.length > 0" class="space-y-2">
      <NuxtLink
        v-for="chapter in chapters"
        :key="chapter.id"
        :to="`/home/comics/${comicSlug}/chapters/${chapter.id}`"
        class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <div class="flex-1">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-500">
              {{ chapter.chapter_label || `Chương ${chapter.chapter_index}` }}
            </span>
            <h3 class="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
              {{ chapter.title }}
            </h3>
          </div>
          <div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              {{ formatNumber(chapter.view_count || 0) }}
            </span>
            <span>{{ formatDate(chapter.created_at) }}</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500">Chưa có chương nào</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  comicSlug: string
  chapters: Array<{
    id: number
    title: string
    chapter_index: number
    chapter_label?: string
    view_count?: number
    created_at: string
  }>
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits(['refresh'])

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>



