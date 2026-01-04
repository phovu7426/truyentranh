<template>
  <div class="container mx-auto p-4">
    <AdminProductCategories />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProductCategories from '@/components/Admin/ProductCategories/AdminProductCategories.vue'
</script>
