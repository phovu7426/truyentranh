<template>
  <div class="container mx-auto p-4">
    <AdminPayments />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPayments from '@/components/Admin/Payments/AdminPayments.vue'
</script>
