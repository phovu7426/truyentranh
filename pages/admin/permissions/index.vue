<template>
  <div class="container mx-auto p-4">
    <AdminPermissions />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminPermissions from '@/components/Admin/Permissions/AdminPermissions.vue'
</script>
