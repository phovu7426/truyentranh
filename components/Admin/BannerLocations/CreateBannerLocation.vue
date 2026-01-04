<template>
  <div>
    <BannerLocationForm 
      v-if="showModal"
      :show="showModal"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      @created="handleCreated" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import BannerLocationForm from './BannerLocationForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  statusEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object,
  onClose: Function
})

const emit = defineEmits(['created'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleCreated(formData) {
  // Emit data to parent component để xử lý bằng composable
  emit('created', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>
