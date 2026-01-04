<template>
  <div class="container mx-auto p-4">
    <AdminRoles />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminRoles from '@/components/Admin/Roles/AdminRoles.vue'
</script>
