# Group-Based Permissions - API Guide cho Frontend

Tài liệu đơn giản về các API cần sử dụng trong hệ thống phân quyền Group-based.

**⚠️ QUAN TRỌNG:** Hệ thống sử dụng **Group-based permissions** - User có roles trong Groups, không phải trong Contexts.

---

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Flow đơn giản - Chỉ 1 API call](#flow-đơn-giản)
3. [Danh sách API](#danh-sách-api)
4. [Breaking Changes](#breaking-changes)
5. [Checklist Migration](#checklist-migration)

---

## 🎯 Tổng quan {#tổng-quan}

### Hiểu rõ Group vs Context

**Group (Nhóm - Scope thực thi quyền):**
- ✅ Là **scope duy nhất** để gán và kiểm tra quyền
- ✅ User có roles **trong group**, không phải trong context
- ✅ Ví dụ: "SYSTEM_ADMIN", "shop-001", "shop-managers"
- ✅ Mỗi group thuộc về **một context** (context_id)

**Context (Ngữ cảnh - Phạm vi lớn):**
- ⚠️ Là **cấu trúc cha** để tổ chức các groups
- ⚠️ Ví dụ: "System", "Shop Trung Tâm", "Shop Quận 1"
- ⚠️ **KHÔNG PHẢI** scope thực thi quyền (chỉ để tổ chức)
- ⚠️ Một context có thể có **nhiều groups**

**Mối quan hệ:**
```
Context (System)
  └── Group (SYSTEM_ADMIN) ← User có role "system_admin" ở đây

Context (Shop Trung Tâm)
  ├── Group (shop-001) ← User có role "admin" ở đây
  └── Group (shop-managers) ← User có role "manager" ở đây
```

**Cấu trúc Roles trong 1 Group:**

Trong 1 group có **nhiều vai trò (roles)** để phân cho các tài khoản khác nhau.

**Ví dụ: Group "shop-001" (Shop Trung Tâm)**

```
Group: shop-001
├── Roles trong group:
│   ├── "admin" (Administrator) - Quản lý toàn bộ shop
│   ├── "manager" (Manager) - Quản lý hàng hóa, đơn hàng
│   ├── "staff" (Staff) - Nhân viên bán hàng
│   └── "viewer" (Viewer) - Chỉ xem
│
└── Users và roles của họ:
    ├── User A → có role "admin"
    ├── User B → có roles ["manager", "staff"]
    ├── User C → có role "staff"
    └── User D → có role "viewer"
```

**Điểm quan trọng:**
1. ✅ **1 Group có nhiều Roles** (admin, manager, staff, viewer...)
2. ✅ **1 User có thể có nhiều Roles trong cùng 1 Group** (User B có cả manager và staff)
3. ✅ **Nhiều Users có thể có cùng 1 Role** (User B và User C đều có role staff)
4. ✅ **Roles chỉ có hiệu lực trong Group đó** (role admin trong group A ≠ role admin trong group B)

---

## ⚡ Flow đơn giản - Chỉ 1 API call {#flow-đơn-giản}

### ✅ Flow khuyến nghị (Đơn giản nhất)

**Chỉ cần 1 API call để lấy tất cả groups:**

```
1. GET /api/user/my-groups
   → Trả về tất cả groups user có thể truy cập, kèm context info và roles
   → Hiển thị dropdown groups ngay từ đầu

2. User chọn group từ dropdown → Lưu group_id vào localStorage

3. Gửi X-Group-Id trong mọi request
   → Permissions được check dựa trên group_id
```

**Ưu điểm:**
- ✅ Chỉ cần **1 API call** thay vì 3-4 calls
- ✅ Không cần chọn context trước, chọn group trực tiếp
- ✅ Có đầy đủ thông tin: group, context, roles trong 1 response
- ✅ UX tốt hơn: User thấy tất cả groups ngay từ đầu

**Code example:**
```javascript
// 1. Lấy groups
const response = await fetch('/api/user/my-groups', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: groups } = await response.json();

// 2. Hiển thị dropdown
// Dropdown: "Chọn Group"
// - System Administrators (System)
// - Shop Trung Tâm (Shop Trung Tâm)

// 3. User chọn group
const selectedGroup = groups[0]; // User chọn
localStorage.setItem('groupId', selectedGroup.id);

// 4. Gửi X-Group-Id trong mọi request
fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Group-Id': selectedGroup.id
  }
});
```

---

## 📡 Danh sách API {#danh-sách-api}

### 1. Lấy danh sách Groups user có thể truy cập

#### ✅ **API 1: `GET /api/user/my-groups`** - KHUYẾN NGHỊ DÙNG

**Khi nào dùng:**
- ✅ **Bước đầu tiên** sau khi user đăng nhập
- ✅ Khi cần lấy danh sách groups mà user hiện tại là member
- ✅ Khi cần hiển thị dropdown groups kèm roles của user trong mỗi group
- ✅ **Đây là API đơn giản nhất:** Chỉ cần 1 call để lấy tất cả groups với context và roles

**Request:**
```http
GET /api/user/my-groups
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SYSTEM_ADMIN",
      "name": "System Administrators",
      "type": "system",
      "description": null,
      "context": {
        "id": "1",
        "type": "system",
        "ref_id": null,
        "name": "System"
      },
      "roles": [
        {
          "id": 1,
          "code": "system_admin",
          "name": "System Administrator"
        }
      ],
      "joined_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 5,
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "type": "shop",
      "description": null,
      "context": {
        "id": "2",
        "type": "shop",
        "ref_id": "1",
        "name": "Shop Trung Tâm"
      },
      "roles": [
        {
          "id": 3,
          "code": "admin",
          "name": "Administrator"
        }
      ],
      "joined_at": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

**Lưu ý:**
- ✅ API này đã được implement trong backend
- ✅ Trả về tất cả groups mà user là member (từ `user_groups` table)
- ✅ Kèm context info và roles của user trong mỗi group
- ✅ Chỉ trả về groups có status = 'active'
- ✅ Sắp xếp theo `joined_at` DESC (groups mới nhất trước)

---

#### ⚠️ **API 2: `GET /api/user/contexts`** - VẪN HOẠT ĐỘNG (Flow cũ)

**Khi nào dùng:**
- ⚠️ Chỉ dùng nếu không thể dùng `GET /api/user/my-groups`
- ⚠️ Flow cũ: Context → Group (phức tạp hơn, cần 2-3 API calls)

**Request:**
```http
GET /api/user/contexts
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "1",
    "type": "system",
    "ref_id": null,
    "name": "System"
  },
  {
    "id": "2",
    "type": "shop",
    "ref_id": "1",
    "name": "Shop Trung Tâm"
  }
]
```

**Lưu ý:** 
- ⚠️ API này trả về **CONTEXTS** (không phải groups)
- ⚠️ Sau khi có context, cần query groups trong context đó (xem API 3)

---

#### ⚠️ **API 3: `GET /api/admin/groups`** - VẪN HOẠT ĐỘNG (Flow cũ)

**Khi nào dùng:**
- ⚠️ Chỉ dùng trong flow cũ: sau khi chọn context, cần lấy groups trong context đó
- ⚠️ Không khuyến nghị nếu đã dùng `GET /api/user/my-groups`

**Request:**
```http
GET /api/admin/groups?page=1&limit=10&filters[context_id]=2
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "type": "shop",
      "code": "shop-001",
      "name": "Shop Trung Tâm",
      "context_id": 2,
      "status": "active"
    }
  ],
  "meta": {...}
}
```

---

### 2. Switch Group

#### ✅ **API 4: `POST /api/user/contexts/switch`** - GIỮ LẠI

**Khi nào dùng:**
- ✅ Khi user chọn group từ dropdown
- ✅ Khi cần switch sang group khác

**Request:**
```http
POST /api/user/contexts/switch
Authorization: Bearer {token}
Content-Type: application/json

