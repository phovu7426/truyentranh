# Public Comics & Chapters API - Tài liệu Thiết kế

API công khai để xem danh sách và chi tiết truyện tranh, đọc chapters. Được thiết kế dựa trên giao diện tham khảo của cmangax10.com.

## Tổng quan

- **Base URL**: `http://localhost:3000/api/public`
- **Authentication**: Không yêu cầu (Public endpoints)
- **Headers**: `Content-Type: application/json`
- **Response Format**: Tất cả responses đều có format:
```json
{
  "success": true,
  "data": {},
  "message": "Thông báo (nếu có)"
}
```

---

## Comics API

### 1. Get Comics List (Lấy danh sách truyện)

**Endpoint**: `GET /api/public/comics`

**Query Parameters**:
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số lượng mỗi trang (tối đa: 100)
- `search` (optional): Tìm kiếm theo tên truyện (full-text search)
- `filters[status]` (optional): Lọc theo trạng thái - chỉ `published` hoặc `completed`
- `filters[author]` (optional): Lọc theo tác giả
- `filters[category_slug]` (optional): Lọc theo slug danh mục
- `filters[translation_team]` (optional): Lọc theo nhóm dịch (translation team)
- `sort` (optional, default: `created_at:DESC`): Sắp xếp
  - Các giá trị: `created_at:ASC|DESC`, `view_count:ASC|DESC`, `follow_count:ASC|DESC`, `updated_at:ASC|DESC`

**Ví dụ Request**:
```bash
# Lấy danh sách truyện
curl -X GET "http://localhost:3000/api/public/comics?page=1&limit=10" \
  -H "Content-Type: application/json"

# Tìm kiếm truyện
curl -X GET "http://localhost:3000/api/public/comics?search=naruto&page=1&limit=10" \
  -H "Content-Type: application/json"

# Lọc theo danh mục và sắp xếp
curl -X GET "http://localhost:3000/api/public/comics?filters[category_slug]=hanh-dong&sort=view_count:DESC&page=1&limit=20" \
  -H "Content-Type: application/json"

# Lọc theo nhóm dịch
curl -X GET "http://localhost:3000/api/public/comics?filters[translation_team]=quan-que-comic&page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
      "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
      "description": "Mô tả ngắn gọn về truyện...",
      "cover_image": "https://example.com/covers/comic-1.jpg",
      "author": "Tác giả",
      "status": "published",
      "translation_team": {
        "id": 1,
        "name": "Quần Què Comic",
        "slug": "quan-que-comic"
      },
      "updated_at": "2025-01-11T05:00:00.000Z",
      "created_at": "2025-01-11T05:00:00.000Z",
      "categories": [
        {
          "id": 1,
          "name": "Hành động",
          "slug": "hanh-dong"
        },
        {
          "id": 2,
          "name": "Trọng Sinh",
          "slug": "trong-sinh"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "Manhua",
          "slug": "manhua"
        },
        {
          "id": 2,
          "name": "Võng Du",
          "slug": "vong-du"
        }
      ],
      "stats": {
        "view_count": 32239,
        "follow_count": 618,
        "review_count": 20,
        "average_rating": 4.5,
        "chapter_count": 183,
        "weekly_stats": {
          "views": 1200,
          "likes": 45,
          "comments": 12
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### 2. Get Comic by Slug (Lấy chi tiết truyện)

**Endpoint**: `GET /api/public/comics/:slug`

**Path Parameters**:
- `slug` (required): Slug của truyện (ví dụ: `trong-sinh-vao-game-phong-than-tan-tu-manh-nhat`)

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/comics/trong-sinh-vao-game-phong-than-tan-tu-manh-nhat" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
    "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
    "description": "Mô tả đầy đủ của truyện... Để cứu người cha đang hôn mê, Lưu Niên một mình bước vào tiểu thế giới của game Phong Thần...",
    "full_description": "Mô tả chi tiết và đầy đủ...",
    "cover_image": "https://example.com/covers/comic-1.jpg",
    "author": "Tác giả",
    "status": "published",
    "translation_team": {
      "id": 1,
      "name": "Quần Què Comic",
      "slug": "quan-que-comic",
      "avatar": "https://example.com/teams/team-1.jpg"
    },
    "updated_at": "2025-01-11T05:00:00.000Z",
    "created_at": "2025-01-11T05:00:00.000Z",
    "categories": [
      {
        "id": 1,
        "name": "Hành động",
        "slug": "hanh-dong"
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Manhua",
        "slug": "manhua"
      },
      {
        "id": 2,
        "name": "Trọng Sinh",
        "slug": "trong-sinh"
      },
      {
        "id": 3,
        "name": "Võng Du",
        "slug": "vong-du"
      },
      {
        "id": 4,
        "name": "Báo Thù",
        "slug": "bao-thu"
      }
    ],
    "stats": {
      "view_count": 32239,
      "follow_count": 618,
      "review_count": 20,
      "average_rating": 4.5,
      "chapter_count": 183,
      "weekly_stats": {
        "views": 1200,
        "likes": 45,
        "comments": 12
      }
    },
    "first_chapter": {
      "id": 1,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "slug": "chapter-1"
    },
    "last_chapter": {
      "id": 183,
      "title": "Chương 183: Kết thúc",
      "chapter_index": 183,
      "chapter_label": "Chapter 183",
      "slug": "chapter-183",
      "updated_at": "2025-01-11T05:00:00.000Z"
    }
  }
}
```

