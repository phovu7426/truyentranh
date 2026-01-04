<template>
  <Modal
    v-model="modalVisible"
    title="Phân quyền người dùng"
    size="lg"
  >
    <div class="space-y-6">
      <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </span>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Phân quyền</h3>
          <p class="text-sm text-gray-500">Chọn vai trò áp dụng cho người dùng</p>
        </div>
      </header>

      <FormWrapper
        :default-values="defaultValues"
        :rules="validationRules"
        :api-errors="apiErrors"
        submit-text="Cập nhật quyền"
        @submit="handleSubmit"
        @cancel="onClose"
      >
        <template #default="{ form, errors, clearError }">
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 space-y-1">
              <div><span class="font-medium">Tên:</span> {{ userDetail?.name || userDetail?.username || 'N/A' }}</div>
              <div><span class="font-medium">Email:</span> {{ userDetail?.email || 'N/A' }}</div>
            </div>
          </div>

          <MultipleSelect
            v-model="form.role_ids"
            label="Vai trò"
            :options="roleOptions"
            :error="errors.role_ids"
            placeholder="Chọn vai trò..."
            @update:model-value="clearError('role_ids')"
          />
        </template>
      </FormWrapper>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import MultipleSelect from '@/components/Core/Select/MultipleSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiClient } from '@/composables/api/useApiClient'
import { useGroup } from '@/composables/group/useGroup'

const props = defineProps({
  show: Boolean,
  user: Object
})

const emit = defineEmits(['role-assigned', 'close'])
const { apiClient } = useApiClient()
const { getGroupId } = useGroup()

const userDetail = ref<any>(null)
const roles = ref<any[]>([])
const apiErrors = reactive<Record<string, string>>({})

const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

function resetErrors() {
  Object.keys(apiErrors).forEach(key => delete apiErrors[key])
}

watch(() => props.show, async (newValue) => {
  if (newValue && props.user?.id) {
    await Promise.all([
      fetchUserDetail(),
      loadRoles()
    ])
  } else if (!newValue) {
    resetErrors()
  }
}, { immediate: true })

// Watch userDetail để đảm bảo form được update khi userDetail thay đổi
watch(() => userDetail.value, () => {
  // FormWrapper sẽ tự động update từ defaultValues
}, { deep: true })

async function fetchUserDetail() {
  try {
    const response = await apiClient.get(adminEndpoints.users.show(props.user!.id))
    if (response.data?.success && response.data?.data) {
      userDetail.value = response.data.data
    } else {
      userDetail.value = props.user || {}
    }
  } catch (error) {
    userDetail.value = props.user || {}
  }
}

async function loadRoles() {
  try {
    const response = await apiClient.get(adminEndpoints.roles.simple)
    if (response.data?.success) {
      roles.value = response.data.data || []
    } else {
      const fallbackResponse = await apiClient.get(`${adminEndpoints.roles.list}?limit=1000`)
      if (fallbackResponse.data?.success) {
        roles.value = fallbackResponse.data.data || []
      }
    }
  } catch (error) {
    // Error loading roles
  }
}

const defaultValues = computed(() => {
  const obj = userDetail.value || {}
  
  let roleIds: any[] = []
  
  // Ưu tiên lấy từ user_role_assignments (Group-based) 
  if (obj.user_role_assignments && Array.isArray(obj.user_role_assignments)) {
    const currentGroupId = getGroupId()
    // Lọc roles theo group_id hiện tại nếu có
    const assignments = currentGroupId 
      ? obj.user_role_assignments.filter((assignment: any) => {
          const assignmentGroupId = typeof assignment.group_id === 'string' 
            ? parseInt(assignment.group_id, 10) 
            : assignment.group_id
          return assignmentGroupId === currentGroupId
        })
      : obj.user_role_assignments
    
    roleIds = assignments
      .map((assignment: any) => {
        const roleId = assignment.role_id || assignment.role?.id
        return typeof roleId === 'string' ? parseInt(roleId, 10) : Number(roleId)
      })
      .filter((id: any) => !isNaN(id) && id !== null && id !== undefined)
  }
  // Fallback: lấy từ roles (backward compatible)
  else if (obj.roles && Array.isArray(obj.roles)) {
    roleIds = obj.roles.map((role: any) => {
      const id: any = role.id
      return typeof id === 'string' ? parseInt(id, 10) : Number(id)
    }).filter((id: any) => !isNaN(id) && id !== null && id !== undefined)
  }
  
  return {
    role_ids: roleIds
  }
})

const validationRules = computed(() => ({
  role_ids: []
}))

const roleOptions = computed(() => {
  return (roles.value || []).map((opt: any) => {
    // Đảm bảo value là number để khớp với role_ids
    const id: number = typeof opt.id === 'string' ? parseInt(opt.id, 10) : Number(opt.id)
    return {
      value: id,
      label: opt.name
    }
  }).filter((opt: any) => !isNaN(opt.value))
})

async function handleSubmit(formData: Record<string, any>) {
  if (!props.user?.id) return

  resetErrors()
  
  // Kiểm tra group_id
  const groupId = getGroupId()
  if (!groupId) {
    apiErrors.role_ids = 'Vui lòng chọn group trước khi phân quyền'
    return
  }

  try {
    const dataToSubmit: any = {
      role_ids: Array.isArray(formData.role_ids) ? formData.role_ids : [formData.role_ids].filter(Boolean)
    }
    
    // Sử dụng PUT /api/admin/users/:id/roles với X-Group-Id header (BẮT BUỘC)
    // group_id sẽ được tự động thêm từ X-Group-Id header trong useApiClient
    await apiClient.put(adminEndpoints.users.assignRoles(props.user.id), dataToSubmit)
    emit('role-assigned')
    onClose()
  } catch (error: any) {
    const payload = error?.response?.data
    if (payload?.errors) {
      Object.keys(payload.errors).forEach((field) => {
        const value = payload.errors[field]
        apiErrors[field] = Array.isArray(value) ? value[0] : value
      })
    } else if (Array.isArray(payload?.message) && payload.message.length) {
      apiErrors.role_ids = payload.message.join(', ')
    } else if (typeof payload?.message === 'string') {
      apiErrors.role_ids = payload.message
    }
  }
}

function onClose() {
  emit('close')
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
