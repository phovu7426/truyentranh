<template>
  <div class="container mx-auto p-4">
    <AdminProductAttributes />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProductAttributes from '@/components/Admin/ProductAttributes/AdminProductAttributes.vue'
</script>
