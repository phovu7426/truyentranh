# Hướng dẫn SEO cho Nuxt Project

## Tổng quan

Project này đã được cấu hình đầy đủ các tính năng SEO cần thiết để tối ưu hóa công cụ tìm kiếm.

## Các tính năng SEO đã được triển khai

### 1. Robots.txt
- File `public/robots.txt` đã được cấu hình với các rules phù hợp
- Chặn các trang admin, API, auth, cart, checkout, orders
- Tham chiếu đến sitemap.xml
- Server route động tại `/api/robots.txt` để có thể thay đổi theo environment

### 2. Sitemap.xml
- Sitemap động được tạo tại `/api/sitemap.xml` hoặc `/sitemap.xml`
- Tự động bao gồm:
  - Tất cả static pages (trang chủ, sản phẩm, tin tức, giới thiệu, liên hệ)
  - Tất cả products (lấy từ API)
  - Tất cả posts (lấy từ API)
  - Tất cả product categories
  - Tất cả post categories
- Mỗi URL có priority và changefreq phù hợp
- Cache 1 giờ để tối ưu performance

### 3. SEO Composable (`composables/seo/index.ts`)
Composable `useSeo()` cung cấp:
- Meta tags tự động (title, description, og tags, twitter cards)
- Canonical URLs
- Structured Data (JSON-LD) cho:
  - Website
  - Articles
  - Products
- Tự động thêm site name vào title
- Hỗ trợ noindex cho các trang không muốn index

**Cách sử dụng:**
```vue
<script setup>
import { useSeo } from '@/composables/seo'

useSeo({
  title: 'Tên trang',
  description: 'Mô tả trang',
  image: '/path/to/image.jpg', // optional
  url: '/home/products', // optional, mặc định dùng route hiện tại
  type: 'website', // 'website' | 'article' | 'product'
  noindex: false, // true nếu không muốn index
  canonical: '/custom-canonical-url' // optional
})
</script>
```

### 4. Nuxt Config SEO Settings
- Title template tự động thêm site name
- Meta tags mặc định (viewport, description, robots, og tags, twitter cards)
- Canonical link mặc định
- Sitemap link trong head
- Language attribute (vi)

### 5. Route Rules cho SEO
- `/sitemap.xml`: Cache 1 giờ với content-type XML
- `/robots.txt`: Cache 24 giờ
- `/admin/**`: noindex, nofollow
- `/api/**`: noindex, nofollow
- `/auth/**`: noindex, nofollow
- `/home/cart/**`, `/home/checkout/**`, `/home/orders/**`: noindex, nofollow

### 6. .htaccess (cho Apache)
- Force HTTPS (uncomment khi deploy)
- Force www hoặc non-www
- Remove trailing slash
- Gzip compression
- Browser caching
- Security headers

## Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# SEO Configuration
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_SITE_NAME=Tên cửa hàng của bạn
NUXT_PUBLIC_SITE_DESCRIPTION=Mô tả về cửa hàng của bạn
NUXT_PUBLIC_OG_IMAGE=/path/to/og-image.jpg
```

## Cách sử dụng trên các trang

### Trang tĩnh (Static Pages)
```vue
<script setup>
import { useSeo } from '@/composables/seo'

useSeo({
  title: 'Tên trang',
  description: 'Mô tả trang',
  type: 'website'
})
</script>
```

### Trang bài viết (Articles)
```vue
<script setup>
import { useSeo } from '@/composables/seo'

const post = ref({...}) // data từ API

useSeo({
  title: post.value.title,
  description: post.value.excerpt,
  image: post.value.featured_image,
  type: 'article',
  publishedTime: post.value.created_at,
  modifiedTime: post.value.updated_at,
  author: post.value.author?.name,
  tags: post.value.tags?.map(t => t.name),
  url: `/home/posts/${post.value.slug}`
})
</script>
```

### Trang sản phẩm (Products)
```vue
<script setup>
import { useSeo } from '@/composables/seo'

const product = ref({...}) // data từ API

useSeo({
  title: product.value.name,
  description: product.value.description,
  image: product.value.image,
  type: 'product',
  url: `/home/products/${product.value.slug}`
})
</script>
```

## Kiểm tra SEO

### 1. Kiểm tra robots.txt
- Truy cập: `https://yourdomain.com/robots.txt`
- Đảm bảo các rules đúng

### 2. Kiểm tra sitemap.xml
- Truy cập: `https://yourdomain.com/sitemap.xml`
- Đảm bảo tất cả URLs quan trọng đều có trong sitemap

### 3. Kiểm tra meta tags
- Sử dụng browser dev tools hoặc công cụ như:
  - [Google Rich Results Test](https://search.google.com/test/rich-results)
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### 4. Kiểm tra Structured Data
- Sử dụng [Google Rich Results Test](https://search.google.com/test/rich-results)
- Hoặc [Schema.org Validator](https://validator.schema.org/)

## Best Practices

1. **Title Tags**: 
   - Giữ độ dài 50-60 ký tự
   - Bao gồm từ khóa chính
   - Unique cho mỗi trang

2. **Meta Descriptions**:
   - Giữ độ dài 150-160 ký tự
   - Hấp dẫn, có call-to-action
   - Unique cho mỗi trang

3. **Images**:
   - Sử dụng alt text cho tất cả images
   - Tối ưu kích thước (không quá lớn)
   - Sử dụng format WebP khi có thể

4. **URLs**:
   - Sử dụng slugs thân thiện với SEO
   - Tránh query parameters không cần thiết
   - Sử dụng canonical URLs để tránh duplicate content

5. **Content**:
   - Sử dụng heading tags (h1, h2, h3) đúng cách
   - H1 chỉ xuất hiện một lần trên mỗi trang
   - Sử dụng internal linking

6. **Performance**:
   - Tối ưu images
   - Sử dụng lazy loading
   - Minify CSS và JavaScript
   - Enable caching

## Submit sitemap lên Google Search Console

1. Đăng nhập vào [Google Search Console](https://search.google.com/search-console)
2. Chọn property của bạn
3. Vào Sitemaps
4. Thêm sitemap URL: `https://yourdomain.com/sitemap.xml`
5. Submit

## Monitoring

- Sử dụng Google Search Console để monitor:
  - Indexing status
  - Search performance
  - Coverage issues
  - Mobile usability

- Sử dụng Google Analytics để track:
  - Organic traffic
  - Bounce rate
  - Time on page
  - Conversion rate

## Troubleshooting

### Sitemap không hiển thị đúng
- Kiểm tra API endpoints có trả về data đúng không
- Kiểm tra console logs để xem errors
- Đảm bảo `NUXT_PUBLIC_SITE_URL` được set đúng

### Meta tags không hiển thị
- Kiểm tra `useSeo()` có được gọi trong `<script setup>` không
- Kiểm tra browser dev tools để xem meta tags trong `<head>`
- Đảm bảo SSR đang hoạt động đúng

### Robots.txt không hoạt động
- Kiểm tra file `public/robots.txt` có tồn tại không
- Kiểm tra server route `/api/robots.txt` có hoạt động không
- Đảm bảo `NUXT_PUBLIC_SITE_URL` được set đúng trong robots.txt

