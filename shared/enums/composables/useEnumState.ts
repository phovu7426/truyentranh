import { ref, computed, watch, type Ref } from 'vue'
import { useEnums } from './useEnums'
import type { EnumItem, EnumName } from '../types/enum.types'

/**
 * Composable để quản lý state của enum trong components
 */
export const useEnumState = (enumName: EnumName, options: { immediate?: boolean } = {}) => {
    const { getEnumByName, getEnumLabel, getEnumColor, getEnumIcon, getEnumDescription } = useEnums()

    // State
    const enumItems = ref<EnumItem[]>([])
    const loading = ref(false)
    const error = ref<any>(null)

    // Computed properties
    const enumMap = computed(() => {
        const map: Record<string, EnumItem> = {}
        enumItems.value.forEach(item => {
            map[item.value] = item
        })
        return map
    })

    const enumValues = computed(() => enumItems.value.map(item => item.value))

    const enumLabels = computed(() => {
        const labels: Record<string, string> = {}
        enumItems.value.forEach(item => {
            labels[item.value] = item.label
        })
        return labels
    })

    // Methods
    const loadEnum = async () => {
        loading.value = true
        error.value = null

        try {
            enumItems.value = await getEnumByName(enumName)
        } catch (err) {
            error.value = err
        } finally {
            loading.value = false
        }
    }

    const reloadEnum = () => loadEnum()

    // Helper functions
    const getLabel = (value: string): string => {
        return getEnumLabel(enumItems.value, value)
    }

    const getColor = (value: string): string | undefined => {
        return getEnumColor(enumItems.value, value)
    }

    const getIcon = (value: string): string | undefined => {
        return getEnumIcon(enumItems.value, value)
    }

    const getDescription = (value: string): string | undefined => {
        return getEnumDescription(enumItems.value, value)
    }

    const findByValue = (value: string): EnumItem | undefined => {
        return enumMap.value[value]
    }

    const findById = (id: string): EnumItem | undefined => {
        return enumItems.value.find(item => item.id === id)
    }

    // Auto load
    if (options.immediate !== false) {
        loadEnum()
    }

    return {
        // State
        enumItems: readonly(enumItems),
        loading: readonly(loading),
        error: readonly(error),

        // Computed
        enumMap: readonly(enumMap),
        enumValues: readonly(enumValues),
        enumLabels: readonly(enumLabels),

        // Methods
        loadEnum,
        reloadEnum,

        // Helpers
        getLabel,
        getColor,
        getIcon,
        getDescription,
        findByValue,
        findById,
    }
}

/**
 * Composable để quản lý multiple enums
 */
export const useMultipleEnums = (enumNames: EnumName[]) => {
    const enumStates = ref<Record<string, any>>({})

    // Initialize enum states
    enumNames.forEach(name => {
        enumStates.value[name] = useEnumState(name)
    })

    const loading = computed(() => {
        return Object.values(enumStates.value).some(state => state.loading.value)
    })

    const error = computed(() => {
        return Object.values(enumStates.value).find(state => state.error.value)?.error.value
    })

    const loadAll = async () => {
        await Promise.all(
            Object.values(enumStates.value).map((state: any) => state.loadEnum())
        )
    }

    const getEnumState = (name: EnumName) => {
        return enumStates.value[name]
    }

    return {
        enumStates: readonly(enumStates),
        loading: readonly(loading),
        error: readonly(error),
        loadAll,
        getEnumState,
    }
}