<template>
  <ContextForm 
    v-if="props.show"
    :show="props.show"
    :context="contextData"
    :status-enums="props.statusEnums"
    :api-errors="apiErrors"
    @submit="handleSubmit" 
    @cancel="onClose" 
  />
</template>
<script setup>
import ContextForm from './ContextForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  context: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['updated', 'close'])

const contextData = ref(null)

watch(() => props.show, (newValue) => {
  if (newValue) {
    // Set data từ props ngay để form hiển thị ngay
    contextData.value = props.context || null
  } else {
    contextData.value = null // Reset data khi đóng modal
  }
}, { immediate: true })

watch(() => props.context, (newValue) => {
  if (newValue) {
    contextData.value = newValue
  }
}, { immediate: true, deep: true })

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  emit('close')
}
</script>

