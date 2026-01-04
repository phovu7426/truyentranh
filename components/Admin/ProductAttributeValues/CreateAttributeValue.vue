<template>
  <div>
    <AttributeValueForm 
      v-if="showModal"
      :show="showModal"
      :attribute-enums="attributeEnums"
      :status-enums="statusEnums"
      :api-errors="apiErrors"
      @submit="handleSubmit" 
      @cancel="onClose" 
    />
  </div>
</template>

<script setup>
import AttributeValueForm from './AttributeValueForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  attributeEnums: {
    type: Array,
    default: () => []
  },
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