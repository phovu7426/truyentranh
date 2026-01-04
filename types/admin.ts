// ===== ADMIN TYPES =====
// Gộp tất cả admin types vào một file

// Endpoints
type Id = string | number
export const adminEndpoints = {
  users: {
    list: '/api/admin/users',
    create: '/api/admin/users',
    show: (id: Id) => `/api/admin/users/${id}`,
    update: (id: Id) => `/api/admin/users/${id}`,
    delete: (id: Id) => `/api/admin/users/${id}`,
    changePassword: (id: Id) => `/api/admin/users/${id}/password`,
    /** Gán roles cho user trong group hiện tại. BẮT BUỘC phải có X-Group-Id header */
    assignRoles: (id: Id) => `/api/admin/users/${id}/roles`,
  },
  products: {
    list: '/api/admin/products',
    create: '/api/admin/products',
    show: (id: Id) => `/api/admin/products/${id}`,
    update: (id: Id) => `/api/admin/products/${id}`,
    delete: (id: Id) => `/api/admin/products/${id}`,
    getForSelect: '/api/admin/products/select/list',
    updateStatus: (id: Id) => `/api/admin/products/status/${id}`,
    toggleFeatured: (id: Id) => `/api/admin/products/toggle-featured/${id}`,
    restore: (id: Id) => `/api/admin/products/${id}/restore`,
  },
  orders: {
    list: '/api/admin/orders',
    create: '/api/admin/orders',
    show: (id: Id) => `/api/admin/orders/${id}`,
    update: (id: Id) => `/api/admin/orders/${id}`,
    delete: (id: Id) => `/api/admin/orders/${id}`,
    updateStatus: (id: Id) => `/api/admin/orders/${id}/status`,
  },
  adminPayments: {
    list: '/api/admin/payments',
    show: (id: Id) => `/api/admin/payments/${id}`,
    updateStatus: (id: Id) => `/api/admin/payments/${id}/status`,
  },
  warehouses: {
    list: '/api/admin/warehouses',
    create: '/api/admin/warehouses',
    show: (id: Id) => `/api/admin/warehouses/${id}`,
    update: (id: Id) => `/api/admin/warehouses/${id}`,
    delete: (id: Id) => `/api/admin/warehouses/${id}`,
    inventory: (id: Id) => `/api/admin/warehouses/${id}/inventory`,
    updateInventory: '/api/admin/warehouses/inventory/update',
  },
  stockTransfers: {
    list: '/api/admin/warehouses/transfers/list',
    create: '/api/admin/warehouses/transfers',
    approve: (id: Id) => `/api/admin/warehouses/transfers/${id}/approve`,
    complete: (id: Id) => `/api/admin/warehouses/transfers/${id}/complete`,
    cancel: (id: Id) => `/api/admin/warehouses/transfers/${id}/cancel`,
  },
  coupons: {
    list: '/api/admin/coupons',
    create: '/api/admin/coupons',
    show: (id: Id) => `/api/admin/coupons/${id}`,
    update: (id: Id) => `/api/admin/coupons/${id}`,
    delete: (id: Id) => `/api/admin/coupons/${id}`,
    stats: (id: Id) => `/api/admin/coupons/${id}/stats`,
  },
  categories: {
    list: '/api/admin/categories',
    create: '/api/admin/categories',
    show: (id: Id) => `/api/admin/categories/${id}`,
    update: (id: Id) => `/api/admin/categories/${id}`,
    delete: (id: Id) => `/api/admin/categories/${id}`,
    search: '/api/admin/categories/search',
  },
  brands: {
    list: '/api/admin/brands',
    create: '/api/admin/brands',
    show: (id: Id) => `/api/admin/brands/${id}`,
    update: (id: Id) => `/api/admin/brands/${id}`,
    delete: (id: Id) => `/api/admin/brands/${id}`,
    search: '/api/admin/brands/search',
  },
  attributes: {
    list: '/api/admin/attributes',
    create: '/api/admin/attributes',
    show: (id: Id) => `/api/admin/attributes/${id}`,
    update: (id: Id) => `/api/admin/attributes/${id}`,
    delete: (id: Id) => `/api/admin/attributes/${id}`,
  },
  attributeValues: {
    list: '/api/admin/attribute-values',
    create: '/api/admin/attribute-values',
    show: (id: Id) => `/api/admin/attribute-values/${id}`,
    update: (id: Id) => `/api/admin/attribute-values/${id}`,
    delete: (id: Id) => `/api/admin/attribute-values/${id}`,
  },
  permissions: {
    list: '/api/admin/permissions',
    simple: '/api/admin/permissions/simple',
    create: '/api/admin/permissions',
    show: (id: Id) => `/api/admin/permissions/${id}`,
    update: (id: Id) => `/api/admin/permissions/${id}`,
    delete: (id: Id) => `/api/admin/permissions/${id}`,
  },
  roles: {
    list: '/api/admin/roles',
    simple: '/api/admin/roles/simple',
    create: '/api/admin/roles',
    show: (id: Id) => `/api/admin/roles/${id}`,
    update: (id: Id) => `/api/admin/roles/${id}`,
    delete: (id: Id) => `/api/admin/roles/${id}`,
    assignPermissions: (id: Id) => `/api/admin/roles/${id}/permissions`,
  },
  productAttributes: {
    list: '/api/admin/product-attributes',
    create: '/api/admin/product-attributes',
    show: (id: Id) => `/api/admin/product-attributes/${id}`,
    update: (id: Id) => `/api/admin/product-attributes/${id}`,
    delete: (id: Id) => `/api/admin/product-attributes/${id}`,
    updateStatus: (id: Id) => `/api/admin/product-attributes/status/${id}`,
    restore: (id: Id) => `/api/admin/product-attributes/${id}/restore`,
    withValues: '/api/admin/product-attributes/with-values',
    getByCode: (code: string) => `/api/admin/product-attributes/code/${code}`,
  },
  productVariants: {
    list: '/api/admin/product-variants',
    create: '/api/admin/product-variants',
    show: (id: Id) => `/api/admin/product-variants/${id}`,
    update: (id: Id) => `/api/admin/product-variants/${id}`,
    delete: (id: Id) => `/api/admin/product-variants/${id}`,
    getByProduct: (productId: Id) => `/api/admin/product-variants/product/${productId}`,
    updateStatus: (id: Id) => `/api/admin/product-variants/status/${id}`,
    restore: (id: Id) => `/api/admin/product-variants/${id}/restore`,
    search: '/api/admin/product-variants/search',
    getBySku: (sku: string) => `/api/admin/product-variants/sku/${sku}`,
  },
  inventory: {
    list: '/api/admin/inventory',
    create: '/api/admin/inventory',
    show: (id: Id) => `/api/admin/inventory/${id}`,
    update: (id: Id) => `/api/admin/inventory/${id}`,
    delete: (id: Id) => `/api/admin/inventory/${id}`,
    import: '/api/admin/inventory/import',
    export: '/api/admin/inventory/export',
    expiringSoon: '/api/admin/inventory/expiring-soon',
    expired: '/api/admin/inventory/expired',
    lowStock: '/api/admin/inventory/low-stock',
    filterOptions: '/api/admin/inventory/filter-options',
  },
  contacts: {
    list: '/api/admin/contacts',
    create: '/api/admin/contacts',
    show: (id: Id) => `/api/admin/contacts/${id}`,
    update: (id: Id) => `/api/admin/contacts/${id}`,
    delete: (id: Id) => `/api/admin/contacts/${id}`,
    reply: (id: Id) => `/api/admin/contacts/${id}/reply`,
    markAsRead: (id: Id) => `/api/admin/contacts/${id}/read`,
    close: (id: Id) => `/api/admin/contacts/${id}/close`,
  },
  enums: {
    all: '/api/enums',
    byName: (type: string) => `/api/enums/${type}`,
  },
  shippingApi: {
    list: '/api/admin/shipping/api',
    create: '/api/admin/shipping/api',
    show: (id: Id) => `/api/admin/shipping/api/${id}`,
    update: (id: Id) => `/api/admin/shipping/api/${id}`,
    delete: (id: Id) => `/api/admin/shipping/api/${id}`,
  },
  shippingServices: {
    list: '/api/admin/shipping/services',
    create: '/api/admin/shipping/services',
    show: (id: Id) => `/api/admin/shipping/services/${id}`,
    update: (id: Id) => `/api/admin/shipping/services/${id}`,
    delete: (id: Id) => `/api/admin/shipping/services/${id}`,
    changeStatus: (id: Id) => `/api/admin/shipping/services/${id}/toggle-status`,
  },
  shippingZones: {
    list: '/api/admin/shipping/zones',
    create: '/api/admin/shipping/zones',
    show: (id: Id) => `/api/admin/shipping/zones/${id}`,
    update: (id: Id) => `/api/admin/shipping/zones/${id}`,
    delete: (id: Id) => `/api/admin/shipping/zones/${id}`,
  },
  shippingPricing: {
    list: '/api/admin/shipping/pricing',
    create: '/api/admin/shipping/pricing',
    show: (id: Id) => `/api/admin/shipping/pricing/${id}`,
    update: (id: Id) => `/api/admin/shipping/pricing/${id}`,
    delete: (id: Id) => `/api/admin/shipping/pricing/${id}`,
  },
  shippingPromotions: {
    list: '/api/admin/shipping/promotions',
    create: '/api/admin/shipping/promotions',
    show: (id: Id) => `/api/admin/shipping/promotions/${id}`,
    update: (id: Id) => `/api/admin/shipping/promotions/${id}`,
    delete: (id: Id) => `/api/admin/shipping/promotions/${id}`,
  },
  shippingDelivery: {
    list: '/api/admin/shipping/delivery',
    create: '/api/admin/shipping/delivery',
    show: (id: Id) => `/api/admin/shipping/delivery/${id}`,
    update: (id: Id) => `/api/admin/shipping/delivery/${id}`,
    delete: (id: Id) => `/api/admin/shipping/delivery/${id}`,
  },
  shippingAdvanced: {
    list: '/api/admin/shipping/advanced',
    create: '/api/admin/shipping/advanced',
    show: (id: Id) => `/api/admin/shipping/advanced/${id}`,
    update: (id: Id) => `/api/admin/shipping/advanced/${id}`,
    delete: (id: Id) => `/api/admin/shipping/advanced/${id}`,
  },
  posts: {
    list: '/api/admin/posts',
    create: '/api/admin/posts',
    show: (id: Id) => `/api/admin/posts/${id}`,
    update: (id: Id) => `/api/admin/posts/${id}`,
    delete: (id: Id) => `/api/admin/posts/${id}`,
    restore: (id: Id) => `/api/admin/posts/${id}/restore`,
  },
  postCategories: {
    list: '/api/admin/post-categories',
    create: '/api/admin/post-categories',
    show: (id: Id) => `/api/admin/post-categories/${id}`,
    update: (id: Id) => `/api/admin/post-categories/${id}`,
    delete: (id: Id) => `/api/admin/post-categories/${id}`,
  },
  productCategories: {
    list: '/api/admin/product-categories',
    create: '/api/admin/product-categories',
    show: (id: Id) => `/api/admin/product-categories/${id}`,
    update: (id: Id) => `/api/admin/product-categories/${id}`,
    delete: (id: Id) => `/api/admin/product-categories/${id}`,
    tree: '/api/admin/product-categories/tree',
    products: (id: Id) => `/api/admin/product-categories/products/${id}`,
    restore: (id: Id) => `/api/admin/product-categories/${id}/restore`,
    root: '/api/admin/product-categories/root',
    children: (id: Id) => `/api/admin/product-categories/${id}/children`,
  },
  postTags: {
    list: '/api/admin/post-tags',
    create: '/api/admin/post-tags',
    show: (id: Id) => `/api/admin/post-tags/${id}`,
    update: (id: Id) => `/api/admin/post-tags/${id}`,
    delete: (id: Id) => `/api/admin/post-tags/${id}`,
  },
  systemConfigs: {
    list: '/api/admin/system-configs',
    create: '/api/admin/system-configs',
    show: (id: Id) => `/api/admin/system-configs/${id}`,
    update: (id: Id) => `/api/admin/system-configs/${id}`,
    delete: (id: Id) => `/api/admin/system-configs/${id}`,
    getByGroup: (group: string) => `/api/admin/system-configs/group/${group}`,
    bulkUpdate: '/api/admin/system-configs/bulk-update',
    general: {
      get: '/api/admin/system-config/general',
      update: '/api/admin/system-config/general',
    },
    email: {
      get: '/api/admin/system-config/email',
      update: '/api/admin/system-config/email',
    },
  },
  productAttributeValues: {
    list: '/api/admin/product-attribute-values',
    create: '/api/admin/product-attribute-values',
    show: (id: Id) => `/api/admin/product-attribute-values/${id}`,
    update: (id: Id) => `/api/admin/product-attribute-values/${id}`,
    delete: (id: Id) => `/api/admin/product-attribute-values/${id}`,
    restore: (id: Id) => `/api/admin/product-attribute-values/${id}/restore`,
    getByAttribute: (attributeId: Id) => `/api/admin/product-attribute-values/attribute/${attributeId}`,
  },
  productVariantAttributes: {
    list: '/api/admin/product-variant-attributes',
    create: '/api/admin/product-variant-attributes',
    show: (id: Id) => `/api/admin/product-variant-attributes/${id}`,
    update: (id: Id) => `/api/admin/product-variant-attributes/${id}`,
    delete: (id: Id) => `/api/admin/product-variant-attributes/${id}`,
    getByVariant: (variantId: Id) => `/api/admin/product-variant-attributes/variant/${variantId}`,
  },
  paymentMethods: {
    list: '/api/admin/payment-methods',
    create: '/api/admin/payment-methods',
    show: (id: Id) => `/api/admin/payment-methods/${id}`,
    update: (id: Id) => `/api/admin/payment-methods/${id}`,
    delete: (id: Id) => `/api/admin/payment-methods/${id}`,
    restore: (id: Id) => `/api/admin/payment-methods/${id}/restore`,
  },
  shippingMethods: {
    list: '/api/admin/shipping-methods',
    create: '/api/admin/shipping-methods',
    show: (id: Id) => `/api/admin/shipping-methods/${id}`,
    update: (id: Id) => `/api/admin/shipping-methods/${id}`,
    delete: (id: Id) => `/api/admin/shipping-methods/${id}`,
    restore: (id: Id) => `/api/admin/shipping-methods/${id}/restore`,
    active: '/api/admin/shipping-methods/active',
    getByCode: (code: string) => `/api/admin/shipping-methods/code/${code}`,
  },
  payments: {
    list: '/api/public/payments',
    show: (id: Id) => `/api/public/payments/${id}`,
    create: '/api/public/payments',
    createUrl: '/api/public/payments/create-url',
    verify: (gateway: string) => `/api/public/payments/verify/${gateway}`,
    webhook: (gateway: string) => `/api/public/payments/webhook/${gateway}`,
  },
  menus: {
    list: '/api/admin/menus',
    create: '/api/admin/menus',
    show: (id: Id) => `/api/admin/menus/${id}`,
    update: (id: Id) => `/api/admin/menus/${id}`,
    delete: (id: Id) => `/api/admin/menus/${id}`,
    tree: '/api/admin/menus/tree',
  },
  userMenus: {
    list: '/api/admin/user/menus',
  },
  bannerLocations: {
    list: '/api/admin/banner-locations',
    create: '/api/admin/banner-locations',
    show: (id: Id) => `/api/admin/banner-locations/${id}`,
    update: (id: Id) => `/api/admin/banner-locations/${id}`,
    delete: (id: Id) => `/api/admin/banner-locations/${id}`,
    updateStatus: (id: Id) => `/api/admin/banner-locations/${id}/status`,
    restore: (id: Id) => `/api/admin/banner-locations/${id}/restore`,
    getByCode: (code: string) => `/api/admin/banner-locations/code/${code}`,
  },
  banners: {
    list: '/api/admin/banners',
    create: '/api/admin/banners',
    show: (id: Id) => `/api/admin/banners/${id}`,
    update: (id: Id) => `/api/admin/banners/${id}`,
    delete: (id: Id) => `/api/admin/banners/${id}`,
    updateStatus: (id: Id) => `/api/admin/banners/${id}/status`,
    updateSortOrder: (id: Id) => `/api/admin/banners/${id}/sort-order`,
    restore: (id: Id) => `/api/admin/banners/${id}/restore`,
    getByLocation: (locationCode: string) => `/api/admin/banners/location/${locationCode}`,
  },
  contexts: {
    list: '/api/admin/contexts', // GET - Lấy danh sách contexts với pagination, filter, search
    create: '/api/admin/contexts', // POST - Tạo context mới
    show: (id: Id) => `/api/admin/contexts/${id}`, // GET - Lấy context theo ID
    update: (id: Id) => `/api/admin/contexts/${id}`, // PUT - Cập nhật context
    delete: (id: Id) => `/api/admin/contexts/${id}`, // DELETE - Xóa context (soft delete)
    userList: '/api/user/contexts', // GET - Lấy danh sách contexts của user (chỉ để hiển thị)
  },
  groups: {
    list: '/api/admin/groups', // GET - Lấy danh sách groups với pagination, filter, search
    create: '/api/admin/groups', // POST - Tạo group mới
    show: (id: Id) => `/api/admin/groups/${id}`, // GET - Lấy group theo ID
    update: (id: Id) => `/api/admin/groups/${id}`, // PUT - Cập nhật group
    delete: (id: Id) => `/api/admin/groups/${id}`, // DELETE - Xóa group (soft delete)
    byType: (type: string) => `/api/admin/groups/type/${type}`, // GET - Lấy groups theo type
    members: {
      list: (groupId: Id) => `/api/groups/${groupId}/members`, // GET - Lấy danh sách members
      add: (groupId: Id) => `/api/groups/${groupId}/members`, // POST - Thêm member vào group
      updateRoles: (groupId: Id, memberId: Id) => `/api/groups/${groupId}/members/${memberId}/roles`, // PUT - Gán roles cho member
      remove: (groupId: Id, memberId: Id) => `/api/groups/${groupId}/members/${memberId}`, // DELETE - Xóa member khỏi group
    },
  },
  userGroups: {
    list: '/api/user/groups', // GET - Lấy danh sách groups của user hiện tại
  },
  comicCategories: {
    list: '/api/admin/comic-categories',
    create: '/api/admin/comic-categories',
    show: (id: Id) => `/api/admin/comic-categories/${id}`,
    update: (id: Id) => `/api/admin/comic-categories/${id}`,
    delete: (id: Id) => `/api/admin/comic-categories/${id}`,
  },
  comics: {
    list: '/api/admin/comics',
    simple: '/api/admin/comics/simple',
    create: '/api/admin/comics',
    show: (id: Id) => `/api/admin/comics/${id}`,
    update: (id: Id) => `/api/admin/comics/${id}`,
    delete: (id: Id) => `/api/admin/comics/${id}`,
    restore: (id: Id) => `/api/admin/comics/${id}/restore`,
    uploadCover: (id: Id) => `/api/admin/comics/${id}/cover`,
    assignCategories: (id: Id) => `/api/admin/comics/${id}/comic-categories`,
    getChapters: (id: Id) => `/api/admin/comics/${id}/chapters`,
  },
  chapters: {
    list: '/api/admin/chapters',
    create: '/api/admin/chapters',
    show: (id: Id) => `/api/admin/chapters/${id}`,
    update: (id: Id) => `/api/admin/chapters/${id}`,
    delete: (id: Id) => `/api/admin/chapters/${id}`,
    restore: (id: Id) => `/api/admin/chapters/${id}/restore`,
    reorder: (id: Id) => `/api/admin/chapters/${id}/reorder`,
    getByComic: (comicId: Id) => `/api/admin/chapters/comics/${comicId}`,
    getPages: (id: Id) => `/api/admin/chapters/${id}/pages`,
    uploadPages: (id: Id) => `/api/admin/chapters/${id}/pages`,
    updatePages: (id: Id) => `/api/admin/chapters/${id}/pages`,
  },
  // Note: rbac.syncRoles endpoint không tồn tại trong API
  // Sử dụng users.assignRoles (PUT /api/admin/users/:id/roles) với X-Group-Id header thay thế
} as const

export type AdminEndpoints = typeof adminEndpoints

// Navigation types
import type { ComputedRef } from 'vue'
export interface MenuItem {
  id?: string
  name: string
  path?: string
  api?: string
  icon: string
  status: 'active' | 'inactive'
  children?: MenuItem[]
  hasDynamicChildren?: boolean
  permissions?: string[]
  roles?: string[]
  requiresAuth?: boolean
  order?: number
  parentId?: string
  type?: 'admin' | 'user' | 'public'
  external?: boolean
  target?: '_blank' | '_self'
  badge?: {
    text: string
    color?: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  }
  tooltip?: string
  disabled?: boolean
}

export interface AdminNavigationResult {
  menuItems: ComputedRef<MenuItem[]>
  currentPath: ComputedRef<string>
  isActiveMenuItem: (item: MenuItem) => boolean
  menuLoading: ComputedRef<boolean>
  menuError: ComputedRef<string | null>
}

// Common types
export interface AdminModals {
  create: boolean
  edit: boolean
  delete: boolean
  view?: boolean
  [key: string]: boolean | undefined
}