**Lưu ý**: 
- Chỉ trả về truyện có status `published` hoặc `completed`
- Nếu truyện không tồn tại hoặc bị ẩn, trả về 404

---

### 3. Get Comics Chapters (Lấy danh sách chương của truyện)

**Endpoint**: `GET /api/public/comics/:slug/chapters`

**Path Parameters**:
- `slug` (required): Slug của truyện

**Query Parameters**:
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 50): Số lượng mỗi trang (tối đa: 100)
- `sort` (optional, default: `chapter_index:ASC`): Sắp xếp
  - Các giá trị: `chapter_index:ASC|DESC`, `created_at:ASC|DESC`, `updated_at:ASC|DESC`
- `chapter_index` (optional): Tìm chương theo index cụ thể

**Ví dụ Request**:
```bash
# Lấy tất cả chương
curl -X GET "http://localhost:3000/api/public/comics/trong-sinh-vao-game-phong-than-tan-tu-manh-nhat/chapters" \
  -H "Content-Type: application/json"

# Lấy chương sắp xếp mới nhất trước
curl -X GET "http://localhost:3000/api/public/comics/trong-sinh-vao-game-phong-than-tan-tu-manh-nhat/chapters?sort=chapter_index:DESC" \
  -H "Content-Type: application/json"

# Tìm chương cụ thể
curl -X GET "http://localhost:3000/api/public/comics/trong-sinh-vao-game-phong-than-tan-tu-manh-nhat/chapters?chapter_index=1" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "comic_id": 1,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "slug": "chapter-1",
      "view_count": 1000,
      "page_count": 134,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z"
    },
    {
      "id": 2,
      "comic_id": 1,
      "title": "Chương 2: Tiếp tục",
      "chapter_index": 2,
      "chapter_label": "Chapter 2",
      "slug": "chapter-2",
      "view_count": 800,
      "page_count": 120,
      "created_at": "2025-01-12T05:00:00.000Z",
      "updated_at": "2025-01-12T05:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 183,
    "totalPages": 4
  }
}
```

**Lưu ý**: 
- Chỉ trả về các chương có status `published`
- Danh sách chương được sắp xếp theo `chapter_index` ASC mặc định

---

### 4. Get Trending Comics (Lấy truyện đang hot)

**Endpoint**: `GET /api/public/comics/trending`

