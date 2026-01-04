import { defineEventHandler } from 'h3'
import type { H3Event } from 'h3'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://yourdomain.com'
  
  // Lấy danh sách các routes public
  const urls: SitemapUrl[] = []
  
  // Static pages
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/home', priority: 1.0, changefreq: 'daily' },
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
    const productsResponse = await $fetch(`${config.public.apiBase}/api/public/products`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (productsResponse?.data) {
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
    const postsResponse = await $fetch(`${config.public.apiBase}/api/public/posts`, {
      params: { limit: 1000, status: 'published' }
    }).catch(() => null)
    
    if (postsResponse?.data) {
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
    const categoriesResponse = await $fetch(`${config.public.apiBase}/api/public/product-categories`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (categoriesResponse?.data) {
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
    const postCategoriesResponse = await $fetch(`${config.public.apiBase}/api/public/post-categories`, {
      params: { limit: 1000, status: 'active' }
    }).catch(() => null)
    
    if (postCategoriesResponse?.data) {
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


