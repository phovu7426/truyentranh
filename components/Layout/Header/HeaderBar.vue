<template>
  <header :class="['header', { 'sidebar-open': sidebarOpen }]" :style="sidebarOpen ? { '--sidebar-offset': '256px' } : { '--sidebar-offset': '0' }">
    <div class="header-left">
      <button class="menu-button" @click="$emit('toggle-sidebar')">
        <svg class="menu-icon" viewBox="0 0 24 24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>
    </div>

    <div class="header-right">
      <!-- Group Switcher -->
      <ClientOnly>
        <GroupSwitcher
          v-if="authStore.isAuthenticated"
          class="mr-3"
        />
        <template #fallback>
          <!-- Empty fallback để tránh hydration mismatch -->
        </template>
      </ClientOnly>
      
      <!-- SSR-safe: wrap UserDropdown trong ClientOnly vì auth state khác nhau giữa server và client -->
      <ClientOnly>
      <UserDropdown
        v-if="authStore.isAuthenticated"
        :username="username"
        :email="email"
        @logout="doLogout"
      />
        <template #fallback>
          <!-- Empty fallback để tránh hydration mismatch -->
        </template>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import UserDropdown from '../Shared/UserDropdown.vue'
import GroupSwitcher from '@/components/Core/Group/GroupSwitcher.vue'

const emit = defineEmits(['toggle-sidebar', 'logout'])

const props = defineProps({
  title: {
    type: String,
    default: 'Admin'
  },
  sidebarOpen: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()

const username = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  return user.name || user.username || user.profile?.name || 'User'
})

const email = computed(() => {
  return authStore.user?.email || ''
})

function doLogout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    emit('logout')
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1001;
  transition: left 0.3s ease;
}

@media (min-width: 1024px) {
  .header {
    left: var(--sidebar-offset, 0);
    width: calc(100% - var(--sidebar-offset, 0));
  }
  
  .header:not(.sidebar-open) {
    left: 0 !important;
    width: 100% !important;
    max-width: 100vw !important;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.menu-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex !important;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  visibility: visible !important;
  opacity: 1 !important;
}

.menu-button:hover {
  background: #f1f5f9;
}

.menu-icon {
  width: 20px;
  height: 20px;
  fill: #475569;
}

.title {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