{
  "context_id": 2,
  "group_id": 5  // Nếu đã biết group_id, gửi luôn
}
```

**Response:**
```json
{
  "context": {
    "id": "2",
    "type": "shop",
    "ref_id": "1",
    "name": "Shop Trung Tâm"
  },
  "message": "Context switched. Use X-Group-Id header or ?group_id query param in subsequent requests."
}
```

**Lưu ý:**
- ✅ Sau khi switch, lưu `group_id` vào localStorage
- ✅ Gửi `X-Group-Id` header trong mọi request tiếp theo

---

### 3. Lấy danh sách Users

#### ✅ **API 5: `GET /api/admin/users`** - GIỮ LẠI, NHƯNG RESPONSE ĐÃ THAY ĐỔI

**Khi nào dùng:**
- ✅ Khi cần hiển thị danh sách users trong group hiện tại
- ✅ Khi quản lý users và roles của họ

**Request:**
```http
GET /api/admin/users?page=1&limit=10
X-Group-Id: 5
Authorization: Bearer {token}
```

**⚠️ QUAN TRỌNG:**
- **Bắt buộc** gửi `X-Group-Id` header hoặc `?group_id=5` query param
- Nếu không có → API sẽ filter users của tất cả groups (có thể không đúng ý muốn)

**Response (MỚI):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": "active",
      "profile": {...},
      "user_role_assignments": [  // ✅ DÙNG CÁI NÀY
        {
          "id": 10,
          "role_id": 3,
          "group_id": 5,  // ✅ Thay đổi: context_id → group_id
          "role": {
            "id": 3,
            "code": "admin",
            "name": "Administrator"
          }
        }
      ]
    }
  ],
  "meta": {...}
}
```

