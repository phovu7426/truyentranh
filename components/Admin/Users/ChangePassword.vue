<template>
  <div>
    <ChangePasswordForm 
      v-if="showModal"
      :show="showModal"
      :user="user"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>
<script setup lang="ts">
import ChangePasswordForm from './ChangePasswordForm.vue'
import { adminEndpoints } from '@/api/endpoints'
import { reactive, ref, watch } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'

const props = defineProps({
  show: Boolean,
  user: Object
})
const emit = defineEmits(['password-changed', 'close'])
const { apiClient } = useApiClient()

const showModal = ref(false)
const apiErrors = reactive<Record<string, string>>({})

function resetErrors() {
  Object.keys(apiErrors).forEach(key => delete apiErrors[key])
}

// Watch show prop để cập nhật showModal
watch(() => props.show, (newValue) => {
  showModal.value = newValue
  if (!newValue) {
    resetErrors()
  }
}, { immediate: true })

async function handleSubmit(formData: Record<string, any>) {
  if (!props.user?.id) return

  resetErrors()
  try {
    await apiClient.patch(adminEndpoints.users.changePassword(props.user.id), formData)
    emit('password-changed')
    onClose()
  } catch (error: any) {
    const response = error?.response
    const payload = response?.data

    // Map lỗi về FormWrapper
    if (payload?.errors) {
      Object.keys(payload.errors).forEach((field) => {
        const value = payload.errors[field]
        apiErrors[field] = Array.isArray(value) ? value[0] : value
      })
    } else if (Array.isArray(payload?.message) && payload.message.length) {
      apiErrors.password = payload.message[0]
    } else if (typeof payload?.message === 'string') {
      apiErrors.password = payload.message
    }
  }
}

function onClose() {
  emit('close')
}
</script>

