import { defineEventHandler } from 'h3'
import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * Server route để serve robots.txt động
 * Cho phép thay đổi robots.txt dựa trên environment
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://yourdomain.com'
  
  try {
    // Đọc file robots.txt từ public folder
    const robotsPath = join(process.cwd(), 'public', 'robots.txt')
    let robotsContent = await readFile(robotsPath, 'utf-8')
    
    // Thay thế placeholder URL nếu có
    robotsContent = robotsContent.replace(/https:\/\/yourdomain\.com/g, siteUrl)
    
    event.node.res.setHeader('Content-Type', 'text/plain')
    event.node.res.setHeader('Cache-Control', 'public, max-age=86400')
    
    return robotsContent
  } catch (error) {
    // Fallback nếu không đọc được file
    const defaultRobots = `User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /user/profile/
Disallow: /home/cart/
Disallow: /home/checkout/
Disallow: /home/orders/

Sitemap: ${siteUrl}/sitemap.xml`
    
    event.node.res.setHeader('Content-Type', 'text/plain')
    event.node.res.setHeader('Cache-Control', 'public, max-age=86400')
    
    return defaultRobots
  }
})

