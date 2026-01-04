import { ref, computed } from 'vue'

export interface LazyDataOptions {
    immediate?: boolean
    threshold?: number
    rootMargin?: string
}

export function useLazyDataLoader<T>(
    fetcher: () => Promise<T>,
    options: LazyDataOptions = {}
) {
    const {
        immediate = false,
        threshold = 0.1,
        rootMargin = '0px'
    } = options

    const data = ref<T | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const hasLoaded = ref(false)

    // Create a target element for intersection observer
    const target = ref<HTMLElement | null>(null)

    // Computed property to check if we should start loading
    const shouldLoad = computed(() => {
        return hasLoaded.value || loading.value
    })

    // Function to load data
    const loadData = async () => {
        if (loading.value || hasLoaded.value) return

        loading.value = true
        error.value = null

        try {
            const result = await fetcher()
            data.value = result
            hasLoaded.value = true
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'An error occurred'
        } finally {
            loading.value = false
        }
    }

    // Set up intersection observer
    let observer: IntersectionObserver | null = null

    const observeElement = (element: HTMLElement) => {
        target.value = element

        if (observer) {
            observer.disconnect()
        }

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasLoaded.value && !loading.value) {
                        loadData()
                    }
                })
            },
            { threshold, rootMargin }
        )

        observer.observe(element)
    }

    const unobserve = () => {
        if (observer && target.value) {
            observer.unobserve(target.value)
        }
    }

    // Load immediately if immediate is true
    if (immediate) {
        loadData()
    }

    // Cleanup
    const stop = () => {
        if (observer) {
            observer.disconnect()
            observer = null
        }
    }

    return {
        data,
        loading,
        error,
        hasLoaded,
        target,
        loadData,
        observeElement,
        unobserve,
        stop
    }
}