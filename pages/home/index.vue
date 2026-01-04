<template>
  <div>
    <!-- Hero Banner Slider -->
    <section class="mb-12">
      <ClientOnly>
        <BannerSlider 
          location-code="home_slider"
          :autoplay="true"
          :interval="5000"
          :show-arrows="true"
          :show-indicators="true"
        />
        <template #fallback>
          <div class="h-96 md:h-[500px] bg-gray-200 animate-pulse rounded-lg"></div>
        </template>
      </ClientOnly>
    </section>


  <!-- Features Section -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
        <p class="text-xl text-gray-600">Những tính năng mạnh mẽ giúp bạn quản lý doanh nghiệp hiệu quả</p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Quản lý sản phẩm</h3>
          <p class="text-gray-600">Quản lý danh mục, sản phẩm, kho hàng và giá cả một cách dễ dàng và hiệu quả</p>
        </div>
        
        <!-- Feature 2 -->
        <div class="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Xử lý đơn hàng</h3>
          <p class="text-gray-600">Theo dõi và xử lý đơn hàng từ khi đặt hàng đến khi giao hàng thành công</p>
        </div>
        
        <!-- Feature 3 -->
        <div class="group text-center p-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Báo cáo thông minh</h3>
          <p class="text-gray-600">Phân tích dữ liệu bán hàng, doanh thu và xu hướng thị trường chi tiết</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Latest News Section -->
  <NewsSection :limit="3" />

  <!-- Newsletter Section -->
  <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl font-bold text-white mb-4">Đăng ký nhận tin tức</h2>
      <p class="text-xl text-blue-100 mb-8">Nhận thông tin mới nhất về tính năng và cập nhật từ chúng tôi</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <input 
          type="email" 
          placeholder="Nhập email của bạn" 
          class="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
        <button class="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
          Đăng ký
        </button>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-20 bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-8 text-center">
        <div class="group">
          <div class="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
          <div class="text-gray-600 font-medium">Sản phẩm</div>
        </div>
        <div class="group">
          <div class="text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
          <div class="text-gray-600 font-medium">Đơn hàng</div>
        </div>
        <div class="group">
          <div class="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
          <div class="text-gray-600 font-medium">Khách hàng</div>
        </div>
        <div class="group">
          <div class="text-4xl font-bold text-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
          <div class="text-gray-600 font-medium">Hỗ trợ</div>
        </div>
      </div>
    </div>
  </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-4xl font-bold text-white mb-4">Sẵn sàng bắt đầu?</h2>
      <p class="text-xl text-blue-100 mb-8">Tham gia ngay để trải nghiệm nền tảng thương mại điện tử hiện đại</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/auth/register" class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
          Đăng ký miễn phí
        </NuxtLink>
        <NuxtLink to="/auth/login" class="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
          Đăng nhập
        </NuxtLink>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserNavigation } from '@/composables/navigation/useUserNavigation'
import { useGlobalSystemConfig } from '~/composables/system-config'
import NewsSection from '~/components/Home/posts/components/NewsSection.vue'
import BannerSlider from '@/components/Public/Banners/BannerSlider.vue'
import { useSeo } from '@/composables/seo'

// Sử dụng system config
const { systemInfo } = useGlobalSystemConfig()

// Page meta
definePageMeta({
  layout: 'home'
})

// SEO configuration
useSeo({
  title: systemInfo.value?.name || 'Trang chủ',
  description: systemInfo.value?.description || 'Nền tảng thương mại điện tử hiện đại với đầy đủ tính năng quản lý sản phẩm, đơn hàng và khách hàng.',
  type: 'website',
  url: '/home'
})

// Sử dụng auth store
const authStore = useAuthStore()

// Sử dụng user navigation composable
const { 
  menuItems: navigationItems,
  getBreadcrumb,
  searchInMenuItems 
} = useUserNavigation()

// Reactive auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)

// Breadcrumb cho trang hiện tại
const breadcrumb = computed(() => getBreadcrumb())

</script>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
