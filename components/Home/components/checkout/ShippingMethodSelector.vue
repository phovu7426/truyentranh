<template>
  <div class="space-y-4">
    <label class="block text-sm font-medium text-gray-700">
      Phương thức vận chuyển <span class="text-red-500">*</span>
    </label>
    
    <div class="space-y-3">
      <div
        v-for="method in methods"
        :key="method.value"
        class="relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors"
        :class="[
          selectedMethod === method.value
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:bg-gray-50'
        ]"
        @click="selectMethod(method.value)"
      >
        <div class="flex items-center h-5">
          <input
            :id="`shipping-${method.value}`"
            :checked="selectedMethod === method.value"
            name="shipping_method"
            type="radio"
            class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
        </div>
        <div class="ml-3 flex-1">
          <label :for="`shipping-${method.value}`" class="font-medium text-gray-900 cursor-pointer">
            {{ method.label }}
          </label>
          <p class="text-sm text-gray-500 mt-1">
            {{ method.description }}
          </p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-sm text-gray-600">
              {{ method.estimatedTime }}
            </span>
            <span class="text-sm font-medium text-gray-900">
              {{ formatShippingCost(method.cost) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Shipping Address Preview -->
    <div v-if="shippingAddress" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h4>
      <p class="text-sm text-gray-600">{{ shippingAddress }}</p>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '~/utils/formatters'

interface ShippingMethodData {
  id: number
  name: string
  description?: string
  code: string
  base_cost: string
  calculated_cost?: number
  estimated_days?: string
}

interface Props {
  modelValue: number | null
  shippingMethods: ShippingMethodData[]
  shippingAddress?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  shippingAddress: '',
  shippingMethods: () => []
})

const emit = defineEmits<Emits>()

const selectedMethod = ref<number | null>(props.modelValue)

const methods = computed(() => {
  return props.shippingMethods.map(method => ({
    value: method.id,
    label: method.name,
    description: method.description || `Phương thức vận chuyển ${method.name}`,
    estimatedTime: method.estimated_days || 'Liên hệ',
    cost: method.calculated_cost ? parseFloat(method.calculated_cost.toString()) : parseFloat(method.base_cost) || 0
  }))
})

const formatShippingCost = (cost: number) => {
  if (cost === 0) {
    return 'Miễn phí'
  }
  return formatCurrency(cost)
}

const selectMethod = (methodId: number) => {
  selectedMethod.value = methodId
  emit('update:modelValue', methodId)
}

watch(() => props.modelValue, (newValue) => {
  selectedMethod.value = newValue
})
</script>