<template>
  <div class="container mx-auto p-4">
    <AdminOrders />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminOrders from '@/components/Admin/Orders/AdminOrders.vue'
</script>
