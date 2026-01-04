<template>
  <div class="container mx-auto p-4">
    <GroupMembers :group-id="groupId" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true
})

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GroupMembers from '@/components/Admin/Groups/GroupMembers.vue'

const route = useRoute()
const groupId = computed(() => Number(route.params.id))
</script>





