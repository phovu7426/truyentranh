import { useGlobalApiClient } from '~/composables/api'
import { adminEndpoints } from '~/api/endpoints'
import type { EnumItem, EnumResponse, EnumName, EnumOptions } from '../types/enum.types'

export const useEnums = () => {
    const { apiClient } = useGlobalApiClient()

    /**
     * Lấy tất cả enums
     */
    const getAllEnums = async (options: EnumOptions = {}): Promise<EnumResponse> => {
        const response = await apiClient.get<EnumResponse>(adminEndpoints.enums.all)
        return response.data
    }

    /**
     * Lấy enum theo tên
     */
    const getEnumByName = async (name: EnumName, options: EnumOptions = {}): Promise<EnumItem[]> => {
        const response = await apiClient.get<EnumItem[]>(adminEndpoints.enums.byName(name))
        return response.data
    }

    /**
     * Helper functions để lấy label từ enum value
     */
    const getEnumLabel = (enumItems: EnumItem[], value: string): string => {
        const item = enumItems.find(item => item.value === value)
        return item?.label || value
    }

    const getEnumColor = (enumItems: EnumItem[], value: string): string | undefined => {
        const item = enumItems.find(item => item.value === value)
        return item?.color
    }

    const getEnumIcon = (enumItems: EnumItem[], value: string): string | undefined => {
        const item = enumItems.find(item => item.value === value)
        return item?.icon
    }

    const getEnumDescription = (enumItems: EnumItem[], value: string): string | undefined => {
        const item = enumItems.find(item => item.value === value)
        return item?.description
    }

    return {
        getAllEnums,
        getEnumByName,
        getEnumLabel,
        getEnumColor,
        getEnumIcon,
        getEnumDescription,
    }
}