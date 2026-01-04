<template>
  <div class="container mx-auto p-4">
    <AdminShippingMethods />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminShippingMethods from '@/components/Admin/ShippingMethods/AdminShippingMethods.vue'
</script>