**Query Parameters**:
- `limit` (optional, default: 20): Số lượng truyện (tối đa: 100)
- `period` (optional, default: `week`): Khoảng thời gian
  - Các giá trị: `day`, `week`, `month`

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/comics/trending?limit=20&period=week" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
      "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
      "cover_image": "https://example.com/covers/comic-1.jpg",
      "author": "Tác giả",
      "stats": {
        "view_count": 10000,
        "follow_count": 500,
        "weekly_views": 1200
      },
      "last_chapter": {
        "chapter_index": 183,
        "chapter_label": "Chapter 183",
        "updated_at": "2025-01-11T05:00:00.000Z"
      }
    }
  ]
}
```

**Lưu ý**: 
- Trending được tính dựa trên lượt xem và tương tác trong khoảng thời gian gần đây
- Công thức: `(views * 1) + (follows * 10) + (comments * 5)` trong period

---

### 5. Get Popular Comics (Lấy truyện phổ biến)

**Endpoint**: `GET /api/public/comics/popular`

**Query Parameters**:
- `limit` (optional, default: 20): Số lượng truyện (tối đa: 100)

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/comics/popular?limit=20" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
      "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
      "cover_image": "https://example.com/covers/comic-1.jpg",
      "author": "Tác giả",
      "stats": {
        "view_count": 50000,
        "follow_count": 2000,
        "average_rating": 4.8,
        "review_count": 150
      },
      "last_chapter": {
        "chapter_index": 183,
        "chapter_label": "Chapter 183",
        "updated_at": "2025-01-11T05:00:00.000Z"
      }
    }
  ]
}
```

**Lưu ý**: 
- Popular được tính dựa trên tổng lượt xem, lượt follow, đánh giá và số lượng review
- Công thức: `(total_views * 0.1) + (follow_count * 50) + (average_rating * 1000) + (review_count * 10)`

---

### 6. Get Newest Comics (Lấy truyện mới nhất)

**Endpoint**: `GET /api/public/comics/newest`

**Query Parameters**:
- `limit` (optional, default: 20): Số lượng truyện (tối đa: 100)

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/comics/newest?limit=20" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "truyen-tranh-moi",
      "title": "Truyện Tranh Mới",
      "cover_image": "https://example.com/covers/comic-new.jpg",
      "author": "Tác giả",
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "stats": {
        "view_count": 100,
        "follow_count": 10,
        "chapter_count": 1
      }
    }
  ]
}
```

**Lưu ý**: 
- Truyện mới nhất được sắp xếp theo `created_at` DESC
- Chỉ hiển thị truyện có status `published` hoặc `completed`

---

## Chapters API

### 1. Get Chapters List (Lấy danh sách chương)

**Endpoint**: `GET /api/public/chapters`

**Query Parameters**:
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số lượng mỗi trang (tối đa: 100)
- `filters[comic_id]` (optional): Lọc theo ID truyện
- `filters[comic_slug]` (optional): Lọc theo slug truyện
- `sort` (optional, default: `created_at:DESC`): Sắp xếp
  - Các giá trị: `created_at:ASC|DESC`, `chapter_index:ASC|DESC`, `view_count:ASC|DESC`, `updated_at:ASC|DESC`
- `include` (optional): Bao gồm thêm thông tin
  - Các giá trị: `comic`, `pages` (có thể kết hợp: `comic,pages`)

**Ví dụ Request**:
```bash
# Lấy danh sách chương mới nhất
curl -X GET "http://localhost:3000/api/public/chapters?page=1&limit=10&include=comic" \
  -H "Content-Type: application/json"

