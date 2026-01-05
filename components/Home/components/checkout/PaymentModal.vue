<template>
  <Modal
    :model-value="isOpen"
    :show="isOpen"
    title="Thanh toán"
    size="xl"
    :close-on-backdrop="false"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div class="payment-modal-content">
      <!-- Order Info Header -->
      <div v-if="orderNumber || orderId" class="payment-order-info">
        <div class="order-info-card">
          <div class="order-info-item">
            <span class="order-info-label">Mã đơn hàng:</span>
            <span class="order-info-value">{{ orderNumber || `#${orderId}` }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Iframe Container -->
      <div v-if="paymentUrl" class="payment-iframe-container">
        <div class="payment-header">
          <div class="payment-header-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="payment-header-text">
            <h3 class="payment-header-title">Trang thanh toán</h3>
            <p class="payment-header-subtitle">Vui lòng hoàn tất thanh toán trong trang này</p>
          </div>
        </div>
        
        <div class="iframe-wrapper">
          <iframe
            ref="paymentIframe"
            :src="paymentUrl"
            class="payment-iframe"
            frameborder="0"
            allow="payment"
            @load="handleIframeLoad"
            @error="handleIframeError"
          ></iframe>
        </div>
        
        <div v-if="loading" class="payment-loading-overlay">
          <div class="loading-content">
            <div class="spinner-modern"></div>
            <p class="loading-text">Đang tải trang thanh toán...</p>
            <p class="loading-subtext">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="payment-error">
        <div class="error-icon">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="error-title">Không thể tải trang thanh toán</h3>
        <p class="error-message">Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục</p>
        <button @click="handleClose" class="btn-close">Đóng</button>
      </div>
    </div>
    
    <template v-slot:footer>
      <div class="payment-modal-footer">
        <button @click="handleClose" class="btn btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Hủy thanh toán
        </button>
        <button v-if="paymentUrl" @click="openInNewTab" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Mở trong tab mới
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Modal from '~/components/Core/Modal/Modal.vue'

interface Props {
  isOpen: boolean
  paymentUrl?: string
  orderId?: string | number
  orderNumber?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  paymentUrl: '',
  orderId: undefined,
  orderNumber: ''
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'payment-success'): void
  (e: 'payment-cancel'): void
}>()

const paymentIframe = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)
let loadTimeout: NodeJS.Timeout | null = null

// Watch for payment URL changes
watch(() => props.paymentUrl, (newUrl) => {
  if (newUrl) {
    loading.value = true
    // Set timeout to hide loading after 5 seconds even if iframe doesn't load
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }
    loadTimeout = setTimeout(() => {
      loading.value = false
    }, 5000)
  } else {
    if (loadTimeout) {
      clearTimeout(loadTimeout)
      loadTimeout = null
    }
  }
}, { immediate: true })

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.paymentUrl) {
    loading.value = true
    // Set timeout to hide loading after 5 seconds
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }
    loadTimeout = setTimeout(() => {
      loading.value = false
    }, 5000)
  } else {
    if (loadTimeout) {
      clearTimeout(loadTimeout)
      loadTimeout = null
    }
  }
})

const handleIframeLoad = () => {
  loading.value = false
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
  
  // Check if iframe loaded successfully
  try {
    const iframe = paymentIframe.value
    if (iframe && iframe.contentWindow) {
      // Listen for messages from payment gateway (if they send postMessage)
      window.addEventListener('message', handlePaymentMessage)
    }
  } catch (error) {
    // Cross-origin restrictions - this is expected
  }
}

const handleIframeError = () => {
  loading.value = false
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
}

const handlePaymentMessage = (event: MessageEvent) => {
  // Handle messages from payment gateway
  // This depends on what the payment gateway sends
  if (event.data && typeof event.data === 'object') {
    if (event.data.type === 'payment-success' || event.data.status === 'success') {
      emit('payment-success')
      handleClose()
    } else if (event.data.type === 'payment-cancel' || event.data.status === 'cancel') {
      emit('payment-cancel')
      handleClose()
    }
  }
}

const handleClose = () => {
  emit('close')
}

const openInNewTab = () => {
  if (props.paymentUrl) {
    window.open(props.paymentUrl, '_blank', 'noopener,noreferrer')
  }
}

// Cleanup
onBeforeUnmount(() => {
  window.removeEventListener('message', handlePaymentMessage)
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
})
</script>

<style scoped>
/* Prevent double scrollbars */
.payment-modal-content {
  position: relative;
  min-height: 500px;
  width: 100%;
  overflow: visible;
  max-height: none;
}

/* Override modal-body overflow for this specific modal */
:deep(.modal-body) {
  overflow: visible !important;
  padding: 0 !important;
}

:deep(.modal-container) {
  overflow: hidden;
}

/* Order Info Header */
.payment-order-info {
  margin-bottom: 1.5rem;
}

.order-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.order-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
}

.order-info-value {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* Payment Iframe Container */
.payment-iframe-container {
  width: 100%;
  position: relative;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.payment-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.payment-header-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.payment-header-text {
  flex: 1;
}

.payment-header-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.payment-header-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  margin: 0;
}

.iframe-wrapper {
  height: 600px;
  position: relative;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}

.payment-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  overflow: hidden;
  /* Hide scrollbar for iframe */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.payment-iframe::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Loading Overlay */
.payment-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.spinner-modern {
  width: 56px;
  height: 56px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  position: relative;
}

.spinner-modern::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border: 3px solid transparent;
  border-top-color: #764ba2;
  border-radius: 50%;
  animation: spin 0.6s linear infinite reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.loading-subtext {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Error State */
.payment-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 1rem;
  border: 1px solid #fbbf24;
}

.error-icon {
  color: #f59e0b;
}

.error-title {
  color: #92400e;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.error-message {
  color: #78350f;
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-close:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

/* Footer */
.payment-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 640px) {
  .payment-header {
    padding: 1rem;
    gap: 0.75rem;
  }

  .payment-header-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .payment-header-title {
    font-size: 1rem;
  }

  .payment-header-subtitle {
    font-size: 0.75rem;
  }

  .iframe-wrapper {
    height: 500px;
  }

  .payment-modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}
</style>

