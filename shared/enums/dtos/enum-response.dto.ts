import { EnumItem, EnumMetadata } from '../interfaces/enum-metadata.interface';

export class EnumResponseDto implements EnumMetadata {
    [key: string]: EnumItem[];
}

export class SingleEnumResponseDto implements EnumItem {
    id: string;
    name: string;
    value: string;
    label: string;
    color?: string;
    icon?: string;
    description?: string;
}