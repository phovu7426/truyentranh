<template>
  <div>
    <CategoryForm
      v-if="showModal"
      :show="showModal"
      :category="null"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="onClose"
    />
  </div>
</template>

<script setup>
import CategoryForm from './ProductCategoryForm.vue'
import { ref, watch, onMounted, onUnmounted } from 'vue'

// Lifecycle hooks
onMounted(() => {
  // Component mounted
})

onUnmounted(() => {
  // Component unmounted
})

const props = defineProps({
  show: Boolean,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['created', 'close'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  emit('created', formData)
}

function onClose() {
  emit('close')
}
</script>
