import { Clock, Trash2, Sticker, Film, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryItem, clearHistory } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface HistorySectionProps {
  history: HistoryItem[];
  onRefresh: () => void;
}

const typeIcons = {
  sticker: Sticker,
  animation: Film,
  video: Video,
};

export function HistorySection({ history, onRefresh }: HistorySectionProps) {
  const handleClear = () => {
    clearHistory();
    onRefresh();
  };

  if (history.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card/50">
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
    <div className="p-6 rounded-xl border border-border bg-card/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Generation History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {history.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {history.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-40 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="aspect-square rounded-md overflow-hidden bg-secondary/50 mb-2 checkered-bg">
                <img
                  src={item.thumbnail}
                  alt={item.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">{item.subType}</span>
                </div>
                <p className="text-xs font-medium truncate" title={item.prompt}>
                  {item.prompt}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
