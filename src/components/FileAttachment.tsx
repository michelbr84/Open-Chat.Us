import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  ExternalLink,
  X
} from 'lucide-react';
import { UploadedFile } from '@/hooks/useFileUpload';

interface FileAttachmentProps {
  file: UploadedFile;
  onRemove?: (fileId: string) => void;
  showRemoveButton?: boolean;
  compact?: boolean;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  onRemove,
  showRemoveButton = false,
  compact = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf' || type.startsWith('text/')) return FileText;
    return File;
  };

  const isImage = file.type.startsWith('image/');
  const FileIcon = getFileIcon(file.type);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
        <FileIcon className="w-4 h-4 text-muted-foreground" />
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline max-w-[150px] truncate"
        >
          {file.name}
        </a>
        <Badge variant="secondary" className="text-xs">
          {formatFileSize(file.size)}
        </Badge>
        {showRemoveButton && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <FileIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}
              </div>
              {file.uploadedAt && (
                <div className="text-xs text-muted-foreground mt-1">
                  {file.uploadedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
              title="Download file"
            >
              <a href={file.url} download={file.name}>
                <Download className="w-4 h-4" />
              </a>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
              title="Open in new tab"
            >
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>

            {showRemoveButton && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(file.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {isImage && (
          <div className="mt-3">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-32 object-cover rounded border"
              loading="lazy"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};