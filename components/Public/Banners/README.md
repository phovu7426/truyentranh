# Banner System Documentation

## Tổng quan

Hệ thống Banner cho phép quản lý và hiển thị các banner/slide ở nhiều vị trí khác nhau trên website. Mỗi vị trí có thể chứa nhiều banner với thứ tự hiển thị tùy chỉnh.

## Cấu trúc thư mục

```
components/Public/Banners/
├── BannerSlider.vue      # Component slider với autoplay và navigation
├── BannerGrid.vue        # Component hiển thị banner dạng grid
├── SimpleBanner.vue      # Component hiển thị banner đơn giản
├── SidebarBanner.vue     # Component hiển thị banner sidebar
└── README.md             # Documentation
```

## Components

### 1. BannerSlider

Component hiển thị banner dạng slider với autoplay, navigation arrows và indicators.

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `location-code` | String | - | Yes | Mã vị trí banner |
| `autoplay` | Boolean | `true` | No | Tự động chuyển slide |
| `interval` | Number | `5000` | No | Thời gian chuyển slide (ms) |
| `show-arrows` | Boolean | `true` | No | Hiển thị mũi tên điều hướng |
| `show-indicators` | Boolean | `true` | No | Hiển thị chấm chỉ thị |
| `container-class` | String | `''` | No | CSS class cho container |

#### Usage

```vue
<template>
  <BannerSlider 
    location-code="home_slider"
    :autoplay="true"
    :interval="5000"
    :show-arrows="true"
    :show-indicators="true"
  />
</template>

<script setup>
import BannerSlider from '@/components/Public/Banners/BannerSlider.vue'
</script>
```

#### Features

- ✅ Autoplay với interval tùy chỉnh
- ✅ Navigation arrows (prev/next)
- ✅ Indicators (dots)
- ✅ Fade transition
- ✅ Responsive design
- ✅ Loading và error states
- ✅ Hỗ trợ hình ảnh mobile riêng biệt

---

### 2. BannerGrid

Component hiển thị banner dạng grid responsive với hover effects.

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `location-code` | String | - | Yes | Mã vị trí banner |
| `container-class` | String | `''` | No | CSS class cho container |

#### Usage

```vue
<template>
  <BannerGrid 
    location-code="product_page_banner"
  />
</template>

<script setup>
import BannerGrid from '@/components/Public/Banners/BannerGrid.vue'
</script>
```

#### Features

- ✅ Responsive grid layout (1/2/3 columns)
- ✅ Hover effects
- ✅ Card design với shadow
- ✅ Button với custom colors
- ✅ Loading skeleton
- ✅ Empty và error states

---

### 3. SimpleBanner

Component hiển thị một banner đơn giản (lấy banner đầu tiên hoặc theo index).

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `location-code` | String | - | Yes | Mã vị trí banner |
| `index` | Number | `0` | No | Index của banner cần hiển thị |
| `container-class` | String | `''` | No | CSS class cho container |

#### Usage

```vue
<template>
  <SimpleBanner 
    location-code="product_detail_banner"
    :index="0"
  />
</template>

<script setup>
import SimpleBanner from '@/components/Public/Banners/SimpleBanner.vue'
</script>
```

#### Features

- ✅ Hiển thị một banner duy nhất
- ✅ Chọn banner theo index
- ✅ Overlay với gradient
- ✅ Button với custom colors
- ✅ Loading và error states

---

### 4. SidebarBanner

Component hiển thị danh sách banner dạng sidebar (vertical list).

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `location-code` | String | - | Yes | Mã vị trí banner |
| `limit` | Number | `3` | No | Số lượng banner tối đa |

#### Usage

```vue
<template>
  <SidebarBanner 
    location-code="sidebar_banner"
    :limit="3"
  />
</template>

<script setup>
import SidebarBanner from '@/components/Public/Banners/SidebarBanner.vue'
</script>
```

#### Features

- ✅ Vertical list layout
- ✅ Compact design
- ✅ Hover overlay
- ✅ Limit số lượng banner
- ✅ Loading skeleton
- ✅ Empty và error states

---

## Banner Locations

Các vị trí banner được định nghĩa sẵn trong hệ thống:

| Code | Name | Description | Recommended Component |
|------|------|-------------|----------------------|
| `home_slider` | Slider trang chủ | Banner chính trang chủ | BannerSlider |
| `product_page_banner` | Banner trang sản phẩm | Banner đầu trang sản phẩm | SimpleBanner |
| `product_detail_banner` | Banner chi tiết sản phẩm | Banner trong trang chi tiết | SimpleBanner |
| `about_us_banner` | Banner giới thiệu | Banner trang giới thiệu | SimpleBanner |
| `contact_banner` | Banner liên hệ | Banner trang liên hệ | SimpleBanner |
| `blog_banner` | Banner blog | Banner trang blog | BannerSlider |
| `checkout_banner` | Banner thanh toán | Banner trang thanh toán | SimpleBanner |
| `sidebar_banner` | Banner sidebar | Banner ở sidebar | SidebarBanner |

## API Endpoints

### Public Endpoints

#### GET `/api/public/banners/location/:locationCode`

Lấy danh sách banner theo mã vị trí (đã được filter theo trạng thái active và thời gian hiển thị).

