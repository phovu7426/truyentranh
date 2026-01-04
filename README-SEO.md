# 🚀 Hệ thống SEO đã được triển khai

## ✅ Các tính năng đã hoàn thành

### 1. **Robots.txt** ✅
- ✅ File `public/robots.txt` đã được cập nhật với đầy đủ rules
- ✅ Server route động tại `/api/robots.txt` để có thể thay đổi theo environment
- ✅ Chặn các trang không cần index: admin, API, auth, cart, checkout, orders
- ✅ Tham chiếu đến sitemap.xml

### 2. **Sitemap.xml** ✅
- ✅ Sitemap động tại `/api/sitemap.xml` hoặc `/sitemap.xml`
- ✅ Tự động bao gồm:
  - Static pages (trang chủ, sản phẩm, tin tức, giới thiệu, liên hệ)
  - Products (lấy từ API)
  - Posts (lấy từ API)
  - Product categories
  - Post categories
- ✅ Priority và changefreq được cấu hình phù hợp
- ✅ Cache 1 giờ để tối ưu performance

### 3. **SEO Composable** ✅
- ✅ Composable `useSeo()` tại `composables/seo/index.ts`
- ✅ Tự động tạo meta tags (title, description, OG, Twitter)
- ✅ Canonical URLs
- ✅ Structured Data (JSON-LD) cho Website, Articles, Products
- ✅ Hỗ trợ noindex

### 4. **Nuxt Config** ✅
- ✅ Title template tự động
- ✅ Meta tags mặc định
- ✅ Canonical link
- ✅ Sitemap link trong head
- ✅ Language attribute (vi)

### 5. **Route Rules** ✅
- ✅ SEO headers cho sitemap và robots.txt
- ✅ noindex cho admin, API, auth, cart, checkout, orders

### 6. **.htaccess** ✅
- ✅ File `.htaccess` cho Apache server
- ✅ Force HTTPS (cần uncomment khi deploy)
- ✅ Gzip compression
- ✅ Browser caching
- ✅ Security headers

## 📝 Cách sử dụng

### 1. Cấu hình Environment Variables

Thêm vào file `.env`:
```env
NUXT_PUBLIC_SITE_URL=https://yourdomain.com
NUXT_PUBLIC_SITE_NAME=Tên cửa hàng của bạn
NUXT_PUBLIC_SITE_DESCRIPTION=Mô tả về cửa hàng
NUXT_PUBLIC_OG_IMAGE=/path/to/og-image.jpg
```

### 2. Sử dụng SEO Composable trong các trang

**Trang tĩnh:**
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

**Trang bài viết:**
```vue
<script setup>
import { useSeo } from '@/composables/seo'

const post = ref({...})

useSeo({
  title: post.value.title,
  description: post.value.excerpt,
  image: post.value.featured_image,
  type: 'article',
  publishedTime: post.value.created_at,
  modifiedTime: post.value.updated_at,
  author: post.value.author?.name,
  tags: post.value.tags?.map(t => t.name)
})
</script>
```

**Trang sản phẩm:**
```vue
<script setup>
import { useSeo } from '@/composables/seo'

const product = ref({...})

useSeo({
  title: product.value.name,
  description: product.value.description,
  image: product.value.image,
  type: 'product'
})
</script>
```

## 🔍 Kiểm tra

1. **Robots.txt**: `https://yourdomain.com/robots.txt`
2. **Sitemap**: `https://yourdomain.com/sitemap.xml`
3. **Meta tags**: Sử dụng browser dev tools hoặc [Google Rich Results Test](https://search.google.com/test/rich-results)

## 📚 Tài liệu chi tiết

Xem file `SEO.md` để biết thêm chi tiết về:
- Best practices
- Troubleshooting
- Monitoring
- Submit sitemap lên Google Search Console

## 🎯 Next Steps

1. ✅ Cập nhật `NUXT_PUBLIC_SITE_URL` trong `.env` với domain thực tế
2. ✅ Cập nhật `NUXT_PUBLIC_SITE_NAME` và `NUXT_PUBLIC_SITE_DESCRIPTION`
3. ✅ Thêm OG image vào `public/` folder và cập nhật `NUXT_PUBLIC_OG_IMAGE`
4. ✅ Submit sitemap lên Google Search Console
5. ✅ Kiểm tra meta tags trên các trang quan trọng
6. ✅ Monitor indexing status trong Google Search Console

## 📌 Lưu ý

- Nhớ cập nhật domain trong `public/robots.txt` (dòng `Sitemap: https://yourdomain.com/sitemap.xml`)
- Nếu dùng Apache, uncomment các dòng Force HTTPS trong `.htaccess`
- Sitemap tự động cache 1 giờ, nếu cần refresh ngay có thể clear cache hoặc đợi 1 giờ

