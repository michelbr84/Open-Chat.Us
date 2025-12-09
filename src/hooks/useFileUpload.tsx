import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const useFileUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Generate a simple guest ID if no user
  const guestId = user ? null : `guest-${Date.now()}-${Math.random().toString(36).substring(2)}`;

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'File type not supported. Allowed: images, PDF, text, and document files';
    }

    return null;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Upload Error',
        description: validationError,
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const userId = user?.id || guestId;
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        id: fileName,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        uploadedAt: new Date(),
      };

      toast({
        title: 'Upload Successful',
        description: `${file.name} uploaded successfully`,
      });

      return uploadedFile;

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [user, guestId, validateFile, toast]);

  const deleteFile = useCallback(async (fileId: string, filePath: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('chat-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      toast({
        title: 'File Deleted',
        description: 'File has been successfully deleted',
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    uploadFile,
    deleteFile,
    validateFile,
    uploading,
    uploadProgress,
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES,
  };
};
