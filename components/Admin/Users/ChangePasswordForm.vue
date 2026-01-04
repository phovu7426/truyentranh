<template>
  <Modal
    v-model="modalVisible"
    :title="formTitle"
    size="lg"
  >
    <div class="space-y-6">
      <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.657-1.343-3-3-3H7a3 3 0 100 6h2a3 3 0 003-3zm0 0V7m0 4v4"></path>
          </svg>
        </span>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
          <p class="text-sm text-gray-500">Nhập mật khẩu mới cho người dùng</p>
        </div>
      </header>

      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Đổi mật khẩu"
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError }">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              v-model="form.password"
              label="Mật khẩu mới"
              name="password"
              type="password"
              :error="errors.password"
              required
              autocomplete="new-password"
              @update:model-value="clearError('password')"
            />
            <FormField
              v-model="form.password_confirmation"
              label="Xác nhận mật khẩu mới"
              name="password_confirmation"
              type="password"
              :error="errors.password_confirmation"
              required
              autocomplete="new-password"
              @update:model-value="clearError('password_confirmation')"
            />
          </div>
        </template>
      </FormWrapper>
    </div>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'

const props = defineProps({
  show: Boolean,
  user: Object,
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formTitle = computed(() => `Đổi mật khẩu cho ${props.user?.username || 'người dùng'}`)
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = {
  password: '',
  password_confirmation: ''
}

const validationRules = {
  password: [
    { required: 'Mật khẩu mới là bắt buộc.' },
    { min: [6, 'Mật khẩu phải có ít nhất 6 ký tự.'] }
  ],
  password_confirmation: [
    { required: 'Vui lòng xác nhận mật khẩu mới.' },
    { match: ['password', 'Mật khẩu xác nhận không khớp.'] }
  ]
}

function handleSubmit(form) {
  emit('submit', form)
}

function onClose() {
  emit('cancel')
}
</script> 

<style scoped>
:deep(.modal-header) {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-0;
}

:deep(.modal-title) {
  @apply text-lg font-semibold text-white;
}

:deep(.modal-close) {
  @apply text-white hover:text-gray-200;
}
</style>

