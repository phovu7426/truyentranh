// Re-export order types from main types file
export type * from '~/types/orders'

// Additional composable-specific types
export interface UseOrdersOptions {
    immediate?: boolean;
    page?: number;
    search?: string;
    status?: string;
}

export interface UseOrderManagementOptions {
    immediate?: boolean;
    orderId?: number;
}

export interface UseCheckoutOptions {
    immediate?: boolean;
}

export interface OrderFilters {
    status?: string;
    paymentStatus?: string;
    shippingStatus?: string;
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface OrderPagination {
    page: number;
    limit: number;
}

export interface OrderState {
    orders: any[];
    currentOrder: any;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        totalPages: number;
        limit: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    filters: OrderFilters;
}

export interface CheckoutState {
    address: any;
    loading: boolean;
    error: string | null;
}