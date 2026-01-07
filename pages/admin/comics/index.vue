<template>
  <div class="container mx-auto p-4">
    <AdminComics />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminComics from '@/components/Admin/Comics/AdminComics.vue'
</script>



