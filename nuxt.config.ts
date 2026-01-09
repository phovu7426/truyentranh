import { fileURLToPath } from 'node:url'

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data: https: http:",
  // Nuxt/Vue + Tailwind thường cần inline styles
  "style-src 'self' 'unsafe-inline'",
  // Dev cần unsafe-eval (Vite); prod vẫn OK nếu giữ (Lighthouse chỉ check có CSP)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https: http: ws: wss:"
  // Trusted Types đã được tắt để CKEditor hoạt động
  // Nếu cần bật lại, thêm: "trusted-types ckeditor default", "require-trusted-types-for 'script'"
].join('; ')

const securityHeaders: Record<string, string> = {
  // Clickjacking mitigation
  'X-Frame-Options': 'SAMEORIGIN',
  // COOP for origin isolation
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Basic hardening
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // CSP (enforcement)
  'Content-Security-Policy': csp,
  // HSTS (browser sẽ chỉ enforce khi chạy HTTPS)
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains'
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'http://127.0.0.1:8000',
      /**
       * Nguồn cấu hình hệ thống chung:
       * - dev/local mặc định dùng mock API (Nuxt server route)
       * - production mặc định dùng backend qua apiBase
       */
      systemConfigMode:
        process.env.NUXT_PUBLIC_SYSTEM_CONFIG_MODE ||
        (process.env.NODE_ENV === 'production' ? 'backend' : 'mock'),
      // SEO defaults (có thể override bằng ENV)
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || '',
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || '',
      ogImage: process.env.NUXT_PUBLIC_OG_IMAGE || '/default.svg'
    }
  },

  app: {
    baseURL: '/',
    cdnURL: '',
    head: {
      titleTemplate: (titleChunk?: string) => {
        return titleChunk
          ? `${titleChunk} | ${process.env.NUXT_PUBLIC_SITE_NAME || 'Cửa hàng'}`
          : `${process.env.NUXT_PUBLIC_SITE_NAME || 'Cửa hàng'}`
      },
      htmlAttrs: {
        lang: 'vi'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || '' },
        { name: 'robots', content: 'index,follow' },
        { name: 'googlebot', content: 'index,follow' },
        { name: 'author', content: process.env.NUXT_PUBLIC_SITE_NAME || 'Cửa hàng' },
        { name: 'theme-color', content: '#ffffff' },
        // Open Graph defaults
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: process.env.NUXT_PUBLIC_SITE_NAME || 'Cửa hàng' },
        { property: 'og:locale', content: 'vi_VN' },
        // Twitter Card defaults
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@yourtwitter' }
      ],
      link: [
        { rel: 'canonical', href: process.env.NUXT_PUBLIC_SITE_URL || '' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
        // DNS prefetch cho API backend để tối ưu TTFB/LCP khi gọi API từ client
        {
          rel: 'dns-prefetch',
          href: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'
        }
      ]
    }
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/global.css'
  ],

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url)),
        '~': fileURLToPath(new URL('./', import.meta.url))
      }
    },
    server: {
      fs: {
        // Fix for Windows path issues
        strict: false
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        '@heroicons/vue'
      ],
      exclude: [
        '@ckeditor/ckeditor5-build-decoupled-document',
        'vite/modulepreload-polyfill'
      ]
    },
    build: {
      // Tránh ship sourcemap ở production (hiệu năng + lộ code)
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true
        }
      },
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'vue-vendor': ['vue', 'vue-router'],
            'pinia-vendor': ['pinia'],
            'ui-vendor': ['@heroicons/vue'],
            // Large libraries
            'ckeditor': ['@ckeditor/ckeditor5-build-decoupled-document']
          }
        }
      },
      cssCodeSplit: true, // Split CSS into smaller chunks
      cssMinify: true
    },
    ssr: {
      noExternal: ['@ckeditor/ckeditor5-build-decoupled-document']
    },
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false
    }
  },

  nitro: {
    sourceMap: false,
    minify: true,
    compressPublicAssets: true,
    // Enable compression (gzip/brotli)
    experimental: {
      wasm: true
    },
    routeRules: {
      '/**': {
        headers: {
          ...securityHeaders,
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      },
      // Static assets - long cache
      '/_nuxt/**': {
        headers: {
          ...securityHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      '/favicon.ico': {
        headers: {
          ...securityHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      '/default.svg': {
        headers: {
          ...securityHeaders,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      '/sitemap.xml': {
        headers: {
          ...securityHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      },
      '/robots.txt': {
        headers: {
          ...securityHeaders,
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400'
        }
      },
      '/admin/**': {
        headers: {
          ...securityHeaders,
          'cache-control': 'no-cache',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      },
      '/api/**': {
        headers: {
          ...securityHeaders,
          'cache-control': 'no-cache',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      },
      '/auth/**': {
        headers: {
          ...securityHeaders,
          'X-Robots-Tag': 'noindex, nofollow'
        }
      },
      '/home/cart/**': {
        headers: {
          ...securityHeaders,
          'X-Robots-Tag': 'noindex, nofollow'
        }
      },
      '/home/checkout/**': {
        headers: {
          ...securityHeaders,
          'X-Robots-Tag': 'noindex, nofollow'
        }
      },
      '/home/orders/**': {
        headers: {
          ...securityHeaders,
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    }
  },

  vue: {
    compilerOptions: {
      hoistStatic: true, // Enable hoisting for better performance
      // Avoid hydration mismatches caused by CRLF/LF whitespace differences (Windows)
      // Use Vue default whitespace behavior (condense) for stable SSR hydration.
      whitespace: 'condense'
    }
  },

  ssr: true,

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true
  }
})
