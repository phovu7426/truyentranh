<template>
  <Modal :show="show" :on-close="onClose" size="lg">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Chỉnh sửa liên hệ</h2>
        <span class="text-sm text-gray-500">ID: #{{ contact?.id }}</span>
      </div>

      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Cập nhật"
        submitting-text="Đang cập nhật..."
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError, isSubmitting }">
          <!-- Thông tin cơ bản -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              v-model="form.name"
              label="Họ và tên"
              name="name"
              type="text"
              :error="errors.name"
              placeholder="Nhập họ và tên"
              @update:model-value="clearError('name')"
            />

            <FormField
              v-model="form.email"
              label="Email"
              name="email"
              type="email"
              :error="errors.email"
              required
              placeholder="Nhập email"
              @update:model-value="clearError('email')"
            />

            <FormField
              v-model="form.phone"
              label="Số điện thoại"
              name="phone"
              type="tel"
              :error="errors.phone"
              placeholder="Nhập số điện thoại"
              @update:model-value="clearError('phone')"
            />

            <FormField
              v-model="form.subject"
              label="Chủ đề"
              name="subject"
              type="text"
              :error="errors.subject"
              placeholder="Nhập chủ đề"
              @update:model-value="clearError('subject')"
            />
          </div>

          <!-- Trạng thái -->
          <FormField
            v-model="form.status"
            label="Trạng thái"
            name="status"
            type="select"
            :options="statusOptions"
            :error="errors.status"
            required
            @update:model-value="clearError('status')"
          />

          <!-- Nội dung tin nhắn -->
          <FormField
            v-model="form.message"
            label="Nội dung tin nhắn"
            name="message"
            type="textarea"
            :error="errors.message"
            :rows="6"
            required
            placeholder="Nhập nội dung tin nhắn"
            @update:model-value="clearError('message')"
          />

          <!-- Phản hồi từ admin -->
          <FormField
            v-model="form.reply"
            label="Phản hồi từ admin"
            name="reply"
            type="textarea"
            :error="errors.reply"
            :rows="6"
            placeholder="Nhập phản hồi từ admin (nếu có)"
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
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits(['updated'])

// Default values
const defaultValues = computed(() => {
  if (!props.contact) {
    return {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      status: 'pending',
      reply: ''
    }
  }
  
  return {
    name: props.contact.name || '',
    email: props.contact.email || '',
    phone: props.contact.phone || '',
    subject: props.contact.subject || '',
    message: props.contact.message || '',
    status: props.contact.status || 'pending',
    reply: props.contact.reply || ''
  }
})

// Validation rules
const validationRules = computed(() => ({
  name: [
    { max: [255, 'Họ và tên không được vượt quá 255 ký tự.'] }
  ],
  email: [
    { required: 'Email là bắt buộc.' },
    { email: 'Email không hợp lệ.' },
    { max: [255, 'Email không được vượt quá 255 ký tự.'] }
  ],
  phone: [
    { max: [20, 'Số điện thoại không được vượt quá 20 ký tự.'] }
  ],
  subject: [
    { max: [255, 'Chủ đề không được vượt quá 255 ký tự.'] }
  ],
  message: [
    { required: 'Nội dung tin nhắn là bắt buộc.' }
  ],
  status: [
    { required: 'Vui lòng chọn trạng thái.' }
  ]
}))

// Status options
const statusOptions = computed(() => {
  const options = []
  if (props.statusEnums && Array.isArray(props.statusEnums)) {
    props.statusEnums.forEach(item => {
      options.push({
        value: item.value,
        label: item.label || item.name
      })
    })
  }
  return options
})

// Submit handler
const handleSubmit = async (formData) => {
  const payload = {
    name: formData.name?.trim() || null,
    email: formData.email.trim(),
    phone: formData.phone?.trim() || null,
    subject: formData.subject?.trim() || null,
    message: formData.message.trim(),
    status: formData.status,
    reply: formData.reply?.trim() || null
  }
  
  emit('updated', payload)
}
</script>
