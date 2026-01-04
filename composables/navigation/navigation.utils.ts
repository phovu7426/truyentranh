import type { MenuItem } from './navigation.types'

/**
 * Filter menu items by status
 */
export function filterByStatus(
  items: MenuItem[], 
  status: 'active' | 'inactive' | 'all' = 'active'
): MenuItem[] {
  if (status === 'all') return items
  return items.filter(item => item.status === status)
}

/**
 * Check if menu item is active
 */
export function isMenuItemActive(
  item: MenuItem, 
  currentPath: string
): boolean {
  if (!item.path || !currentPath) return false
  
  // Exact match
  if (currentPath === item.path) return true
  
  // Check if current path starts with item path (for nested routes)
  if (currentPath.startsWith(item.path + '/')) return true
  
  // Check children
  if (item.children) {
    return item.children.some(child => isMenuItemActive(child, currentPath))
  }
  
  return false
}
