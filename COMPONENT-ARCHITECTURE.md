# 🏗️ KẾ HOẠCH CHUẨN HÓA COMPONENT ARCHITECTURE

## 📋 TỔNG QUAN

Tài liệu này mô tả chiến lược tổ chức component cho dự án Nuxt v2, phân biệt rõ ràng giữa **Admin Components** (bắt buộc tách) và **Public Components** (tùy trường hợp).

### 📊 **THỐNG KÊ HỆ THỐNG**

- **Admin Modules:** 27+ modules (Products, Users, Orders, Payments, Posts, Banners, Warehouses, Groups, Roles, Permissions, ...)
- **Public Pages:** 11+ pages (Home, Products, Posts, Cart, Checkout, Orders, Profile, ...)
- **Tổng số modules cần refactor:** ~29 admin modules
- **Migration Plan:** 8 phases (từ cao → thấp ưu tiên)

---

## 📦 DANH SÁCH ĐẦY ĐỦ CÁC CHỨC NĂNG HỆ THỐNG

### 🔐 **ADMIN MODULES** (17+ modules)

#### **1. Core Business Modules** (Ưu tiên cao)
- ✅ **Products** - Quản lý sản phẩm (CRUD, filter, status, featured)
- ✅ **Users** - Quản lý người dùng (CRUD, roles, password)
- ✅ **Orders** - Quản lý đơn hàng (CRUD, status, export)
- ✅ **Payments** - Quản lý thanh toán (list, status)
- ✅ **Dashboard** - Bảng điều khiển (stats, overview)

#### **2. Product Management Sub-modules**
- ✅ **Product Categories** - Danh mục sản phẩm (tree structure, CRUD)
- ✅ **Product Attributes** - Thuộc tính sản phẩm (CRUD)
- ✅ **Product Attribute Values** - Giá trị thuộc tính (CRUD)
- ✅ **Product Variants** - Biến thể sản phẩm (CRUD, filter)

#### **3. Content Management**
- ✅ **Posts** - Quản lý bài viết (CRUD, filter, status)
- ✅ **Post Categories** - Danh mục bài viết (CRUD)
- ✅ **Post Tags** - Thẻ bài viết (CRUD)

#### **4. Marketing & Display**
- ✅ **Banners** - Quản lý banner (CRUD, filter, locations)
- ✅ **Banner Locations** - Vị trí banner (CRUD)
- ✅ **Coupons** - Quản lý mã giảm giá (CRUD, filter)

#### **5. System Configuration**
- ✅ **Menus** - Quản lý menu (CRUD, filter)
- ✅ **System Configs** - Cấu hình hệ thống
  - General settings
  - Email settings
- ✅ **Contexts** - Quản lý context (multi-tenant)

#### **6. Inventory & Logistics**
- ✅ **Warehouses** - Quản lý kho hàng (CRUD, inventory)
- ✅ **Warehouse Inventory** - Tồn kho (view, update)
- ✅ **Stock Transfers** - Chuyển kho (list, manage)
- ✅ **Shipping Methods** - Phương thức vận chuyển (CRUD)
- ✅ **Payment Methods** - Phương thức thanh toán (CRUD)

#### **7. User & Permission Management**
- ✅ **Groups** - Quản lý nhóm (CRUD, members, roles)
- ✅ **Roles** - Quản lý vai trò (CRUD, permissions)
- ✅ **Permissions** - Quản lý quyền (CRUD)

#### **8. Customer Service**
- ✅ **Contacts** - Quản lý liên hệ (list, view, reply, notes)

---

### 🌐 **PUBLIC PAGES** (11+ pages)

#### **1. Home & Navigation**
- ❌ **Home** (`/`) - Trang chủ (gắn chặt route, SEO)
- ❌ **About** (`/home/about`) - Giới thiệu
- ❌ **Contact** (`/home/contact`) - Liên hệ

#### **2. Products**
- ⚠️ **Product List** (`/home/products`) - Danh sách sản phẩm (tùy reuse)
- ❌ **Product Detail** (`/home/products/[slug]`) - Chi tiết sản phẩm (1 route - 1 UI)

#### **3. Posts/Blog**
- ⚠️ **Post List** (`/home/posts`) - Danh sách bài viết (tùy reuse)
- ⚠️ **Post Category** (`/home/posts/category/[slug]`) - Bài viết theo danh mục (tùy reuse)
- ⚠️ **Post Tag** (`/home/posts/tag/[slug]`) - Bài viết theo thẻ (tùy reuse)
- ❌ **Post Detail** (`/home/posts/[slug]`) - Chi tiết bài viết (1 route - 1 UI)

#### **4. Shopping**
- ❌ **Cart** (`/home/cart`) - Giỏ hàng
- ❌ **Checkout** (`/home/checkout`) - Thanh toán
- ❌ **Order Success** (`/home/order-success`) - Đặt hàng thành công
- ❌ **Orders List** (`/home/orders`) - Danh sách đơn hàng
- ❌ **Order Detail** (`/home/orders/[id]`) - Chi tiết đơn hàng
- ❌ **Payment Mock** (`/home/payment/mock`) - Mock thanh toán

#### **5. User**
- ❌ **User Profile** (`/user/profile`) - Hồ sơ cá nhân
- ❌ **Edit Profile** (`/user/profile/edit`) - Chỉnh sửa hồ sơ
- ❌ **Change Password** (`/user/profile/change-password`) - Đổi mật khẩu

#### **6. Auth**
- ❌ **Login** (`/auth/login`) - Đăng nhập
- ❌ **Register** (`/auth/register`) - Đăng ký

---

## 🧠 BẢNG QUYẾT ĐỊNH ĐẦY ĐỦ

### **ADMIN MODULES**

