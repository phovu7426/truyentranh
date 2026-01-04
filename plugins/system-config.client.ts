import { useGlobalSystemConfig } from '~/composables/system-config'

export default defineNuxtPlugin(async () => {
  // Client-only plugin (due to .client.ts suffix)
  try {
    // Tự động load system config khi app khởi động
    // getData sẽ tự động kiểm tra cache trước khi fetch API
    const { getData, data } = useGlobalSystemConfig()
    if (data.value) return
    await getData()
  } catch (error) {
    // Ignore system config errors during initialization
  }
})
