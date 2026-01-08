<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Top Header -->
        <div class="flex items-center justify-between py-3 sm:py-4 gap-3 min-w-0">
          <div class="flex items-center min-w-0 flex-1">
            <!-- Mobile hamburger -->
            <button
              type="button"
              class="md:hidden mr-2 sm:mr-3 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
              :aria-expanded="mobileMenuOpen"
              aria-controls="mobile-menu-drawer"
              aria-label="Mở menu"
              title="Menu"
              @click="toggleMobileMenu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <!-- Logo từ API hoặc fallback icon -->
            <div v-if="!siteLogo" class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <img v-else :src="siteLogo" :alt="systemInfo.name || 'Logo'" class="h-10 w-auto object-contain mr-2 sm:mr-3 flex-shrink-0" />
            <!-- Tránh dùng H1 ở layout để page có thể có H1 riêng (SEO/semantics) -->
            <NuxtLink
              to="/"
              class="text-base sm:text-xl md:text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors block truncate min-w-0"
            >
              {{ systemInfo.name || 'E-Commerce Platform' }}
            </NuxtLink>
          </div>
          
          <!-- Search Bar -->
          <div class="hidden md:flex flex-1 max-w-md mx-8">
            <div class="relative w-full">
              <input 
                type="text" 
                placeholder="Tìm kiếm truyện tranh..." 
                class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <nav class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <!-- User Menu -->
            <ClientOnly>
              <template v-if="isAuthenticated && userRole !== 'admin'">
                <UserDropdown
                  :username="user?.name || 'User'"
                  :email="user?.email || ''"
                  variant="compact"
                  @logout="handleLogout"
                />
              </template>
              
              <template v-else>
                <!-- Mobile: chỉ hiển thị icon login để tránh tràn header -->
                <NuxtLink
                  to="/auth/login"
                  class="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Đăng nhập"
                  title="Đăng nhập"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </NuxtLink>

                <!-- Desktop / >= sm -->
                <NuxtLink to="/auth/login" class="hidden sm:inline-flex text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Đăng nhập
                </NuxtLink>
                <NuxtLink to="/auth/register" class="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  Đăng ký
                </NuxtLink>
              </template>
              
              <!-- Fallback cho SSR -->
              <template #fallback>
                <NuxtLink to="/auth/login" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Đăng nhập
                </NuxtLink>
                <NuxtLink to="/auth/register" class="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  Đăng ký
                </NuxtLink>
              </template>
            </ClientOnly>
          </nav>
        </div>
        
        <!-- Navigation Menu -->
        <!-- Desktop only: menu ngang (dropdown hover). Mobile sẽ dùng drawer -->
        <div class="hidden md:block border-t border-gray-200 py-3">
          <nav class="flex items-center">
            <div class="flex items-center space-x-8">
              <!-- Dynamic Navigation Menu -->
              <template v-for="item in navigationItems" :key="item.name">
                <!-- Menu item có children (dropdown) -->
                <div v-if="item.children" class="relative group">
                  <button 
                    class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    :class="{ 'text-blue-600': isActiveMenuItem(item) }"
                  >
                    <span class="text-lg">{{ item.icon }}</span>
                    <span>{{ item.name }}</span>
                    <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <!-- Dropdown Menu -->
                  <div class="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    <div class="py-2">
                      <!-- Static children -->
                      <NuxtLink 
                        v-for="child in item.children" 
                        :key="child.name"
                        :to="child.path" 
                        class="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <span class="text-lg mr-3">{{ child.icon }}</span>
                        <span>{{ child.name }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
                
                <!-- Menu item thường -->
                <NuxtLink 
                  v-else
                  :to="item.path" 
                  class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                  :class="{ 'text-blue-600': isActiveMenuItem(item) }"
                >
                  <span class="text-lg">{{ item.icon }}</span>
                  <span>{{ item.name }}</span>
                </NuxtLink>
              </template>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <!-- Mobile menu drawer -->
    <Teleport v-if="isClient" to="body">
      <Transition name="mobile-fade">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 bg-black/40 z-[60]"
          aria-hidden="true"
          @click="closeMobileMenu"
        ></div>
      </Transition>

      <Transition name="mobile-slide">
        <aside
          v-if="mobileMenuOpen"
          id="mobile-menu-drawer"
          class="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white z-[70] shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          @click.stop
        >
          <div class="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <NuxtLink
                to="/"
                :prefetch="false"
                class="font-semibold text-gray-900 truncate"
                @click="closeMobileMenu"
              >
                {{ systemInfo.name || 'E-Commerce Platform' }}
              </NuxtLink>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Đóng menu"
              title="Đóng"
              @click="closeMobileMenu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile search -->
          <div class="px-4 py-4 border-b border-gray-100">
            <div class="relative">
              <input
                v-model="mobileSearch"
                type="text"
                placeholder="Tìm kiếm truyện tranh..."
                class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Mobile navigation -->
          <nav class="flex-1 overflow-y-auto px-2 py-2">
            <div class="space-y-1">
              <template v-for="item in navigationItems" :key="`m-${item.name}`">
                <!-- Has children / dynamic -->
                <div v-if="item.children" class="rounded-xl">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left text-gray-800 hover:bg-gray-100 transition-colors min-h-[48px]"
                    :class="{ 'bg-blue-50 text-blue-700': isActiveMenuItem(item) }"
                    @click="toggleMobileSubmenu(item.name)"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="text-lg shrink-0">{{ item.icon }}</span>
                      <span class="font-medium truncate">{{ item.name }}</span>
                    </div>
                    <svg
                      class="w-5 h-5 text-gray-500 transition-transform"
                      :class="{ 'rotate-180': expandedMobileMenus.includes(item.name) }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  <div v-show="expandedMobileMenus.includes(item.name)" class="mt-1 mb-2 ml-3 border-l border-gray-200 pl-3 space-y-1">
                    <!-- Static children -->
                    <NuxtLink
                      v-for="child in item.children"
                      :key="`m-child-${child.name}-${child.path}`"
                      :to="child.path"
                      :prefetch="false"
                      class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors min-h-[44px]"
                      :class="{ 'bg-blue-50 text-blue-700': route.path === child.path }"
                      @click="closeMobileMenu"
                    >
                      <span class="text-lg">{{ child.icon }}</span>
                      <span class="truncate">{{ child.name }}</span>
                    </NuxtLink>
                  </div>
                </div>

                <!-- Normal item -->
                <NuxtLink
                  v-else
                  :to="item.path"
                  :prefetch="false"
                  class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-800 hover:bg-gray-100 transition-colors min-h-[48px]"
                  :class="{ 'bg-blue-50 text-blue-700': isActiveMenuItem(item) }"
                  @click="closeMobileMenu"
                >
                  <span class="text-lg">{{ item.icon }}</span>
                  <span class="font-medium">{{ item.name }}</span>
                </NuxtLink>
              </template>
            </div>
          </nav>

          <!-- Mobile footer actions -->
          <div class="border-t border-gray-200 p-4 space-y-2">
            <template v-if="!isAuthenticated">
              <NuxtLink
                to="/auth/login"
                :prefetch="false"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors"
                @click="closeMobileMenu"
              >
                Đăng nhập
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                :prefetch="false"
                class="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
                @click="closeMobileMenu"
              >
                Đăng ký
              </NuxtLink>
            </template>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <!-- Logo từ API hoặc fallback icon -->
              <div v-if="!siteLogo" class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <img v-else :src="siteLogo" :alt="systemInfo.name || 'Logo'" class="h-10 w-auto object-contain mr-3" />
              <h3 class="text-lg font-semibold">{{ systemInfo.name || 'E-Commerce Platform' }}</h3>
            </div>
            <p class="text-gray-400 mb-4">{{ siteDescription }}</p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Truyện tranh</h4>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/home/comics" class="hover:text-white transition-colors">Danh sách truyện</NuxtLink></li>
              <li><NuxtLink to="/home/comics?sort_by=view_count&sort_order=DESC" class="hover:text-white transition-colors">Truyện hot</NuxtLink></li>
              <li><NuxtLink to="/home/comics?sort_by=created_at&sort_order=DESC" class="hover:text-white transition-colors">Truyện mới</NuxtLink></li>
              <li><NuxtLink to="/home/comics?sort_by=follow_count&sort_order=DESC" class="hover:text-white transition-colors">Truyện phổ biến</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Liên hệ hỗ trợ</a></li>
              <li><a href="#" class="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Tài liệu API</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Thông tin hệ thống</h4>
            <ul class="space-y-2 text-gray-400">
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Phiên bản: {{ systemInfo.version || '1.0.0' }}
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Múi giờ: {{ systemInfo.timezone || 'Asia/Ho_Chi_Minh' }}
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p v-if="siteCopyright">{{ siteCopyright }}</p>
          <p v-else>&copy; {{ currentYear }} {{ systemInfo.name || 'E-Commerce Platform' }}. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <!-- Floating Contact Channels (chỉ hiển thị trên trang public) -->
    <ClientOnly>
      <FloatingContactChannels
        v-if="!isAdminRoute"
        :channels="contactChannels"
        :show-label="true"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useUserNavigation } from '@/composables/navigation/useUserNavigation'
