import { defineEventHandler } from 'h3'
import type { H3Event } from 'h3'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

interface StaticPage {
  path: string
  priority: number
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://yourdomain.com'
  
  // Lấy danh sách các routes public
  const urls: SitemapUrl[] = []
  
  // Static pages
  const staticPages: StaticPage[] = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/home', priority: 1.0, changefreq: 'daily' },
    { path: '/home/comics', priority: 1.0, changefreq: 'daily' }, // Trang truyện tranh - QUAN TRỌNG
    { path: '/home/products', priority: 0.9, changefreq: 'daily' },
    { path: '/home/posts', priority: 0.9, changefreq: 'daily' },
    { path: '/home/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/home/contact', priority: 0.7, changefreq: 'monthly' },
  ]
  
  // Thêm static pages vào sitemap
  for (const page of staticPages) {
    urls.push({
      loc: `${siteUrl}${page.path}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority
    })
  }
  
  // Dynamic pages - Products
  try {
    const productsResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/products`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (productsResponse?.data && Array.isArray(productsResponse.data)) {
      for (const product of productsResponse.data) {
        if (product.slug) {
          urls.push({
            loc: `${siteUrl}/home/products/${product.slug}`,
            lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: 0.8
          })
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch products for sitemap:', error)
  }
  
  // Dynamic pages - Posts
  try {
    const postsResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/posts`, {
      params: { limit: 1000, status: 'published' }
    }).catch(() => null)
    
    if (postsResponse?.data && Array.isArray(postsResponse.data)) {
      for (const post of postsResponse.data) {
        if (post.slug) {
          urls.push({
            loc: `${siteUrl}/home/posts/${post.slug}`,
            lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: 0.7
          })
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch posts for sitemap:', error)
  }
  
  // Dynamic pages - Product Categories
  try {
    const categoriesResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/product-categories`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
      for (const category of categoriesResponse.data) {
        if (category.slug) {
          urls.push({
            loc: `${siteUrl}/home/products/category/${category.slug}`,
            lastmod: category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: 0.8
          })
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch product categories for sitemap:', error)
  }
  
  // Dynamic pages - Post Categories
  try {
    const postCategoriesResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/post-categories`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (postCategoriesResponse?.data && Array.isArray(postCategoriesResponse.data)) {
      for (const category of postCategoriesResponse.data) {
        if (category.slug) {
          urls.push({
            loc: `${siteUrl}/home/posts/category/${category.slug}`,
            lastmod: category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'weekly',
            priority: 0.7
          })
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch post categories for sitemap:', error)
  }
  
  // Dynamic pages - Comics (TRUYỆN TRANH - QUAN TRỌNG NHẤT)
  try {
    // Lấy danh sách tất cả comics (có thể cần pagination nếu có nhiều)
    const comicsResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/comics`, {
      params: { limit: 5000, 'filters[status]': 'published' } // Tăng limit để lấy nhiều hơn
    }).catch(() => null)
    
    if (comicsResponse?.data && Array.isArray(comicsResponse.data)) {
      for (const comic of comicsResponse.data) {
        if (comic.slug) {
          // Thêm trang chi tiết truyện
          urls.push({
            loc: `${siteUrl}/home/comics/${comic.slug}`,
            lastmod: comic.updated_at ? new Date(comic.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'daily', // Truyện thường cập nhật hàng ngày
            priority: 0.9 // Priority cao vì đây là nội dung chính
          })
          
          // Lấy danh sách chapters của truyện này (có thể cần pagination)
          try {
            const chaptersResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/comics/${comic.slug}/chapters`, {
              params: { limit: 1000, sort: 'chapter_index:ASC' }
            }).catch(() => null)
            
            if (chaptersResponse?.data && Array.isArray(chaptersResponse.data)) {
              for (const chapter of chaptersResponse.data) {
                // URL pattern: /home/comics/:slug/chapters/:chapter_index
                if (chapter.chapter_index !== undefined && chapter.chapter_index !== null) {
                  urls.push({
                    loc: `${siteUrl}/home/comics/${comic.slug}/chapters/${chapter.chapter_index}`,
                    lastmod: chapter.updated_at ? new Date(chapter.updated_at).toISOString().split('T')[0] : undefined,
                    changefreq: 'weekly', // Chapters ít thay đổi hơn
                    priority: 0.8 // Priority cao vì đây là nội dung đọc
                  })
                }
              }
            }
          } catch (chapterError) {
            // Bỏ qua nếu không lấy được chapters, nhưng vẫn giữ comic URL
            console.warn(`Could not fetch chapters for comic ${comic.slug}:`, chapterError)
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch comics for sitemap:', error)
  }
  
  // Dynamic pages - Comic Categories
  try {
    const comicCategoriesResponse = await $fetch<ApiResponse<any[]>>(`${config.public.apiBase}/api/public/comic-categories`, {
      params: { limit: 1000 }
    }).catch(() => null)
    
    if (comicCategoriesResponse?.data && Array.isArray(comicCategoriesResponse.data)) {
      for (const category of comicCategoriesResponse.data) {
        if (category.slug) {
          // URL pattern có thể là /home/comics?category=slug hoặc route riêng
          // Giả sử có filter query param
          urls.push({
            loc: `${siteUrl}/home/comics?filters[comic_category_id]=${category.id}`,
            lastmod: category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : undefined,
            changefreq: 'daily',
            priority: 0.8
          })
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch comic categories for sitemap:', error)
  }
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `
    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`
  
  // Set headers
  event.node.res.setHeader('Content-Type', 'application/xml')
  event.node.res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  
  return xml
})

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}


