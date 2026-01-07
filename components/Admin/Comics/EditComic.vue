<template>
  <div>
    <ComicForm 
      v-if="showModal"
      :show="showModal"
      :comic="comic"
      :status-enums="statusEnums"
      :category-enums="categoryEnums"
      :api-errors="apiErrors"
      :loading="false"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import ComicForm from './ComicForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  comic: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  categoryEnums: {
    type: Array,
    default: () => []
  },
  apiErrors: Object
})

const emit = defineEmits(['updated', 'close'])

const showModal = ref(false)

watch(() => props.show, (newValue) => {
  showModal.value = newValue
}, { immediate: true })

async function handleSubmit(formData) {
  emit('updated', formData)
}

function onClose() {
  emit('close')
}
</script>



