<template>
  <div>
    <ChapterForm 
      v-if="showModal"
      :show="showModal"
      :chapter="chapter"
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
  chapter: Object,
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



