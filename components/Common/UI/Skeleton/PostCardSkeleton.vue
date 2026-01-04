<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse cursor-pointer">
    <!-- Post Image Skeleton -->
    <div class="relative w-full h-48 overflow-hidden">
      <div class="w-full h-full bg-gray-200"></div>
    </div>
    
    <!-- Post Content Skeleton -->
    <div class="p-5">
      <!-- Category Badge Skeleton -->
      <div class="mb-2">
        <div class="h-5 bg-gray-200 rounded-full w-20"></div>
      </div>
      
      <!-- Post Title Skeleton -->
      <div class="mb-2">
        <div class="h-6 bg-gray-200 rounded mb-1"></div>
        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
      
      <!-- Post Excerpt Skeleton -->
      <div class="mb-4">
        <div class="h-4 bg-gray-200 rounded mb-1"></div>
        <div class="h-4 bg-gray-200 rounded mb-1"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      
      <!-- Post Meta Skeleton -->
      <div class="flex items-center justify-between">
        <div class="h-4 bg-gray-200 rounded w-24"></div>
        <div class="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed for skeleton
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>