**Response:**
```json
[
  {
    "id": 1,
    "title": "Khuyến mãi đặc biệt",
    "subtitle": "Giảm giá đến 50%",
    "image": "/uploads/banners/home-slider-1.jpg",
    "mobile_image": "/uploads/banners/home-slider-1-mobile.jpg",
    "link": "/products?sale=true",
    "link_target": "_self",
    "description": "Khuyến mãi đặc biệt cho các sản phẩm nổi bật",
    "button_text": "Xem ngay",
    "button_color": "#ff6b6b",
    "text_color": "#ffffff",
    "sort_order": 1
  }
]
```

#### GET `/api/public/banners`

Lấy tất cả banner đang hoạt động (grouped by location).

**Query Parameters:**
- `locationCode` (optional): Filter theo mã vị trí

**Response:**
```json
{
  "home_slider": [...],
  "product_page_banner": [...],
  ...
}
```

### Admin Endpoints

Xem chi tiết trong file API Documentation.

## Banner Data Structure

```typescript
interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  mobile_image?: string;
  link?: string;
  link_target: '_self' | '_blank';
  description?: string;
  button_text?: string;
  button_color?: string;
  text_color?: string;
  location_id: number;
  sort_order: number;
  status: 'active' | 'inactive';
  start_date?: Date;
  end_date?: Date;
}
```

## Styling

Tất cả components đều sử dụng Tailwind CSS và có responsive design:

- **Mobile**: Single column, compact layout
- **Tablet**: 2 columns (grid), adjusted spacing
- **Desktop**: 3 columns (grid), full features

### Custom Colors

Banner hỗ trợ custom colors cho button và text:

```vue
<!-- Button với màu tùy chỉnh -->
<a 
  :style="{ 
    backgroundColor: banner.button_color || '#3B82F6',
    color: banner.text_color || '#ffffff'
  }"
>
  {{ banner.button_text }}
</a>
```

## Best Practices

### 1. Chọn Component phù hợp

- **Slider**: Dùng cho trang chủ, blog (nhiều banner cần autoplay)
- **Grid**: Dùng cho trang danh sách sản phẩm (hiển thị nhiều banner cùng lúc)
- **Simple**: Dùng cho trang chi tiết, trang tĩnh (1 banner)
- **Sidebar**: Dùng cho sidebar, widget (vertical list)

### 2. Tối ưu hình ảnh

- Desktop: 1920x600px (recommended)
- Mobile: 768x400px (recommended)
- Format: WebP hoặc JPEG
- Compress để giảm dung lượng

### 3. Responsive Design

Luôn cung cấp cả hình ảnh desktop và mobile:

```javascript
// Component tự động chọn hình ảnh phù hợp
const isMobile = window.innerWidth < 768
const imageUrl = isMobile && banner.mobile_image 
  ? banner.mobile_image 
  : banner.image
```

### 4. Performance

- Components sử dụng lazy loading
- Images có error handling
- API calls được cache
- Skeleton loading cho UX tốt hơn

### 5. Accessibility

- Alt text cho images
- Semantic HTML
- Keyboard navigation support
- Screen reader friendly

## Examples

### Example 1: Trang chủ với Slider

```vue
<template>
  <div>
    <!-- Hero Banner -->
    <BannerSlider 
      location-code="home_slider"
      :autoplay="true"
      :interval="5000"
    />
    
    <!-- Content -->
    <div class="container mx-auto">
      <!-- Your content here -->
    </div>
  </div>
</template>
```

### Example 2: Trang sản phẩm với Grid

```vue
<template>
  <div>
    <!-- Page Banner -->
    <SimpleBanner location-code="product_page_banner" />
    
    <!-- Products Grid -->
    <div class="container mx-auto">
      <div class="grid grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="col-span-2">
          <!-- Products -->
        </div>
        
        <!-- Sidebar with banners -->
        <div class="col-span-1">
          <SidebarBanner 
            location-code="sidebar_banner"
            :limit="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>
```

### Example 3: Trang chi tiết với Simple Banner

```vue
<template>
  <div>
    <!-- Detail Banner -->
    <SimpleBanner 
      location-code="product_detail_banner"
      :index="0"
    />
    
    <!-- Product Details -->
    <div class="container mx-auto">
      <!-- Your content here -->
    </div>
  </div>
</template>
```

## Troubleshooting

### Banner không hiển thị

1. Kiểm tra `location_code` có đúng không
2. Kiểm tra banner có status = 'active' không
3. Kiểm tra thời gian hiển thị (start_date, end_date)
4. Kiểm tra API endpoint có hoạt động không

### Hình ảnh không load

1. Kiểm tra đường dẫn hình ảnh
2. Kiểm tra CORS settings
3. Kiểm tra file có tồn tại không
4. Xem console để debug

### Autoplay không hoạt động

1. Kiểm tra prop `autoplay` = true
2. Kiểm tra có nhiều hơn 1 banner không
3. Kiểm tra interval value
4. Xem browser console để debug

## Support

Nếu có vấn đề hoặc câu hỏi, vui lòng:

1. Xem documentation này
2. Xem demo page: `/home/banners-demo`
3. Kiểm tra API documentation
4. Contact team support

## Changelog

### Version 1.0.0 (2024)

- ✅ Initial release
- ✅ BannerSlider component
- ✅ BannerGrid component
- ✅ SimpleBanner component
- ✅ SidebarBanner component
- ✅ Admin management
- ✅ Public API
- ✅ Documentation
