<template>
  <div class="container mx-auto p-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
          <div class="mt-4">
            <button @click="loadConfig" class="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Cấu hình chung</h1>
          <p class="text-gray-600 mt-1">Quản lý thông tin cơ bản của website</p>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="saveConfig" 
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            :disabled="saving"
          >
            {{ saving ? 'Đang lưu...' : 'Lưu cấu hình' }}
          </button>
        </div>
      </div>

      <!-- Form cấu hình chung -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="saveConfig" class="space-y-6">
          <!-- Site Name -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên website <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Tên hiển thị của website</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.site_name"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_name }"
                placeholder="Nhập tên website"
              />
              <div v-if="apiErrors?.site_name" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_name }}
              </div>
            </div>
          </div>

          <!-- Site Description -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả website
              </label>
              <p class="text-sm text-gray-500">Mô tả ngắn về website (dùng cho SEO)</p>
            </div>
            <div class="md:col-span-2">
              <textarea
                v-model="formData.site_description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_description }"
                placeholder="Nhập mô tả website"
              ></textarea>
              <div v-if="apiErrors?.site_description" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_description }}
              </div>
            </div>
          </div>

          <!-- Site Logo -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Logo website
              </label>
              <p class="text-sm text-gray-500">Upload logo của website (PNG, JPG, SVG)</p>
            </div>
            <div class="md:col-span-2">
              <ImageUploader
                v-model="formData.site_logo"
                :defaultUrl="formData.site_logo"
                :maxSize="5 * 1024 * 1024"
                :autoUpload="true"
                @remove="formData.site_logo = ''"
                @error="handleUploadError"
              />
              <div v-if="apiErrors?.site_logo" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_logo }}
              </div>
            </div>
          </div>

          <!-- Site Favicon -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <p class="text-sm text-gray-500">Upload favicon của website (ICO, PNG, 16x16 hoặc 32x32)</p>
            </div>
            <div class="md:col-span-2">
              <ImageUploader
                v-model="formData.site_favicon"
                :defaultUrl="formData.site_favicon"
                :maxSize="1 * 1024 * 1024"
                :autoUpload="true"
                @remove="formData.site_favicon = ''"
                @error="handleUploadError"
              />
              <div v-if="apiErrors?.site_favicon" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_favicon }}
              </div>
            </div>
          </div>

          <!-- Site Email -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email liên hệ
              </label>
              <p class="text-sm text-gray-500">Email liên hệ của website</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.site_email"
                type="email"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_email }"
                placeholder="contact@example.com"
              />
              <div v-if="apiErrors?.site_email" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_email }}
              </div>
            </div>
          </div>

          <!-- Site Phone -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <p class="text-sm text-gray-500">Số điện thoại liên hệ</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.site_phone"
                type="text"
                maxlength="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_phone }"
                placeholder="0123456789"
              />
              <div v-if="apiErrors?.site_phone" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_phone }}
              </div>
            </div>
          </div>

          <!-- Site Address -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <p class="text-sm text-gray-500">Địa chỉ của website</p>
            </div>
            <div class="md:col-span-2">
              <textarea
                v-model="formData.site_address"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_address }"
                placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
              ></textarea>
              <div v-if="apiErrors?.site_address" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_address }}
              </div>
            </div>
          </div>

          <!-- Site Copyright -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Copyright
              </label>
              <p class="text-sm text-gray-500">Text copyright hiển thị ở footer</p>
            </div>
            <div class="md:col-span-2">
              <input
                v-model="formData.site_copyright"
                type="text"
                maxlength="255"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.site_copyright }"
                placeholder="© 2024 My Website. All rights reserved."
              />
              <div v-if="apiErrors?.site_copyright" class="mt-1 text-sm text-red-600">
                {{ apiErrors.site_copyright }}
              </div>
            </div>
          </div>

          <!-- Timezone -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Múi giờ <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Múi giờ mặc định của hệ thống</p>
            </div>
            <div class="md:col-span-2">
              <select
                v-model="formData.timezone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.timezone }"
              >
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
              <div v-if="apiErrors?.timezone" class="mt-1 text-sm text-red-600">
                {{ apiErrors.timezone }}
              </div>
            </div>
          </div>

          <!-- Locale -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Ngôn ngữ mặc định của hệ thống</p>
            </div>
            <div class="md:col-span-2">
              <select
                v-model="formData.locale"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.locale }"
              >
                <option value="vi">Tiếng Việt (vi)</option>
                <option value="en">English (en)</option>
                <option value="ja">日本語 (ja)</option>
              </select>
              <div v-if="apiErrors?.locale" class="mt-1 text-sm text-red-600">
                {{ apiErrors.locale }}
              </div>
            </div>
          </div>

          <!-- Currency -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị tiền tệ <span class="text-red-500">*</span>
              </label>
              <p class="text-sm text-gray-500">Đơn vị tiền tệ mặc định</p>
            </div>
            <div class="md:col-span-2">
              <select
                v-model="formData.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': apiErrors?.currency }"
              >
                <option value="VND">VND (₫)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
              <div v-if="apiErrors?.currency" class="mt-1 text-sm text-red-600">
                {{ apiErrors.currency }}
              </div>
            </div>
          </div>

          <!-- Contact Channels -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div class="md:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Kênh liên hệ
              </label>
              <p class="text-sm text-gray-500">Quản lý các kênh liên hệ hiển thị trên website</p>
            </div>
            <div class="md:col-span-2">
              <div class="space-y-4">
                <!-- List of channels -->
                <div v-if="formData.contact_channels && formData.contact_channels.length > 0" class="space-y-3">
                  <div
                    v-for="(channel, index) in formData.contact_channels"
                    :key="index"
                    class="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Type -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Loại kênh <span class="text-red-500">*</span></label>
                        <select
                          v-model="channel.type"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="zalo">Zalo</option>
                          <option value="messenger">Facebook Messenger</option>
                          <option value="hotline">Hotline</option>
                          <option value="telegram">Telegram</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="custom">Tùy chỉnh</option>
                        </select>
                      </div>
                      
                      <!-- Value -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Giá trị <span class="text-red-500">*</span></label>
                        <input
                          v-model="channel.value"
                          type="text"
                          maxlength="255"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0123456789"
                        />
                      </div>
                      
                      <!-- Label -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Tên hiển thị</label>
                        <input
                          v-model="channel.label"
                          type="text"
                          maxlength="255"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Chat Zalo"
                        />
                      </div>
                      
                      <!-- Icon Upload -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                        <ImageUploader
                          v-model="channel.icon"
                          :defaultUrl="channel.icon"
                          :maxSize="2 * 1024 * 1024"
                          :autoUpload="true"
                          @remove="channel.icon = ''"
                          @error="handleUploadError"
                        />
                      </div>
                      
                      <!-- URL Template -->
                      <div class="md:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 mb-1">URL Template</label>
                        <input
                          v-model="channel.url_template"
                          type="text"
                          maxlength="500"
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://zalo.me/{value}"
                        />
                        <p class="mt-1 text-xs text-gray-500">Sử dụng {value} để thay thế bằng giá trị</p>
                      </div>
                      
                      <!-- Enabled & Sort Order -->
                      <div class="md:col-span-2 flex items-center justify-between">
                        <div class="flex items-center">
                          <input
                            v-model="channel.enabled"
                            type="checkbox"
                            :id="`channel-enabled-${index}`"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label :for="`channel-enabled-${index}`" class="ml-2 text-sm text-gray-700">
                            Bật hiển thị
                          </label>
                        </div>
                        <div class="flex items-center gap-2">
                          <label class="text-xs text-gray-700">Thứ tự:</label>
                          <input
                            v-model.number="channel.sort_order"
                            type="number"
                            min="0"
                            class="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          @click="removeChannel(index)"
                          class="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state -->
                <div v-else class="text-center py-8 text-gray-500 text-sm">
                  Chưa có kênh liên hệ nào. Nhấn "Thêm kênh" để thêm mới.
                </div>
                
                <!-- Add channel button -->
                <button
                  type="button"
                  @click="addChannel"
                  class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Thêm kênh liên hệ
                </button>
              </div>
              <div v-if="apiErrors?.contact_channels" class="mt-1 text-sm text-red-600">
                {{ apiErrors.contact_channels }}
              </div>
            </div>
          </div>

          <!-- SEO Meta Tags Section -->
          <div class="pt-6 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">SEO Meta Tags</h2>
            
            <!-- Meta Title -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <p class="text-sm text-gray-500">SEO title cho trang chủ (max 255 ký tự)</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.meta_title"
                  type="text"
                  maxlength="255"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.meta_title }"
                  placeholder="Shop Online - Mua Sắm Trực Tuyến | Giá Tốt, Giao Hàng Nhanh"
                />
                <div v-if="apiErrors?.meta_title" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.meta_title }}
                </div>
              </div>
            </div>

            <!-- Meta Description -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <p class="text-sm text-gray-500">Mô tả SEO cho search engines (riêng biệt với mô tả website)</p>
              </div>
              <div class="md:col-span-2">
                <textarea
                  v-model="formData.meta_description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.meta_description }"
                  placeholder="Shop Online - Cửa hàng mua sắm trực tuyến uy tín với hàng ngàn sản phẩm đa dạng. Giá tốt, giao hàng nhanh, thanh toán an toàn."
                ></textarea>
                <div v-if="apiErrors?.meta_description" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.meta_description }}
                </div>
                <p class="mt-1 text-xs text-gray-500">Khác với "Mô tả website" - trường này dùng riêng cho SEO meta tags</p>
              </div>
            </div>

            <!-- Meta Keywords -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <p class="text-sm text-gray-500">Từ khóa SEO (phân cách bằng dấu phẩy)</p>
              </div>
              <div class="md:col-span-2">
                <textarea
                  v-model="formData.meta_keywords"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.meta_keywords }"
                  placeholder="mua sắm online, shop online, bán hàng trực tuyến"
                ></textarea>
                <div v-if="apiErrors?.meta_keywords" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.meta_keywords }}
                </div>
              </div>
            </div>

            <!-- OG Title -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Title
                </label>
                <p class="text-sm text-gray-500">Title cho social media sharing (max 255 ký tự)</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.og_title"
                  type="text"
                  maxlength="255"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.og_title }"
                  placeholder="Shop Online - Mua Sắm Trực Tuyến"
                />
                <div v-if="apiErrors?.og_title" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.og_title }}
                </div>
              </div>
            </div>

            <!-- OG Description -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Description
                </label>
                <p class="text-sm text-gray-500">Mô tả cho social media sharing</p>
              </div>
              <div class="md:col-span-2">
                <textarea
                  v-model="formData.og_description"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.og_description }"
                  placeholder="Shop Online - Cửa hàng mua sắm trực tuyến uy tín với hàng ngàn sản phẩm đa dạng."
                ></textarea>
                <div v-if="apiErrors?.og_description" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.og_description }}
                </div>
              </div>
            </div>

            <!-- OG Image -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Image
                </label>
                <p class="text-sm text-gray-500">URL ảnh hiển thị khi share lên social media</p>
              </div>
              <div class="md:col-span-2">
                <ImageUploader
                  v-model="formData.og_image"
                  :defaultUrl="formData.og_image"
                  :maxSize="5 * 1024 * 1024"
                  :autoUpload="true"
                  @remove="formData.og_image = ''"
                  @error="handleUploadError"
                />
                <div v-if="apiErrors?.og_image" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.og_image }}
                </div>
              </div>
            </div>

            <!-- Canonical URL -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <p class="text-sm text-gray-500">URL chính thức của website</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.canonical_url"
                  type="url"
                  maxlength="500"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.canonical_url }"
                  placeholder="https://shoponline.com"
                />
                <div v-if="apiErrors?.canonical_url" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.canonical_url }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tracking & Analytics Section -->
          <div class="pt-6 border-t border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Tracking & Analytics</h2>
            
            <!-- Google Analytics ID -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID (GA4)
                </label>
                <p class="text-sm text-gray-500">ID Google Analytics (ví dụ: G-XXXXXXXXXX)</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.google_analytics_id"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.google_analytics_id }"
                  placeholder="G-XXXXXXXXXX"
                />
                <div v-if="apiErrors?.google_analytics_id" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.google_analytics_id }}
                </div>
              </div>
            </div>

            <!-- Google Search Console -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Google Search Console
                </label>
                <p class="text-sm text-gray-500">Verification code từ Google Search Console</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.google_search_console"
                  type="text"
                  maxlength="255"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.google_search_console }"
                  placeholder="abc123xyz..."
                />
                <div v-if="apiErrors?.google_search_console" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.google_search_console }}
                </div>
              </div>
            </div>

            <!-- Facebook Pixel ID -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <p class="text-sm text-gray-500">ID Facebook Pixel (ví dụ: 1234567890123456)</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.facebook_pixel_id"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.facebook_pixel_id }"
                  placeholder="1234567890123456"
                />
                <div v-if="apiErrors?.facebook_pixel_id" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.facebook_pixel_id }}
                </div>
              </div>
            </div>

            <!-- Twitter Site -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="md:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Site
                </label>
                <p class="text-sm text-gray-500">Twitter handle (không có dấu @, ví dụ: shoponline)</p>
              </div>
              <div class="md:col-span-2">
                <input
                  v-model="formData.twitter_site"
                  type="text"
                  maxlength="50"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': apiErrors?.twitter_site }"
                  placeholder="shoponline"
                />
                <div v-if="apiErrors?.twitter_site" class="mt-1 text-sm text-red-600">
                  {{ apiErrors.twitter_site }}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/ui/useToast'
