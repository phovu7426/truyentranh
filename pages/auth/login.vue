<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Decorations -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full opacity-5 blur-3xl"></div>
    </div>

    <!-- Login Form - Hiển thị khi CHƯA đăng nhập -->
    <div v-if="!authStore.isAuthenticated" class="max-w-md w-full relative z-10">
      <!-- Logo/Brand Section -->
      <div class="text-center mb-8">
        <div class="mx-auto h-20 w-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
          Chào mừng trở lại
        </h2>
        <p class="text-gray-600 text-lg">
          Đăng nhập vào tài khoản của bạn
        </p>
      </div>
      
      <!-- Form Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
        <!-- Card Decoration -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div class="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div class="absolute bottom-4 left-4 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
        
        <FormWrapper
          :default-values="defaultValues"
          :rules="validationRules"
          :api-errors="apiErrors"
          :show-cancel-button="false"
          :disable-submit="isLoading"
          submit-text="Đăng nhập"
          submitting-text="Đang đăng nhập..."
          @submit="handleSubmit"
        >
          <template #default="{ form, errors, clearError, isSubmitting }">
            <div class="space-y-6">
              <!-- Email Field -->
              <div class="space-y-2 group">
                <FormField
                  v-model="form.email"
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="Nhập email của bạn"
                  :error="errors.email"
                  :disabled="isLoading"
                  required
                  autocomplete="email"
                  @update:model-value="clearError('email')"
                />
              </div>

              <!-- Password Field -->
              <div class="space-y-2 group">
                <FormField
                  v-model="form.password"
                  name="password"
                  type="password"
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu của bạn"
                  :error="errors.password"
                  :disabled="isLoading"
                  required
                  autocomplete="current-password"
                  @update:model-value="clearError('password')"
                />
              </div>

              <!-- Remember Me & Forgot Password -->
              <div class="flex items-center justify-between">
                <FormField
                  v-model="form.remember"
                  name="remember"
                  type="checkbox"
                  checkbox-label="Ghi nhớ đăng nhập"
                  :disabled="isLoading"
                />
                
                <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500 transition-all duration-200 hover:scale-105" :class="{ 'pointer-events-none opacity-50': isLoading }">
                  Quên mật khẩu?
                </a>
              </div>

              <!-- Error Message -->
              <div v-if="generalError" class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm backdrop-blur-sm">
                <div class="flex items-center">
                  <svg class="h-5 w-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  {{ generalError }}
                </div>
              </div>
            </div>
          </template>
        </FormWrapper>
      </div>

      <!-- Register Link -->
      <div class="text-center mt-8">
        <p class="text-gray-600">
          Chưa có tài khoản?
          <NuxtLink to="/auth/register" class="font-semibold text-blue-600 hover:text-blue-500 transition-all duration-200 hover:scale-105 inline-block" :class="{ 'pointer-events-none opacity-50': isLoading }">
            Đăng ký ngay
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- User Dashboard - Hiển thị khi ĐÃ đăng nhập -->
    <div v-else class="max-w-2xl w-full relative z-10">
      <!-- Welcome Card -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <!-- Gradient Header -->
        <div class="relative h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/5"></div>
          <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          <!-- Avatar -->
          <div class="relative z-10 transform -mb-16">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-white to-blue-50 border-8 border-white shadow-2xl flex items-center justify-center">
              <div class="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold">
                {{ getUserInitial }}
              </div>
            </div>
            <!-- Online Badge -->
            <div class="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full animate-pulse"></div>
          </div>
        </div>

        <!-- User Info Section -->
        <div class="pt-20 pb-8 px-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Xin chào, {{ authStore.user?.name || authStore.user?.username || 'Người dùng' }}!
            </h2>
            <p class="text-gray-600 text-lg flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {{ authStore.user?.email }}
            </p>
            <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span class="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                {{ authStore.userRole || 'User' }}
              </span>
            </div>
          </div>

          <!-- Action Buttons Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <!-- Profile Button -->
            <button 
              @click="navigateTo('/user/profile')"
              class="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative z-10 flex flex-col items-center gap-3">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span class="font-semibold text-lg">Thông tin</span>
                <span class="text-xs text-blue-100">Quản lý hồ sơ</span>
              </div>
            </button>

            <!-- Change Password Button -->
            <button 
              @click="navigateTo('/user/profile/change-password')"
              class="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative z-10 flex flex-col items-center gap-3">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <span class="font-semibold text-lg">Đổi mật khẩu</span>
                <span class="text-xs text-indigo-100">Bảo mật tài khoản</span>
              </div>
            </button>

            <!-- Logout Button -->
            <button 
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="group relative bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="relative z-10 flex flex-col items-center gap-3">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg v-if="!isLoggingOut" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <svg v-else class="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
                <span class="font-semibold text-lg">{{ isLoggingOut ? 'Đang xuất...' : 'Đăng xuất' }}</span>
                <span class="text-xs text-purple-100">Thoát tài khoản</span>
              </div>
            </button>
          </div>

          <!-- Additional Links -->
          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <NuxtLink 
              :to="authStore.isAdmin ? '/admin' : '/user'"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span class="font-medium text-gray-700">
                {{ authStore.isAdmin ? 'Trang quản trị' : 'Trang chủ' }}
              </span>
            </NuxtLink>

            <NuxtLink 
              to="/home"
              class="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span class="font-medium text-gray-700">Trang mua hàng</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Stats Card -->
      <div class="mt-6 grid grid-cols-3 gap-4">
        <div class="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/40 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            {{ authStore.user?.phone ? '✓' : '—' }}
          </div>
          <div class="text-xs text-gray-600 font-medium">Số điện thoại</div>
        </div>
        
        <div class="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/40 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
            ✓
          </div>
          <div class="text-xs text-gray-600 font-medium">Đã xác thực</div>
        </div>
        
        <div class="bg-white/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-white/40 shadow-lg transform hover:scale-105 transition-all duration-300">
          <div class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            {{ authStore.user?.status || 'Active' }}
          </div>
          <div class="text-xs text-gray-600 font-medium">Trạng thái</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'

