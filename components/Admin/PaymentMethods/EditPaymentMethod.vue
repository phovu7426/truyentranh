<template>
  <div>
    <PaymentMethodForm 
      v-if="showModal"
      :show="showModal"
      :item="item"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import PaymentMethodForm from './PaymentMethodForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  item: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['updated'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('updated', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>







