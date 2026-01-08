<template>
  <NuxtLink
    :to="`/home/comics/${comic.slug}`"
    class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
  >
    <!-- Cover Image -->
    <div class="relative aspect-[3/4] overflow-hidden bg-gray-200">
      <img
        v-if="comic.cover_image"
        :src="comic.cover_image"
        :alt="comic.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-200">
        <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>

      <!-- Status Badge -->
      <div v-if="comic.status === 'completed'" class="absolute top-2 right-2">
        <span class="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
          Hoàn thành
        </span>
      </div>

      <!-- Stats Overlay -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <div class="flex items-center justify-between text-white text-xs">
          <div class="flex items-center space-x-3">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              {{ formatNumber(comic.stats?.view_count || 0) }}
            </span>
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              {{ comic.stats?.chapter_count || 0 }} chương
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {{ comic.title }}
      </h3>

      <!-- Last Chapter -->
      <div v-if="comic.last_chapter" class="mb-2">
        <NuxtLink
          :to="`/home/comics/${comic.slug}/chapters/${comic.last_chapter.id}`"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm block truncate"
          @click.stop
        >
          {{ comic.last_chapter.title || `Chương ${comic.last_chapter.chapter_index}` }}
        </NuxtLink>
        <span v-if="comic.last_chapter.created_at" class="text-xs text-gray-500">
          {{ formatDate(comic.last_chapter.created_at) }}
        </span>
      </div>

      <!-- Categories -->
      <div v-if="comic.categories && comic.categories.length > 0" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="category in comic.categories.slice(0, 2)"
          :key="category.id"
          class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- Rating -->
      <div v-if="comic.stats?.average_rating" class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        <span>{{ comic.stats.average_rating.toFixed(1) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  comic: {
    id: number
    slug: string
    title: string
    cover_image?: string
    author?: string
    status?: string
    categories?: Array<{ id: number; name: string }>
    stats?: {
      view_count?: number
      chapter_count?: number
      average_rating?: number
    }
    last_chapter?: {
      id: number
      title?: string
      chapter_index: number
      created_at?: string
    }
  }
}

defineProps<Props>()

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}
</script>