# Lọc theo truyện
curl -X GET "http://localhost:3000/api/public/chapters?filters[comic_slug]=trong-sinh-vao-game-phong-than-tan-tu-manh-nhat&sort=chapter_index:ASC" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "comic_id": 1,
      "title": "Chương 1: Bắt đầu",
      "chapter_index": 1,
      "chapter_label": "Chapter 1",
      "slug": "chapter-1",
      "view_count": 1000,
      "page_count": 134,
      "created_at": "2025-01-11T05:00:00.000Z",
      "updated_at": "2025-01-11T05:00:00.000Z",
      "comic": {
        "id": 1,
        "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
        "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
        "cover_image": "https://example.com/covers/comic-1.jpg"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Lưu ý**: 
- Chỉ trả về các chương có status `published`
- Mặc định không bao gồm thông tin comic và pages để tối ưu performance

---

### 2. Get Chapter by ID (Lấy chi tiết chương)

**Endpoint**: `GET /api/public/chapters/:id`

**Path Parameters**:
- `id` (required): ID của chương

**Query Parameters**:
- `include` (optional): Bao gồm thêm thông tin
  - Các giá trị: `comic`, `pages`, `prev`, `next` (có thể kết hợp: `comic,pages,prev,next`)

**Ví dụ Request**:
```bash
# Lấy chi tiết chương với đầy đủ thông tin
curl -X GET "http://localhost:3000/api/public/chapters/1?include=comic,pages,prev,next" \
  -H "Content-Type: application/json"

# Lấy chi tiết chương cơ bản
curl -X GET "http://localhost:3000/api/public/chapters/1" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "comic_id": 1,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "slug": "chapter-1",
    "view_count": 1000,
    "page_count": 134,
    "created_at": "2025-01-11T05:00:00.000Z",
    "updated_at": "2025-01-11T05:00:00.000Z",
    "comic": {
      "id": 1,
      "title": "Trọng Sinh Vào Game Phong Thần: Tán Tu Mạnh Nhất",
      "slug": "trong-sinh-vao-game-phong-than-tan-tu-manh-nhat",
      "cover_image": "https://example.com/covers/comic-1.jpg"
    },
    "prev_chapter": null,
    "next_chapter": {
      "id": 2,
      "title": "Chương 2: Tiếp tục",
      "chapter_index": 2,
      "chapter_label": "Chapter 2",
      "slug": "chapter-2"
    }
  }
}
```

**Lưu ý**: 
- Chỉ trả về chương có status `published`
- Nếu chương không tồn tại hoặc chưa được xuất bản, trả về 404

---

### 3. Get Chapter by Comic Slug and Chapter Index (Lấy chương theo slug truyện và index)

**Endpoint**: `GET /api/public/comics/:comic_slug/chapters/:chapter_index`

**Path Parameters**:
- `comic_slug` (required): Slug của truyện
- `chapter_index` (required): Index của chương (số thứ tự)

**Query Parameters**:
- `include` (optional): Bao gồm thêm thông tin (giống như Get Chapter by ID)

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/comics/trong-sinh-vao-game-phong-than-tan-tu-manh-nhat/chapters/1?include=comic,pages,prev,next" \
  -H "Content-Type: application/json"
```

**Response (200)**: Giống như Get Chapter by ID

**Lưu ý**: 
- Endpoint này thân thiện với SEO hơn, dễ dàng chia sẻ
- URL format: `/comics/{comic-slug}/chapters/{chapter-index}`

---

### 4. Get Chapter Pages (Lấy danh sách trang của chương)

**Endpoint**: `GET /api/public/chapters/:id/pages`

**Path Parameters**:
- `id` (required): ID của chương

**Query Parameters**:
- `format` (optional, default: `list`): Định dạng trả về
  - `list`: Danh sách các trang
  - `flat`: Mảng URL ảnh phẳng (tối ưu cho performance)

**Ví dụ Request**:
```bash
# Lấy danh sách trang đầy đủ
curl -X GET "http://localhost:3000/api/public/chapters/1/pages" \
  -H "Content-Type: application/json"

# Lấy mảng URL phẳng (tối ưu)
curl -X GET "http://localhost:3000/api/public/chapters/1/pages?format=flat" \
  -H "Content-Type: application/json"
```

**Response (200) - format=list**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "chapter_id": 1,
      "page_number": 1,
      "image_url": "https://example.com/pages/chapter-1/page-1.jpg",
      "thumbnail_url": "https://example.com/pages/chapter-1/page-1-thumb.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 150000,
      "order": 1
    },
    {
      "id": 2,
      "chapter_id": 1,
      "page_number": 2,
      "image_url": "https://example.com/pages/chapter-1/page-2.jpg",
      "thumbnail_url": "https://example.com/pages/chapter-1/page-2-thumb.jpg",
      "width": 800,
      "height": 1200,
      "file_size": 145000,
      "order": 2
    }
  ],
  "meta": {
    "total": 134,
    "chapter_id": 1
  }
}
```

**Response (200) - format=flat**:
```json
{
  "success": true,
  "data": [
    "https://example.com/pages/chapter-1/page-1.jpg",
    "https://example.com/pages/chapter-1/page-2.jpg",
    "https://example.com/pages/chapter-1/page-3.jpg"
  ],
  "meta": {
    "total": 134,
    "chapter_id": 1
  }
}
```

**Lưu ý**: 
- Trang được sắp xếp theo `page_number` ASC (1, 2, 3, ...)
- Chỉ trả về trang của chương có status `published`
- Format `flat` tối ưu hơn khi chỉ cần danh sách URL ảnh

---

### 5. Get Next Chapter (Lấy chương tiếp theo)

**Endpoint**: `GET /api/public/chapters/:id/next`

**Path Parameters**:
- `id` (required): ID của chương hiện tại

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/chapters/1/next" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "comic_id": 1,
    "title": "Chương 2: Tiếp tục",
    "chapter_index": 2,
    "chapter_label": "Chapter 2",
    "slug": "chapter-2",
    "view_count": 800,
    "created_at": "2025-01-12T05:00:00.000Z"
  }
}
```

**Response (200) - Không có chương tiếp theo**:
```json
{
  "success": true,
  "data": null,
  "message": "Không có chương tiếp theo"
}
```

**Lưu ý**: 
- Chỉ trả về chương có status `published`
- Dựa trên `chapter_index` của cùng một truyện

---

### 6. Get Previous Chapter (Lấy chương trước đó)

**Endpoint**: `GET /api/public/chapters/:id/prev`

**Path Parameters**:
- `id` (required): ID của chương hiện tại

**Ví dụ Request**:
```bash
curl -X GET "http://localhost:3000/api/public/chapters/2/prev" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "comic_id": 1,
    "title": "Chương 1: Bắt đầu",
    "chapter_index": 1,
    "chapter_label": "Chapter 1",
    "slug": "chapter-1",
    "view_count": 1000,
    "created_at": "2025-01-11T05:00:00.000Z"
  }
}
```

**Response (200) - Không có chương trước đó**:
```json
{
  "success": true,
  "data": null,
  "message": "Không có chương trước đó"
}
```

**Lưu ý**: 
- Chỉ trả về chương có status `published`
- Dựa trên `chapter_index` của cùng một truyện

---

### 7. Track View (Đếm lượt xem)

**Endpoint**: `POST /api/public/chapters/:id/view`

**Path Parameters**:
- `id` (required): ID của chương

**Headers**:
- `Authorization` (optional): Bearer token nếu user đã đăng nhập

**Request Body**: Không cần (optional: có thể gửi thêm metadata)
```json
{
  "read_duration": 300,
  "pages_read": 50
}
```

**Ví dụ Request**:
```bash
curl -X POST "http://localhost:3000/api/public/chapters/1/view" \
  -H "Content-Type: application/json"
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "tracked": true,
    "chapter_id": 1,
    "comic_id": 1,
    "view_count": 1001
  },
  "message": "View tracked successfully"
}
```

**Rate Limit**:
- **Limit**: 10 requests per minute per IP
- **Purpose**: Tránh spam view count
- **Behavior**: Nếu vượt quá limit, request vẫn thành công (200) nhưng không tăng view count
  - Response sẽ có `"tracked": false` và message: `"Rate limit exceeded"`

**Lưu ý**:
- API tự động lấy `user_id` từ token nếu user đã đăng nhập (optional)
- API tự động lấy `ip` và `user_agent` từ request
- View count được cập nhật async để không làm chậm response
- Hệ thống tự động ngăn duplicate views trong cùng một khoảng thời gian (30 giây)

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Truyện không tồn tại",
  "error": "NOT_FOUND"
}
```

