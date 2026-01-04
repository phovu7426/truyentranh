<template>
  <div class="container mx-auto p-4">
    <AdminUsers />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminUsers from '@/components/Admin/Users/AdminUsers.vue'
</script>
