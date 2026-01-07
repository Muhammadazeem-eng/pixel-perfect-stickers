import { Download, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const LOADING_STEPS = [
  "Initializing AI...",
  "Generating Sticker...",
  "Enhancing Details...",
  "Removing Background...",
  "Finalizing Output..."
];

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
  transparentPreviewUrl,
  previewType,
  isLoading,
  loadingMessage = "Generating...",
  onDownload,
  onDownloadTransparent,
  taskId,
  downloadFilename = "sticker.webp",
}: PreviewAreaProps & { transparentPreviewUrl?: string | null }) {
  const [progressStep, setProgressStep] = useState(0);
  const [viewMode, setViewMode] = useState<'original' | 'transparent'>('original');

  // Auto-switch to transparent when it becomes available if original is already showing
  useEffect(() => {
    if (transparentPreviewUrl && previewType === 'video') {
      // Optional: could auto-switch, but maybe better to let user choose.
      // Let's just default to original, user can switch.
    }
  }, [transparentPreviewUrl, previewType]);

  useEffect(() => {
    if (!isLoading) {
      setProgressStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 3500); // Slowed down significantly to feel more deliberate

    return () => clearInterval(interval);
  }, [isLoading]);

  const showTransparent = viewMode === 'transparent' && transparentPreviewUrl;
  const activeUrl = showTransparent ? transparentPreviewUrl : previewUrl;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Preview</h3>
        {previewUrl && !isLoading && (
          <div className="flex items-center gap-2">

            {/* View Mode Toggles for Video */}
            {previewType === 'video' && transparentPreviewUrl && (
              <div className="flex bg-secondary/50 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setViewMode('original')}
                  className={cn(
                    "px-2 py-1 text-[10px] rounded-md transition-all",
                    viewMode === 'original' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('transparent')}
                  className={cn(
                    "px-2 py-1 text-[10px] rounded-md transition-all",
                    viewMode === 'transparent' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Transparent
                </button>
              </div>
            )}

            {onDownload && (
              <Button type="button" variant="outline" size="xs" className="h-7 text-[10px] px-2" onClick={onDownload}>
                <Download className="h-3 w-3 mr-1" />
                {previewType === 'video' ? 'MP4' : 'WebP'}
              </Button>
            )}
            {(taskId || onDownloadTransparent) && (
              <Button type="button" variant="default" size="xs" className="h-7 text-[10px] px-2" onClick={onDownloadTransparent} disabled={!onDownloadTransparent}>
                <Download className="h-3 w-3 mr-1" />
                Trans WebP
              </Button>
            )}
          </div>
        )}
      </div>

      <div className={cn(
        "relative flex-1 min-h-[300px] rounded-xl border overflow-hidden",
        "flex items-center justify-center",
        activeUrl ? "checkered-bg" : "bg-muted/30"
      )}>
        {isLoading ? (
          <div className="relative w-full h-full">
            <Skeleton className="w-full h-full animate-shimmer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p
                key={progressStep}
                className="text-primary font-bold text-lg animate-in fade-in zoom-in duration-700"
              >
                {LOADING_STEPS[progressStep]}
              </p>
            </div>
          </div>
        ) : activeUrl ? (
          (previewType === 'video' && viewMode === 'original') ? (
            <video
              src={activeUrl}
              controls
              autoPlay
              loop
              muted
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <CardContainer className="w-full h-full p-0 py-0">
              <CardBody className="flex items-center justify-center p-0">
                <CardItem translateZ="100" className="flex items-center justify-center">
                  <img
                    src={activeUrl}
                    alt="Generated sticker preview"
                    className="max-w-[280px] max-h-[280px] md:max-w-full md:max-h-full object-contain animate-fade-in shadow-2xl rounded-xl"
                  />
                </CardItem>
              </CardBody>
            </CardContainer>
          )
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="p-0 overflow-hidden">
              {previewType === 'video' ? (
                <img src="/assets/video-placeholder.png" alt="Video Placeholder" className="h-16 w-16 object-contain opacity-80" />
              ) : (
                <img src="/assets/image-placeholder.png" alt="Image Placeholder" className="h-16 w-16 object-contain opacity-80" />
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
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary/50 text-[10px]">
          <span className="text-muted-foreground">Task ID:</span>
          <code className="font-mono text-foreground">{taskId}</code>
        </div>
      )}
    </div>
  );
}