**Breaking Change:**
- ❌ `user_context_roles` → ✅ `user_role_assignments`
- Mỗi assignment có `group_id` thay vì `context_id`

**Action cho FE:**
```javascript
// CŨ (KHÔNG DÙNG NỮA)
const roles = user.user_context_roles.map(ucr => ucr.role);

// MỚI (DÙNG CÁI NÀY)
const roles = user.user_role_assignments
  .filter(ura => ura.group_id === currentGroupId)
  .map(ura => ura.role);
```

---

### 4. Gán Roles cho User

#### ✅ **API 6: `PUT /api/admin/users/:id/roles`** - GIỮ LẠI, BẮT BUỘC X-Group-Id

**Khi nào dùng:**
- ✅ Khi admin gán/chỉnh sửa roles cho user trong group hiện tại
- ✅ Khi sync roles của user (xóa roles cũ, gán roles mới)

**Request:**
```http
PUT /api/admin/users/:id/roles
X-Group-Id: 5
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**⚠️ BẮT BUỘC:**
- Phải gửi `X-Group-Id` header hoặc `?group_id=5` query param
- Nếu không có → Lỗi 400: "Group ID is required"

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 10,
    "group_id": 5,
    "role_ids": [3, 4, 5],
    "message": "Roles synced successfully"
  }
}
```

**Lưu ý:**
- API này sẽ xóa tất cả roles cũ của user trong group, rồi gán roles mới
- Nếu muốn thêm/xóa từng role → dùng API quản lý members (xem phần 5)

---

### 5. Quản lý Members trong Group

#### ✅ **API 7-10: Quản lý Members** - GIỮ LẠI, VẪN DÙNG

Tất cả các API này vẫn hoạt động bình thường:

- `GET /api/groups/:id/members` - Lấy danh sách members
- `POST /api/groups/:id/members` - Thêm member vào group
- `PUT /api/groups/:id/members/:memberId/roles` - Cập nhật roles của member
- `DELETE /api/groups/:id/members/:memberId` - Xóa member khỏi group

