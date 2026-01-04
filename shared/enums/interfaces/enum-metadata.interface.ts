export interface EnumItem {
    id: string;
    name: string;
    value: string;
    label: string;
    color?: string;
    icon?: string;
    description?: string;
}

export interface EnumMetadata {
    [key: string]: EnumItem[];
}