<template>
  <div>
    <ShippingMethodForm 
      v-if="showModal"
      :show="showModal"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import ShippingMethodForm from './ShippingMethodForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['created'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('created', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>


