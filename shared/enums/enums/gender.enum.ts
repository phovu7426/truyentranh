export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export const GenderLabels: Record<Gender, string> = {
    [Gender.MALE]: 'Nam',
    [Gender.FEMALE]: 'Nữ',
    [Gender.OTHER]: 'Khác',
};

export const GenderIcons: Record<Gender, string> = {
    [Gender.MALE]: 'male',
    [Gender.FEMALE]: 'female',
    [Gender.OTHER]: 'other',
};

export const getGenderLabel = (value: Gender): string => {
    return GenderLabels[value];
};

export const getGenderIcon = (value: Gender): string => {
    return GenderIcons[value];
};

export const getGenderArray = () => {
    return Object.values(Gender).map(value => ({
        id: value,
        name: value,
        value: value,
        label: getGenderLabel(value as Gender),
        icon: getGenderIcon(value as Gender),
    }));
};