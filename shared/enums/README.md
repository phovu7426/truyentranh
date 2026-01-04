# Enum System

Hệ thống enum dùng chung toàn hệ thống để quản lý và lấy ra các giá trị, label của enum một cách thống nhất thông qua API.

## Cấu trúc

```
shared/enums/
├── interfaces/
│   └── enum-metadata.interface.ts  # Interface cho metadata của enum
├── types/
│   └── enum.types.ts               # Types cho enum system
├── composables/
│   └── useEnums.ts                 # Composable để gọi API lấy enum data
├── dtos/
│   └── enum-response.dto.ts        # DTO cho response
├── enums/
│   ├── basic-status.enum.ts        # Enum BasicStatus (để tương thích)
│   └── gender.enum.ts              # Enum Gender (để tương thích)
├── examples/
│   └── usage-example.vue           # Ví dụ sử dụng
├── index.ts                        # Export tất cả
└── README.md                       # Documentation
```

## API Endpoints

### Lấy tất cả enums
```
GET /api/enums
```

Response:
```json
{
  "basicstatus": [
    {
      "id": "active",
      "name": "active",
      "value": "active",
      "label": "Hoạt động",
      "color": "green"
    },
    {
      "id": "inactive",
      "name": "inactive",
      "value": "inactive",
      "label": "Ngừng hoạt động",
      "color": "red"
    }
  ],
  "gender": [
    {
      "id": "male",
      "name": "male",
      "value": "male",
      "label": "Nam",
      "icon": "male"
    },
    {
      "id": "female",
      "name": "female",
      "value": "female",
      "label": "Nữ",
      "icon": "female"
    },
    {
      "id": "other",
      "name": "other",
      "value": "other",
      "label": "Khác",
      "icon": "other"
    }
  ],
  // ... các enum khác
}
```

### Lấy enum theo tên
```
GET /api/enums/:name
```

Ví dụ:
```
GET /api/enums/orderstatus
```

Response:
```json
[
  {
    "id": "pending",
    "name": "pending",
    "value": "pending",
    "label": "Chờ xử lý",
    "color": "orange",
    "description": "Trạng thái đơn hàng: Chờ xử lý"
  },
  {
    "id": "confirmed",
    "name": "confirmed",
    "value": "confirmed",
    "label": "Đã xác nhận",
    "color": "blue",
    "description": "Trạng thái đơn hàng: Đã xác nhận"
  },
  // ... các trạng thái khác
]
```

## Sử dụng trong code

### Import và sử dụng composable

```typescript
import { useEnums } from '~/shared/enums'

// Trong component hoặc composable
const { 
  getAllEnums, 
  getEnumByName, 
  getEnumLabel, 
  getEnumColor, 
  getEnumIcon, 
  getEnumDescription 
} = useEnums()

// Lấy tất cả enums
const allEnums = await getAllEnums()

// Lấy enum cụ thể
const orderStatuses = await getEnumByName('orderstatus')

// Sử dụng helper functions
const label = getEnumLabel(orderStatuses, 'pending') // "Chờ xử lý"
const color = getEnumColor(orderStatuses, 'pending') // "orange"
```

### Sử dụng trong Vue component

```vue
<template>
  <div>
    <!-- Hiển thị dropdown với các trạng thái đơn hàng -->
    <select v-model="selectedStatus">
      <option 
        v-for="status in orderStatuses" 
        :key="status.value" 
        :value="status.value"
      >
        {{ status.label }}
      </option>
    </select>
    
    <!-- Hiển thị badge với màu sắc -->
    <span 
      class="status-badge"
      :style="{ backgroundColor: getStatusColor(selectedStatus) }"
    >
      {{ getStatusLabel(selectedStatus) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEnums } from '~/shared/enums'
import type { EnumItem } from '~/shared/enums'

const { getEnumByName, getEnumLabel, getEnumColor } = useEnums()

const orderStatuses = ref<EnumItem[]>([])
const selectedStatus = ref('')

onMounted(async () => {
  orderStatuses.value = await getEnumByName('orderstatus')
})

const getStatusLabel = (value: string) => {
  return getEnumLabel(orderStatuses.value, value)
}

const getStatusColor = (value: string) => {
  return getEnumColor(orderStatuses.value, value)
}
</script>

<style scoped>
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}
</style>
```

### Sử dụng singleton instance

```typescript
import { enumsApi } from '~/shared/enums'

// Sử dụng trực tiếp mà không cần gọi useEnums()
const allEnums = await enumsApi.getAllEnums()
const genders = await enumsApi.getEnumByName('gender')
```

## Các enum có sẵn

### BasicStatus
- `active`: Hoạt động (xanh)
- `inactive`: Ngừng hoạt động (đỏ)

### Gender
- `male`: Nam
- `female`: Nữ
- `other`: Khác

### OrderStatus
- `pending`: Chờ xử lý (cam)
- `confirmed`: Đã xác nhận (xanh dương)
- `processing`: Đang xử lý (tím)
- `shipped`: Đã giao hàng (chàm)
- `delivered`: Đã giao thành công (xanh lá)
- `cancelled`: Đã hủy (đỏ)

### PaymentStatus
- `pending`: Chờ thanh toán (cam)
- `paid`: Đã thanh toán (xanh lá)
- `failed`: Thanh toán thất bại (đỏ)
- `refunded`: Đã hoàn tiền (xanh dương)
- `partially_refunded`: Hoàn tiền một phần (lơ)

### ShippingStatus
- `pending`: Chờ xử lý (cam)
- `preparing`: Đang chuẩn bị hàng (xanh dương)
- `shipped`: Đã giao cho đơn vị vận chuyển (tím)
- `delivered`: Đã giao hàng thành công (xanh lá)
- `returned`: Hàng bị trả lại (đỏ)

### UserStatus
- `active`: Hoạt động (xanh lá)
- `pending`: Chờ xác nhận (cam)
- `inactive`: Đã khóa (đỏ)

## Types

```typescript
interface EnumItem {
  id: string;
  name: string;
  value: string;
  label: string;
  color?: string;
  icon?: string;
  description?: string;
}

interface EnumResponse {
  [key: string]: EnumItem[];
}

type EnumName = 
  | 'basicstatus'
  | 'gender'
  | 'orderstatus'
  | 'paymentstatus'
  | 'shippingstatus'
  | 'userstatus';
```

## Lưu ý

- Enum data được lấy từ API, không được hardcode trong client
- Sử dụng caching để tránh gọi API nhiều lần
- Helper functions giúp lấy label, color, icon, description một cách dễ dàng
- Hệ thống sử dụng chung endpoint cho tất cả enums