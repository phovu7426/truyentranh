<template>
  <Modal :show="show" :on-close="onClose" size="lg">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Phản hồi liên hệ</h2>
        <span class="text-sm text-gray-500">ID: #{{ contact?.id }}</span>
      </div>

      <!-- Contact Info -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label class="text-gray-600">Tên:</label>
            <p class="font-medium text-gray-900">{{ contact?.name || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-gray-600">Email:</label>
            <p class="font-medium text-gray-900">{{ contact?.email || 'N/A' }}</p>
          </div>
          <div class="col-span-2">
            <label class="text-gray-600">Tin nhắn gốc:</label>
            <p class="text-gray-700 mt-1 whitespace-pre-wrap">{{ contact?.message || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Gửi phản hồi"
        submitting-text="Đang gửi..."
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError, isSubmitting }">
          <!-- Phản hồi -->
          <FormField
            v-model="form.reply"
            label="Nội dung phản hồi"
            name="reply"
            type="textarea"
            :error="errors.reply"
            :rows="8"
            required
            placeholder="Nhập nội dung phản hồi..."
            @update:model-value="clearError('reply')"
          />
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

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  contact: {
    type: Object,
    default: null
  },
  apiErrors: Object,
  onClose: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits(['replied'])

// Default values
const defaultValues = computed(() => ({
  reply: ''
}))

// Validation rules
const validationRules = computed(() => ({
  reply: [
    { required: 'Nội dung phản hồi là bắt buộc.' },
    { min: [10, 'Nội dung phản hồi phải có ít nhất 10 ký tự.'] }
  ]
}))

// Submit handler
const handleSubmit = async (formData) => {
  const payload = {
    reply: formData.reply.trim()
  }
  
  emit('replied', payload)
}
</script>

