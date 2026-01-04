export interface EnumItem {
    id: string;
    name: string;
    value: string;
    label: string;
    color?: string;
    icon?: string;
    description?: string;
}

export interface EnumResponse {
    [key: string]: EnumItem[];
}

export type EnumName =
    | 'basicstatus'
    | 'gender'
    | 'orderstatus'
    | 'paymentstatus'
    | 'shippingstatus'
    | 'userstatus'
    | 'product_status'
    | 'attribute_type';

export interface EnumOptions {
    cache?: boolean;
    revalidate?: number;
}