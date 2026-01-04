<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="bg-blue-600 px-6 py-6">
      <h2 class="text-2xl font-bold text-white flex items-center">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        Phương thức vận chuyển
      </h2>
      <p class="text-blue-100 text-sm mt-1">Chọn phương thức giao hàng phù hợp</p>
    </div>
    
    <div class="p-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <LoadingSpinner size="md" />
        <p class="text-gray-500 mt-2">Đang tải phương thức vận chuyển...</p>
      </div>

      <!-- Shipping Methods -->
      <div v-else-if="shippingMethods.length > 0" class="space-y-3">
        <div
          v-for="method in shippingMethods"
          :key="method.id"
          class="relative flex items-start p-5 border rounded-lg cursor-pointer transition-all hover:shadow-md"
          :class="selectedMethodId === method.id
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-blue-300 bg-white'"
          @click="selectMethod(method.id)"
        >
          <div class="flex items-center h-6">
            <div class="relative">
              <input
                type="radio"
                :checked="selectedMethodId === method.id"
                class="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                @click.stop
              />
              <div v-if="selectedMethodId === method.id" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex items-center justify-between">
              <div class="font-bold text-gray-800 text-lg">{{ method.name }}</div>
              <div class="text-xl font-bold text-blue-600">
                {{ formatCurrency(parseFloat(method.base_cost) || 0) }}
              </div>
            </div>
            <div class="text-sm text-gray-600 mt-2">{{ method.description }}</div>
            <div class="flex items-center mt-3 text-sm text-gray-500">
              <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-medium">{{ method.estimated_days || 'Liên hệ' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-500 text-lg">Không có phương thức vận chuyển nào</p>
        <p class="text-gray-400 text-sm mt-1">Vui lòng thử lại sau</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 rounded-md bg-red-50 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Lỗi tải phương thức vận chuyển</h3>
            <div class="mt-1 text-sm text-red-700">{{ error }}</div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          @click="$emit('previous')"
          class="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Quay lại
        </button>
        
        <button
          type="button"
          @click="handleContinue"
          :disabled="!selectedMethodId || isSubmitting"
          class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <svg v-if="isSubmitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isSubmitting">Đang xử lý...</span>
          <span v-else>Tiếp tục →</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '~/utils/formatters'
import LoadingSpinner from '~/components/Core/Loading/LoadingSpinner.vue'

interface ShippingMethodData {
  id: number
  name: string
  description?: string
  code: string
  base_cost: string
  estimated_days?: string
}

interface Props {
  modelValue?: number | null
  shippingMethods: ShippingMethodData[]
  loading?: boolean
  error?: string
  isSubmitting?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'method-selected', method: ShippingMethodData): void
  (e: 'continue'): void
  (e: 'previous'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  loading: false,
  isSubmitting: false,
  shippingMethods: () => []
})

const emit = defineEmits<Emits>()

const selectedMethodId = ref<number | null>(props.modelValue)

// Computed
const selectedMethod = computed(() => {
  return props.shippingMethods.find(m => m.id === selectedMethodId.value)
})

// Methods
const selectMethod = (methodId: number) => {
  selectedMethodId.value = methodId
  emit('update:modelValue', methodId)
  
  const method = props.shippingMethods.find(m => m.id === methodId)
  if (method) {
    emit('method-selected', method)
  }
}

const handleContinue = () => {
  if (selectedMethodId.value) {
    emit('continue')
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  selectedMethodId.value = newValue
})

// Auto-select first method if available and no method is selected
watch(() => props.shippingMethods, (newMethods) => {
  if (newMethods && newMethods.length > 0 && !selectedMethodId.value) {
    if (newMethods[0] && newMethods[0].id) {
      selectMethod(newMethods[0].id)
    }
  }
}, { immediate: true })
</script>