**Lưu ý:** Các API này không cần `X-Group-Id` header vì `group_id` đã có trong URL.

---

### 6. Quản lý Groups (System Admin)

#### ✅ **API 11-16: Các API quản lý Groups** - GIỮ LẠI, VẪN DÙNG

Tất cả các API này vẫn hoạt động bình thường:

- `POST /api/admin/groups` - Tạo group mới
- `GET /api/admin/groups` - Lấy danh sách groups
- `GET /api/admin/groups/:id` - Lấy group theo ID
- `PUT /api/admin/groups/:id` - Cập nhật group
- `DELETE /api/admin/groups/:id` - Xóa group
- `GET /api/admin/groups/type/:type` - Lấy groups theo type

**Lưu ý:** Chỉ system admin (user trong SYSTEM_ADMIN group) mới có thể tạo/sửa/xóa groups.

---

## 🔄 Breaking Changes - Response Structure {#breaking-changes}

### 1. `GET /api/admin/users` - Response thay đổi

**Trước đây:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "user_context_roles": [  // ❌ KHÔNG CÒN
        {
          "context_id": 2,
          "role_id": 3,
          "role": {...}
        }
      ]
    }
  ]
}
```

**Hiện tại:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "user_role_assignments": [  // ✅ DÙNG CÁI NÀY
        {
          "id": 10,
          "role_id": 3,
          "group_id": 5,  // ✅ Thay đổi: context_id → group_id
          "role": {...}
        }
      ]
    }
  ]
}
```

**Action cho FE:**
```javascript
// CŨ (KHÔNG DÙNG NỮA)
function getUserRoles(user, contextId) {
  return user.user_context_roles
    .filter(ucr => ucr.context_id === contextId)
    .map(ucr => ucr.role);
}

// MỚI (DÙNG CÁI NÀY)
function getUserRoles(user, groupId) {
  return user.user_role_assignments
    .filter(ura => ura.group_id === groupId)
    .map(ura => ura.role);
}
```

---

### 2. `PUT /api/admin/users/:id/roles` - Bắt buộc `X-Group-Id`

**Trước đây:**
```http
PUT /api/admin/users/:id/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**Hiện tại:**
```http
PUT /api/admin/users/:id/roles
X-Group-Id: 5  // ✅ BẮT BUỘC
Authorization: Bearer {token}
Content-Type: application/json