import { useGlobalApiClient } from '@/composables/api'
import { adminEndpoints } from '@/api/endpoints'
import { useGlobalSystemConfig } from '@/composables/system-config'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'

const { showSuccess, showError } = useToast()
const { apiClient } = useGlobalApiClient()
const { clearCache } = useGlobalSystemConfig()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const apiErrors = ref(null)

// Form data
const formData = ref({
  site_name: '',
  site_description: '',
  site_logo: '',
  site_favicon: '',
  site_email: '',
  site_phone: '',
  site_address: '',
  site_copyright: '',
  timezone: 'Asia/Ho_Chi_Minh',
  locale: 'vi',
  currency: 'VND',
  contact_channels: [],
  // SEO Meta Tags
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_title: '',
  og_description: '',
  og_image: '',
  canonical_url: '',
  // Tracking & Analytics
  google_analytics_id: '',
  google_search_console: '',
  facebook_pixel_id: '',
  twitter_site: ''
})

// Load config
const loadConfig = async () => {
  loading.value = true
  error.value = null
  apiErrors.value = null
  
  try {
    const response = await apiClient.get(adminEndpoints.systemConfigs.general.get)
    
    if (response.data) {
      // Map data từ API response - dữ liệu thực tế nằm trong response.data.data
      const data = response.data.data || response.data
      formData.value = {
        site_name: data.site_name || '',
        site_description: data.site_description || '',
        site_logo: data.site_logo || '',
        site_favicon: data.site_favicon || '',
        site_email: data.site_email || '',
        site_phone: data.site_phone || '',
        site_address: data.site_address || '',
        site_copyright: data.site_copyright || '',
        timezone: data.timezone || 'Asia/Ho_Chi_Minh',
        locale: data.locale || 'vi',
        currency: data.currency || 'VND',
        contact_channels: data.contact_channels ? JSON.parse(JSON.stringify(data.contact_channels)) : [],
        // SEO Meta Tags
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords || '',
        og_title: data.og_title || '',
        og_description: data.og_description || '',
        og_image: data.og_image || '',
        canonical_url: data.canonical_url || '',
        // Tracking & Analytics
        google_analytics_id: data.google_analytics_id || '',
        google_search_console: data.google_search_console || '',
        facebook_pixel_id: data.facebook_pixel_id || '',
        twitter_site: data.twitter_site || ''
      }
    }
  } catch (err) {
    error.value = err.message || 'Không thể tải cấu hình'
    console.error('Error loading config:', err)
  } finally {
    loading.value = false
  }
}

