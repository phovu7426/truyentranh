<template>
  <RoleForm 
    v-if="props.show"
    :show="props.show"
    :role="roleData"
    :status-enums="props.statusEnums"
    :api-errors="apiErrors"
    :loading="loading"
    @submit="handleSubmit" 
    @cancel="onClose" 
  />
</template>
<script setup>
import RoleForm from './RoleForm.vue'
import { adminEndpoints } from '@/api/endpoints'
import { ref, watch } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'

const { apiClient } = useApiClient()

const props = defineProps({
  show: Boolean,
  role: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['updated', 'close'])

const roleData = ref(null)
const loading = ref(false)

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Set data từ props ngay để form hiển thị ngay, sau đó fetch để cập nhật
    roleData.value = props.role || null
    // Luôn fetch dữ liệu chi tiết từ API khi mở modal để có data mới nhất
    if (props.role?.id) {
      fetchRoleDetails()
    }
  } else {
    roleData.value = null // Reset data khi đóng modal
    loading.value = false
  }
}, { immediate: true })

async function fetchRoleDetails() {
  if (!props.role?.id) return
  
  loading.value = true
  try {
    const response = await apiClient.get(adminEndpoints.roles.show(props.role.id))
    
    if (response.data?.success && response.data?.data) {
      roleData.value = response.data.data
    } else if (response.data && !response.data.success) {
      roleData.value = response.data
    } else {
      roleData.value = props.role || {}
    }
  } catch (error) {
    // Fallback về dữ liệu từ list view nếu API lỗi
    roleData.value = props.role || {}
  } finally {
    loading.value = false
  }
}

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  } else {
    emit('close')
  }
}
</script>


<style>
.multiselect__tag, .multiselect__single, .multiselect__option {
  color: #222 !important;
  font-size: 14px !important;
  min-width: 40px;
}
/* Thêm scroll cho vùng tag khi tràn */
.multiselect__tags {
  max-height: 90px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style> 