{
  "role_ids": [3, 4, 5]
}
```

**Nếu không có `X-Group-Id`:**
- Lỗi 400: "Group ID is required. Please specify X-Group-Id header or group_id query parameter"

---

## 🔧 Headers & Query Parameters

### Headers

#### ✅ `X-Group-Id` - ƯU TIÊN CAO NHẤT

**Khi nào dùng:**
- ✅ Khi đã có `group_id` từ localStorage hoặc user chọn
- ✅ Khi cần chính xác group (không muốn auto-resolve)
- ✅ **Bắt buộc** cho `PUT /api/admin/users/:id/roles`

**Example:**
```http
GET /api/admin/users
X-Group-Id: 5
Authorization: Bearer {token}
```

---

#### ⚠️ `X-Context-Id` - VẪN HOẠT ĐỘNG NHƯNG KHÔNG KHUYẾN NGHỊ

**Khi nào dùng:**
- ⚠️ Khi chỉ có `context_id` (chưa có `group_id`)
- ⚠️ Khi context chỉ có 1 group (backend sẽ auto-resolve)
- ⚠️ **Không dùng** nếu context có nhiều groups (sẽ lỗi 400)

**Lưu ý:**
- Nếu context có nhiều groups → Backend trả về lỗi 400: "Multiple groups found in context. Please specify group_id"
- Khuyến nghị: Luôn cố gắng dùng `X-Group-Id` thay vì `X-Context-Id`

---

### Query Parameters

#### ✅ `group_id` - ƯU TIÊN

**Khi nào dùng:**
- ✅ Khi không thể dùng header (ví dụ: trong URL share)
- ✅ Alternative cho `X-Group-Id` header

**Example:**
```http
GET /api/admin/users?group_id=5
Authorization: Bearer {token}
```

---

#### ⚠️ `context_id` - VẪN HOẠT ĐỘNG NHƯNG KHÔNG KHUYẾN NGHỊ

**Khi nào dùng:**
- ⚠️ Tương tự `X-Context-Id` header
- ⚠️ Alternative cho header

---

### Thứ tự ưu tiên

Backend sẽ check theo thứ tự:
1. `X-Group-Id` header (ưu tiên cao nhất)
2. `group_id` query parameter
3. `X-Context-Id` header (auto-resolve)
4. `context_id` query parameter (auto-resolve)

---

## ✅ Checklist Migration cho FE {#checklist-migration}

### Phase 1: Cập nhật Flow - Dùng API mới

- [ ] Thay `GET /api/user/contexts` → `GET /api/user/my-groups` (nếu có thể)
- [ ] Hiển thị dropdown groups ngay từ đầu (không cần chọn context trước)
- [ ] Lưu `group_id` vào localStorage sau khi user chọn group

### Phase 2: Cập nhật Headers

- [ ] Thay `X-Context-Id` bằng `X-Group-Id` trong các request cần thiết
- [ ] Đảm bảo luôn gửi `X-Group-Id` khi gọi `PUT /api/admin/users/:id/roles`
- [ ] Cập nhật logic lưu/load: lưu cả `group_id` vào localStorage

### Phase 3: Cập nhật Response Parsing

- [ ] Tìm tất cả chỗ dùng `user_context_roles` → thay bằng `user_role_assignments`
- [ ] Cập nhật logic filter: dùng `group_id` thay vì `context_id`
- [ ] Cập nhật UI hiển thị roles: parse từ `user_role_assignments[].role`

### Phase 4: Testing

- [ ] Test lấy danh sách groups với `GET /api/user/my-groups`
- [ ] Test switch group
- [ ] Test lấy danh sách users với `X-Group-Id`
- [ ] Test gán roles với `X-Group-Id`
- [ ] Test backward compatibility với `X-Context-Id` (nếu vẫn dùng)

---

## 📊 Summary Table

| API Endpoint | Status | Khi nào dùng | Action Required |
|--------------|--------|--------------|-----------------|
| `GET /api/user/my-groups` | ✅ **KHUYẾN NGHỊ** | **Lấy tất cả groups user có thể truy cập** | ✅ **Đã implement** |
| `GET /api/user/contexts` | ⚠️ Flow cũ | User đăng nhập, cần dropdown contexts (flow cũ) | Không cần thay đổi |
| `POST /api/user/contexts/switch` | ✅ Giữ | User chọn group | Có thể thêm `group_id` (optional) |
| `GET /api/admin/groups` | ⚠️ Flow cũ | Lấy danh sách groups, tìm group_id từ context_id (flow cũ) | Không cần thay đổi |
| `GET /api/admin/users` | ✅ Giữ | Hiển thị users trong group | **Parse `user_role_assignments` thay vì `user_context_roles`** |
| `PUT /api/admin/users/:id/roles` | ✅ Giữ | Gán roles cho user | **Bắt buộc gửi `X-Group-Id`** |
| `GET /api/groups/:id/members` | ✅ Giữ | Xem members của group | Không cần thay đổi |
| `POST /api/groups/:id/members` | ✅ Giữ | Thêm member vào group | Không cần thay đổi |
| `PUT /api/groups/:id/members/:id/roles` | ✅ Giữ | Cập nhật roles của member | Không cần thay đổi |
| `DELETE /api/groups/:id/members/:id` | ✅ Giữ | Xóa member khỏi group | Không cần thay đổi |

---

## ❓ FAQ - Câu hỏi thường gặp

### Q1: Tại sao không bỏ context_id, chỉ dùng group_id?

**A:** Context có mục đích:
1. **Tổ chức:** Nhóm các groups lại (ví dụ: Tất cả groups của Shop Trung Tâm)
2. **Validate:** Kiểm tra role có được phép trong context không (role_contexts)
3. **Backward compatibility:** Vẫn hỗ trợ `X-Context-Id` header (auto-resolve group)

**Nhưng quan trọng:**
- ✅ **Group** là scope duy nhất để check permissions
- ⚠️ **Context** chỉ để tổ chức và validate, không check permissions trực tiếp

---

### Q2: Khi nào dùng context_id, khi nào dùng group_id?

**A:**

| Mục đích | Dùng gì | Khi nào |
|----------|---------|---------|
| **Hiển thị dropdown đầu tiên** | `GET /api/user/my-groups` → Trả về **groups** | ✅ **KHUYẾN NGHỊ** |
| **Hiển thị dropdown đầu tiên (flow cũ)** | `GET /api/user/contexts` → Trả về **contexts** | ⚠️ Flow cũ |
| **Switch group** | Lưu `group_id` vào localStorage | User chọn group từ dropdown |
| **Gửi trong mọi request** | `X-Group-Id` header (ƯU TIÊN) | Từ sau khi chọn group |
| **Auto-resolve** | `X-Context-Id` header (backward compatibility) | Nếu context chỉ có 1 group |

**Tóm tắt:**
- ✅ **Group** = Scope thực thi quyền (dùng trong mọi request sau khi chọn)
- ⚠️ **Context** = Phạm vi lớn, tổ chức groups (dùng để chọn ban đầu - flow cũ)

---

### Q3: Trong 1 group có nhiều vai trò để phân cho các tài khoản khác nhau đúng không?

**A:** **Đúng hoàn toàn!**

**Cấu trúc:**
- **1 Group** có **nhiều Roles** (admin, manager, staff, viewer...)
- **Mỗi User** có thể có **nhiều Roles** trong cùng 1 Group
- **Nhiều Users** có thể có **cùng 1 Role** trong Group đó

**Ví dụ thực tế:**

Group: "shop-001" (Shop Trung Tâm)

**Roles trong group:**
- `admin` - Quản lý toàn bộ
- `manager` - Quản lý hàng hóa, đơn hàng
- `staff` - Nhân viên bán hàng
- `viewer` - Chỉ xem

**Users và roles:**
- User A → có role `admin`
- User B → có roles `manager` và `staff`
- User C → có role `staff`
- User D → có role `viewer`

**Cách gán roles:**

```javascript
// Gán role admin cho User A trong group 5
PUT /api/admin/users/1/roles
X-Group-Id: 5
Body: { role_ids: [3] }  // role_id=3 là admin

// Gán nhiều roles cho User B trong group 5
PUT /api/admin/users/2/roles
X-Group-Id: 5
Body: { role_ids: [4, 5] }  // role_id=4 là manager, role_id=5 là staff
```

**Lưu ý:**
- Mỗi role có các **permissions** riêng (user.create, order.delete...)
- User có nhiều roles → có **tất cả permissions** của các roles đó (OR logic)
- Roles chỉ có hiệu lực **trong Group đó** (admin trong group A ≠ admin trong group B)

---

**Last Updated:** 2025-01-15  
**API Version:** v2.1.0 (Group-Based Permissions)  
**Changelog v2.1.0:**
- ✅ Thêm API mới `GET /api/user/my-groups` - Đơn giản hóa flow, chỉ cần 1 API call
- ✅ Khuyến nghị dùng flow mới với `GET /api/user/my-groups` thay vì flow cũ (3-4 API calls)
- ✅ Đơn giản hóa tài liệu, loại bỏ các phần phức tạp không cần thiết

