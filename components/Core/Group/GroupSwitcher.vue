<template>
  <div class="group-switcher relative">
    <!-- Nếu chỉ có 1 group → Hiển thị thông tin, không cần dropdown -->
    <div v-if="groups.length === 1 && currentGroup" class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <span class="text-sm font-medium text-gray-700">
        {{ currentGroup.name }}
        <span v-if="currentGroup.roles && currentGroup.roles.length > 0" class="text-xs text-gray-500">
          ({{ currentGroup.roles.map(r => r.name).join(', ') }})
        </span>
      </span>
    </div>

    <!-- Nếu có từ 2 groups trở lên → Hiển thị dropdown -->
    <div v-else-if="groups.length >= 2">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      :disabled="loading"
    >
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <span class="text-sm font-medium text-gray-700">
        {{ currentGroupName }}
      </span>
      <svg 
        class="w-4 h-4 text-gray-500 transition-transform" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
      >
        <div class="p-2">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Chọn Group
          </div>
          <div v-if="loading" class="px-3 py-4 text-center text-sm text-gray-500">
            Đang tải...
          </div>
          <div v-else-if="groups.length === 0" class="px-3 py-4 text-center text-sm text-gray-500">
            Không có group nào
          </div>
          <div v-else class="space-y-1">
            <button
              v-for="group in groups"
              :key="group.id"
              @click="selectGroup(group)"
              class="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between"
              :class="{
                'bg-blue-50 text-blue-700': isCurrentGroup(group),
                'text-gray-700': !isCurrentGroup(group)
              }"
            >
              <div class="flex-1">
                <div class="text-sm font-medium">{{ group.name }}</div>
                <div class="text-xs text-gray-500">
                  <span v-if="group.context?.name">{{ group.context.name }}</span>
                  <span v-else>{{ getTypeLabel(group.type) }}</span>
                </div>
                <div v-if="group.roles && group.roles.length > 0" class="text-xs text-gray-400 mt-0.5">
                  Roles: {{ group.roles.map(r => r.name).join(', ') }}
                </div>
              </div>
              <svg
                v-if="isCurrentGroup(group)"
                class="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGroup } from '@/composables/group/useGroup'

const {
  groups,
  currentGroup,
  loading,
  fetchMyGroups,
  switchGroup
} = useGroup()

const isOpen = ref(false)
const dropdownRef = ref(null)

const currentGroupName = computed(() => {
  if (currentGroup.value) {
    // Hiển thị group name, nếu có context thì hiển thị kèm
    const groupName = currentGroup.value.name
    const contextName = currentGroup.value.context?.name
    if (contextName && contextName !== groupName) {
      return `${groupName} (${contextName})`
    }
    return groupName
  }
  return 'Chưa chọn group'
})

// Computed để đảm bảo so sánh ID đúng
const currentGroupId = computed(() => {
  if (!currentGroup.value) return null
  return typeof currentGroup.value.id === 'string' 
    ? parseInt(currentGroup.value.id, 10) 
    : currentGroup.value.id
})

// Helper để so sánh group ID
const isCurrentGroup = (group) => {
  if (!currentGroupId.value) return false
  const groupId = typeof group.id === 'string' 
    ? parseInt(group.id, 10) 
    : group.id
  return currentGroupId.value === groupId
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && groups.value.length === 0) {
    fetchMyGroups()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectGroup = async (group) => {
  if (isCurrentGroup(group)) {
    closeDropdown()
    return
  }

  const result = await switchGroup(group.id)
  if (result) {
    closeDropdown()
    // Reload trang để áp dụng group mới
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }
}

const getTypeLabel = (type) => {
  const typeMap = {
    system: 'System',
    shop: 'Shop',
    team: 'Team',
    project: 'Project',
    department: 'Department',
    organization: 'Organization'
  }
  return typeMap[type] || type
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target) && isOpen.value) {
    const button = event.target.closest('.group-switcher')
    if (!button) {
      closeDropdown()
    }
  }
}

// Fetch groups on mount if authenticated
onMounted(() => {
  fetchMyGroups()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>


