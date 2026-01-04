<template>
  <div>
    <GroupForm 
      v-if="showModal"
      :show="showModal"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>
<script setup>
import GroupForm from './GroupForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
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

