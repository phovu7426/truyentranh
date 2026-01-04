<template>
  <div class="container mx-auto p-4">
    <AdminProductAttributeValues />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProductAttributeValues from '@/components/Admin/ProductAttributeValues/AdminProductAttributeValues.vue'
</script>
