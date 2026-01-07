<template>
  <div>
    <ChapterForm 
      v-if="showModal"
      :show="showModal"
      :chapter="null"
      :status-enums="statusEnums"
      :comic-enums="comicEnums"
      :api-errors="apiErrors"
      :loading="false"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import ChapterForm from './ChapterForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  statusEnums: {
    type: Array,
    default: () => []
  },
  comicEnums: {
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
  emit('created', formData)
}

function onClose() {
  emit('close')
}
</script>



