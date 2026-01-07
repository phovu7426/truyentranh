<template>
  <ClientOnly>
    <button
      v-if="isAuthenticated"
      @click="handleToggleFollow"
      :disabled="saving"
      class="px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
      :class="isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'"
    >
      <svg
        v-if="!saving"
        class="w-5 h-5"
        :fill="isFollowing ? 'currentColor' : 'none'"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
      <div v-else class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      <span>{{ isFollowing ? 'Đã theo dõi' : 'Theo dõi' }}</span>
    </button>
    <NuxtLink
      v-else
      to="/auth/login"
      class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
    >
      Đăng nhập để theo dõi
    </NuxtLink>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGlobalApiClient } from '@/composables/api'
import { userEndpoints } from '@/api/endpoints'
import { useToast } from '@/composables/ui/useToast'

interface Props {
  comicId: number
}

const props = defineProps<Props>()

const { apiClient } = useGlobalApiClient()
const { showSuccess, showError } = useToast()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const saving = ref(false)
const isFollowing = ref(false)
const checking = ref(false)

onMounted(async () => {
  if (isAuthenticated.value) {
    await checkFollowStatus()
  }
})

watch(() => props.comicId, async () => {
  if (isAuthenticated.value) {
    await checkFollowStatus()
  }
})

async function checkFollowStatus() {
  checking.value = true
  try {
    const response = await apiClient.get(userEndpoints.follows.isFollowing(props.comicId))
    if (response.data?.success) {
      isFollowing.value = response.data.data?.is_following || false
    }
  } catch (error) {
    // Silent fail
    isFollowing.value = false
  } finally {
    checking.value = false
  }
}

async function handleToggleFollow() {
  if (!isAuthenticated.value) return

  saving.value = true

  try {
    if (isFollowing.value) {
      // Unfollow
      await apiClient.delete(userEndpoints.follows.unfollow(props.comicId))
      isFollowing.value = false
      showSuccess('Đã bỏ theo dõi')
    } else {
      // Follow
      await apiClient.post(userEndpoints.follows.follow(props.comicId))
      isFollowing.value = true
      showSuccess('Đã theo dõi truyện')
    }
  } catch (error: any) {
    showError(error.response?.data?.message || 'Không thể cập nhật trạng thái theo dõi')
  } finally {
    saving.value = false
  }
}
</script>



