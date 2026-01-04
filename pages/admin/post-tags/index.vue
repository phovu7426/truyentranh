<template>
  <div class="container mx-auto p-4">
    <AdminPostTags />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPostTags from '@/components/Admin/PostTags/AdminPostTags.vue'
</script>
