<template>
	<div>
		<AttributeForm
			v-if="showModal"
			:show="showModal"
			:attribute="null"
			:status-enums="statusEnums"
			:type-enums="typeEnums"
			:api-errors="apiErrors"
			:loading="loading"
			@submit="handleSubmit"
			@cancel="onClose"
		/>
	</div>
</template>

<script setup>
import AttributeForm from './ProductAttributeForm.vue'
import { ref, watch } from 'vue'

const props = defineProps({
	show: Boolean,
	statusEnums: {
		type: Array,
		default: () => []
	},
	typeEnums: {
		type: Array,
		default: () => []
	},
	apiErrors: Object,
	loading: {
		type: Boolean,
		default: false
	}
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


