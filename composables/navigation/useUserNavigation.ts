import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { MenuItem, UserNavigationResult, MenuType } from './navigation.types'
import { filterByStatus, isMenuItemActive } from './navigation.utils'

// ===== COMPOSABLE =====

export function useUserNavigation(): UserNavigationResult {
  const route = useRoute()

  // Current path từ route
  const currentPath = computed(() => route.path)

  // Menu items cho người dùng
  const menuItems: ComputedRef<MenuItem[]> = computed(() => [
    {
      name: 'Trang chủ',
      path: '/',
      api: '',
      icon: '🏠',
      status: 'active'
    },
    {
      name: 'Truyện tranh',
      path: '/home/comics',
      api: 'api/comics',
      icon: '📚',
      status: 'active'
    },
    {
      name: 'Thể loại',
      path: '/home/comics',
      api: 'api/comic-categories',
      icon: '🏷️',
      status: 'active'
    },
    {
      name: 'Tin tức',
      path: '/home/posts',
      api: 'api/posts',
      icon: '📰',
      status: 'active'
    },
    {
      name: 'Giới thiệu',
      path: '/home/about',
      api: 'api/about',
      icon: 'ℹ️',
      status: 'active'
    },
    {
      name: 'Liên hệ',
      path: '/home/contact',
      api: 'api/contact',
      icon: '📞',
      status: 'active'
    }
  ])

  // Menu items cho người dùng đã đăng nhập
  const userMenuItems: ComputedRef<MenuItem[]> = computed(() => [
    {
      name: 'Tài khoản của tôi',
      path: '/user/profile',
      api: 'api/user/profile',
      icon: '👤',
      status: 'active'
    },
    {
      name: 'Lịch sử đọc',
      path: '/user/reading-history',
      api: 'api/user/reading-history',
      icon: '📖',
      status: 'active'
    },
    {
      name: 'Truyện yêu thích',
      path: '/user/bookmarks',
      api: 'api/user/bookmarks',
      icon: '❤️',
      status: 'active'
    },
    {
      name: 'Đang theo dõi',
      path: '/user/follows',
      api: 'api/user/follows',
      icon: '⭐',
      status: 'active'
    },
    {
      name: 'Cài đặt',
      path: '/user/profile/edit',
      api: 'api/user/settings',
      icon: '⚙️',
      status: 'active'
    }
  ])


  // Menu items đã được filter - đơn giản chỉ filter theo status
  const filteredMenuItems: ComputedRef<MenuItem[]> = computed(() => {
    return filterByStatus(menuItems.value, 'active')
  })

  // Hàm để lấy menu items theo loại
  const getMenuItemsByType = (type: MenuType): MenuItem[] => {
    switch (type) {
      case 'user':
        return filterByStatus(userMenuItems.value, 'active')
      default:
        return filteredMenuItems.value
    }
  }

  // Hàm để kiểm tra menu item có active không
  const isActiveMenuItem = (item: MenuItem): boolean => {
    return isMenuItemActive(item, currentPath.value)
  }

  return {
    menuItems: filteredMenuItems,
    userMenuItems,
    currentPath,
    getMenuItemsByType,
    isActiveMenuItem
  }
}
