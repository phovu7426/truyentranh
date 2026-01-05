<template>
  <ChapterReader />
</template>

<script setup lang="ts">
import ChapterReader from '@/components/Public/Comics/ChapterReader.vue'

definePageMeta({
  // Dùng layout trống để trang đọc truyện là một trang độc lập, không dùng header của layout home
  layout: false,
  key: (route) => `chapter-detail-${route.params.slug}-${(route.params as any).chapter_index}`,
  validate: async (route) => {
    const path = route.path
    const chapterIndex = (route.params as any).chapter_index as string
    
    if (path.includes('/chapters/')) {
      return /^\d+$/.test(chapterIndex)
    }
    return false
  }
})
</script>