| Module | Cho vào component? | Ưu tiên | Vì sao |
|--------|-------------------|---------|--------|
| **Products** | ✅ **BẮT BUỘC** | 🔥 Cao | CRUD phức tạp, dùng lại, nhiều context |
| **Users** | ✅ **BẮT BUỘC** | 🔥 Cao | Module nghiệp vụ, roles, password |
| **Orders** | ✅ **BẮT BUỘC** | 🔥 Cao | Phức tạp, status management, export |
| **Payments** | ✅ **BẮT BUỘC** | 🔥 Cao | Quản lý thanh toán, status |
| **Dashboard** | ⚠️ **NÊN** | ⚡ Trung | Layout giống nhau, có thể reuse |
| **Product Categories** | ✅ **BẮT BUỘC** | ⚡ Trung | Tree structure, CRUD phức tạp |
| **Product Attributes** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, liên kết với products |
| **Product Attribute Values** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Product Variants** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD phức tạp, filter |
| **Posts** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter, status |
| **Post Categories** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Post Tags** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Banners** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter, locations |
| **Banner Locations** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Coupons** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter, validation |
| **Menus** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter, tree structure |
| **Warehouses** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, inventory management |
| **Warehouse Inventory** | ✅ **BẮT BUỘC** | ⚡ Trung | Update inventory, complex logic |
| **Stock Transfers** | ✅ **BẮT BUỘC** | ⚡ Trung | List, manage transfers |
| **Shipping Methods** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Payment Methods** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Groups** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, members, roles |
| **Roles** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, permissions assignment |
| **Permissions** | ✅ **BẮT BUỘC** | ⚡ Trung | CRUD, filter |
| **Contacts** | ✅ **BẮT BUỘC** | ⚡ Trung | List, view, reply, notes |
| **System Configs** | ⚠️ **NÊN** | 💡 Thấp | Settings pages, có thể tách |
| **Contexts** | ⚠️ **NÊN** | 💡 Thấp | Multi-tenant management |

### **PUBLIC PAGES**

| Trang | Cho vào component? | Vì sao |
|-------|-------------------|--------|
| **Home** | ❌ **KHÔNG cần** | Gắn chặt route `/`, SEO riêng |
| **About** | ❌ **KHÔNG cần** | Trang tĩnh, đơn giản |
| **Contact** | ❌ **KHÔNG cần** | Form liên hệ, gắn route |
| **Product List** | ⚠️ **TÙY** | Chỉ tách nếu reuse nhiều layout |
| **Product Detail** | ❌ **KHÔNG cần** | 1 route – 1 UI, SEO riêng |
| **Post List** | ⚠️ **TÙY** | Chỉ tách nếu reuse nhiều layout |
| **Post Category** | ⚠️ **TÙY** | Có thể dùng chung với Post List |
| **Post Tag** | ⚠️ **TÙY** | Có thể dùng chung với Post List |
| **Post Detail** | ❌ **KHÔNG cần** | 1 route – 1 UI, SEO riêng |
| **Cart** | ❌ **KHÔNG cần** | Logic đơn giản, gắn route |
| **Checkout** | ❌ **KHÔNG cần** | Flow phức tạp nhưng gắn route |
| **Order Success** | ❌ **KHÔNG cần** | Trang đơn giản |
| **Orders List** | ❌ **KHÔNG cần** | User orders, đơn giản |
| **Order Detail** | ❌ **KHÔNG cần** | 1 route – 1 UI |
| **User Profile** | ❌ **KHÔNG cần** | Cá nhân hóa, không reuse |
| **Edit Profile** | ❌ **KHÔNG cần** | Form đơn giản |
| **Change Password** | ❌ **KHÔNG cần** | Form đơn giản |
| **Login/Register** | ❌ **KHÔNG cần** | Auth pages, gắn route |

---

## 🎯 QUY TẮC CHỐT (NHỚ 4 DÒNG NÀY)

1. ✅ **Admin → gần như luôn dùng component**
2. ⚠️ **Public → chỉ tách khi cần reuse**
3. ❌ **Trang gắn chặt route → page**
4. ❌ **Trang nhỏ → không cần cầu kỳ**

---

## 📂 PHÂN LOẠI COMPONENTS

### **1. Admin Components** (`components/Admin/`)
- **Mục đích:** Components dùng cho admin pages
- **Đặc điểm:** CRUD, table, filter, modals
- **Ví dụ:** `AdminProducts.vue`, `AdminUsers.vue`, `AdminOrders.vue`
- **Quy tắc:** ✅ **BẮT BUỘC tách** cho tất cả admin modules

### **2. Public Components** (`components/Public/`)
- **Mục đích:** Components chỉ dùng ở public pages và user pages (không dùng ở admin)
- **Đặc điểm:** Banners, Cart, Checkout, ProductCard, CategoryTreeItem, ProductList, PostList
- **Ví dụ:** 
  - `Public/Banners/BannerSlider.vue` (dùng ở public + user pages)
  - `Public/Cart/CartItem.vue` (chỉ cart page)
  - `Public/Checkout/OrderSummary.vue` (chỉ checkout page)
  - `Public/Products/ProductCard.vue` (chỉ product list, home)
  - `Public/Products/ProductList.vue` (nếu reuse nhiều layout)
- **Quy tắc:** 📦 **Di chuyển từ các thư mục cũ** (Banners, Cart, Checkout, Products - nếu chỉ dùng public/user)

### **3. Common Components** (`components/Common/`)
- **Mục đích:** Components dùng chung giữa admin và public, **có ngữ nghĩa nghiệp vụ**
- **Đặc điểm:** Orders badges, UI components có nghiệp vụ (FeaturedPostsSlider, FeaturedProductsSlider), Shared components
- **Ví dụ:** 
  - `Common/Orders/Badges/OrderStatusBadge.vue` (dùng cả admin và public, có nghiệp vụ "order")
  - `Common/UI/FeaturedPostsSlider.vue` (có ngữ nghĩa "posts" → nghiệp vụ)
  - `Common/Shared/ProductDisplay.vue` (dùng nhiều nơi, có nghiệp vụ "product")
- **Quy tắc:** 📦 **Di chuyển từ các thư mục cũ** (Orders, UI có nghiệp vụ, User, Shared)
- **Phân biệt với Core:** Core = UI nguyên tử không biết nghiệp vụ, Common = UI có ngữ nghĩa nghiệp vụ

---

## 📋 BẢNG PHÂN LOẠI COMPONENTS (338-365)

