<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Quản lý liên hệ</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
        v-text="'Thêm liên hệ mới'"
      ></button>
    </div>

    <ContactsFilter
      :initial-filters="filters"
      :status-enums="normalizedStatusEnums"
      @update:filters="handleFilterUpdate"
    />

    <!-- Bảng dữ liệu -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <ClientOnly>
        <SkeletonLoader v-if="formattedItems.length === 0" type="table" :rows="5" :columns="8" />
        <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điện thoại</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in formattedItems" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.serialNumber }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ item.name || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <a :href="`mailto:${item.email}`" class="text-blue-600 hover:text-blue-800">
                {{ item.email }}
              </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <a v-if="item.phone" :href="`tel:${item.phone}`" class="text-blue-600 hover:text-blue-800">
                {{ item.phone }}
              </a>
              <span v-else class="text-gray-400">N/A</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="max-w-xs truncate" :title="item.subject">
                {{ item.subject || 'Không có chủ đề' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="item.statusClass"
              >
                {{ item.statusLabel }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ item.formattedDate }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <Actions 
                  :item="item"
                  :show-edit="false"
                  :show-delete="false"
                  :show-view="true"
                  @view="handleOpenViewModal"
                  :additional-actions="getContactActions(item)"
                />
            </td>
          </tr>
          <tr v-if="formattedItems.length === 0">
            <td colspan="8" class="px-6 py-4 text-center text-gray-500">
              Không có dữ liệu
            </td>
          </tr>
        </tbody>
      </table>
        <template #fallback>
          <SkeletonLoader type="table" :rows="5" :columns="8" />
        </template>
      </ClientOnly>
    </div>

    <!-- Phân trang -->
    <Pagination
      v-if="hasData"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total-items="pagination.totalItems"
      :loading="loading"
      @page-change="handlePageChange"
    />

    <!-- Modal xem chi tiết -->
    <ContactView
      v-if="modals.view"
      :show="modals.view"
      :contact="selectedItem"
      :status-enums="normalizedStatusEnums"
      @close="handleCloseViewModal"
      @reply="openReplyModal"
      @mark-as-read="markAsRead"
      @close-contact="closeContact"
    />

    <!-- Modal chỉnh sửa -->
    <ContactEdit
      v-if="modals.edit"
      :show="modals.edit"
      :contact="selectedItem"
      :status-enums="normalizedStatusEnums"
      :api-errors="apiErrors"
      @close="closeEditModal"
      @updated="handleContactUpdated"
    />

    <!-- Modal reply -->
    <ContactReply
      v-if="modals.reply"
      :show="modals.reply"
      :contact="selectedItem"
      :api-errors="apiErrors"
      @close="closeReplyModal"
      @replied="handleContactReplied"
    />

    <!-- Modal xác nhận xóa -->
    <ConfirmModal
      v-if="modals.delete"
      :show="modals.delete"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa liên hệ từ ${selectedItem?.name || selectedItem?.email || ''}?`"
      :on-close="closeDeleteModal"
      @confirm="deleteContact"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useUrlApiSync } from '@/composables/utils/useUrlApiSync'
import { useToast } from '@/composables/ui/useToast'
import { useSerialNumber, useAdminModals } from '@/composables/ui'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import ConfirmModal from '@/components/Core/Modal/ConfirmModal.vue'
import Actions from '@/components/Core/Actions/Actions.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalApiClient } from '@/composables/api'
import ContactsFilter from './filter.vue'

// Lazy load components
const ContactView = defineAsyncComponent(() => import('./view.vue'))
const ContactEdit = defineAsyncComponent(() => import('./edit.vue'))
const ContactReply = defineAsyncComponent(() => import('./reply.vue'))

// Use simple URL API sync
const composable = useUrlApiSync({
  endpoint: adminEndpoints.contacts.list,
  createEndpoint: adminEndpoints.contacts.create,
  updateEndpoint: (id) => adminEndpoints.contacts.update(id),
  deleteEndpoint: (id) => adminEndpoints.contacts.delete(id)
})

// Await initial fetch trên server để tránh hydration mismatch  
await useAsyncData('contacts-list', async () => {
  await composable.fetchFromUrl()
  return true
}, {
  server: true,
  default: () => true,
  lazy: false
})

const {
  items,
  loading,
  pagination,
  filters,
  updateFilters,
  changePage,
  resetFilters,
  refresh,
  apiErrors,
  clearApiErrors
} = composable

// Safely access CRUD operations with null checks
const createItem = composable.createItem || (() => { throw new Error('createEndpoint not provided') })
const updateItem = composable.updateItem || (() => { throw new Error('updateEndpoint not provided') })
const deleteItem = composable.deleteItem || (() => { throw new Error('deleteEndpoint not provided') })

// Use admin modals composable
const {
  modals,
  selectedItem,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDeleteModal: confirmDelete,
  closeDeleteModal,
  openViewModal,
  closeViewModal,
  openModal,
  closeModal
} = useAdminModals({ 
  clearApiErrors,
  includeViewModal: true,
  customModals: ['reply']
})

// Computed properties
const hasData = computed(() => items.value.length > 0)
const isEmpty = computed(() => !loading.value && items.value.length === 0)
const isFirstPage = computed(() => pagination.value.page === 1)
const isLastPage = computed(() => pagination.value.page === pagination.value.totalPages)


const { showSuccess, showError } = useToast()
const { getSerialNumber } = useSerialNumber(pagination)
const { apiClient } = useGlobalApiClient()

// State - Load enums using useAsyncData để đảm bảo SSR/client sync
const { data: statusEnums } = await useAsyncData('contact_status_enums', async () => {
  try {
    const response = await apiClient.get(adminEndpoints.enums.byName('contact_status'))
    if (response.data?.success) {
      const enums = response.data.data || []
      return enums
    }
    return []
  } catch (e) {
    return []
  }
}, {
  default: () => [],
  server: true,
  lazy: false
})

// Đảm bảo statusEnums luôn là mảng để tránh hydration mismatch
const normalizedStatusEnums = computed(() => {
  const enums = statusEnums.value
  if (!Array.isArray(enums)) {
    return []
  }
  return enums
})

// Computed để format items với các giá trị đã được tính toán sẵn, tránh hydration mismatch
const formattedItems = computed(() => {
  // Đảm bảo chỉ tính toán khi có items
  if (!Array.isArray(items.value) || items.value.length === 0) {
    return []
  }
  
  // Đảm bảo pagination có giá trị hợp lệ - normalize để tránh hydration mismatch
  const pag = pagination.value || {}
  const currentPage = Math.max(1, Number(pag.page || pag.current_page || 1))
  const perPage = Math.max(1, Number(pag.limit || pag.per_page || 10))
  
  return items.value.map((contact, index) => {
    // Tính serial number một cách nhất quán - đảm bảo luôn là số nguyên
    const serialNumber = (currentPage - 1) * perPage + index + 1
    
    // Format date một cách nhất quán - sử dụng cùng logic trên server và client
    let formattedDate = 'N/A'
    const dateValue = contact.created_at
    if (dateValue && typeof dateValue === 'string' && dateValue.trim() && dateValue !== 'null' && dateValue !== 'undefined') {
      try {
        const d = new Date(dateValue.trim())
        if (!isNaN(d.getTime())) {
          // Luôn sử dụng UTC để đảm bảo nhất quán giữa server và client
          const day = String(d.getUTCDate()).padStart(2, '0')
          const month = String(d.getUTCMonth() + 1).padStart(2, '0')
          const year = String(d.getUTCFullYear())
          const hours = String(d.getUTCHours()).padStart(2, '0')
          const minutes = String(d.getUTCMinutes()).padStart(2, '0')
          formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`
        }
      } catch (e) {
        formattedDate = 'N/A'
      }
    }
    
    // Get status label và class - đảm bảo luôn có giá trị mặc định và nhất quán
    const enums = normalizedStatusEnums.value
    const statusValue = String(contact.status || '')
    const statusEnum = Array.isArray(enums) && statusValue ? enums.find(s => String(s.value) === statusValue) : null
    const statusLabel = statusEnum?.label || statusEnum?.name || statusValue || 'Không xác định'
    
    // Status class - có fallback để đảm bảo luôn có giá trị
    const statusColors = {
      pending: 'bg-orange-100 text-orange-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    const statusClass = statusEnum?.class || statusEnum?.badge_class || statusEnum?.color_class || statusColors[statusValue] || 'bg-gray-100 text-gray-800'
    
    return {
      ...contact,
      serialNumber,
      formattedDate,
      statusLabel,
      statusClass
    }
  })
})


