<template>
  <div class="admin-layout flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Sidebar - ClientOnly để tránh hydration mismatch -->
    <ClientOnly>
      <SidebarMenu
        :menu-items="menuItems"
        :active-path="currentPath"
        :sidebar-open="isSidebarOpen"
        :loading="menuLoading"
        :error="menuError || undefined"
        @close="closeSidebar"
        @select="handleMenuClick"
      />
      <template #fallback>
        <aside class="fixed inset-y-0 left-0 z-50 w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></aside>
      </template>
    </ClientOnly>

    <!-- Mobile overlay -->
    <ClientOnly>
      <Teleport to="body">
        <Transition name="fade">
          <div 
            v-if="isSidebarOpen && isMobile" 
            @click="closeSidebar"
            class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        </Transition>
      </Teleport>
    </ClientOnly>

    <!-- Main content -->
    <!-- SSR-safe: chỉ apply margin sau khi mounted để tránh hydration mismatch -->
    <div :class="[
      'flex-1 min-w-0 flex flex-col transition-all duration-300 main-content',
      { 
        'lg:ml-64': isMounted && isSidebarOpen && !isMobile,
        'sidebar-closed': isMounted && !isSidebarOpen && !isMobile
      }
    ]">
      <HeaderBar
        :title="pageTitle"
        :user-name="userName"
        :sidebar-open="isMounted && isSidebarOpen && !isMobile"
        @toggle-sidebar="toggleSidebar"
        @logout="logout"
      />
      <main class="flex-1 min-w-0 pt-16">
        <slot />
      </main>
      <ToastContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminNavigation } from '@/composables/navigation'
import { useGlobalSystemConfig } from '@/composables/system-config'
import { useGroup } from '@/composables/group/useGroup'
import { defineAsyncComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import ToastContainer from '@/components/Core/Feedback/ToastContainer.vue'

// SEO: không cho index các trang admin
useHead({
  meta: [{ name: 'robots', content: 'noindex,nofollow' }]
})

const HeaderBar = defineAsyncComponent(() => import('../components/Layout/Header/HeaderBar.vue'))
const SidebarMenu = defineAsyncComponent(() => import('../components/Layout/Sidebar/SidebarMenu.vue'))

const route = useRoute()
const authStore = useAuthStore()

// State - SSR-safe: khởi tạo giá trị giống nhau trên server và client
const sidebarOpen = ref(false)
const isMobile = ref(false)
const isMounted = ref(false)

const { systemInfo } = useGlobalSystemConfig()
const { menuItems, menuLoading, menuError, currentPath } = useAdminNavigation()
const { fetchMyGroups, switchGroup, getGroupId } = useGroup()

// Computed cho sidebar state - SSR-safe
const isSidebarOpen = computed(() => {
  if (!isMounted.value) return false // Server: luôn false
  return sidebarOpen.value // Mobile và Desktop: theo state
})

// Khởi tạo trên client
onMounted(async () => {
  isMounted.value = true
  
  // Khởi tạo lần đầu: desktop thì mở sidebar, mobile thì đóng
  const initialWidth = window.innerWidth
  isMobile.value = initialWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = true // Desktop: mở sidebar mặc định
  }
  
  // Handle resize - chỉ update isMobile, không thay đổi sidebar state
  const handleResize = () => {
    isMobile.value = window.innerWidth < 1024
  }
  
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  // Khởi tạo group khi vào admin
  await initializeAdminGroup()
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function handleMenuClick() {
  if (isMobile.value) {
    closeSidebar()
  }
}

// Computed values - SSR-safe
const pageTitle = computed(() => {
  const defaultTitle = systemInfo.value?.name || 'Admin Panel'
  
  // Server: trả về default
  if (process.server || !isMounted.value) {
    return defaultTitle
  }
  
  // Client: tìm trong menu
  const currentItem = menuItems.value.find(item => item.path === route.path)
  if (currentItem) return currentItem.name
  
  for (const item of menuItems.value) {
    if (item.children) {
      const childItem = item.children.find(child => child.path === route.path)
      if (childItem) return childItem.name
    }
  }
  
  return defaultTitle
})

const userName = computed(() => {
  if (process.server || !isMounted.value) {
    return 'Admin User'
  }
  return authStore.user?.name || 'Admin User'
})

const logout = async () => {
  await authStore.logout()
  await navigateTo('/auth/login')
}

// Khởi tạo group khi vào admin
const initializeAdminGroup = async () => {
  try {
    // Kiểm tra xem đã có group được lưu trong localStorage chưa (trước khi gọi API)
    const storedGroupIdBefore = getGroupId()
    
    // Luôn gọi API group khi vào admin
    await fetchMyGroups()

    // Nếu đã có group được lưu từ trước → sử dụng group đó, không cần switch
    if (storedGroupIdBefore) {
      return
    }

    // Chưa có group được lưu → gọi API switch với group đầu tiên
    const { getUserGroups } = await import('@/composables/group/useGroupUtils')
    const groups = getUserGroups()
    
    if (groups.length > 0) {
      const firstGroup = groups[0]
      if (firstGroup) {
        await switchGroup(firstGroup.id)
      }
    }
  } catch (error) {
    console.error('[AdminLayout] Lỗi khi khởi tạo group:', error)
    // Không throw error để không block admin layout
  }
}
</script>

<style scoped>
aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-track {
  background: transparent;
}
aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
aside::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.main-content {
  position: relative;
  z-index: 10;
  width: 100%;
  transition: margin-left 0.3s ease;
}

@media (min-width: 1024px) {
  .main-content.sidebar-closed {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100vw !important;
  }
}
</style>
