<template>
  <Modal v-model="modalVisible" title="Gán quyền cho vai trò">
    <FormWrapper
      :default-values="defaultValues"
      :rules="validationRules"
      :api-errors="apiErrors"
      submit-text="Cập nhật quyền"
      @submit="handleSubmit"
      @cancel="onClose"
    >
      <template #default="{ form, errors, clearError, isSubmitting }">
        <!-- Thông tin role -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="text-sm text-gray-600">
            <div><strong>Mã code:</strong> {{ roleDetail?.code || 'N/A' }}</div>
            <div><strong>Tên:</strong> {{ roleDetail?.name || 'N/A' }}</div>
          </div>
        </div>
        
        <!-- Permissions -->
        <MultipleSelect
          v-model="form.permission_ids"
          label="Quyền"
          :options="permissionOptions"
          :error="errors.permission_ids"
          placeholder="Chọn quyền..."
          @update:model-value="clearError('permission_ids')"
        />
      </template>
    </FormWrapper>
  </Modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import MultipleSelect from '@/components/Core/Select/MultipleSelect.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useApiFormSubmit } from '@/utils/form'
import { useApiClient } from '@/composables/api/useApiClient'

const props = defineProps({
  show: Boolean,
  role: Object
})

const emit = defineEmits(['permissions-assigned', 'close'])
const { apiClient } = useApiClient()

const roleDetail = ref(null)
const permissions = ref([])

const formTitle = computed(() => `Gán quyền cho ${roleDetail.value?.name || roleDetail.value?.code || 'vai trò'}`)
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

// Watch show prop để fetch role detail và permissions
watch(() => props.show, async (newValue) => {
  if (newValue && props.role?.id) {
    await Promise.all([
      fetchRoleDetail(),
      loadPermissions()
    ])
  }
}, { immediate: true })

async function fetchRoleDetail() {
  try {
    const response = await apiClient.get(adminEndpoints.roles.show(props.role.id))
    if (response.data?.success && response.data?.data) {
      roleDetail.value = response.data.data
    } else {
      roleDetail.value = props.role || {}
    }
  } catch (error) {
    // Error fetching role detail
    roleDetail.value = props.role || {}
  }
}

async function loadPermissions() {
  try {
    // Sử dụng /simple endpoint để lấy danh sách permissions không có pagination
    const response = await apiClient.get(adminEndpoints.permissions.simple)
    if (response.data?.success) {
      permissions.value = response.data.data || []
    } else {
      // Fallback về list endpoint nếu simple không có
      const fallbackResponse = await apiClient.get(adminEndpoints.permissions.list + '?limit=1000')
      if (fallbackResponse.data?.success) {
        permissions.value = fallbackResponse.data.data || []
      }
    }
  } catch (error) {
    // Error loading permissions
  }
}

const defaultValues = computed(() => {
  const obj = roleDetail.value || {}
  
  // Extract permission_ids from permissions array if exists
  let permissionIds = []
  if (obj.permissions && Array.isArray(obj.permissions)) {
    permissionIds = obj.permissions.map(permission => permission.id)
  }
  
  return {
    permission_ids: permissionIds,
    ...obj
  }
})

const { apiErrors, submit } = useApiFormSubmit({
  endpoint: adminEndpoints.roles.assignPermissions(props.role?.id),
  emit,
  onClose: undefined, // Không truyền onClose vào useApiFormSubmit
  eventName: 'permissions-assigned',
  method: 'POST'
})

const validationRules = computed(() => ({
  permission_ids: [
    { required: 'Vui lòng chọn ít nhất một quyền.' }
  ]
}))

const permissionOptions = computed(() => {
  return (permissions.value || []).map(opt => ({
    value: opt.id,
    label: opt.name || opt.code
  }))
})

async function handleSubmit(formData) {
  try {
    // Chỉ gửi permission_ids để cập nhật
    const dataToSubmit = {
      permission_ids: Array.isArray(formData.permission_ids) ? formData.permission_ids : [formData.permission_ids].filter(Boolean)
    }
    
    await submit(dataToSubmit)
    // Chỉ gọi onClose khi submit thành công
    onClose()
  } catch (error) {
    // Không gọi onClose khi có lỗi
    // Error submitting form
  }
}

function onClose() {
  emit('close')
}
</script>


