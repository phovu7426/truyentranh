import { useRouter } from 'vue-router'
import type { NavigationResult } from './navigation.types'

// ===== COMPOSABLE =====

export function useNavigation(): NavigationResult {
  const router = useRouter()

  const navigateToPath = (path: string) => {
    router.push({ path, query: {} })
  }

  const navigateToWithQuery = (path: string, query: Record<string, any> = {}) => {
    router.push({ path, query })
  }

  const updateQuery = async (newQuery: Record<string, any> = {}) => {
    const currentPath = router.currentRoute.value.path
    const currentQuery = router.currentRoute.value.query

    // Create new query object by merging current query with new query
    const mergedQuery = { ...currentQuery, ...newQuery }

    // Remove undefined values
    Object.keys(mergedQuery).forEach(key => {
      if (mergedQuery[key] === undefined || mergedQuery[key] === null || mergedQuery[key] === '') {
        delete mergedQuery[key]
      }
    })


    try {
      // Use router.replace to update URL without adding a new history entry (unless needed)
      // This ensures Vue Router knows about the change and triggers watchers
      await router.replace({
        path: currentPath,
        query: mergedQuery
      })
    } catch (error: any) {
      // Ignore navigation duplicate errors
      // Error handled silently
    }
  }

  return {
    navigateTo: navigateToPath,
    navigateToWithQuery,
    updateQuery
  }
}