| Component | Vị trí hiện tại | Vị trí mới | Lý do |
|-----------|----------------|------------|-------|
| **Banners/** | `components/Banners/` | `Public/Banners/` | ✅ Chỉ dùng ở public + user pages (không dùng admin) |
| **Cart/** | `components/Cart/` | `Public/Cart/` | ✅ Chỉ dùng ở public (cart page) |
| **Checkout/** | `components/Checkout/` | `Public/Checkout/` | ✅ Chỉ dùng ở public (checkout page) |
| **Orders/Badges/** | `components/Orders/` | `Common/Orders/Badges/` | ✅ Dùng cả admin (orders, payments) và public (orders) |
| **Products/ProductCard** | `components/Products/` | `Public/Products/` | ✅ Chỉ dùng ở public (product list, home) |
| **Products/CategoryTreeItem** | `components/Products/` | `Public/Products/` | ✅ Chỉ dùng ở public (product categories) |
| **Shared/ProductDisplay** | `components/Shared/` | `Common/Shared/` | ✅ Dùng nhiều nơi, có thể cả admin và public |
| **UI/** | `components/UI/` | `Common/UI/` | ✅ UI components dùng chung toàn hệ thống |
| **User/** | `components/User/` | `Common/User/` | ✅ Có thể dùng cả admin và public |

### **4. Core Components** (`components/Core/`)
- **Mục đích:** System components, base components dùng toàn hệ thống, **KHÔNG biết nghiệp vụ**
- **Đặc điểm:** Table, Modal, Form, Filter, Select, Upload, Loading - UI nguyên tử, không có ngữ nghĩa nghiệp vụ
- **Ví dụ:** 
  - `Core/Table/DataTable.vue` (table generic, không biết "order" hay "product")
  - `Core/Modal/ConfirmModal.vue` (modal generic)
  - `Core/Form/FormField.vue` (form field generic)
- **Quy tắc:** 🔧 **GIỮ NGUYÊN** - không di chuyển, đây là system components
- **Phân biệt với Common:** Core = UI nguyên tử, Common = UI có ngữ nghĩa nghiệp vụ

### **5. Layout Components** (`components/Layout/`)
- **Mục đích:** Layout components (Header, Footer, Sidebar)
- **Đặc điểm:** Dùng trong layouts
- **Ví dụ:** `Layout/Header/HeaderBar.vue`, `Layout/Footer/SystemFooter.vue`
- **Quy tắc:** 🏗️ **GIỮ NGUYÊN** - không di chuyển

---

## 📁 CẤU TRÚC THƯ MỤC ĐỀ XUẤT

```
components/
├── Admin/                          # Admin components (bắt buộc tách)
│   │                               # ⚠️ Khi project lớn (50+ modules), có thể thêm features/
│   │                               # Admin/features/products/, Admin/features/users/, etc.
│   │
│   ├── Products/                   # ✅ BẮT BUỘC
│   │   ├── AdminProducts.vue
│   │   ├── ProductsTable.vue
│   │   └── ProductsModals/
│   │
│   ├── Users/                      # ✅ BẮT BUỘC
│   │   ├── AdminUsers.vue
│   │   ├── UsersTable.vue
│   │   └── UsersModals/
│   │
│   ├── Orders/                     # ✅ BẮT BUỘC
│   │   ├── AdminOrders.vue
│   │   ├── OrdersTable.vue
│   │   └── OrdersModals/
│   │
│   ├── Payments/                   # ✅ BẮT BUỘC
│   │   ├── AdminPayments.vue
│   │   └── PaymentsTable.vue
│   │
│   ├── Dashboard/                  # ⚠️ NÊN
│   │   └── AdminDashboard.vue
│   │
│   ├── ProductCategories/         # ✅ BẮT BUỘC
│   │   ├── AdminProductCategories.vue
│   │   └── CategoryTree.vue
│   │
│   ├── ProductAttributes/          # ✅ BẮT BUỘC
│   │   ├── AdminProductAttributes.vue
│   │   └── AttributesTable.vue
│   │
│   ├── ProductAttributeValues/     # ✅ BẮT BUỘC
│   │   ├── AdminProductAttributeValues.vue
│   │   └── AttributeValuesTable.vue
│   │
│   ├── ProductVariants/            # ✅ BẮT BUỘC
│   │   ├── AdminProductVariants.vue
│   │   └── VariantsTable.vue
│   │
│   ├── Posts/                      # ✅ BẮT BUỘC
│   │   ├── AdminPosts.vue
│   │   └── PostsTable.vue
│   │
│   ├── PostCategories/             # ✅ BẮT BUỘC
│   │   ├── AdminPostCategories.vue
│   │   └── PostCategoriesTable.vue
│   │
│   ├── PostTags/                   # ✅ BẮT BUỘC
│   │   ├── AdminPostTags.vue
│   │   └── PostTagsTable.vue
│   │
│   ├── Banners/                     # ✅ BẮT BUỘC
│   │   ├── AdminBanners.vue
│   │   └── BannersTable.vue
│   │
│   ├── BannerLocations/             # ✅ BẮT BUỘC
│   │   ├── AdminBannerLocations.vue
│   │   └── BannerLocationsTable.vue
│   │
│   ├── Coupons/                     # ✅ BẮT BUỘC
│   │   ├── AdminCoupons.vue
│   │   └── CouponsTable.vue
│   │
│   ├── Menus/                       # ✅ BẮT BUỘC
│   │   ├── AdminMenus.vue
│   │   └── MenusTree.vue
│   │
│   ├── Warehouses/                  # ✅ BẮT BUỘC
│   │   ├── AdminWarehouses.vue
│   │   ├── WarehouseInventory.vue
│   │   └── StockTransfers.vue
│   │
│   ├── ShippingMethods/             # ✅ BẮT BUỘC
│   │   ├── AdminShippingMethods.vue
│   │   └── ShippingMethodsTable.vue
│   │
│   ├── PaymentMethods/              # ✅ BẮT BUỘC
│   │   ├── AdminPaymentMethods.vue
│   │   └── PaymentMethodsTable.vue
│   │
│   ├── Groups/                      # ✅ BẮT BUỘC
│   │   ├── AdminGroups.vue
│   │   ├── GroupMembers.vue
│   │   └── GroupRoles.vue
│   │
│   ├── Roles/                       # ✅ BẮT BUỘC
│   │   ├── AdminRoles.vue
│   │   └── RolePermissions.vue
│   │
│   ├── Permissions/                 # ✅ BẮT BUỘC
│   │   ├── AdminPermissions.vue
│   │   └── PermissionsTable.vue
│   │
│   ├── Contacts/                     # ✅ BẮT BUỘC
│   │   ├── AdminContacts.vue
│   │   ├── ContactView.vue
│   │   └── ContactReply.vue
│   │
│   ├── SystemConfigs/               # ⚠️ NÊN
│   │   ├── GeneralSettings.vue
│   │   └── EmailSettings.vue
│   │
│   ├── Contexts/                    # ⚠️ NÊN
│   │   └── AdminContexts.vue
│   │
│   ├── Filter/                      # Shared admin filters
│   │   ├── AdminFilter.vue
│   │   └── BaseFilter.vue
│   │
│   └── components/                 # Shared admin sub-components
│       └── orders/
│           └── OrderItem.vue
│
├── Public/                         # Public components (chỉ dùng ở public + user)
│   ├── Banners/                     # ✅ PUBLIC - Dùng ở public (home, product pages) và user pages
│   │   ├── BannerSlider.vue
│   │   ├── BannerGrid.vue
│   │   ├── SimpleBanner.vue
│   │   └── SidebarBanner.vue
│   │
│   ├── Products/
│   │   ├── ProductList.vue         # Nếu reuse nhiều layout
│   │   ├── ProductCard.vue         # ✅ PUBLIC - Chỉ dùng ở public (product list, home)
│   │   └── CategoryTreeItem.vue    # ✅ PUBLIC - Chỉ dùng ở public (product categories)
│   │
│   ├── Cart/                       # ✅ PUBLIC - Chỉ dùng ở public (cart page)
│   │   └── CartItem.vue
│   │
│   ├── Checkout/                   # ✅ PUBLIC - Chỉ dùng ở public (checkout page)
│   │   ├── CheckoutAddress.vue
│   │   ├── CheckoutProgress.vue
│   │   ├── OrderSummary.vue
│   │   ├── PaymentMethodSelector.vue
│   │   └── ShippingMethodSelector.vue
│   │
│   ├── Posts/
│   │   └── PostList.vue            # Nếu reuse nhiều layout
│   │
│   └── Home/                       # Di chuyển từ Home/ nếu cần
│       ├── ProductSlider.vue
│       ├── CategorySlider.vue
│       └── NewsSection.vue
│
├── Common/                         # Shared components dùng chung giữa admin và public
│   ├── Orders/                     # ✅ COMMON - Badges dùng ở cả admin và public
│   │   └── Badges/
│   │       ├── OrderStatusBadge.vue      # Dùng: admin/orders, home/orders
│   │       ├── PaymentStatusBadge.vue     # Dùng: admin/orders, admin/payments, home/orders
│   │       └── ShippingStatusBadge.vue    # Dùng: admin/orders, home/orders
│   │
│   ├── Shared/                     # ✅ COMMON - Dùng nhiều nơi
│   │   └── ProductDisplay.vue
│   │
│   ├── UI/                         # ✅ COMMON - UI components có ngữ nghĩa nghiệp vụ
│   │   ├── BaseSlider.vue          # Base component (có thể vào Core nếu không có nghiệp vụ)
│   │   ├── FeaturedPostsSlider.vue  # Có ngữ nghĩa "posts" → Common
│   │   ├── FeaturedProductsSlider.vue  # Có ngữ nghĩa "products" → Common
│   │   └── Skeleton/
│   │       ├── BannerSkeleton.vue
│   │       ├── PostCardSkeleton.vue
│   │       └── ProductCardSkeleton.vue
│   │
│   └── User/                       # ✅ COMMON - Có thể dùng cả admin và public
│       └── UserCard.vue
│
├── Core/                           # Core system components (GIỮ NGUYÊN - đã có)
│   ├── Actions/
│   │   └── Actions.vue
│   ├── Badges/
│   │   └── StatusBadge.vue
│   ├── Content/
│   │   ├── CKEditor.vue
│   │   ├── HtmlContent.vue
│   │   └── SimpleEditor.vue
│   ├── Context/
│   │   └── ContextSwitcher.vue
│   ├── Feedback/
│   │   └── ToastContainer.vue
│   ├── Filter/
│   │   ├── DateRangeFilter.vue
│   │   ├── MultiSelectFilter.vue
│   │   ├── SelectFilter.vue
│   │   └── TextFilter.vue
│   ├── Form/
│   │   ├── FormField.vue
│   │   └── FormWrapper.vue
│   ├── Image/
│   │   ├── ImageUploader.vue
│   │   └── OptimizedImage.vue
│   ├── Loading/
│   │   ├── LoadingSpinner.vue
│   │   └── SkeletonLoader.vue
│   ├── Modal/
│   │   ├── ConfirmModal.vue
│   │   └── Modal.vue
│   ├── Navigation/
│   │   └── Pagination.vue
│   ├── Select/
│   │   ├── DropdownPortal.vue
│   │   ├── MultipleSelect.vue
│   │   ├── MultipleSelectEnhanced.vue
│   │   ├── SearchableMultiSelect.vue
│   │   ├── SearchableSelect.vue
│   │   ├── SingleSelect.vue
│   │   └── SingleSelectEnhanced.vue
│   ├── Table/
│   │   └── DataTable.vue
│   └── Upload/
│       └── Upload.vue
│
├── Layout/                         # Layout components (GIỮ NGUYÊN)
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── ...
│
└── ...                             # Các components khác
```

---

## 🔧 CHUẨN HÓA ADMIN COMPONENTS

### 1️⃣ **AdminProducts.vue** - Template chuẩn

```vue
<template>
  <div class="admin-products">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <button 
        @click="openCreateModal" 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {{ createButtonText }}
      </button>
    </div>

    <!-- Filter -->
    <ProductsFilter
      :initial-filters="filters"
      :status-enums="statusEnums"
      :category-enums="categoryEnums"
      @update:filters="handleFilterUpdate"
    />

    <!-- Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <SkeletonLoader v-if="loading" type="table" :rows="5" :columns="7" />
      <ProductsTable
        v-else
        :items="items"
        :get-serial-number="getSerialNumber"
        @edit="openEditModal"
        @delete="confirmDelete"
        @restore="restoreProduct"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="hasData"
      :current-page="pagination.page"
      :total-pages="pagination.totalPages"
      :total-items="pagination.totalItems"
      :loading="loading"
      @page-change="handlePageChange"
    />

    <!-- Modals -->
    <CreateProduct
      v-if="modals.create"
      :show="modals.create"
      @close="closeCreateModal"
      @created="handleProductCreated"
    />
    <!-- ... other modals -->
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  title?: string
  createButtonText?: string
  // ... other props
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quản lý sản phẩm',
  createButtonText: 'Thêm sản phẩm mới'
})

// Emits
const emit = defineEmits<{
  created: [product: any]
  updated: [product: any]
  deleted: [id: string | number]
}>()

// Logic (tách từ page)
// ...
</script>
```

### 2️⃣ **Cấu trúc Page sau khi refactor**

```vue
<!-- pages/admin/products/index.vue -->
<template>
  <AdminProducts />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin-layout',
  requiresAuth: true,
  requiresAdmin: true
})

import AdminProducts from '@/components/Admin/Products/AdminProducts.vue'
</script>
```

### 3️⃣ **Nếu có nhiều context (System vs Shop)**

```vue
<!-- pages/system/products.vue -->
<template>
  <AdminProducts context="system" />
</template>

<!-- pages/context/.../products.vue -->
<template>
  <AdminProducts context="shop" :shop-id="route.params.shopId" />
</template>
```

---

## 📝 CHECKLIST CHUẨN HÓA

### ✅ **Bước 1: Tạo Component Structure**

- [ ] Tạo thư mục `components/Admin/Products/`
- [ ] Tạo `AdminProducts.vue` (component chính)
- [ ] Di chuyển logic từ `pages/admin/products/index.vue` vào component
- [ ] Tách modals vào `ProductsModals/` (nếu cần)
- [ ] Tách table vào `ProductsTable.vue` (nếu phức tạp)

### ✅ **Bước 2: Refactor Page**

- [ ] Cập nhật `pages/admin/products/index.vue` để chỉ import component
- [ ] Đảm bảo page meta vẫn hoạt động
- [ ] Test routing và navigation

### ✅ **Bước 3: Áp dụng cho các module khác**

- [ ] **Users**: `components/Admin/Users/AdminUsers.vue`
- [ ] **Orders**: `components/Admin/Orders/AdminOrders.vue`
- [ ] **Dashboard**: `components/Admin/Dashboard/AdminDashboard.vue`
- [ ] Các module admin khác (banners, posts, categories, ...)

### ✅ **Bước 4: Tổ chức lại Components hiện có**

- [ ] Tạo thư mục `components/Public/` cho public components
- [ ] Tạo thư mục `components/Common/` cho shared components
- [ ] Di chuyển components từ `Banners/`, `Cart/`, `Checkout/`, `Orders/`, `UI/`, `User/` vào `Common/`
- [ ] Di chuyển `Products/ProductCard.vue` vào `Public/Products/` hoặc `Common/Products/`
- [ ] Di chuyển `Home/` components vào `Public/Home/` nếu cần
- [ ] Giữ nguyên `Core/` và `Layout/` (không di chuyển)

### ✅ **Bước 5: Public Components (tùy chọn)**

- [ ] Đánh giá từng public page có cần tách không
- [ ] Chỉ tách khi thực sự cần reuse
- [ ] Giữ nguyên page nếu không cần reuse
- [ ] Nếu tách, đặt vào `components/Public/`

---

## 🎨 NAMING CONVENTIONS

### **Admin Components**

```
Admin{ModuleName}.vue          # Component chính
{ModuleName}Table.vue          # Table component (nếu tách)
{ModuleName}Filter.vue         # Filter component (nếu tách)
{ModuleName}Modals/            # Thư mục modals
  ├── Create{ModuleName}.vue
  ├── Edit{ModuleName}.vue
  └── Delete{ModuleName}.vue
```

**Ví dụ:**
- `AdminProducts.vue`
- `ProductsTable.vue`
- `ProductsFilter.vue`
- `ProductsModals/CreateProduct.vue`

### **Public Components**

```
Public/{ModuleName}/{ComponentName}.vue
```

**Ví dụ:**
- `Public/Products/ProductList.vue` (nếu reuse)
- `Public/Products/ProductCard.vue`
- `Public/Posts/PostList.vue` (nếu reuse)

### **Common Components (Shared)**

```
Common/{ModuleName}/{ComponentName}.vue
```

**Ví dụ:**
- `Common/Banners/BannerSlider.vue`
- `Common/Cart/CartItem.vue`
- `Common/Checkout/OrderSummary.vue`
- `Common/Orders/Badges/OrderStatusBadge.vue`
- `Common/UI/BaseSlider.vue`

### **Core Components (System)**

```
Core/{Category}/{ComponentName}.vue
```

**Ví dụ:**
- `Core/Table/DataTable.vue`
- `Core/Modal/ConfirmModal.vue`
- `Core/Filter/TextFilter.vue`
- `Core/Form/FormField.vue`

---

## 🔄 MIGRATION PLAN CHI TIẾT

### **🔥 Phase 1: Core Business Modules (Ưu tiên CAO - Bắt đầu ngay)**

**Mục tiêu:** Tạo pattern chuẩn cho các module quan trọng nhất

1. ✅ **Products** (`pages/admin/products/index.vue`)
   - Tạo `components/Admin/Products/AdminProducts.vue`
   - Di chuyển toàn bộ logic CRUD
   - Tách modals, table, filter
   - Test kỹ: CRUD, filter, pagination, status, featured

2. ✅ **Users** (`pages/admin/users/index.vue`)
   - Tạo `components/Admin/Users/AdminUsers.vue`
   - Di chuyển logic + modals (create, edit, change password, assign role)
   - Test: CRUD, roles, password management

3. ✅ **Orders** (`pages/admin/orders/index.vue`)
   - Tạo `components/Admin/Orders/AdminOrders.vue`
   - Di chuyển logic + status management
   - Test: CRUD, status update, export

4. ✅ **Payments** (`pages/admin/payments/index.vue`)
   - Tạo `components/Admin/Payments/AdminPayments.vue`
   - Di chuyển logic + status management
   - Test: list, view, status update

**Kết quả mong đợi:** 4 module core hoàn thành, pattern chuẩn được xác lập

---

### **⚡ Phase 2: Product Management Sub-modules (Ưu tiên TRUNG)**

**Mục tiêu:** Hoàn thiện hệ thống quản lý sản phẩm

5. ✅ **Product Categories** (`pages/admin/product-categories/index.vue`)
   - Tạo `components/Admin/ProductCategories/AdminProductCategories.vue`
   - Xử lý tree structure
   - Test: CRUD, tree operations

6. ✅ **Product Attributes** (`pages/admin/product-attributes/index.vue`)
   - Tạo `components/Admin/ProductAttributes/AdminProductAttributes.vue`
   - Test: CRUD, filter

7. ✅ **Product Attribute Values** (`pages/admin/product-attribute-values/index.vue`)
   - Tạo `components/Admin/ProductAttributeValues/AdminProductAttributeValues.vue`
   - Test: CRUD, filter

8. ✅ **Product Variants** (`pages/admin/product-variants/index.vue`)
   - Tạo `components/Admin/ProductVariants/AdminProductVariants.vue`
   - Test: CRUD, filter, variants management

---

### **⚡ Phase 3: Content Management (Ưu tiên TRUNG)**

**Mục tiêu:** Hoàn thiện hệ thống quản lý nội dung

9. ✅ **Posts** (`pages/admin/posts/index.vue`)
   - Tạo `components/Admin/Posts/AdminPosts.vue`
   - Test: CRUD, filter, status, categories

10. ✅ **Post Categories** (`pages/admin/post-categories/index.vue`)
    - Tạo `components/Admin/PostCategories/AdminPostCategories.vue`
    - Test: CRUD, filter

11. ✅ **Post Tags** (`pages/admin/post-tags/index.vue`)
    - Tạo `components/Admin/PostTags/AdminPostTags.vue`
    - Test: CRUD, filter

---

### **⚡ Phase 4: Marketing & Display (Ưu tiên TRUNG)**

**Mục tiêu:** Hoàn thiện hệ thống marketing

12. ✅ **Banners** (`pages/admin/banners/index.vue`)
    - Tạo `components/Admin/Banners/AdminBanners.vue`
    - Test: CRUD, filter, locations, images

13. ✅ **Banner Locations** (`pages/admin/banner-locations/index.vue`)
    - Tạo `components/Admin/BannerLocations/AdminBannerLocations.vue`
    - Test: CRUD, filter

14. ✅ **Coupons** (`pages/admin/coupons/index.vue`)
    - Tạo `components/Admin/Coupons/AdminCoupons.vue`
    - Test: CRUD, filter, validation

---

### **⚡ Phase 5: Inventory & Logistics (Ưu tiên TRUNG)**

**Mục tiêu:** Hoàn thiện hệ thống kho và logistics

15. ✅ **Warehouses** (`pages/admin/warehouses/index.vue`)
    - Tạo `components/Admin/Warehouses/AdminWarehouses.vue`
    - Test: CRUD, filter

16. ✅ **Warehouse Inventory** (`pages/admin/warehouses/inventory.vue`)
    - Tạo `components/Admin/Warehouses/WarehouseInventory.vue`
    - Test: View inventory, update stock

17. ✅ **Stock Transfers** (`pages/admin/warehouses/transfers/index.vue`)
    - Tạo `components/Admin/Warehouses/StockTransfers.vue`
    - Test: List transfers, manage transfers

18. ✅ **Shipping Methods** (`pages/admin/shipping-methods/index.vue`)
    - Tạo `components/Admin/ShippingMethods/AdminShippingMethods.vue`
    - Test: CRUD, filter

19. ✅ **Payment Methods** (`pages/admin/payment-methods/index.vue`)
    - Tạo `components/Admin/PaymentMethods/AdminPaymentMethods.vue`
    - Test: CRUD, filter

---

### **⚡ Phase 6: User & Permission Management (Ưu tiên TRUNG)**

**Mục tiêu:** Hoàn thiện hệ thống phân quyền

20. ✅ **Groups** (`pages/admin/groups/index.vue`)
    - Tạo `components/Admin/Groups/AdminGroups.vue`
    - Tạo `components/Admin/Groups/GroupMembers.vue`
    - Test: CRUD, members, roles

21. ✅ **Roles** (`pages/admin/roles/index.vue`)
    - Tạo `components/Admin/Roles/AdminRoles.vue`
    - Tạo `components/Admin/Roles/RolePermissions.vue`
    - Test: CRUD, permissions assignment

22. ✅ **Permissions** (`pages/admin/permissions/index.vue`)
    - Tạo `components/Admin/Permissions/AdminPermissions.vue`
    - Test: CRUD, filter

---

### **💡 Phase 7: System & Configuration (Ưu tiên THẤP)**

**Mục tiêu:** Hoàn thiện cấu hình hệ thống

23. ⚠️ **Dashboard** (`pages/admin/index.vue`)
    - Tạo `components/Admin/Dashboard/AdminDashboard.vue`
    - Test: Stats, charts, overview

24. ✅ **Menus** (`pages/admin/menus/index.vue`)
    - Tạo `components/Admin/Menus/AdminMenus.vue`
    - Test: CRUD, tree structure

25. ✅ **Contacts** (`pages/admin/contacts/index.vue`)
    - Tạo `components/Admin/Contacts/AdminContacts.vue`
    - Tạo `components/Admin/Contacts/ContactView.vue`
    - Tạo `components/Admin/Contacts/ContactReply.vue`
    - Test: List, view, reply, notes

26. ⚠️ **System Configs** (`pages/admin/system-configs/`)
    - Tạo `components/Admin/SystemConfigs/GeneralSettings.vue`
    - Tạo `components/Admin/SystemConfigs/EmailSettings.vue`
    - Test: Settings update

27. ⚠️ **Contexts** (`pages/admin/contexts/index.vue`)
    - Tạo `components/Admin/Contexts/AdminContexts.vue`
    - Test: Multi-tenant management

---

### **📁 Phase 8: Tổ chức lại Components hiện có (Ưu tiên TRUNG)**

**Mục tiêu:** Chuẩn hóa cấu trúc components hiện có

28. 📁 **Tạo cấu trúc mới**
    - Tạo `components/Public/` cho public components
    - Tạo `components/Common/` cho shared components
    - Giữ nguyên `components/Core/` và `components/Layout/`

29. 📦 **Di chuyển Common Components** (dùng chung admin + public)
    - `Orders/` → `Common/Orders/` ✅ (badges dùng cả admin và public)
    - `UI/` → `Common/UI/` ✅ (UI components dùng chung)
    - `User/` → `Common/User/` ✅ (có thể dùng cả admin và public)
    - `Shared/` → `Common/Shared/` ✅ (dùng nhiều nơi)

30. 📦 **Di chuyển Public Components** (chỉ dùng ở public + user)
    - `Banners/` → `Public/Banners/` ✅ (dùng ở public + user pages)
    - `Cart/` → `Public/Cart/` ✅ (chỉ cart page)
    - `Checkout/` → `Public/Checkout/` ✅ (chỉ checkout page)
    - `Products/ProductCard.vue` → `Public/Products/ProductCard.vue` ✅ (chỉ product list, home)
    - `Products/CategoryTreeItem.vue` → `Public/Products/CategoryTreeItem.vue` ✅ (chỉ public)
    - `Home/` → `Public/Home/` (nếu cần tách)

31. ✅ **Cập nhật imports**
    - Tìm và thay thế tất cả imports cũ
    - Đảm bảo không break existing features
    - Test kỹ sau khi di chuyển

### **🌐 Phase 9: Public Components (Tùy chọn - Chỉ khi cần)**

**Mục tiêu:** Tối ưu public pages nếu cần reuse

32. ⚠️ **Product List** (`pages/home/products/index.vue`)
    - Chỉ tách nếu reuse nhiều layout
    - Đánh giá: `/home/products`, `/category/[slug]`, etc.
    - Nếu tách → `Public/Products/ProductList.vue`

33. ⚠️ **Post List** (`pages/home/posts/index.vue`)
    - Chỉ tách nếu reuse nhiều layout
    - Đánh giá: `/home/posts`, `/home/posts/category/[slug]`, `/home/posts/tag/[slug]`
    - Nếu tách → `Public/Posts/PostList.vue`

34. ❌ **Các trang còn lại**
    - Home, Product Detail, Post Detail, Cart, Checkout, Orders, Profile
    - **Giữ nguyên trong page** - không cần tách

---

## 📊 TỔNG KẾT MIGRATION

| Phase | Modules | Trạng thái | Ưu tiên |
|-------|---------|------------|---------|
| **Phase 1** | 4 modules (Products, Users, Orders, Payments) | 🔥 Bắt đầu ngay | Cao |
| **Phase 2** | 4 modules (Product sub-modules) | ⚡ Sau Phase 1 | Trung |
| **Phase 3** | 3 modules (Posts, Categories, Tags) | ⚡ Sau Phase 2 | Trung |
| **Phase 4** | 3 modules (Banners, Coupons) | ⚡ Sau Phase 3 | Trung |
| **Phase 5** | 5 modules (Warehouses, Shipping, Payment) | ⚡ Sau Phase 4 | Trung |
| **Phase 6** | 3 modules (Groups, Roles, Permissions) | ⚡ Sau Phase 5 | Trung |
| **Phase 7** | 5 modules (Dashboard, Menus, Contacts, Configs, Contexts) | 💡 Cuối cùng | Thấp |
| **Phase 8** | Tổ chức lại components hiện có | ⚡ Sau Phase 7 | Trung |
| **Phase 9** | 2 modules (Public - tùy chọn) | ⚠️ Nếu cần | Tùy chọn |

**Tổng cộng: ~29 admin modules cần refactor + Tổ chức lại components hiện có**

---

## 💡 BEST PRACTICES

### **1. Component Props**

```typescript
// ✅ Tốt: Props rõ ràng, có type
interface AdminProductsProps {
  title?: string
  context?: 'system' | 'shop'
  shopId?: string | number
  initialFilters?: Record<string, any>
}

// ❌ Tránh: Props quá nhiều hoặc không rõ ràng
```

### **2. Component Events**

```typescript
// ✅ Tốt: Events có type
const emit = defineEmits<{
  created: [product: Product]
  updated: [product: Product]
  deleted: [id: string | number]
  filter-changed: [filters: Record<string, any>]
}>()

// ❌ Tránh: Events không có type
```

### **3. Composables**

```typescript
// ✅ Tốt: Tách logic vào composables
// composables/admin/useAdminProducts.ts
export function useAdminProducts() {
  // Logic quản lý products
  return {
    items,
    loading,
    pagination,
    // ...
  }
}

// Component chỉ handle UI
```

### **4. Error Handling**

```vue
<!-- ✅ Tốt: Có error state -->
<template>
  <div v-if="error" class="error-message">
    {{ error }}
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### **5. Loading States**

```vue
<!-- ✅ Tốt: Skeleton loader -->
<SkeletonLoader v-if="loading" type="table" :rows="5" />
<ProductsTable v-else :items="items" />
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU

### **Trước (Page có quá nhiều logic)**

```vue
<!-- pages/admin/products/index.vue -->
<template>
  <!-- 400+ lines of template -->
</template>

<script setup>
// 300+ lines of logic
// Khó maintain
// Khó reuse
</script>
```

### **Sau (Page đơn giản, Component tách biệt)**

```vue
<!-- pages/admin/products/index.vue -->
<template>
  <AdminProducts />
</template>

<script setup>
import AdminProducts from '@/components/Admin/Products/AdminProducts.vue'
</script>
```

```vue
<!-- components/Admin/Products/AdminProducts.vue -->
<template>
  <!-- Logic được tổ chức tốt -->
</template>

<script setup>
// Logic được tách vào composables
// Dễ maintain
// Dễ reuse
</script>
```

---

## 🚀 LỢI ÍCH

### **1. Reusability**
- Component có thể dùng ở nhiều context (system, shop)
- Dễ dàng tạo variations

### **2. Maintainability**
- Logic tập trung một chỗ
- Dễ test và debug
- Dễ refactor

### **3. Consistency**
- Tất cả admin pages có cấu trúc giống nhau
- Dễ onboard developer mới

### **4. Performance**
- Component có thể lazy load
- Code splitting tốt hơn

---

## ⚠️ LƯU Ý

1. **Không over-engineering**
   - Chỉ tách khi thực sự cần
   - Public pages đơn giản không cần tách

2. **Giữ page meta trong page**
   - `definePageMeta()` vẫn ở trong page
   - Component chỉ handle UI và logic

3. **SEO cho public pages**
   - Public pages vẫn cần SEO
   - Component không ảnh hưởng SEO

4. **Testing**
   - Test kỹ sau mỗi refactor
   - Đảm bảo không break existing features

---

## 📚 TÀI LIỆU THAM KHẢO

- [Nuxt 3 Components](https://nuxt.com/docs/guide/directory-structure/components)
- [Vue 3 Component Best Practices](https://vuejs.org/guide/best-practices/performance.html)
- [Component Architecture Patterns](https://www.patterns.dev/posts/vue-patterns/)

---

## ✅ CHECKLIST TỔNG QUAN

### **Phase 1: Core Business (4 modules)**
- [x] Products ✅
- [x] Users ✅
- [x] Orders ✅
- [x] Payments ✅

### **Phase 2: Product Management (4 modules)**
- [x] Product Categories ✅
- [x] Product Attributes ✅
- [x] Product Attribute Values ✅
- [x] Product Variants ✅

### **Phase 3: Content Management (3 modules)**
- [x] Posts ✅
- [x] Post Categories ✅
- [x] Post Tags ✅

### **Phase 4: Marketing (3 modules)**
- [x] Banners ✅
- [x] Banner Locations ✅
- [x] Coupons ✅

### **Phase 5: Inventory & Logistics (5 modules)**
- [x] Warehouses ✅
- [x] Warehouse Inventory ✅ (giữ nguyên page vì đơn giản)
- [x] Stock Transfers ✅
- [x] Shipping Methods ✅
- [x] Payment Methods ✅

### **Phase 6: User & Permission (3 modules)**
- [x] Groups ✅
- [x] Roles ✅
- [x] Permissions ✅

### **Phase 7: System & Config (5 modules)**
- [x] Dashboard ✅ (giữ nguyên page - đặc biệt)
- [x] Menus ✅
- [x] Contacts ✅ (giữ nguyên page - phức tạp với nhiều modals)
- [x] System Configs ✅ (giữ nguyên pages - config đặc biệt)
- [x] Contexts ✅ (giữ nguyên page - đặc biệt)

### **Phase 8: Tổ chức lại Components**
- [x] Tạo `components/Public/` ✅
- [x] Tạo `components/Common/` ✅
- [x] Di chuyển Banners, Cart, Checkout, Orders, UI, User, Shared ✅
- [x] Di chuyển Products components ✅
- [x] Cập nhật tất cả imports ✅

### **Phase 9: Public (Tùy chọn)**
- [ ] Product List (nếu cần)
- [ ] Post List (nếu cần)

---

## ✅ CHECKLIST TỰ KIỂM SOÁT (RẤT QUAN TRỌNG)

**Mỗi khi tạo component mới, hỏi 5 câu này:**

### **❓ Câu 1: Có CRUD / nghiệp vụ không?**
- ✅ **Có** → Admin / Public feature
- ❌ **Không** → Tiếp câu 2

### **❓ Câu 2: Có dùng cả admin & public không?**
- ✅ **Có** → `Common/` (nếu có ngữ nghĩa nghiệp vụ)
- ❌ **Không** → Tiếp câu 3

### **❓ Câu 3: Chỉ là UI nguyên tử (button, table, modal) không?**
- ✅ **Có** → `Core/` (không biết nghiệp vụ)
- ❌ **Không** → Tiếp câu 4

### **❓ Câu 4: Có phụ thuộc route cụ thể không?**
- ✅ **Có** → Giữ trong `Page` (không cần component)
- ❌ **Không** → Tiếp câu 5

### **❓ Câu 5: Có thể reuse ở module khác không?**
- ✅ **Có** → Tách component
- ❌ **Không** → Giữ trong page

---

## 📊 BẢNG QUYẾT ĐỊNH NHANH

| Component | Nên ở | Ví dụ |
|-----------|-------|-------|
| **DataTable.vue** | `Core/` | UI nguyên tử, không biết nghiệp vụ |
| **OrderStatusBadge.vue** | `Common/` | Có ngữ nghĩa "order", dùng cả admin & public |
| **ProductCard.vue** | `Public/` | Chỉ dùng ở public |
| **AdminOrders.vue** | `Admin/` | CRUD nghiệp vụ admin |
| **FeaturedPostsSlider.vue** | `Common/` | Có ngữ nghĩa "posts", dùng chung |
| **BaseSlider.vue** | `Core/` hoặc `Common/` | Nếu không có nghiệp vụ → Core, nếu có → Common |

---

## ✅ KẾT LUẬN

### **✅ Đã sửa các vấn đề:**

1. ✅ **Xóa Public bị lặp** - Chỉ còn 1 folder `Public/`
2. ✅ **Làm rõ ranh giới Core vs Common**
   - Core = UI nguyên tử, KHÔNG biết nghiệp vụ
   - Common = UI có ngữ nghĩa nghiệp vụ, dùng chung admin & public
3. ✅ **Chuẩn bị phân tầng Admin** - Ghi chú về `features/` khi project lớn (50+ modules)

### **✅ Kiến trúc hiện tại:**

1. ✅ Admin pages có logic phức tạp, cần tách component
2. ✅ Có thể reuse ở nhiều context
3. ✅ Dễ maintain và test
4. ✅ Public pages giữ đơn giản, không over-engineering
5. ✅ Ranh giới Core/Common/Public/Admin rõ ràng

### **🚀 Bắt đầu:**

**Phase 1 (Products, Users, Orders, Payments)** để tạo pattern chuẩn, sau đó áp dụng cho các module khác.

**Tổng cộng: ~29 admin modules cần refactor theo 9 phases.**

