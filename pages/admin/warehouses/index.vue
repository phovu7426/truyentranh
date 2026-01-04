<template>
  <div class="container mx-auto p-4">
    <AdminWarehouses />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminWarehouses from '@/components/Admin/Warehouses/AdminWarehouses.vue'
</script>
