<template>
  <div v-if="enabledChannels.length > 0" class="floating-contact-channels">
    <!-- Main button (toggle) -->
    <button
      v-if="!isExpanded"
      @click="toggleExpanded"
      class="floating-main-button"
      :aria-label="'Mở kênh liên hệ'"
      :title="'Kênh liên hệ'"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <span v-if="enabledChannels.length > 0" class="badge">{{ enabledChannels.length }}</span>
    </button>

    <!-- Expanded menu -->
    <Transition name="expand">
      <div v-if="isExpanded" class="floating-menu">
        <!-- Close button -->
        <button
          @click="toggleExpanded"
          class="floating-close-button"
          :aria-label="'Đóng menu'"
          :title="'Đóng'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Channel buttons -->
        <a
          v-for="(channel, index) in enabledChannels"
          :key="index"
          :href="getChannelUrl(channel)"
          :target="isExternalUrl(getChannelUrl(channel)) ? '_blank' : undefined"
          :rel="isExternalUrl(getChannelUrl(channel)) ? 'noopener noreferrer' : undefined"
          :aria-label="channel.label || channel.type"
          :title="channel.label || channel.type"
          class="floating-channel-button"
          :class="getChannelClass(channel.type)"
          @click="handleChannelClick(channel, $event)"
        >
          <!-- Icon -->
          <span v-if="channel.icon" class="flex-shrink-0">
            <img
              :src="channel.icon"
              :alt="channel.label || channel.type"
              class="w-6 h-6 object-contain"
              @error="handleImageError"
            />
          </span>
          <span v-else class="flex-shrink-0">
            <!-- Zalo -->
            <svg v-if="channel.type === 'zalo'" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <!-- Messenger -->
            <svg v-else-if="channel.type === 'messenger'" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            <!-- Hotline -->
            <svg v-else-if="channel.type === 'hotline'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <!-- Telegram -->
            <svg v-else-if="channel.type === 'telegram'" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <!-- WhatsApp -->
            <svg v-else-if="channel.type === 'whatsapp'" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <!-- Default (Hotline) -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </span>
          
          <!-- Label (optional, shown on hover) -->
          <span v-if="showLabel" class="floating-label">
            {{ channel.label || getDefaultLabel(channel.type) }}
          </span>
        </a>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ContactChannel } from '@/types/system'

interface Props {
  channels?: ContactChannel[] | null
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  channels: () => [],
  showLabel: true
})

const isExpanded = ref(false)

// Lọc và sắp xếp channels
const enabledChannels = computed(() => {
  if (!props.channels || props.channels.length === 0) return []
  
  return props.channels
    .filter(ch => ch.enabled !== false)
    .sort((a, b) => {
      const orderA = a.sort_order ?? 999
      const orderB = b.sort_order ?? 999
      return orderA - orderB
    })
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Tạo URL từ channel
// Ưu tiên sử dụng url_template từ API, nếu không có mới dùng fallback
const getChannelUrl = (channel: ContactChannel): string => {
  // Nếu có url_template từ API, sử dụng nó và thay {value} bằng giá trị thực tế
  if (channel.url_template && channel.url_template.trim()) {
    return channel.url_template.replace(/{value}/g, channel.value)
  }
  
  // Fallback URL theo type (chỉ dùng khi không có url_template từ API)
  const urlMap: Record<string, string> = {
    'hotline': `tel:${channel.value}`,
    'zalo': `https://zalo.me/${channel.value}`,
    'messenger': `https://m.me/${channel.value}`,
    'telegram': `https://t.me/${channel.value.replace(/^@/, '')}`, // Remove @ nếu có
    'whatsapp': `https://wa.me/${channel.value}`,
  }
  
  return urlMap[channel.type] || '#'
}

// Kiểm tra URL có phải external không
const isExternalUrl = (url: string): boolean => {
  if (url.startsWith('tel:') || url.startsWith('mailto:')) return false
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.origin !== window.location.origin
  } catch {
    return false
  }
}

// Xử lý click
const handleChannelClick = (channel: ContactChannel, event: MouseEvent) => {
  const url = getChannelUrl(channel)
  
  // Đóng menu sau khi click
  if (!url.startsWith('tel:') && !url.startsWith('mailto:')) {
    setTimeout(() => {
      isExpanded.value = false
    }, 300)
  }
}

// Lấy class CSS theo type
const getChannelClass = (type: string): string => {
  const classMap: Record<string, string> = {
    'zalo': 'bg-blue-500 hover:bg-blue-600 text-white',
    'messenger': 'bg-blue-500 hover:bg-blue-600 text-white',
    'hotline': 'bg-green-500 hover:bg-green-600 text-white',
    'telegram': 'bg-blue-400 hover:bg-blue-500 text-white',
    'whatsapp': 'bg-green-500 hover:bg-green-600 text-white',
  }
  
  return classMap[type] || 'bg-gray-600 hover:bg-gray-700 text-white'
}

// Lấy label mặc định
const getDefaultLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'zalo': 'Chat Zalo',
    'messenger': 'Messenger',
    'hotline': 'Hotline',
    'telegram': 'Telegram',
    'whatsapp': 'WhatsApp',
  }
  
  return labelMap[type] || type
}

// Xử lý lỗi load image
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.floating-contact-channels {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.floating-main-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.floating-main-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.floating-main-button .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
}

.floating-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.floating-close-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.floating-close-button:hover {
  background: #4b5563;
  transform: scale(1.05);
}

.floating-channel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: visible;
}

.floating-channel-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.floating-label {
  position: absolute;
  right: 60px;
  white-space: nowrap;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.floating-channel-button:hover .floating-label {
  opacity: 1;
}

/* Animations */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.expand-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* Responsive */
@media (max-width: 640px) {
  .floating-contact-channels {
    bottom: 15px;
    right: 15px;
  }

  .floating-main-button {
    width: 56px;
    height: 56px;
  }

  .floating-channel-button {
    width: 48px;
    height: 48px;
  }

  .floating-menu {
    bottom: 66px;
  }
}
</style>