// Save config
const saveConfig = async () => {
  saving.value = true
  apiErrors.value = null
  
  try {
    const response = await apiClient.put(adminEndpoints.systemConfigs.general.update, formData.value)
    
    if (response.data) {
      showSuccess('Cấu hình đã được cập nhật thành công')
      
      // Clear cache để lần request tiếp theo lấy dữ liệu mới
      clearCache()
      
      // Reload config để có dữ liệu mới nhất
      await loadConfig()
    } else {
      throw new Error('Không thể cập nhật cấu hình')
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      apiErrors.value = err.response.data.errors
    } else {
      apiErrors.value = { general: err.message || 'Không thể cập nhật cấu hình' }
    }
    showError('Không thể cập nhật cấu hình')
    console.error('Error saving config:', err)
  } finally {
    saving.value = false
  }
}

// Handle upload error
const handleUploadError = (error) => {
  showError(error.message || 'Lỗi khi upload file')
  console.error('Upload error:', error)
}

// Contact channels management
const addChannel = () => {
  if (!formData.value.contact_channels) {
    formData.value.contact_channels = []
  }
  formData.value.contact_channels.push({
    type: 'zalo',
    value: '',
    label: '',
    icon: '',
    url_template: '',
    enabled: true,
    sort_order: formData.value.contact_channels.length + 1
  })
}

const removeChannel = (index) => {
  if (formData.value.contact_channels && formData.value.contact_channels.length > index) {
    formData.value.contact_channels.splice(index, 1)
  }
}

// Lifecycle
onMounted(() => {
  loadConfig()
})
</script>