async function handleFilterUpdate(newFilters) {
  await updateFilters(newFilters)
}

// Modal handlers
function handleOpenViewModal(contact) {
  openViewModal(contact)
}

function handleCloseViewModal() {
  closeViewModal()
}

function openReplyModal(contact) {
  openModal('reply', contact)
}

function closeReplyModal() {
  closeModal('reply')
}

// Action handlers
async function handleContactCreated(contactData) {
  try {
    await createItem(contactData)
    showSuccess('Liên hệ đã được tạo thành công')
    closeCreateModal()
  } catch (error) {
    showError('Không thể tạo liên hệ')
  }
}

async function handleContactUpdated(contactData) {
  if (!selectedItem.value) {
    return
  }
  
  try {
    await updateItem(selectedItem.value.id, contactData)
    showSuccess('Liên hệ đã được cập nhật thành công')
    closeEditModal()
  } catch (error) {
    showError('Không thể cập nhật liên hệ')
  }
}

async function handleContactReplied(replyData) {
  if (!selectedItem.value) {
    return
  }
  
  try {
    const response = await apiClient.put(adminEndpoints.contacts.reply(selectedItem.value.id), {
      reply: replyData.reply
    })
    
    if (response.data?.success) {
      showSuccess('Đã phản hồi liên hệ thành công')
      closeReplyModal()
      refresh() // Refresh data
    } else {
      showError('Không thể phản hồi liên hệ')
    }
  } catch (error) {
    showError('Không thể phản hồi liên hệ')
  }
}

