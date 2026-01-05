<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8">Banner Components Demo</h1>
    
    <!-- Banner Locations Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Chọn vị trí banner:</label>
      <select 
        v-model="selectedLocation" 
        @change="handleLocationChange"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">-- Chọn vị trí --</option>
        <option value="home_slider">Slider trang chủ</option>
        <option value="product_page_banner">Banner trang sản phẩm</option>
        <option value="product_detail_banner">Banner chi tiết sản phẩm</option>
        <option value="about_us_banner">Banner giới thiệu</option>
        <option value="contact_banner">Banner liên hệ</option>
        <option value="blog_banner">Banner blog</option>
        <option value="checkout_banner">Banner thanh toán</option>
        <option value="sidebar_banner">Banner sidebar</option>
      </select>
    </div>
    
    <!-- Banner Slider Demo -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Banner Slider</h2>
      <p class="text-gray-600 mb-6">Component hiển thị banner dạng slider với autoplay và navigation</p>
      
      <BannerSlider 
        v-if="selectedLocation"
        :location-code="selectedLocation"
        :autoplay="true"
        :interval="5000"
        :show-arrows="true"
        :show-indicators="true"
        container-class="mb-6"
      />
      
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        Vui lòng chọn vị trí banner để hiển thị slider
      </div>
    </div>
    
    <!-- Banner Grid Demo -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Banner Grid</h2>
      <p class="text-gray-600 mb-6">Component hiển thị banner dạng grid responsive</p>
      
      <BannerGrid 
        v-if="selectedLocation"
        :location-code="selectedLocation"
        container-class="mb-6"
      />
      
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        Vui lòng chọn vị trí banner để hiển thị grid
      </div>
    </div>
    
    <!-- Usage Examples -->
    <div class="bg-gray-50 rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4">Cách sử dụng</h2>
      
      <div class="space-y-6">
        <!-- Slider Example -->
        <div>
          <h3 class="text-lg font-medium mb-2">1. Banner Slider</h3>
          <div class="bg-white rounded-md p-4 overflow-x-auto">
            <pre class="text-sm"><code><BannerSlider 
  location-code="home_slider"
  :autoplay="true"
  :interval="5000"
  :show-arrows="true"
  :show-indicators="true"
/></code></pre>
          </div>
        </div>
        
        <!-- Grid Example -->
        <div>
          <h3 class="text-lg font-medium mb-2">2. Banner Grid</h3>
          <div class="bg-white rounded-md p-4 overflow-x-auto">
            <pre class="text-sm"><code><BannerGrid 
  location-code="product_page_banner"
/></code></pre>
          </div>
        </div>
        
        <!-- Available Locations -->
        <div>
          <h3 class="text-lg font-medium mb-2">3. Các vị trí banner có sẵn:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li><code>home_slider</code> - Slider trang chủ</li>
            <li><code>product_page_banner</code> - Banner trang sản phẩm</li>
            <li><code>product_detail_banner</code> - Banner chi tiết sản phẩm</li>
            <li><code>about_us_banner</code> - Banner giới thiệu</li>
            <li><code>contact_banner</code> - Banner liên hệ</li>
            <li><code>blog_banner</code> - Banner blog</li>
            <li><code>checkout_banner</code> - Banner thanh toán</li>
            <li><code>sidebar_banner</code> - Banner sidebar</li>
          </ul>
        </div>
        
        <!-- Props Documentation -->
        <div>
          <h3 class="text-lg font-medium mb-2">4. Props Documentation</h3>
          
          <div class="bg-white rounded-md p-4">
            <h4 class="font-medium mb-2">BannerSlider Props:</h4>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700 mb-4">
              <li><code>location-code</code> (String, required) - Mã vị trí banner</li>
              <li><code>autoplay</code> (Boolean, default: true) - Tự động chuyển slide</li>
              <li><code>interval</code> (Number, default: 5000) - Thời gian chuyển slide (ms)</li>
              <li><code>show-arrows</code> (Boolean, default: true) - Hiển thị mũi tên điều hướng</li>
              <li><code>show-indicators</code> (Boolean, default: true) - Hiển thị chấm chỉ thị</li>
              <li><code>container-class</code> (String) - CSS class cho container</li>
            </ul>
            
            <h4 class="font-medium mb-2">BannerGrid Props:</h4>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><code>location-code</code> (String, required) - Mã vị trí banner</li>
              <li><code>container-class</code> (String) - CSS class cho container</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BannerSlider from '@/components/Public/Banners/BannerSlider.vue'
import BannerGrid from '@/components/Public/Banners/BannerGrid.vue'

definePageMeta({
  layout: 'home'
})

// State
const selectedLocation = ref('')

// Methods
function handleLocationChange() {
  // Reset any state if needed when location changes
}
</script>

<style scoped>
/* Custom styles for demo page */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>