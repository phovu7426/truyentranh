<template>
  <div>
    <UserForm 
      v-if="showModal"
      :show="showModal"
      :user="userDetail"
      :status-enums="statusEnums"
      :gender-enums="genderEnums"
      :api-errors="apiErrors"
      :loading="loading"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>
<script setup lang="ts">
import UserForm from './UserForm.vue'
import { adminEndpoints } from '@/api/endpoints'
import { ref, watch } from 'vue'
import { formatDate } from '@/utils/formatters'
import { useApiClient } from '@/composables/api/useApiClient'

const props = defineProps({
  show: Boolean,
  user: Object,
  statusEnums: Array,
  genderEnums: Array,
  apiErrors: Object
})
const emit = defineEmits(['updated', 'close'])
const { apiClient } = useApiClient()

const showModal = ref(false)
const userDetail = ref<any>(null)
const loading = ref(false)
const hasFetched = ref(false)

// Watch show prop để cập nhật showModal và fetch user detail
watch(() => props.show, async (newValue) => {
  showModal.value = newValue
  
  // Chỉ fetch khi modal thực sự được mở và chưa fetch hoặc user.id thay đổi
  if (newValue && props.user?.id) {
    const currentUserId = props.user.id
    if (!hasFetched.value || (userDetail.value?.id !== currentUserId)) {
      await fetchUserDetail()
      hasFetched.value = true
    }
  } else if (!newValue) {
    userDetail.value = null
    loading.value = false
    hasFetched.value = false // Reset flag khi đóng modal
  }
}, { immediate: true })

async function fetchUserDetail() {
  if (!props.user?.id || loading.value) return // Tránh gọi API đồng thời
  
  try {
    loading.value = true
    const response = await apiClient.get(adminEndpoints.users.show(props.user!.id))
    if (response.data?.success && response.data?.data) {
      const data = response.data.data
      const profile = data?.profile || {}
      
      // Parse roles từ user_role_assignments (Group-based) hoặc roles (backward compatible)
      let roles: any[] = []
      if (data?.user_role_assignments && Array.isArray(data.user_role_assignments)) {
        // Lấy roles từ user_role_assignments
        roles = data.user_role_assignments
          .map((assignment: any) => assignment.role)
          .filter((role: any) => role != null)
      } else if (Array.isArray(data?.roles)) {
        // Fallback: lấy từ roles (backward compatible)
        roles = data.roles
      }

      // Transform API shape to flat form-consumable structure
      userDetail.value = {
        id: data?.id,
        username: data?.username || '',
        email: data?.email || '',
        phone: data?.phone || '',
        status: data?.status || '',
        name: profile?.name || '',
        address: profile?.address || '',
        gender: profile?.gender || '',
        birthday: formatDate(profile?.birthday, 'yyyy-MM-dd'),
        image: profile?.image || null,
        about: profile?.about || '',
        roles: roles,
        role_ids: roles.filter(r => r != null).map(r => r?.id).filter(Boolean),
        email_verified_at: data?.email_verified_at || null,
        phone_verified_at: data?.phone_verified_at || null,
        last_login_at: data?.last_login_at || null,
        created_at: data?.created_at || null,
        updated_at: data?.updated_at || null
      }
    } else {
      userDetail.value = props.user || {}
    }
  } catch (error) {
    // Fallback to props data if API fails
    userDetail.value = props.user || {}
  } finally {
    loading.value = false
  }
}

async function handleSubmit(formData: Record<string, any>) {
  const data = formData || {}

  // Chỉ giữ các trường được API chấp nhận; password chỉ gửi khi có giá trị
  const baseKeys = ['username', 'email', 'phone', 'status', 'password'] as const
  const profileKeys = ['name', 'gender', 'birthday', 'address', 'image', 'about'] as const

  const payload: Record<string, any> = {}

  baseKeys.forEach((key) => {
    const value = (data as any)[key]
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'password' && !value) return
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
  emit('updated', payload)
}

function onClose() {
  emit('close')
}
</script>

