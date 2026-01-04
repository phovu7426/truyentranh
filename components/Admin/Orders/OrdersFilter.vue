<template>
  <AdminFilter
    :initial-filters="initialFilters"
    :sort-options="sortOptions"
    sort-field="sortBy"
    sort-order-field="sortOrder"
    search-field="search"
    search-placeholder="Tìm theo mã đơn hàng, email, tên..."
    :has-advanced-filters="true"
    @update:filters="handleUpdateFilters"
    @filter-change="handleFilterChange"
  >
    <!-- Các bộ lọc chính -->
    <template #main-filters="{ filters, onChange }">
      <!-- Trạng thái đơn hàng -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Chọn trạng thái"
          @update:model-value="onChange"
        />
      </div>

      <!-- Trạng thái thanh toán -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.paymentStatus"
          :options="paymentStatusOptions"
          placeholder="Chọn thanh toán"
          @update:model-value="onChange"
        />
      </div>

      <!-- Trạng thái vận chuyển -->
      <div class="min-w-[150px]">
        <SelectFilter
          v-model="filters.shippingStatus"
          :options="shippingStatusOptions"
          placeholder="Chọn vận chuyển"
          @update:model-value="onChange"
        />
      </div>
    </template>

    <!-- Bộ lọc nâng cao -->
    <template #advanced-filters="{ filters, onChange }">
      <!-- Email khách hàng -->
      <div>
        <input
          v-model="filters.customerEmail"
          type="email"
          placeholder="Email khách hàng"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          @input="onChange"
        />
      </div>

      <!-- Từ ngày -->
      <div>
        <input
          v-model="filters.startDate"
          type="date"
          placeholder="Từ ngày"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          @change="onChange"
        />
      </div>

      <!-- Đến ngày -->
      <div>
        <input
          v-model="filters.endDate"
          type="date"
          placeholder="Đến ngày"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          @change="onChange"
        />
      </div>
    </template>
  </AdminFilter>
</template>

<script setup>
import { computed } from 'vue'
import SelectFilter from '@/components/Core/Filter/SelectFilter.vue'
import AdminFilter from '@/components/Admin/Filter/AdminFilter.vue'
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, SHIPPING_STATUS_OPTIONS } from '~/types/orders'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:filters'])

// Options for select filters
const statusOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  ORDER_STATUS_OPTIONS.forEach(option => {
    options.push({
      value: option.value,
      label: option.label
    })
  })
  return options
})

const paymentStatusOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  PAYMENT_STATUS_OPTIONS.forEach(option => {
    options.push({
      value: option.value,
      label: option.label
    })
  })
  return options
})

const shippingStatusOptions = computed(() => {
  const options = [{ value: '', label: 'Tất cả' }]
  SHIPPING_STATUS_OPTIONS.forEach(option => {
    options.push({
      value: option.value,
      label: option.label
    })
  })
  return options
})

const sortOptions = [
  { value: 'created_at:desc', label: 'Ngày tạo (mới nhất)' },
  { value: 'created_at:asc', label: 'Ngày tạo (cũ nhất)' },
  { value: 'order_number:asc', label: 'Mã đơn hàng (A-Z)' },
  { value: 'order_number:desc', label: 'Mã đơn hàng (Z-A)' },
  { value: 'customer_name:asc', label: 'Tên khách hàng (A-Z)' },
  { value: 'customer_name:desc', label: 'Tên khách hàng (Z-A)' },
  { value: 'total_amount:desc', label: 'Tổng tiền (giảm dần)' },
  { value: 'total_amount:asc', label: 'Tổng tiền (tăng dần)' }
]

function handleFilterChange() {
  // Có thể debounce ở đây nếu cần
}

function handleUpdateFilters(filters) {
  emit('update:filters', filters)
}
</script>

