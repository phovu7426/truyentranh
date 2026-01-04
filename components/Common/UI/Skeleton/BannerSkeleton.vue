<template>
  <div class="relative w-full overflow-hidden">
    <div class="relative h-[500px] md:h-[600px]">
      <div class="absolute inset-0 transition-opacity duration-500 bg-gray-200 animate-pulse"></div>
      
      <!-- Navigation dots skeleton -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <div class="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
        <div class="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
        <div class="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
      </div>

      <!-- Navigation arrows skeleton -->
      <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div class="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
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