// Form data
const defaultValues = {
  email: '',
  password: '',
  remember: false
}

// Validation rules
const validationRules = {
  email: [
    { required: 'Email là bắt buộc' },
    { email: 'Email không hợp lệ' }
  ],
  password: [
    { required: 'Mật khẩu là bắt buộc' },
    { min: [6, 'Mật khẩu phải có ít nhất 6 ký tự'] }
  ]
}

const apiErrors = ref({})
const generalError = ref('')
const isLoading = ref(false)
const isLoggingOut = ref(false)

const authStore = useAuthStore()

// Computed: Lấy chữ cái đầu tiên của tên user để hiển thị avatar
const getUserInitial = computed(() => {
  const user = authStore.user
  if (user?.name) {
    return user.name.charAt(0).toUpperCase()
  }
  if (user?.username) {
    return user.username.charAt(0).toUpperCase()
  }
  if (user?.email) {
    return user.email.charAt(0).toUpperCase()
  }
  return 'U'
})

// Methods
const handleSubmit = async (form) => {
  if (isLoading.value) return // Prevent multiple submissions
  
  isLoading.value = true
  generalError.value = ''
  apiErrors.value = {}

  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember
    })

    if (result.success) {
      // Redirect based on user role
      if (authStore.isAdmin) {
        await navigateTo('/admin')
      } else {
        await navigateTo('/user')
      }
    } else {
      // Handle API errors
      if (result.errors) {
        apiErrors.value = result.errors
      } else {
        generalError.value = result.message || 'Đăng nhập thất bại'
      }
    }
  } catch (err) {
    generalError.value = 'Có lỗi xảy ra, vui lòng thử lại'
  } finally {
    isLoading.value = false
  }
}

// Handle Logout
const handleLogout = async () => {
  if (isLoggingOut.value) return
  
  isLoggingOut.value = true
  
  try {
    await authStore.logout()
    // Không cần navigate vì trang sẽ tự động hiển thị form đăng nhập
    // khi authStore.isAuthenticated = false
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* Custom styles for better form appearance */
:deep(.form-field) {
  margin-bottom: 0;
}

:deep(.form-field input) {
  @apply transition-all duration-300 ease-out;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

:deep(.form-field input:focus) {
  @apply ring-2 ring-blue-500 ring-opacity-50;
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04);
}

:deep(.form-field input:disabled) {
  @apply opacity-50 cursor-not-allowed;
  transform: none;
}

:deep(.form-field input[type="checkbox"]) {
  @apply rounded border-gray-300 text-blue-600 focus:ring-blue-500;
  transition: all 0.2s ease;
}

:deep(.form-field input[type="checkbox"]:checked) {
  transform: scale(1.1);
}

:deep(.form-field input[type="checkbox"]:disabled) {
  @apply opacity-50 cursor-not-allowed;
  transform: none;
}

:deep(.form-field label) {
  @apply text-sm font-semibold text-gray-700 mb-2;
  transition: all 0.2s ease;
}

:deep(.form-field:hover label) {
  @apply text-blue-600;
}

:deep(.form-field .text-red-500) {
  @apply text-sm mt-1;
  animation: shake 0.5s ease-in-out;
}

/* Custom button styles */
:deep(.form-wrapper button[type="submit"]) {
  @apply w-full text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-xl;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

:deep(.form-wrapper button[type="submit"]:before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

:deep(.form-wrapper button[type="submit"]:hover:before) {
  left: 100%;
}

:deep(.form-wrapper button[type="submit"]:disabled) {
  @apply opacity-50 cursor-not-allowed transform-none;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

:deep(.form-wrapper button[type="submit"]:disabled:before) {
  display: none;
}

/* Loading spinner for button */
:deep(.form-wrapper button[type="submit"]:disabled) {
  position: relative;
}

:deep(.form-wrapper button[type="submit"]:disabled::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid transparent;
  border-top: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Floating animation for background elements */
.absolute:nth-child(1) { animation: float 6s ease-in-out infinite; }
.absolute:nth-child(2) { animation: float 6s ease-in-out infinite reverse; }
.absolute:nth-child(3) { animation: float 8s ease-in-out infinite; }

/* Glass morphism effect */
.backdrop-blur-xl {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Enhanced focus states */
:deep(.form-field input:focus + label) {
  @apply text-blue-600;
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style> 
