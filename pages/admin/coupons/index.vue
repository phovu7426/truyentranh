<template>
  <div class="container mx-auto p-4">
    <AdminCoupons />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminCoupons from '@/components/Admin/Coupons/AdminCoupons.vue'
</script>
