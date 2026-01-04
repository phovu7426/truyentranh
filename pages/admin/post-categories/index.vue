<template>
  <div class="container mx-auto p-4">
    <AdminPostCategories />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPostCategories from '@/components/Admin/PostCategories/AdminPostCategories.vue'
</script>
