<template>
  <div class="container mx-auto p-4">
    <AdminGroups />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminGroups from '@/components/Admin/Groups/AdminGroups.vue'
</script>
