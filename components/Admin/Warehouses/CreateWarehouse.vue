<template>
  <div>
    <WarehouseForm
      v-if="showModal"
      :show="showModal"
      :api-errors="apiErrors"
      @submit="handleSubmit"
      @cancel="onClose"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import WarehouseForm from './WarehouseForm.vue'

const props = defineProps({
  show: Boolean,
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  onClose: Function
})

const emit = defineEmits(['created'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

function handleSubmit(formData) {
  emit('created', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>