import { useAuthStore } from '@/stores/auth'
import { useGlobalSystemConfig } from '~/composables/system-config'
import { useGlobalApiClient } from '@/composables/api/useApiClient'
import { publicEndpoints } from '@/api/endpoints'
import UserDropdown from '@/components/Layout/Shared/UserDropdown.vue'
import FloatingContactChannels from '@/components/Layout/ContactChannels/FloatingContactChannels.vue'

// Sử dụng auth store
const authStore = useAuthStore()

// Sử dụng system config
const { systemInfo, data: systemConfig, getConfigValue } = useGlobalSystemConfig()

// Lấy các giá trị từ config
const siteLogo = computed(() => getConfigValue('site_logo') || null)
const siteFavicon = computed(() => getConfigValue('site_favicon') || null)
const siteCopyright = computed(() => getConfigValue('site_copyright') || null)
const siteDescription = computed(() => getConfigValue('site_description') || 'Nền tảng thương mại điện tử hiện đại với đầy đủ tính năng quản lý')
const contactChannels = computed(() => getConfigValue('contact_channels') || null)

// Sử dụng user navigation composable
const {
  menuItems: navigationItems,
  isActiveMenuItem,
  currentPath
} = useUserNavigation()

// Chỉ set title cho trang chủ, các trang khác tự set title riêng
const route = useRoute()
const pageTitle = computed(() => {
  // Chỉ set title cho trang chủ
  if (route.path === '/' || route.path === '/home') {
    return systemInfo.value.name || 'E-Commerce Platform'
  }
  
  // Tất cả các trang khác sẽ tự set title riêng, không override
  return null
})

