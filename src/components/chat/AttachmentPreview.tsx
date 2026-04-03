import { Button } from '@/components/ui/button';

interface AttachmentPreviewProps {
  attachments: any[];
  onRemove: (index: number) => void;
}

export const AttachmentPreview = ({ attachments, onRemove }: AttachmentPreviewProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((file, index) => (
        <div key={index} className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-sm">
          <span className="truncate max-w-[200px]">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
};
