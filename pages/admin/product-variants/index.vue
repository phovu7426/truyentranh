<template>
  <div class="container mx-auto p-4">
    <AdminProductVariants />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProductVariants from '@/components/Admin/ProductVariants/AdminProductVariants.vue'
</script>
