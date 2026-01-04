<template>
  <Modal
    v-model="modalVisible"
    title="Thêm member vào group"
    size="lg"
  >
    <div class="space-y-6">
      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Thêm member"
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError }">
          <!-- User select -->
          <SearchableSelect
            v-model="form.user_id"
            :search-api="adminEndpoints.users.list"
            placeholder="Tìm kiếm user..."
            label="User"
            :error="errors.user_id"
            label-field="username"
            @update:model-value="clearError('user_id')"
          />

          <!-- Roles select -->
          <MultipleSelect
            v-model="form.role_ids"
            label="Roles"
            :options="roleOptions"
            :error="errors.role_ids"
            placeholder="Chọn roles..."
            @update:model-value="clearError('role_ids')"
          />
        </template>
      </FormWrapper>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import SearchableSelect from '@/components/Core/Select/SearchableSelect.vue'
import MultipleSelect from '@/components/Core/Select/MultipleSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'

interface Props {
  show: boolean
  groupId: number
  apiErrors?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  apiErrors: () => ({})
})

const emit = defineEmits<{
  'member-added': []
  'close': []
}>()

const { apiClient } = useApiClient()

const roles = ref<any[]>([])
const apiErrors = ref(props.apiErrors || {})

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => ({
  user_id: null,
  role_ids: []
}))

const validationRules = computed(() => ({
  user_id: [
    { required: 'User là bắt buộc' }
  ],
  role_ids: [
    { required: 'Ít nhất một role là bắt buộc' }
  ]
}))

const roleOptions = computed(() => {
  return (roles.value || []).map(opt => ({
    value: opt.id,
    label: opt.name || opt.code
  }))
})

// Load roles when modal opens
watch(() => props.show, async (newValue) => {
  if (newValue) {
    await loadRoles()
  }
}, { immediate: true })

async function loadRoles() {
  try {
    const response = await apiClient.get(`${adminEndpoints.roles.list}?limit=1000`)
    if (response.data?.success) {
      roles.value = response.data.data || []
    }
  } catch (error) {
    // Error loading roles
  }
}

async function handleSubmit(formData: any) {
  if (!props.groupId) return

  apiErrors.value = {}
  
  try {
    const dataToSubmit = {
      user_id: formData.user_id,
      role_ids: Array.isArray(formData.role_ids) ? formData.role_ids : [formData.role_ids].filter(Boolean)
    }
    
    await apiClient.post(adminEndpoints.groups.members.add(props.groupId), dataToSubmit)
    emit('member-added')
    onClose()
  } catch (err: any) {
    const payload = err?.response?.data
    if (payload?.errors) {
      apiErrors.value = payload.errors
    } else if (Array.isArray(payload?.message) && payload.message.length) {
      apiErrors.value = { general: payload.message.join(', ') }
    } else if (typeof payload?.message === 'string') {
      apiErrors.value = { general: payload.message }
    }
  }
}

function onClose() {
  emit('close')
}
</script>

