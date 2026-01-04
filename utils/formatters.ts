// ===== TYPES =====

type Currency = 'VND' | 'USD' | 'EUR' | 'GBP'
type Locale = 'vi-VN' | 'en-US' | 'en-GB'

// ===== CURRENCY FORMATTING =====

/**
 * Format currency with proper type safety
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: Currency = 'VND',
  locale: Locale = 'vi-VN'
): string {
  if (amount === null || amount === undefined) return ''

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  } catch (error) {
    // Fallback formatting
    return `${amount.toLocaleString()} ${currency}`
  }
}

/**
 * Format number with comma separators
 */
export function formatNumber(
  number: number | null | undefined,
  locale: Locale = 'vi-VN'
): string {
  if (number === null || number === undefined) return ''

  try {
    return new Intl.NumberFormat(locale).format(number)
  } catch (error) {
    return number.toString()
  }
}

// Default export for backward compatibility
export default formatCurrency

// ===== DATE FORMATTING =====

type DateFormat = 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'MM/dd/yyyy'

interface FormatDateOptions {
  includeTime?: boolean
  shortFormat?: boolean
}

/**
 * Format date with type safety
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatOrOptions?: DateFormat | FormatDateOptions
): string {
  if (!date) return ''

  const d = new Date(date)

  if (isNaN(d.getTime())) return ''

  // Handle options object (for compatibility with formatHelpers)
  if (formatOrOptions && typeof formatOrOptions === 'object' && 'includeTime' in formatOrOptions) {
    const { includeTime = true, shortFormat = false } = formatOrOptions

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: shortFormat ? 'short' : 'long',
      day: 'numeric'
    }

    if (includeTime) {
      formatOptions.hour = '2-digit'
      formatOptions.minute = '2-digit'
    }

    return d.toLocaleDateString('vi-VN', formatOptions)
  }

  // Handle string format
  const format = formatOrOptions as DateFormat || 'dd/MM/yyyy'

  switch (format) {
    case 'yyyy-MM-dd':
      return d.toISOString().slice(0, 10)
    case 'MM/dd/yyyy':
      return d.toLocaleDateString('en-US')
    case 'dd/MM/yyyy':
    default:
      return d.toLocaleDateString('vi-VN')
  }
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  locale: Locale = 'vi-VN'
): string {
  if (!date) return ''

  const d = new Date(date)

  if (isNaN(d.getTime())) return ''

  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
  locale: Locale = 'vi-VN'
): string {
  if (!date) return ''

  const d = new Date(date)

  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`
  }

  return formatDate(d)
}

// ===== ADDITIONAL FORMATTING FUNCTIONS =====

/**
 * Format date range
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // If same day, just show the date
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate, { includeTime: true })
  }

  // If same month and year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}`
  }

  // Different months or years
  return `${formatDate(startDate, { shortFormat: true, includeTime: false })} - ${formatDate(endDate, { shortFormat: true, includeTime: false })}`
}

/**
 * Format phone number to Vietnamese format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Check if it's a valid Vietnamese phone number
  if (cleaned.length < 10 || cleaned.length > 11) {
    return phone // Return original if invalid
  }

  // Format: 0xxx xxx xxx or 0xxx xxx xxxx
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  } else {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ===== PRODUCT PRICE HELPERS =====

interface ProductVariant {
  id: string | number
  price: number
  sale_price?: number
  stock_quantity: number
}

interface Product {
  id: string | number
  price?: number
  sale_price?: number
  variants?: ProductVariant[]
}

/**
 * Get the lowest price from product variants
 * If no variants exist, return the product's own price
 */
export function getLowestProductPrice(product: Product): { price: number; sale_price?: number } | null {
  // If product has variants, find the lowest price among them
  if (product.variants && product.variants.length > 0) {
    const validVariants = product.variants.filter(variant => variant.stock_quantity > 0)

    if (validVariants.length === 0) {
      // If no variants in stock, check all variants regardless of stock
      const allVariants = product.variants
      if (allVariants.length === 0) return null

      const lowestVariant = allVariants.reduce((lowest, current) => {
        const currentPrice = current.sale_price || current.price
        const lowestPrice = lowest.sale_price || lowest.price
        return currentPrice < lowestPrice ? current : lowest
      })

      return {
        price: lowestVariant.price,
        sale_price: lowestVariant.sale_price
      }
    }

    const lowestVariant = validVariants.reduce((lowest, current) => {
      const currentPrice = current.sale_price || current.price
      const lowestPrice = lowest.sale_price || lowest.price
      return currentPrice < lowestPrice ? current : lowest
    })

    return {
      price: lowestVariant.price,
      sale_price: lowestVariant.sale_price
    }
  }

  // If no variants, use product's own price
  if (product.price !== undefined) {
    return {
      price: product.price,
      sale_price: product.sale_price
    }
  }

  return null
}

/**
 * Get the display price for a product (lowest price from variants or product price)
 */
export function getProductDisplayPrice(product: Product): number | null {
  const priceInfo = getLowestProductPrice(product)
  return priceInfo ? (priceInfo.sale_price || priceInfo.price) : null
}

/**
 * Get the original price for a product (for comparison with sale price)
 */
export function getProductOriginalPrice(product: Product): number | null {
  const priceInfo = getLowestProductPrice(product)
  return priceInfo ? priceInfo.price : null
}

/**
 * Check if a product has a sale price
 */
export function productHasSalePrice(product: Product): boolean {
  const priceInfo = getLowestProductPrice(product)
  return priceInfo ? !!priceInfo.sale_price : false
}

/**
 * Get total stock quantity from product variants
 * If no variants exist, return the product's own stock quantity
 */
export function getTotalStockQuantity(product: any): number {
  // If product has variants, sum up all variant stock quantities
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((total: number, variant: ProductVariant) => {
      return total + (variant.stock_quantity || 0)
    }, 0)
  }

  // If no variants, use product's own stock quantity
  return product.stock_quantity || 0
}

/**
 * Get stock quantity for a specific variant
 */
export function getVariantStockQuantity(product: any, variantId: string | number): number {
  if (!product.variants || product.variants.length === 0) {
    return product.stock_quantity || 0
  }

  const variant = product.variants.find((v: ProductVariant) => v.id === variantId)
  return variant ? (variant.stock_quantity || 0) : 0
}
