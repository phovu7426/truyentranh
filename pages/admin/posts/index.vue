<template>
  <div class="container mx-auto p-4">
    <AdminPosts />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPosts from '@/components/Admin/Posts/AdminPosts.vue'
</script>
