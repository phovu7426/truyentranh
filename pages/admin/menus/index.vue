<template>
  <div class="container mx-auto p-4">
    <AdminMenus />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminMenus from '@/components/Admin/Menus/AdminMenus.vue'
</script>
