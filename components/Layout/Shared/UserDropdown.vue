<template>
  <div class="user-dropdown-container" :data-variant="variant" ref="dropdownRef">
    <button
      class="user-dropdown-button"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <div class="user-avatar">
        <span class="avatar-text">{{ username?.charAt(0)?.toUpperCase() || 'U' }}</span>
      </div>
      <span v-if="showName" class="user-name">{{ username }}</span>
      <svg 
        class="dropdown-arrow" 
        :class="{ 'dropdown-arrow-open': isOpen }"
        viewBox="0 0 24 24"
      >
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </button>

    <!-- Overlay to capture clicks when dropdown is open -->
    <!-- SSR-safe: dùng Teleport để render vào body, chỉ render sau khi mounted -->
    <Teleport v-if="isMounted" to="body">
      <div 
        v-if="isOpen"
        class="dropdown-overlay"
        @click="closeDropdown"
      ></div>
      
      <Transition name="dropdown">
        <div 
          v-if="isOpen"
          class="dropdown"
          :style="dropdownPosition"
        >
          <div class="dropdown-header">
            <div class="dropdown-name">{{ username }}</div>
            <div class="dropdown-email">{{ email }}</div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="handleProfile">Thông tin cá nhân</button>
          <button class="dropdown-item" @click="handleChangePassword">Đổi mật khẩu</button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" @click="handleLogout">Đăng xuất</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  username: {
    type: String,
    default: 'User'
  },
  email: {
    type: String,
    default: ''
  },
  showName: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'default', // default, compact
    validator: (value) => ['default', 'compact'].includes(value)
  }
})

const emit = defineEmits(['logout'])

const router = useRouter()
const authStore = useAuthStore()
// SSR-safe: isOpen luôn false trên server để tránh hydration mismatch
const isOpen = ref(false)
// SSR-safe: isMounted = true ngay trên client để tránh hydration mismatch
const isMounted = ref(process.client)
const dropdownRef = ref(null)
const dropdownPosition = ref({})

function toggleDropdown(event) {
  event?.stopPropagation()
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    nextTick(() => {
      calculateDropdownPosition()
    })
  }
}

function closeDropdown() {
  isOpen.value = false
}

function calculateDropdownPosition() {
  if (!dropdownRef.value) return
  
  const rect = dropdownRef.value.getBoundingClientRect()
  const dropdownWidth = 240
  const dropdownHeight = 200 // Ước tính chiều cao
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
  
  let left = rect.right - dropdownWidth + scrollLeft
  let top = rect.bottom + 8 + scrollTop
  
  // Đảm bảo dropdown không vượt ra ngoài màn hình bên phải
  if (left + dropdownWidth > windowWidth + scrollLeft) {
    left = windowWidth - dropdownWidth + scrollLeft - 16
  }
  
  // Đảm bảo dropdown không vượt ra ngoài màn hình bên trái
  if (left < scrollLeft + 16) {
    left = scrollLeft + 16
  }
  
  // Nếu không đủ không gian bên dưới, hiển thị bên trên
  if (top + dropdownHeight > windowHeight + scrollTop) {
    top = rect.top - dropdownHeight - 8 + scrollTop
  }
  
  dropdownPosition.value = {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: `${dropdownWidth}px`
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

function handleProfile() {
  closeDropdown()
  router.push('/user/profile')
}

function handleChangePassword() {
  closeDropdown()
  router.push('/user/profile/change-password')
}

function handleLogout() {
  closeDropdown()
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    emit('logout')
  }
}

// Watch cho dropdown open/close để thêm/xóa event listeners
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
  }
})

// Handle window resize
function handleResize() {
  if (isOpen.value) {
    calculateDropdownPosition()
  }
}

onMounted(() => {
  // isMounted đã được set = true từ process.client, nhưng đảm bảo chắc chắn
  if (!isMounted.value) {
    isMounted.value = true
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.user-dropdown-container {
  position: relative;
  display: inline-block;
}

.user-dropdown-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-dropdown-button:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 16px;
  height: 16px;
  fill: white;
}

.avatar-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  fill: #64748b;
  transition: transform 0.2s;
}

.dropdown-arrow-open {
  transform: rotate(180deg);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
}

.dropdown {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 9999;
  overflow: hidden;
}

.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin-bottom: 2px;
}

.dropdown-email {
  font-size: 13px;
  color: #64748b;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background: #f8fafc;
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
}

/* Dropdown transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Compact variant */
.user-dropdown-container[data-variant="compact"] .user-dropdown-button {
  padding: 6px 8px;
}

.user-dropdown-container[data-variant="compact"] .user-name {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .user-dropdown-button {
    padding: 6px 8px;
  }
}
</style>