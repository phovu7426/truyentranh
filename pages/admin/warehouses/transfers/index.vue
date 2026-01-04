<template>
  <div class="container mx-auto p-4">
    <AdminStockTransfers />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminStockTransfers from '@/components/Admin/StockTransfers/AdminStockTransfers.vue'
</script>
