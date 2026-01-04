/**
 * Trusted Types Policy Plugin
 *
 * Định nghĩa Trusted Types policy để cho phép CKEditor hoạt động
 * với CSP require-trusted-types-for directive.
 *
 * Plugin này phải chạy trước khi CKEditor được khởi tạo.
 *
 * Vì file là `.client.ts` nên plugin chỉ chạy trên client.
 */
export default defineNuxtPlugin({
  name: 'trusted-types',
  enforce: 'pre', // Chạy trước các plugin khác
  setup() {
    // Kiểm tra xem Trusted Types có được hỗ trợ không
    if (typeof window === 'undefined' || !window.trustedTypes) {
      return
    }

    try {
      // Tạo policy cho phép CKEditor sử dụng DOMParser và các API khác
      // Policy này sẽ wrap các string thành TrustedHTML
      let ckeditorPolicy: TrustedTypePolicy | null = null
      try {
        ckeditorPolicy = window.trustedTypes.createPolicy('ckeditor', {
          createHTML: (string: string) => {
            // Cho phép tất cả HTML từ CKEditor
            // Trong production, bạn có thể thêm sanitization ở đây nếu cần
            return string
          },
          createScript: (string: string) => {
            // Cho phép script từ CKEditor (nếu cần)
            return string
          },
          createScriptURL: (string: string) => {
            // Cho phép script URL từ CKEditor (nếu cần)
            return string
          }
        })
      } catch (error) {
        // Policy có thể đã tồn tại
        ckeditorPolicy = window.trustedTypes.createPolicy('ckeditor')
      }

      // Tạo policy mặc định cho các trường hợp khác
      // Policy này sẽ được sử dụng khi không có policy cụ thể
      let defaultPolicy: TrustedTypePolicy | null = null
      try {
        defaultPolicy = window.trustedTypes.createPolicy('default', {
          createHTML: (string: string) => string,
          createScript: (string: string) => string,
          createScriptURL: (string: string) => string
        })
      } catch (error) {
        // Policy có thể đã tồn tại
        defaultPolicy = window.trustedTypes.createPolicy('default')
      }

      // Wrap DOMParser.parseFromString để tự động chuyển đổi string thành TrustedHTML
      // Điều này cần thiết vì CKEditor sử dụng DOMParser.parseFromString() với string thông thường
      // Chỉ wrap nếu có policy available
      if (defaultPolicy || ckeditorPolicy) {
        const OriginalParseFromString = DOMParser.prototype.parseFromString

        // Tạo một policy helper để wrap string thành TrustedHTML
        const getTrustedHTML = (source: string | TrustedHTML): TrustedHTML => {
          if (source instanceof TrustedHTML) {
            return source
          }
          // Sử dụng defaultPolicy hoặc ckeditorPolicy để tạo TrustedHTML
          const policy = defaultPolicy || ckeditorPolicy
          if (policy) {
            return policy.createHTML(source) as unknown as TrustedHTML
          }
          throw new Error('Cannot create TrustedHTML: no policy available')
        }

        // Override parseFromString trên prototype
        DOMParser.prototype.parseFromString = function (
          source: string | TrustedHTML,
          mimeType: DOMParserSupportedType
        ): Document {
          try {
            // Nếu source đã là TrustedHTML, sử dụng trực tiếp
            if (source instanceof TrustedHTML) {
              return OriginalParseFromString.call(this, source, mimeType)
            }

            // Wrap string thành TrustedHTML
            const trustedHTML = getTrustedHTML(source as string)
            return OriginalParseFromString.call(this, trustedHTML, mimeType)
          } catch (error) {
            // Nếu có lỗi, log và throw
            console.error('DOMParser.parseFromString error:', error)
            throw error
          }
        }
      }
    } catch (error) {
      // Nếu có lỗi, bỏ qua nhưng log để debug
      console.warn('Trusted Types policy setup warning:', error)
    }
  }
})
