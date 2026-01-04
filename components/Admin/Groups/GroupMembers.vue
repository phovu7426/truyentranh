<template>
  <div class="group-members">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Quản lý Members</h1>
        <p v-if="group" class="text-sm text-gray-500 mt-1">
          Group: <span class="font-medium">{{ group.name }}</span> ({{ group.code }})
        </p>
      </div>
      <button 
        @click="openAddMemberModal" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
      >
        Thêm member
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="5" />
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(member, index) in members" :key="member.user_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ member.user?.username || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ member.user?.email || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="role in getMemberRoles(member)" 
                  :key="role.id"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                >
                  {{ role.name || role.code }}
                </span>
                <span v-if="getMemberRoles(member).length === 0" class="text-xs text-gray-400">
                  Chưa có role
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <button
                  @click="openEditRolesModal(member)"
                  class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Sửa roles
                </button>
                <button
                  @click="confirmRemoveMember(member)"
                  class="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  :disabled="isOwner(member)"
                >
                  Xóa
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && members.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              Không có members
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm member -->
    <AddMemberModal
      v-if="modals.addMember"
      :show="modals.addMember"
      :group-id="groupId"
      :api-errors="apiErrors || undefined"
      @close="closeAddMemberModal"
      @member-added="handleMemberAdded"
    />

    <!-- Modal sửa roles -->
    <EditMemberRolesModal
      v-if="modals.editRoles"
      :show="modals.editRoles"
      :group-id="groupId"
      :member="selectedMember"
      :api-errors="apiErrors || undefined"
      @close="closeEditRolesModal"
      @roles-updated="handleRolesUpdated"
    />

    <!-- Modal xác nhận xóa -->
    <ConfirmModal
      v-if="modals.delete"
      :show="modals.delete"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa member ${selectedMember?.user?.username || ''} khỏi group?`"
      :on-close="closeDeleteModal"
      @confirm="removeMember"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import { useAdminModals } from '@/composables/ui'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'

// Types
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

// Props
interface Props {
  groupId: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  memberAdded: []
  memberRemoved: []
  rolesUpdated: []
}>()

// Components
import AddMemberModal from './AddMemberModal.vue'
import EditMemberRolesModal from './EditMemberRolesModal.vue'

const router = useRouter()
const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()

const group = ref<any>(null)
const members = ref<GroupMember[]>([])
const loading = ref(false)
const apiErrors = ref<Record<string, any> | null>(null)

// Use admin modals composable
const {
  modals,
  selectedItem: selectedMember,
  openModal,
  closeModal,
  openDeleteModal: confirmRemoveMember,
  closeDeleteModal
} = useAdminModals({ clearApiErrors: () => { apiErrors.value = null } })

const openAddMemberModal = () => openModal('addMember')
const closeAddMemberModal = () => closeModal('addMember')

const openEditRolesModal = (member: GroupMember) => openModal('editRoles', member)
const closeEditRolesModal = () => closeModal('editRoles')

// Fetch data
onMounted(async () => {
  await Promise.all([
    loadGroup(),
    loadMembers()
  ])
})

async function loadGroup() {
  try {
    const response = await apiClient.get(adminEndpoints.groups.show(props.groupId))
    group.value = response.data?.data || response.data
    if (!group.value) {
      showError('Không tìm thấy group')
      router.push('/admin/groups')
    }
  } catch (error) {
    showError('Không thể tải thông tin group')
    router.push('/admin/groups')
  }
}

async function loadMembers() {
  loading.value = true
  try {
    const response = await apiClient.get<{ success: boolean; data: GroupMember[] }>(
      adminEndpoints.groups.members.list(props.groupId)
    )

    // Parse response
    let membersData: GroupMember[] = []
    if (response.data?.success && Array.isArray(response.data.data)) {
      membersData = response.data.data
    } else if (Array.isArray(response.data)) {
      membersData = response.data
    } else if (Array.isArray(response.data?.data)) {
      membersData = response.data.data
    }

    members.value = membersData
  } catch (error: any) {
    showError('Không thể tải danh sách members')
    members.value = []
  } finally {
    loading.value = false
  }
}

// Helper functions
function getMemberRoles(member: GroupMember) {
  // API trả về member với role_id và role, nhưng có thể có nhiều roles
  // Nếu API trả về array roles thì dùng, không thì tạo array từ role
  if (member.roles && Array.isArray(member.roles)) {
    return member.roles
  }
  if (member.role) {
    return [member.role]
  }
  return []
}

function isOwner(member: GroupMember) {
  return group.value && member.user_id === group.value?.owner_id
}

// Action handlers
async function handleMemberAdded() {
  closeAddMemberModal()
  await loadMembers()
  emit('memberAdded')
}

async function handleRolesUpdated() {
  closeEditRolesModal()
  await loadMembers()
  emit('rolesUpdated')
}

async function removeMember() {
  if (!selectedMember.value) return
  loading.value = true
  try {
    await apiClient.delete(
      adminEndpoints.groups.members.remove(props.groupId, selectedMember.value.user_id)
    )
    showSuccess('Xóa member thành công')
    closeDeleteModal()
    await loadMembers()
    emit('memberRemoved')
  } catch (error: any) {
    showError('Không thể xóa member')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.table-responsive {
  overflow-x: auto;
}
</style>

