<template>
  <div class="container mx-auto p-4">
    <AdminBanners />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminBanners from '@/components/Admin/Banners/AdminBanners.vue'
</script>
