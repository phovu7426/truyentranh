<template>
  <GroupForm 
    v-if="props.show"
    :show="props.show"
    :group="groupData"
    :api-errors="apiErrors"
    @submit="handleSubmit" 
    @cancel="onClose" 
  />
</template>
<script setup>
import GroupForm from './GroupForm.vue'
import { adminEndpoints } from '@/api/endpoints'
import { ref, watch } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'

const { apiClient } = useApiClient()

const props = defineProps({
  show: Boolean,
  group: Object,
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['updated', 'close'])

const groupData = ref(null)

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Set data từ props ngay để form hiển thị ngay
    groupData.value = props.group || null
  } else {
    groupData.value = null // Reset data khi đóng modal
  }
}, { immediate: true })

watch(() => props.group, (newValue) => {
  if (props.show && newValue) {
    groupData.value = newValue
  }
})

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  emit('close')
}
</script>

