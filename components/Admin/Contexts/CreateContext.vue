<template>
  <div>
    <ContextForm 
      v-if="showModal"
      :show="showModal"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>
<script setup>
import ContextForm from './ContextForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object
})
const emit = defineEmits(['created', 'close'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('created', formData)
}

function onClose() {
  emit('close')
}
</script>

