<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between relative">
      <!-- Background Progress Line -->
      <div class="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
      <div
        class="absolute left-0 top-1/2 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
        :style="{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }"
      ></div>
      
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="relative z-10 flex flex-col items-center cursor-pointer"
        @click="goToStep(index)"
      >
        <!-- Step Circle -->
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full border-3 transition-all duration-300 shadow-lg"
          :class="[
            currentStepIndex > index
              ? 'bg-green-500 border-green-500'
              : currentStepIndex === index
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300'
          ]"
        >
          <svg
            v-if="currentStepIndex > index"
            class="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
          <span
            v-else
            class="text-sm font-bold"
            :class="currentStepIndex === index ? 'text-white' : 'text-gray-500'"
          >
            {{ index + 1 }}
          </span>
        </div>
        <span
          class="mt-3 text-sm font-semibold text-center"
          :class="currentStepIndex >= index ? 'text-blue-600' : 'text-gray-500'"
        >
          {{ step.name }}
        </span>
        
        <!-- Step Description (optional) -->
        <span
          v-if="step.description && currentStepIndex === index"
          class="mt-1 text-xs text-gray-500 text-center max-w-[100px]"
        >
          {{ step.description }}
        </span>
      </div>
    </div>

    <!-- Step Info -->
    <div v-if="currentStep" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-center">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 class="font-semibold text-blue-800">{{ currentStep.name }}</h4>
          <p class="text-sm text-blue-600">{{ currentStep.description || 'Vui lòng hoàn thành bước này để tiếp tục' }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Navigation (for desktop) -->
    <div class="mt-6 hidden md:flex justify-center space-x-2">
      <button
        v-for="(step, index) in steps"
        :key="`nav-${step.id}`"
        @click="goToStep(index)"
        :disabled="index > currentStepIndex"
        class="px-3 py-1 text-xs rounded-full transition-colors"
        :class="[
          currentStepIndex === index
            ? 'bg-blue-600 text-white'
            : currentStepIndex > index
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        ]"
      >
        {{ step.shortName || step.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface CheckoutStep {
  id: string
  name: string
  shortName?: string
  description?: string
  icon?: string
}

interface Props {
  steps: CheckoutStep[]
  currentStep: string
  allowNavigation?: boolean
}

interface Emits {
  (e: 'step-change', stepIndex: number): void
}

const props = withDefaults(defineProps<Props>(), {
  allowNavigation: false
})

const emit = defineEmits<Emits>()

// Computed
const currentStepIndex = computed(() => {
  return props.steps.findIndex(step => step.id === props.currentStep)
})

const currentStep = computed(() => {
  return props.steps[currentStepIndex.value]
})

// Methods
const goToStep = (index: number) => {
  // Only allow navigation to previous steps or current step
  if (props.allowNavigation && index <= currentStepIndex.value) {
    emit('step-change', index)
  }
}
</script>