<template>
  <div class="container mx-auto p-4">
    <AdminComicCategories />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminComicCategories from '@/components/Admin/ComicCategories/AdminComicCategories.vue'
</script>



