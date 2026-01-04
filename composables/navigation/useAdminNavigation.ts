import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { MenuItem, AdminNavigationResult } from './navigation.types'
import { useMenus } from '@/composables/menus'
import type { MenuTreeItem } from '@/types/menu'

export function useAdminNavigation(): AdminNavigationResult {
  const route = useRoute()
  const { getUserMenus } = useMenus()
  
  const apiMenuItems = ref<MenuTreeItem[]>([])
  const menuLoading = ref(false)
  const menuError = ref<string | null>(null)

  const currentPath = computed(() => route.path)

  const convertApiMenuToMenuItem = (menu: MenuTreeItem): MenuItem => {
    const menuId = typeof menu.id === 'string' ? menu.id : menu.id.toString()
    
    const item: MenuItem = {
      id: menuId,
      name: menu.name,
      path: menu.path || (menu.type === 'group' ? '#' : '/admin'),
      api: menu.api_path || undefined,
      icon: menu.icon || '📋',
      status: menu.status === 'active' ? 'active' : 'inactive',
      order: menu.sort_order || 0,
      parentId: menu.parent_id ? (typeof menu.parent_id === 'string' ? menu.parent_id : menu.parent_id.toString()) : undefined,
      type: 'admin',
      disabled: false
    }

    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      item.children = menu.children
        .filter(child => child.show_in_menu !== false)
        .map(child => convertApiMenuToMenuItem(child))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    }

    return item
  }

  const loadMenus = async () => {
    if (process.server) return
    
    menuLoading.value = true
    menuError.value = null
    try {
      const menus = await getUserMenus({ include_inactive: false, flatten: false })
      apiMenuItems.value = menus || []
    } catch (error: any) {
      menuError.value = error.message || 'Không thể tải menu'
      apiMenuItems.value = []
    } finally {
      menuLoading.value = false
    }
  }

  const menuItems = computed<MenuItem[]>(() => {
    // SSR-safe: server luôn trả về empty array để tránh hydration mismatch
    if (process.server) {
      return []
    }
    
    if (!apiMenuItems.value || apiMenuItems.value.length === 0) {
      return []
    }
    
    return apiMenuItems.value
      .filter(menu => menu.show_in_menu !== false)
      .map(menu => convertApiMenuToMenuItem(menu))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const isActiveMenuItem = (item: MenuItem): boolean => {
    if (!currentPath.value) return false
    return currentPath.value === item.path
  }

  // SSR-safe: chỉ load menus trên client, sau khi mounted
  if (process.client) {
    onMounted(() => {
      loadMenus()
    })
  }

  return {
    menuItems,
    currentPath,
    isActiveMenuItem,
    menuLoading: computed(() => menuLoading.value),
    menuError: computed(() => menuError.value)
  }
}
