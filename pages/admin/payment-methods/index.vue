<template>
  <div class="container mx-auto p-4">
    <AdminPaymentMethods />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPaymentMethods from '@/components/Admin/PaymentMethods/AdminPaymentMethods.vue'
</script>
