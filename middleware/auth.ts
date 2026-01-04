import { useAuthStore } from '@/stores/auth'

// ===== TYPES =====

interface RouteLocationNormalized {
  path: string
  meta: {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    [key: string]: any
  }
  [key: string]: any
}

// ===== MIDDLEWARE =====

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  // Chỉ chạy trên client để tránh hydration mismatch
  if (process.server) {
    return
  }

  const authStore = useAuthStore()

  // Chỉ kiểm tra auth nếu chưa được khởi tạo
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  // Tự động áp dụng middleware cho tất cả các route /admin/**
  if (to.path.startsWith('/admin')) {
    // Kiểm tra authentication
    if (!authStore.isAuthenticated) {
      return navigateTo('/auth/login')
    }
    return
  }

  // Nếu route yêu cầu auth nhưng user chưa đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Nếu user đã đăng nhập và truy cập login/register, redirect về trang chủ
  if (authStore.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    if (authStore.isAdmin) {
      return navigateTo('/admin')
    } else {
      return navigateTo('/user')
    }
  }
})