### 404 Not Found - Hidden Comic/Chapter
```json
{
  "success": false,
  "message": "Truyện không tồn tại hoặc đã bị ẩn",
  "error": "NOT_FOUND"
}
```

### 429 Too Many Requests (Track View)
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "error": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "errors": {
    "limit": ["Limit must be between 1 and 100"],
    "page": ["Page must be greater than 0"]
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "INTERNAL_ERROR"
}
```

---

## Ghi chú tích hợp

### Comics API
1. **Public Status**: Chỉ truyện có status `published` hoặc `completed` mới hiển thị
2. **Slug-based**: Public API sử dụng `slug` thay vì `id` để thân thiện với SEO
3. **Stats**: Thống kê được tính tự động và cập nhật real-time
4. **Categories & Tags**: Mỗi truyện có thể thuộc nhiều danh mục và tags
5. **Translation Team**: Mỗi truyện có thể có nhóm dịch (translation team)
6. **Pagination**: Tất cả danh sách đều hỗ trợ phân trang
7. **Search**: Hỗ trợ tìm kiếm full-text theo tên truyện
8. **Sorting**: Có thể sắp xếp theo nhiều tiêu chí
9. **Weekly Stats**: Thống kê tuần (views, likes, comments) cho trending

### Chapters API
1. **Published Only**: Chỉ chương có status `published` mới hiển thị
2. **Page Order**: Trang được sắp xếp theo `page_number` ASC
3. **Next/Prev**: Dựa trên `chapter_index` của cùng một truyện
4. **View Tracking**: 
   - Tự động track khi user xem chương
   - Có rate limit để tránh spam (10 req/min/IP)
   - Tự động aggregate vào `comic_stats`
   - Hỗ trợ metadata: read_duration, pages_read
5. **Image URLs**: Tất cả `image_url` đều là absolute URLs
6. **Metadata**: `width`, `height`, `file_size` có thể null nếu không extract được
7. **Pagination**: Danh sách chương hỗ trợ phân trang
8. **Include Parameter**: Cho phép bao gồm thêm thông tin (comic, pages, prev, next) để tối ưu số lượng requests
9. **Format Parameter**: Hỗ trợ format `flat` cho pages để tối ưu performance
10. **Slug-based Endpoint**: Endpoint `/comics/:slug/chapters/:index` thân thiện với SEO

---

## Flow đề xuất

### Đọc truyện
1. **Lấy danh sách chương**: `GET /api/public/comics/:slug/chapters?sort=chapter_index:ASC`
2. **Lấy chi tiết chương**: `GET /api/public/comics/:slug/chapters/:index?include=comic,prev,next`
3. **Lấy danh sách trang**: `GET /api/public/chapters/:id/pages?format=flat`
4. **Track view**: `POST /api/public/chapters/:id/view` (sau khi user bắt đầu đọc)
5. **Chuyển chương**: Sử dụng `prev_chapter` và `next_chapter` từ response, hoặc `GET /api/public/chapters/:id/next`

### Xem danh sách truyện
1. **Trang chủ**: 
   - `GET /api/public/comics/trending?limit=20&period=week`
   - `GET /api/public/comics/popular?limit=20`
   - `GET /api/public/comics/newest?limit=20`
   - `GET /api/public/chapters?limit=10&include=comic&sort=created_at:DESC`
2. **Danh sách truyện**: `GET /api/public/comics?page=1&limit=20&sort=created_at:DESC`
3. **Chi tiết truyện**: `GET /api/public/comics/:slug`
4. **Danh sách chương**: `GET /api/public/comics/:slug/chapters?sort=chapter_index:ASC`

---

## Performance Tips

1. **Sử dụng `include` parameter**: Chỉ lấy dữ liệu cần thiết
2. **Sử dụng `format=flat` cho pages**: Khi chỉ cần danh sách URL ảnh
3. **Cache responses**: Cache các responses cho trending, popular, newest (TTL: 5-15 phút)
4. **Pagination**: Luôn sử dụng pagination cho danh sách lớn
5. **Track view async**: Track view không nên block UI, có thể fire-and-forget
6. **Lazy load pages**: Load pages khi user scroll đến gần
7. **Preload next chapter**: Preload metadata của chương tiếp theo khi user đọc gần cuối chương hiện tại

---

## Versioning

API hiện tại là **v1** (implicit). Trong tương lai có thể thêm version prefix:
- `GET /api/v1/public/comics`
- `GET /api/v2/public/comics`

Hiện tại không cần version prefix vì đây là phiên bản đầu tiên.

