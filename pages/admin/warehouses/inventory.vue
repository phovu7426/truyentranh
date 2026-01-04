<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Tồn kho theo kho</h1>
      <p class="text-sm text-gray-600">Chọn kho để xem chi tiết tồn kho</p>
    </div>

    <WarehousesFilter
      :initial-filters="filters"
      @update:filters="handleFilterUpdate"
    />

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <!-- SSR-safe: đảm bảo server và client render cùng cấu trúc -->
      <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
        <div v-else class="table-responsive">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã kho</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kho</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người quản lý</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ưu tiên</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(warehouse, index) in items" :key="warehouse.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getSerialNumber(index) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <code class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{{ warehouse.code }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ warehouse.name }}</div>
                <div v-if="warehouse.city || warehouse.district" class="text-sm text-gray-500">
                  {{ [warehouse.city, warehouse.district].filter(Boolean).join(', ') }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 truncate max-w-xs">{{ warehouse.address || '—' }}</div>
                <div v-if="warehouse.phone" class="text-sm text-gray-500">{{ warehouse.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ warehouse.manager_name || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ warehouse.priority || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900"
                  @click="viewInventory(warehouse)"
                >
                  Xem tồn kho
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
        </div>
    </div>

    <Pagination
      v-if="hasData"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total-items="pagination.totalItems"
      :loading="loading"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import { computed } from 'vue'
import { adminEndpoints } from '@/api/endpoints'
import { useUrlApiSync } from '@/composables/utils/useUrlApiSync'
import { useSerialNumber } from '@/composables/ui'
import SkeletonLoader from '@/components/Core/Loading/SkeletonLoader.vue'
import Pagination from '@/components/Core/Navigation/Pagination.vue'
import WarehousesFilter from './filter.vue'

const composable = useUrlApiSync({
  endpoint: adminEndpoints.warehouses.list
})

const {
  items,
  loading,
  pagination,
  filters,
  updateFilters
} = composable

const { getSerialNumber } = useSerialNumber(pagination)
const hasData = computed(() => items.value.length > 0)

async function handleFilterUpdate(newFilters) {
  await updateFilters(newFilters)
}

function handlePageChange(page) {
  composable.changePage(page)
}

function viewInventory(warehouse) {
  navigateTo(`/admin/warehouses/${warehouse.id}/inventory`)
}
</script>

<style>
.table-responsive {
  overflow-x: auto;
}
</style>

