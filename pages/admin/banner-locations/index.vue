<template>
  <div class="container mx-auto p-4">
    <AdminBannerLocations />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminBannerLocations from '@/components/Admin/BannerLocations/AdminBannerLocations.vue'
</script>
