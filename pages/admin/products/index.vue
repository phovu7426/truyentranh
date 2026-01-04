<template>
  <div class="container mx-auto p-4">
    <AdminProducts />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProducts from '@/components/Admin/Products/AdminProducts.vue'
</script>