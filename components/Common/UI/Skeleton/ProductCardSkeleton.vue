<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <!-- Product Image Skeleton -->
    <div class="relative aspect-w-1 aspect-h-1 w-full overflow-hidden">
      <div class="h-64 w-full bg-gray-200"></div>
    </div>

    <!-- Product Info Skeleton -->
    <div class="p-4">
      <!-- Product Name Skeleton -->
      <div class="h-6 bg-gray-200 rounded mb-2"></div>
      <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      <!-- Categories Skeleton -->
      <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>

      <!-- Price Skeleton -->
      <div class="flex items-baseline space-x-2 mb-3">
        <div class="h-6 bg-gray-200 rounded w-20"></div>
        <div class="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      <!-- Stock Status Skeleton -->
      <div class="flex items-center justify-between mb-3">
        <div class="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>

    <!-- Button Skeleton -->
    <div class="px-4 pb-4">
      <div class="h-10 bg-gray-200 rounded-lg w-full"></div>
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