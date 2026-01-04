<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Tồn kho: {{ warehouse?.name || 'Đang tải...' }}</h1>
        <p v-if="warehouse" class="text-sm text-gray-600 mt-1">
          Mã kho: <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ warehouse.code }}</code>
        </p>
      </div>
      <button 
        @click="goBack" 
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none"
      >
        Quay lại
      </button>
    </div>

    <!-- Bộ lọc -->
    <div class="mb-4">
      <div class="flex items-center space-x-4">
        <label class="flex items-center">
          <input
            v-model="filters.low_stock"
            type="checkbox"
            class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
            @change="handleFilterChange"
          />
          <span class="ml-2 text-sm text-gray-700">Chỉ hiển thị tồn kho thấp</span>
        </label>
      </div>
    </div>

    <!-- Bảng dữ liệu -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <!-- SSR-safe: đảm bảo server và client render cùng cấu trúc -->
      <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã đặt trước</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khả dụng</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in inventoryItems" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ item.variant?.name || '—' }}</div>
                <div v-if="item.variant?.product" class="text-sm text-gray-500">
                  {{ item.variant.product.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs">{{ item.variant?.sku || '—' }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium" :class="getQuantityClass(item)">
                  {{ item.quantity || 0 }}
                </div>
                <div v-if="item.min_stock_level" class="text-xs text-gray-500">
                  Tối thiểu: {{ item.min_stock_level }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.reserved_quantity || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-blue-600">
                  {{ getAvailableQuantity(item) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openUpdateModal(item)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Cập nhật
                </button>
              </td>
            </tr>
            <tr v-if="inventoryItems.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
        </div>
    </div>

    <!-- Modal cập nhật tồn kho -->
    <Modal
      v-model="updateModalVisible"
      title="Cập nhật tồn kho"
      size="md"
      :loading="isSubmitting"
    >
      <form @submit.prevent="handleUpdateInventory" class="space-y-4" @click.stop>
        <div v-if="selectedInventoryItem">
          <div class="mb-4">
            <p class="text-sm text-gray-600">
              <strong>Sản phẩm:</strong> {{ selectedInventoryItem.variant?.name || '—' }}
            </p>
            <p class="text-sm text-gray-600">
              <strong>SKU:</strong> <code>{{ selectedInventoryItem.variant?.sku || '—' }}</code>
            </p>
          </div>

          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
              Số lượng tồn kho <span class="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              v-model.number="updateForm.quantity"
              type="number"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              :class="{ 'border-red-500': updateErrors.quantity }"
            />
            <p v-if="updateErrors.quantity" class="mt-1 text-sm text-red-600">{{ updateErrors.quantity }}</p>
          </div>

          <div>
            <label for="min_stock_level" class="block text-sm font-medium text-gray-700 mb-1">
              Mức tồn kho tối thiểu
            </label>
            <input
              id="min_stock_level"
              v-model.number="updateForm.min_stock_level"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p class="mt-1 text-xs text-gray-500">Cảnh báo khi tồn kho <= mức này</p>
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeUpdateModal"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Đang xử lý...</span>
            <span v-else>Cập nhật</span>
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import Modal from '@/components/Core/Modal/Modal.vue'

const route = useRoute()
const router = useRouter()
const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()

// State
const warehouse = ref(null)
const inventoryItems = ref([])
const loading = ref(false)
const filters = ref({
  low_stock: false
})

// Update modal state
const updateModalVisible = ref(false)
const selectedInventoryItem = ref(null)
const updateForm = ref({
  quantity: 0,
  min_stock_level: 0
})
const updateErrors = ref({})
const isSubmitting = ref(false)

// Computed
const warehouseId = computed(() => route.params.id)

onMounted(() => {
  fetchWarehouse()
  fetchInventory()
})

async function fetchWarehouse() {
  try {
    const response = await apiClient.get(adminEndpoints.warehouses.show(warehouseId.value))
    if (response.data?.success) {
      warehouse.value = response.data.data
    }
  } catch (error) {
    showError('Không thể tải thông tin kho')
  }
}

async function fetchInventory() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.low_stock) {
      params.low_stock = true
    }
    
    const response = await apiClient.get(adminEndpoints.warehouses.inventory(warehouseId.value), { params })
    if (response.data?.success) {
      inventoryItems.value = response.data.data || []
    } else {
      inventoryItems.value = []
    }
  } catch (error) {
    showError('Không thể tải tồn kho')
    inventoryItems.value = []
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  fetchInventory()
}

function getQuantityClass(item) {
  if (item.min_stock_level && item.quantity <= item.min_stock_level) {
    return 'text-red-600'
  }
  return 'text-gray-900'
}

function getAvailableQuantity(item) {
  const quantity = item.quantity || 0
  const reserved = item.reserved_quantity || 0
  return Math.max(0, quantity - reserved)
}

function openUpdateModal(item) {
  selectedInventoryItem.value = item
  updateForm.value = {
    quantity: item.quantity || 0,
    min_stock_level: item.min_stock_level || 0
  }
  updateErrors.value = {}
  updateModalVisible.value = true
}

function closeUpdateModal() {
  updateModalVisible.value = false
  selectedInventoryItem.value = null
  updateForm.value = {
    quantity: 0,
    min_stock_level: 0
  }
  updateErrors.value = {}
}

async function handleUpdateInventory() {
  updateErrors.value = {}
  
  if (updateForm.value.quantity === null || updateForm.value.quantity < 0) {
    updateErrors.value.quantity = 'Số lượng tồn kho phải >= 0'
    return
  }

  isSubmitting.value = true
  try {
    const data = {
      warehouse_id: parseInt(warehouseId.value),
      product_variant_id: selectedInventoryItem.value.product_variant_id,
      quantity: updateForm.value.quantity
    }
    
    if (updateForm.value.min_stock_level !== null && updateForm.value.min_stock_level >= 0) {
      data.min_stock_level = updateForm.value.min_stock_level
    }

    const response = await apiClient.put(adminEndpoints.warehouses.updateInventory, data)
    if (response.data?.success) {
      showSuccess('Cập nhật tồn kho thành công')
      closeUpdateModal()
      fetchInventory()
    } else {
      showError('Không thể cập nhật tồn kho')
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      updateErrors.value = error.response.data.errors
    } else {
      showError('Không thể cập nhật tồn kho')
    }
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push('/admin/warehouses')
}
</script>

<style>
.table-responsive {
  overflow-x: auto;
}
</style>

