import { ref } from 'vue'
import { useApiClient } from '@/composables/api/useApiClient'
import type { UploadResponse, UploadOptions, UseUploadResult } from './upload.types'

/**
 * Composable để upload file lên server
 * Hỗ trợ upload một file hoặc nhiều files
 */
export function useUpload(): UseUploadResult {
  const { apiClient } = useApiClient()

  const uploading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  /**
   * Validate file trước khi upload
   */
  function validateFile(file: File, options?: UploadOptions): void {
    // Kiểm tra kích thước file
    const maxSize = options?.maxSize ?? 10 * 1024 * 1024 // 10MB mặc định
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
      throw new Error(`File ${file.name} vượt quá kích thước tối đa ${maxSizeMB}MB`)
    }

    // Kiểm tra loại file
    if (options?.allowedTypes && options.allowedTypes.length > 0) {
      const isValidType = options.allowedTypes.some(allowedType => {
        // Nếu allowedType có wildcard (ví dụ: image/*)
        if (allowedType.endsWith('/*')) {
          const baseType = allowedType.slice(0, -2) // Bỏ '/*' đi
          return file.type.startsWith(baseType + '/')
        }
        // So sánh chính xác
        return file.type === allowedType
      })

      if (!isValidType) {
        throw new Error(`Loại file ${file.type} không được hỗ trợ. Chỉ chấp nhận: ${options.allowedTypes.join(', ')}`)
      }
    }
  }

  /**
   * Upload một file
   */
  async function uploadFile(file: File, options?: UploadOptions): Promise<UploadResponse> {
    // Validate file
    validateFile(file, options)

    uploading.value = true
    error.value = null
    progress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Gọi API upload
      const response = await apiClient.post<UploadResponse>(
        '/api/upload/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              progress.value = percentCompleted
              options?.onProgress?.(percentCompleted)
            }
          }
        }
      )

      // Lấy response data - API trả về { success, message, data: { url, path, ... } }
      let responseData = response.data
      
      // Nếu response.data có property data (nested response), lấy data đó
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        responseData = (responseData as any).data
      }
      
      // Đảm bảo responseData có đầy đủ thông tin cần thiết
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response from server')
      }
      
      // Đảm bảo có url hoặc path
      if (!responseData.url && !responseData.path) {
        throw new Error('Response không chứa url hoặc path')
      }
      
      // Gọi callback onSuccess
      options?.onSuccess?.(responseData)

      progress.value = 100
      return responseData
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage = err.response?.data?.message || err.message || 'Upload thất bại'
      error.value = errorMessage
      options?.onError?.(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      uploading.value = false
      // Reset progress sau 500ms
      setTimeout(() => {
        progress.value = 0
      }, 500)
    }
  }

  /**
   * Upload nhiều files
   */
  async function uploadFiles(files: File[], options?: UploadOptions): Promise<UploadResponse[]> {
    // Kiểm tra số lượng files
    if (files.length === 0) {
      throw new Error('Không có file nào để upload')
    }

    if (files.length > 10) {
      throw new Error('Chỉ có thể upload tối đa 10 files một lúc')
    }

    // Validate tất cả files
    files.forEach(file => {
      validateFile(file, options)
    })

    uploading.value = true
    error.value = null
    progress.value = 0

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Gọi API upload nhiều files
      const response = await apiClient.post<UploadResponse[]>(
        '/api/upload/files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              progress.value = percentCompleted
              options?.onProgress?.(percentCompleted)
            }
          }
        }
      )

      // Lấy response data
      const responseData = response.data

      // Gọi callback onSuccess cho mỗi file
      responseData.forEach(result => {
        options?.onSuccess?.(result)
      })

      progress.value = 100
      return responseData
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage = err.response?.data?.message || err.message || 'Upload thất bại'
      error.value = errorMessage
      options?.onError?.(new Error(errorMessage))
      throw new Error(errorMessage)
    } finally {
      uploading.value = false
      // Reset progress sau 500ms
      setTimeout(() => {
        progress.value = 0
      }, 500)
    }
  }

  return {
    uploadFile,
    uploadFiles,
    uploading,
    error,
    progress
  }
}

