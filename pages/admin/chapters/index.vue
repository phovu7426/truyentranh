<template>
  <div class="container mx-auto p-4">
    <AdminChapters />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminChapters from '@/components/Admin/Chapters/AdminChapters.vue'
</script>



