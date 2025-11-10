import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';

// Types for Cloud Media API
export type MediaType = 'Image' | 'Video';

export interface UploadToCloudResponse {
  success: boolean;
  message: string;
  data?: {
    publicId: string;
    secureUrl: string;
    originalUrl: string;
    width?: number;
    height?: number;
    format: string;
    bytes: number;
    resourceType: string;
  };
  error?: any;
}

export interface UploadMediaFormRequest {
  file: File;
  ownerEmail: string;
  mediaType: MediaType;
}

export interface UploadFromUrlRequest {
  fileUrl: string;
  ownerEmail: string;
}

export class MediaService {
  /**
   * Upload file from form-data (multipart/form-data)
   */
  static async uploadFile(request: UploadMediaFormRequest): Promise<ApiResponse<UploadToCloudResponse>> {
    const formData = new FormData();
    formData.append('File', request.file);
    formData.append('OwnerEmail', request.ownerEmail);
    formData.append('MediaType', request.mediaType);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('MediaService.uploadFile - File:', request.file.name, request.file.type, request.file.size);
      console.log('MediaService.uploadFile - OwnerEmail:', request.ownerEmail);
      console.log('MediaService.uploadFile - MediaType:', request.mediaType);
      console.log('MediaService.uploadFile - Endpoint:', API_ENDPOINTS.CLOUD_MEDIA.UPLOAD);
      // Check FormData contents
      for (const [key, value] of formData.entries()) {
        console.log(`FormData[${key}]:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
      }
    }

    return apiClient.post<UploadToCloudResponse>(
      API_ENDPOINTS.CLOUD_MEDIA.UPLOAD,
      formData
    );
  }

  /**
   * Upload file from URL
   */
  static async uploadFromUrl(request: UploadFromUrlRequest): Promise<ApiResponse<UploadToCloudResponse>> {
    return apiClient.post<UploadToCloudResponse>(
      API_ENDPOINTS.CLOUD_MEDIA.UPLOAD_FROM_URL,
      request
    );
  }

  /**
   * Delete file by publicId
   */
  static async deleteFile(publicId: string): Promise<ApiResponse<UploadToCloudResponse>> {
    const endpoint = replaceUrlParams(API_ENDPOINTS.CLOUD_MEDIA.DELETE, { publicId });
    return apiClient.delete<UploadToCloudResponse>(endpoint);
  }
}

