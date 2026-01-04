<template>
  <div>
    <UserForm 
      v-if="showModal"
      :show="showModal"
      :status-enums="statusEnums"
      :gender-enums="genderEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>
<script setup lang="ts">
import UserForm from './UserForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  statusEnums: Array,
  genderEnums: Array,
  apiErrors: Object
})
const emit = defineEmits(['created', 'close'])

const showModal = ref(false)

// Watch show prop để cập nhật showModal
watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  const data = formData || {}

  // Chỉ giữ các trường được API chấp nhận
  const baseKeys = ['username', 'email', 'phone', 'status', 'password'] as const
  const profileKeys = ['name', 'gender', 'birthday', 'address', 'image', 'about'] as const

  const payload: Record<string, any> = {}

  baseKeys.forEach((key) => {
    const value = (data as any)[key]
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value
    }
  })

  const profile: Record<string, any> = {}
  profileKeys.forEach((key) => {
    const value = (data as any)[key]
    if (value !== undefined && value !== null && value !== '') {
      profile[key] = value
    }
  })

  if (Object.keys(profile).length > 0) {
    payload.profile = profile
  }

  // Emit data to parent component để xử lý bằng composable
  emit('created', payload)
}

function onClose() {
  emit('close')
}
</script>

