// Order Types and Interfaces (aligned with Admin Orders API)

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

export type ShippingStatus =
    | 'pending'
    | 'preparing'
    | 'shipped'
    | 'delivered'
    | 'returned';

export type PaymentMethodCode =
    | 'cod'
    | 'bank_transfer'
    | 'credit_card'
    | 'debit_card'
    | 'ewallet';

export interface PaymentMethodEntity {
    id: number;
    name: string;
    code: string;
    description?: string;
    status?: string;
}

export type PaymentMethod = PaymentMethodCode | PaymentMethodEntity;

export interface ShippingMethodEntity {
    id: number;
    name: string;
    code: string;
    description?: string;
    status?: string;
}

export type ShippingMethod = ShippingMethodEntity;

export interface OrderAddress {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    postal_code: string;
}

export interface OrderUser {
    id: number;
    name: string;
    email: string;
}

export interface OrderShippingMethod {
    id: number;
    name: string;
    code: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_variant_id: number | null;
    product_name: string;
    product_sku: string;
    variant_name: string | null;
    quantity: number;
    unit_price: string;
    total_price: string;
    product_attributes: Record<string, any> | null;
    product?: {
        id: number;
        name: string;
    };
    variant?: {
        id: number;
        sku: string;
        name: string;
    };
}

export interface OrderPayment {
    id: number;
    order_id: number;
    payment_method_id: number;
    status: PaymentStatus;
    amount: string;
    transaction_id: string | null;
    payment_method?: {
        id: number;
        name: string;
        code: string;
    };
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: OrderAddress;
    billing_address: OrderAddress;
    shipping_method_id: number | null;
    payment_method_id: number | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    shipping_status: ShippingStatus;
    subtotal: string;
    tax_amount: string;
    shipping_amount: string;
    discount_amount: string;
    total_amount: string;
    currency: string;
    notes: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    user?: OrderUser | null;
    shipping_method?: OrderShippingMethod | null;
    order_items: OrderItem[];
    payments: OrderPayment[];
}

export interface OrderListMeta {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface OrderListResponse {
    data: Order[];
    meta: OrderListMeta;
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    notes?: string;
}

export interface UpdateOrderRequest {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    shipping_address?: Partial<OrderAddress>;
    billing_address?: Partial<OrderAddress>;
    shipping_method_id?: number | null;
    notes?: string | null;
    tracking_number?: string | null;
}

export interface OrderStatusResponse {
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    shipping_status: ShippingStatus;
}

// Order creation response with payment URL for online payments
export interface OrderCreateResponse {
    order_id: string | number;
    order_number: string;
    status: OrderStatus;
    total_amount: string;
    items_count: number;
    payment_url?: string; // URL for online payment (VNPay, MoMo, etc.)
    payment?: {
        payment_id: number;
        payment_code: string;
        transaction_id: string;
    };
}

// Status options for dropdowns
export const ORDER_STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý', color: 'yellow' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
    { value: 'processing', label: 'Đang xử lý', color: 'purple' },
    { value: 'shipped', label: 'Đã giao cho VC', color: 'orange' },
    { value: 'delivered', label: 'Đã giao thành công', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ thanh toán', color: 'yellow' },
    { value: 'paid', label: 'Đã thanh toán', color: 'green' },
    { value: 'failed', label: 'Thanh toán thất bại', color: 'red' },
    { value: 'refunded', label: 'Đã hoàn tiền', color: 'blue' },
    { value: 'partially_refunded', label: 'Hoàn tiền một phần', color: 'orange' },
] as const;

export const SHIPPING_STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý', color: 'yellow' },
    { value: 'preparing', label: 'Đang chuẩn bị', color: 'purple' },
    { value: 'shipped', label: 'Đang giao hàng', color: 'blue' },
    { value: 'delivered', label: 'Đã giao hàng', color: 'green' },
    { value: 'returned', label: 'Bị trả lại', color: 'red' },
] as const;