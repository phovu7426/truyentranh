<template>
  <Modal
    v-model="modalVisible"
    title="Sửa roles của member"
    size="lg"
  >
    <div class="space-y-6">
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600 space-y-1">
          <div><span class="font-medium">User:</span> {{ member?.user?.username || 'N/A' }}</div>
          <div><span class="font-medium">Email:</span> {{ member?.user?.email || 'N/A' }}</div>
        </div>
      </div>

      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Cập nhật roles"
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError }">
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
import MultipleSelect from '@/components/Core/Select/MultipleSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'

interface GroupMember {
  user_id: number
  user: {
    id: number
    username: string
    email: string
  }
  role_id?: number
  role?: {
    id: number
    code: string
    name: string
  }
  roles?: Array<{
    id: number
    code: string
    name: string
  }>
}

interface Props {
  show: boolean
  groupId: number
  member?: GroupMember | null
  apiErrors?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  member: null,
  apiErrors: () => ({})
})

const emit = defineEmits<{
  'roles-updated': []
  'close': []
}>()

const { apiClient } = useApiClient()

const roles = ref<any[]>([])
const apiErrors = ref(props.apiErrors || {})

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  // Extract role_ids from member
  let roleIds: number[] = []
  if (props.member?.roles && Array.isArray(props.member.roles)) {
    roleIds = props.member.roles.map(role => role.id)
  } else if (props.member?.role_id) {
    roleIds = [props.member.role_id]
  } else if (props.member?.role?.id) {
    roleIds = [props.member.role.id]
  }
  
  return {
    role_ids: roleIds
  }
})

const validationRules = computed(() => ({
  role_ids: [
    // Không bắt buộc vì có thể gán mảng rỗng để xóa tất cả roles
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
    // Sử dụng /simple endpoint để lấy danh sách roles không có pagination
    const response = await apiClient.get(adminEndpoints.roles.simple)
    if (response.data?.success) {
      roles.value = response.data.data || []
    } else {
      // Fallback về list endpoint nếu simple không có
      const fallbackResponse = await apiClient.get(`${adminEndpoints.roles.list}?limit=1000`)
      if (fallbackResponse.data?.success) {
        roles.value = fallbackResponse.data.data || []
      }
    }
  } catch (error) {
    // Error loading roles
  }
}

async function handleSubmit(formData: any) {
  if (!props.groupId || !props.member?.user_id) return

  apiErrors.value = {}
  
  try {
    const dataToSubmit = {
      role_ids: Array.isArray(formData.role_ids) ? formData.role_ids : [formData.role_ids].filter(Boolean)
    }
    
    await apiClient.put(adminEndpoints.groups.members.updateRoles(props.groupId, props.member.user_id), dataToSubmit)
    emit('roles-updated')
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

