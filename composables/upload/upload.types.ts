import type { Ref } from 'vue'

/**
 * Upload Response DTO từ API
 */
export interface UploadResponse {
  path: string
  url: string
  filename: string
  size: number
  mimetype: string
}

/**
 * Options cho upload file
 */
export interface UploadOptions {
  /**
   * Kích thước file tối đa (bytes)
   * Mặc định: 10MB (10485760 bytes)
   */
  maxSize?: number

  /**
   * Các loại file được phép (MIME types)
   * Ví dụ: ['image/jpeg', 'image/png']
   * Nếu không có, chấp nhận mọi loại file
   */
  allowedTypes?: string[]

  /**
   * Callback khi upload thành công
   */
  onSuccess?: (response: UploadResponse) => void

  /**
   * Callback khi upload thất bại
   */
  onError?: (error: Error) => void

  /**
   * Callback khi upload progress
   */
  onProgress?: (progress: number) => void
}

/**
 * Result từ useUpload composable
 */
export interface UseUploadResult {
  /**
   * Upload một file
   */
  uploadFile: (file: File, options?: UploadOptions) => Promise<UploadResponse>

  /**
   * Upload nhiều files
   */
  uploadFiles: (files: File[], options?: UploadOptions) => Promise<UploadResponse[]>

  /**
   * Trạng thái đang upload
   */
  uploading: Ref<boolean>

  /**
   * Lỗi upload (nếu có)
   */
  error: Ref<string | null>

  /**
   * Progress (0-100)
   */
  progress: Ref<number>
}

