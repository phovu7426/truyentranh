<template>
  <div>
    <ComicCategoryForm 
      v-if="showModal"
      :show="showModal"
      :category="null"
      :api-errors="apiErrors"
      :loading="false"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import ComicCategoryForm from './ComicCategoryForm.vue'
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
  emit('created', formData)
}

function onClose() {
  if (props.onClose) {
    props.onClose()
  }
}
</script>



