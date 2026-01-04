<template>
  <div class="container mx-auto p-4">
    <AdminContexts />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminContexts from '@/components/Admin/Contexts/AdminContexts.vue'
</script>

