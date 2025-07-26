import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload } from 'lucide-react';
import { useFileUpload, UploadedFile } from '@/hooks/useFileUpload';

interface FileUploadButtonProps {
  onFileUploaded: (file: UploadedFile) => void;
  disabled?: boolean;
  variant?: 'icon' | 'button';
  className?: string;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUploaded,
  disabled = false,
  variant = 'icon',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, allowedTypes, maxFileSize } = useFileUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedFile = await uploadFile(file);
    if (uploadedFile) {
      onFileUploaded(uploadedFile);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const acceptedTypes = allowedTypes.join(',');
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
      
      {variant === 'icon' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClick}
          disabled={disabled || uploading}
          className={`h-8 w-8 p-0 ${className}`}
          title={`Upload file (max ${maxSizeMB}MB)`}
        >
          {uploading ? (
            <Upload className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || uploading}
          className={className}
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Paperclip className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      )}
    </>
  );
};