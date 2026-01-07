import { useRef } from "react";
import { Clock, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryItem, clearHistory, downloadBlob, getTransparentVideo } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

interface HistorySectionProps {
  history: HistoryItem[];
  onRefresh: () => void;
}

const typeIcons = {
  sticker: '/assets/tab-stickers.png',
  animation: '/assets/tab-animations.png',
  video: '/assets/video-placeholder.png',
};

export function HistorySection({ history, onRefresh }: HistorySectionProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const downloadingRef = useRef<Set<string>>(new Set());

  const handleClear = () => {
    clearHistory();
    onRefresh();
  };

  const handleDownload = async (item: HistoryItem) => {
    if (downloadingRef.current.has(item.id)) return;
    downloadingRef.current.add(item.id);

    try {
      const response = await fetch(item.downloadUrl);
      const blob = await response.blob();
      const ext = item.type === 'video' ? 'mp4' : 'webp';
      downloadBlob(blob, `${item.type}_${item.subType}.${ext}`);
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download. File may have expired.');
    } finally {
      downloadingRef.current.delete(item.id);
    }
  };

  const handleDownloadTransparent = async (item: HistoryItem) => {
    if (!item.taskId) return;
    const key = `${item.id}:transparent`;
    if (downloadingRef.current.has(key)) return;
    downloadingRef.current.add(key);

    try {
      toast.info('Fetching transparent version...');
      const result = await getTransparentVideo(item.taskId);
      downloadBlob(result.blob, 'sticker_transparent.webp');
      toast.success('Transparent WebP downloaded!');
    } catch {
      toast.error('Failed to get transparent version. Task may have expired.');
    } finally {
      downloadingRef.current.delete(key);
    }
  };

  if (history.length === 0) {
    return (
      <div className="p-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Generation History</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Your recent generations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border bg-card shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">History</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {history.length}
          </span>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {history.map((item) => {
          const iconPath = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-36 p-2 rounded-lg border bg-card hover:border-primary/50 transition-colors group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="aspect-square rounded-md overflow-hidden bg-secondary/50 mb-2 checkered-bg flex items-center justify-center">
                {item.type === 'video' ? (
                  <video
                    src={item.thumbnail}
                    muted
                    loop
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.thumbnail}
                    alt={item.prompt}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <img src={iconPath} className="h-3 w-3 object-contain opacity-70" style={{ filter: 'url(#remove-white)' }} alt={item.type} />
                  <span className="text-[10px] text-muted-foreground capitalize">{item.subType}</span>
                </div>
                <p className="text-[11px] font-medium truncate" title={item.prompt}>
                  {item.prompt}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
                <div className="flex gap-1 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 flex-1"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="h-3 w-3" />
                    {item.type === 'video' ? 'MP4' : 'WebP'}
                  </Button>
                  {item.type === 'video' && item.taskId && (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-6 text-[10px] px-2 flex-1"
                      onClick={() => handleDownloadTransparent(item)}
                    >
                      <Download className="h-3 w-3" />
                      Trans
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md bg-transparent border-none shadow-none p-0">
          {selectedItem && (
            <div className="relative w-full h-full flex items-center justify-center p-6">
              <CardContainer className="inter-var">
                <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">

                  <div className="flex justify-between items-start">
                    <div>
                      <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-foreground dark:text-white"
                      >
                        {selectedItem.prompt}
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="60"
                        className="text-muted-foreground text-sm max-w-sm mt-2 dark:text-neutral-300"
                      >
                        {selectedItem.type.toUpperCase()} • {selectedItem.subType}
                      </CardItem>
                    </div>
                  </div>

                  <CardItem translateZ="100" className="w-full mt-4">
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary/50 checkered-bg relative group-hover/card:shadow-xl flex items-center justify-center">
                      {selectedItem.type === 'video' ? (
                        <video
                          src={selectedItem.thumbnail}
                          controls
                          loop
                          className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
                        />
                      ) : (
                        <img
                          src={selectedItem.thumbnail}
                          className="h-full w-full object-contain rounded-xl group-hover/card:shadow-xl"
                          alt="thumbnail"
                        />
                      )}
                    </div>
                  </CardItem>
                  <div className="flex justify-between items-center mt-20">
                    <CardItem
                      translateZ={20}
                      as="button"
                      className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedItem(null);
                      }}
                    >
                      Close
                    </CardItem>
                    <div className="flex gap-2">
                      {selectedItem.type === 'video' && selectedItem.taskId && (
                        <CardItem
                          translateZ={20}
                          as="button"
                          className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold border border-border"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDownloadTransparent(selectedItem);
                          }}
                        >
                          Download WebP
                        </CardItem>
                      )}
                      <CardItem
                        translateZ={20}
                        as="button"
                        className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDownload(selectedItem);
                        }}
                      >
                        Download {selectedItem.type === 'video' ? 'MP4' : 'WebP'}
                      </CardItem>
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