async function markAsRead(contact) {
  try {
    const response = await apiClient.put(adminEndpoints.contacts.markAsRead(contact.id))
    
    if (response.data?.success) {
      showSuccess('Đã đánh dấu đã đọc')
      refresh() // Refresh data
    } else {
      showError('Không thể đánh dấu đã đọc')
    }
  } catch (error) {
    showError('Không thể đánh dấu đã đọc')
  }
}

async function closeContact(contact) {
  try {
    const response = await apiClient.put(adminEndpoints.contacts.close(contact.id))
    
    if (response.data?.success) {
      showSuccess('Đã đóng liên hệ')
      refresh() // Refresh data
    } else {
      showError('Không thể đóng liên hệ')
    }
  } catch (error) {
    showError('Không thể đóng liên hệ')
  }
}

async function deleteContact() {
  try {
    if (!selectedItem.value) return
    
    await deleteItem(selectedItem.value.id)
    showSuccess('Liên hệ đã được xóa thành công')
    closeDeleteModal()
  } catch (error) {
    showError('Không thể xóa liên hệ')
  }
}

async function handlePageChange(page) {
  await changePage(page)
}

// Helper functions
function getStatusLabel(status) {
  const found = normalizedStatusEnums.value.find(s => s.value === status)
  return found?.label || found?.name || status || 'Không xác định'
}

function getStatusClass(status) {
  const found = normalizedStatusEnums.value.find(s => s.value === status)
  const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    read: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }
  
  return found?.class || found?.badge_class || found?.color_class || statusColors[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(date) {
  if (!date) return 'N/A'
  
  // Đảm bảo date là string hoặc Date object
  const dateStr = typeof date === 'string' ? date : date.toString()
  if (!dateStr || dateStr === 'null' || dateStr === 'undefined') {
    return 'N/A'
  }
  
  try {
    // Parse date - đảm bảo parse nhất quán trên cả server và client
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'N/A'
    
    // Luôn sử dụng UTC để đảm bảo nhất quán giữa server và client
    // Format: DD/MM/YYYY HH:mm (UTC time)
    const day = String(d.getUTCDate()).padStart(2, '0')
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const year = String(d.getUTCFullYear())
    const hours = String(d.getUTCHours()).padStart(2, '0')
    const minutes = String(d.getUTCMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (e) {
    return 'N/A'
  }
}

function getContactActions(contact) {
  const actions = []
  
  // Reply action
  if (contact.status !== 'replied' && contact.status !== 'closed') {
    actions.push({
      label: 'Phản hồi',
      action: () => openReplyModal(contact),
      icon: 'reply'
    })
  }
  
  // Mark as read action
  if (contact.status === 'pending') {
    actions.push({
      label: 'Đánh dấu đã đọc',
      action: () => markAsRead(contact),
      icon: 'check'
    })
  }
  
  // Close action
  if (contact.status !== 'closed') {
    actions.push({
      label: 'Đóng',
      action: () => closeContact(contact),
      icon: 'close'
    })
  }
  
  // Edit action
  actions.push({
    label: 'Chỉnh sửa',
    action: () => openEditModal(contact),
    icon: 'edit'
  })
  
  // Delete action
  actions.push({
    label: 'Xóa',
    action: () => confirmDelete(contact),
    icon: 'trash'
  })
  
  return actions
}
</script>

<style>
/* Cho phép cuộn ngang table khi màn hình nhỏ */
.table-responsive {
  overflow-x: auto;
}
</style>

