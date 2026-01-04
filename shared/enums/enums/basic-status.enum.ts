export enum BasicStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export const BasicStatusLabels: Record<BasicStatus, string> = {
    [BasicStatus.ACTIVE]: 'Hoạt động',
    [BasicStatus.INACTIVE]: 'Ngừng hoạt động',
};

export const BasicStatusColors: Record<BasicStatus, string> = {
    [BasicStatus.ACTIVE]: 'green',
    [BasicStatus.INACTIVE]: 'red',
};

export const getBasicStatusLabel = (value: BasicStatus): string => {
    return BasicStatusLabels[value];
};

export const getBasicStatusColor = (value: BasicStatus): string => {
    return BasicStatusColors[value];
};

export const getBasicStatusArray = () => {
    return Object.values(BasicStatus).map(value => ({
        id: value,
        name: value,
        value: value,
        label: getBasicStatusLabel(value as BasicStatus),
        color: getBasicStatusColor(value as BasicStatus),
    }));
};