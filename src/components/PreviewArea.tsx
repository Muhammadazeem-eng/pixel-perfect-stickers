import { Download, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewAreaProps {
  previewUrl: string | null;
  previewType: 'image' | 'video';
  isLoading: boolean;
  loadingMessage?: string;
  onDownload?: () => void;
  onDownloadTransparent?: () => void;
  taskId?: string | null;
  downloadFilename?: string;
}

export function PreviewArea({
  previewUrl,
  previewType,
  isLoading,
  loadingMessage = "Generating...",
  onDownload,
  onDownloadTransparent,
  taskId,
  downloadFilename = "sticker.webp",
}: PreviewAreaProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Preview</h3>
        {previewUrl && !isLoading && (
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
                Download {previewType === 'video' ? 'MP4' : 'WebP'}
              </Button>
            )}
            {taskId && onDownloadTransparent && (
              <Button variant="gradient" size="sm" onClick={onDownloadTransparent}>
                <Download className="h-4 w-4" />
                Transparent WebP
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className={cn(
        "relative flex-1 min-h-[300px] rounded-xl border border-border overflow-hidden",
        "flex items-center justify-center",
        previewUrl ? "checkered-bg" : "bg-secondary/30"
      )}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="relative">
              <div className="absolute inset-0 rounded-full gradient-primary opacity-20 blur-xl animate-pulse-glow" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
            </div>
            <div className="text-center">
              <p className="font-medium">{loadingMessage}</p>
              <p className="text-xs mt-1">This may take a moment...</p>
            </div>
          </div>
        ) : previewUrl ? (
          previewType === 'video' ? (
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              muted
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Generated sticker preview"
              className="max-w-full max-h-full object-contain animate-fade-in"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="p-4 rounded-xl bg-secondary/50">
              {previewType === 'video' ? (
                <Video className="h-8 w-8" />
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
            </div>
            <div className="text-center">
              <p className="font-medium">No preview yet</p>
              <p className="text-xs mt-1">Generate something to see it here</p>
            </div>
          </div>
        )}
      </div>

      {taskId && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-xs">
          <span className="text-muted-foreground">Task ID:</span>
          <code className="font-mono text-foreground">{taskId}</code>
        </div>
      )}
    </div>
  );
}