// Set page title tự động (chỉ cho trang chủ)
useHead(() => {
  if (pageTitle.value === null) {
    // Các trang khác sẽ tự set title, không override
    return {}
  }
  return {
    title: pageTitle.value
  }
})

// Sử dụng API client
const { apiClient } = useGlobalApiClient()

// Reactive auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)

// SSR-safe current year (computed to ensure consistency between server and client)
const currentYear = computed(() => new Date().getFullYear())

// Kiểm tra xem có phải trang admin không
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

// Mobile menu state (SSR-safe)
const isClient = ref(false)
const mobileMenuOpen = ref(false)
const expandedMobileMenus = ref<string[]>([])
const mobileSearch = ref('')

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleMobileSubmenu = (name: string) => {
  const idx = expandedMobileMenus.value.indexOf(name)
  if (idx >= 0) expandedMobileMenus.value.splice(idx, 1)
  else expandedMobileMenus.value.push(name)
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

// Hàm xử lý logout
async function handleLogout() {
  await authStore.logout()
  await navigateTo('/auth/login')
}

// Fetch categories khi component mount
onMounted(() => {
  isClient.value = true
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  if (process.client) document.body.classList.remove('overflow-hidden')
})

// Cập nhật current path khi route thay đổi
watch(() => route.path, (newPath) => {
  // currentPath là readonly, không thể assign trực tiếp
  // Navigation composable sẽ tự động cập nhật
  // Close mobile drawer on navigation
  if (mobileMenuOpen.value) closeMobileMenu()
}, { immediate: true })

// Prevent body scroll when drawer is open
watch(mobileMenuOpen, (open) => {
  if (!process.client) return
  document.body.classList.toggle('overflow-hidden', open)
})

</script>

<style scoped>
/* Custom styles for home layout */

/* Mobile drawer transitions */
.mobile-fade-enter-active,
.mobile-fade-leave-active {
  transition: opacity 180ms ease;
}
.mobile-fade-enter-from,
.mobile-fade-leave-to {
  opacity: 0;
}

.mobile-slide-enter-active,
.mobile-slide-leave-active {
  transition: transform 220ms ease;
  will-change: transform;
}
.mobile-slide-enter-from,
.mobile-slide-leave-to {
  transform: translateX(-100%);
}
</style>
