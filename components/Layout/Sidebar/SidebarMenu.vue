<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-50 w-64 h-screen overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out',
    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  ]">
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-slate-700">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AdminHub
        </span>
      </div>
      <button 
        @click="$emit('close')"
        class="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <slot name="menu-header"></slot>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-sm text-slate-400">Đang tải menu...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 space-y-4">
        <div class="text-red-400 text-4xl">⚠️</div>
        <p class="text-sm text-red-400 text-center px-4">{{ error }}</p>
      </div>
      
      <!-- Menu Items -->
      <div v-else v-for="item in menuItemsArray" :key="item.name">
        <!-- Menu with children -->
        <button
          v-if="item.children"
          @click="toggleSubmenu(item.name)"
          :class="[
            'group flex items-center w-full justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 min-h-[48px]',
            'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white',
            'hover:shadow-lg hover:scale-105',
            (expandedMenus.includes(item.name) || isSubmenuActive(item))
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
              : 'text-slate-300'
          ]"
        >
          <div class="flex items-center w-full truncate">
            <span class="w-5 h-5 mr-3 transition-transform duration-200 text-center">{{ item.icon }}</span>
            <span class="truncate" :title="item.name">{{ item.name }}</span>
          </div>
          <svg 
            :class="[
              'w-4 h-4 transition-transform duration-200 ml-2',
              expandedMenus.includes(item.name) ? 'rotate-180' : ''
            ]"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <!-- Submenu -->
        <div 
          v-if="item.children"
          v-show="expandedMenus.includes(item.name)"
          class="ml-6 space-y-1 transition-all duration-200"
        >
          <NuxtLink 
            v-for="child in item.children" 
            :key="child.path"
            :to="child.path" 
            :prefetch="false"
            @click="() => { $emit('select', child); handleMenuClick(child.path) }"
            :class="[
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
              'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white',
              'hover:shadow-md hover:scale-105',
                           isActivePath(child.path) 
               ? 'bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white shadow-md scale-105' 
               : 'text-slate-400'
            ]"
          >
            <span class="w-4 h-4 mr-3 transition-transform duration-200 text-center">{{ child.icon }}</span>
            <span class="truncate" :title="child.name">{{ child.name }}</span>
                         <div v-if="route.path === child.path" class="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
           </NuxtLink>
        </div>
        <!-- Menu without children -->
        <NuxtLink 
          v-else
          :to="item.path" 
          :prefetch="false"
          @click="() => { $emit('select', item); handleMenuClick(item.path) }"
          :class="[
            'group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 min-h-[48px]',
            'hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white',
            'hover:shadow-lg hover:scale-105',
                         isActivePath(item.path) 
               ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105' 
               : 'text-slate-300'
          ]"
        >
          <span class="w-5 h-5 mr-3 transition-transform duration-200 text-center">{{ item.icon }}</span>
          <span class="truncate" :title="item.name">{{ item.name }}</span>
                     <div v-if="route.path === item.path" class="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
         </NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/composables/navigation/useNavigation'

const props = defineProps({
  menuItems: { type: [Array, Object], required: true },
  activePath: { type: String, required: true },
  sidebarOpen: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const route = useRoute()
const { navigateTo, navigateToWithQuery } = useNavigation()

// SSR-safe: isMounted để đảm bảo chỉ render menu items sau khi mounted
const isMounted = ref(false)
const expandedMenus = ref([])

// Handle menu click - always go to the exact configured path
const handleMenuClick = (path) => {
  if (path.includes('?')) {
    // Path already has query parameters, use exactly as configured
    const [pathname, search] = path.split('?')
    const query = Object.fromEntries(new URLSearchParams(search))
    navigateToWithQuery(pathname, query)
  } else {
    // Path without query parameters, clear any existing query
    navigateTo(path)
  }
}

// Check if a path is active (handles query parameters)
const isActivePath = (path) => {
  if (path.includes('?')) {
    // For paths with query parameters, compare both path and query
    const [pathname, search] = path.split('?')
    const query = Object.fromEntries(new URLSearchParams(search))
    
    // Check if path matches and all query parameters match
    if (route.path !== pathname) return false
    
    for (const [key, value] of Object.entries(query)) {
      if (route.query[key] !== value) return false
    }
    return true
  } else {
    // For paths without query parameters, just compare path
    return route.path === path
  }
}

// Handle menuItems (could be computed or array)
// SSR-safe: chỉ trả về menu items sau khi mounted để tránh hydration mismatch
const menuItemsArray = computed(() => {
  // Server: luôn trả về empty array
  if (process.server || !isMounted.value) {
    return []
  }
  return Array.isArray(props.menuItems) ? props.menuItems : props.menuItems.value || []
})

const toggleSubmenu = (menuName) => {
  const index = expandedMenus.value.indexOf(menuName)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(menuName)
  }
}

const isSubmenuActive = (item) => {
  if (!item.children) return false
  return item.children.some(child => child.path === route.path)
}

// Auto-expand submenu if current path is in it
const currentSubmenu = computed(() => {
  for (const item of menuItemsArray.value) {
    if (item.children && item.children.some(child => child.path === route.path)) {
      return item.name
    }
  }
  return null
})

// Auto-expand submenu on mount
// Note: onMounted only runs on client, so process.client check is redundant
  onMounted(() => {
  isMounted.value = true
    if (currentSubmenu.value && !expandedMenus.value.includes(currentSubmenu.value)) {
      expandedMenus.value.push(currentSubmenu.value)
    }
  })


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
</style> 
