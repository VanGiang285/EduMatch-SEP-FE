import { useState, useCallback } from 'react';
import { MediaService, MediaType, UploadToCloudResponse } from '@/services/mediaService';
import { useAuth } from '@/contexts/AuthContext';

export interface UseFileUploadReturn {
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File, mediaType: MediaType) => Promise<UploadToCloudResponse | null>;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadFile = useCallback(async (file: File, mediaType: MediaType): Promise<UploadToCloudResponse | null> => {
    if (!user?.email) {
      setError('Vui lòng đăng nhập để tải file');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('🔄 Uploading file:', file.name, 'Type:', mediaType);
      
      const response = await MediaService.uploadFile({
        file,
        ownerEmail: user.email,
        mediaType
      });

      if (response.success && response.data) {
        console.log('✅ File uploaded successfully:', response.data);
        return response.data;
      } else {
        setError(response.message || 'Không thể tải file lên');
        return null;
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Lỗi khi tải file lên');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user?.email]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    error,
    uploadFile,
    clearError,
  };
}

