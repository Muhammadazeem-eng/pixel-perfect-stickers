import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export type PremiumMode = 'sticker' | 'video';

interface PremiumVideoFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  duration: number;
  setDuration: (duration: number) => void;

  mode: PremiumMode;
  setMode: (mode: PremiumMode) => void;

  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;

  onGenerate: (prompt: string, duration: number, mode: PremiumMode, aspectRatio: string) => void;
  isLoading: boolean;
}

const VIDEO_ASPECT_RATIOS = [
  { label: "16:9 Landscape (480p)", value: "16:9_480p" },
  { label: "16:9 Landscape (720p)", value: "16:9_720p" },
  { label: "9:16 Portrait (480p)", value: "9:16_480p" },
  { label: "9:16 Portrait (720p)", value: "9:16_720p" },
  { label: "1:1 Square (480p)", value: "1:1_480p" },
  { label: "1:1 Square (720p)", value: "1:1_720p" },
  { label: "4:3 Standard (480p)", value: "4:3_480p" },
  { label: "4:3 Standard (720p)", value: "4:3_720p" },
  { label: "3:4 Vertical (480p)", value: "3:4_480p" },
  { label: "3:4 Vertical (720p)", value: "3:4_720p" },
  { label: "21:9 Ultrawide (480p)", value: "21:9_480p" },
  { label: "21:9 Ultrawide (720p)", value: "21:9_720p" },
];

export function PremiumVideoForm({
  prompt, setPrompt,
  duration, setDuration,
  mode, setMode,
  aspectRatio, setAspectRatio,
  onGenerate,
  isLoading
}: PremiumVideoFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    onGenerate(prompt, duration, mode, aspectRatio);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Premium Badge & Mode Switch */}
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-transparent overflow-hidden">
          <img src="/assets/premium-video-icon.png" alt="Premium" className="h-full w-full object-contain" style={{ filter: 'url(#remove-white)' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Premium Generator</h3>
          <p className="text-xs text-muted-foreground">High-quality video generation</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(val) => setMode(val as PremiumMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sticker">Transparent Sticker</TabsTrigger>
          <TabsTrigger value="video">Only Video</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-xs">
          {mode === 'sticker' ? 'Sticker Prompt' : 'Video Prompt'}
        </Label>
        <Textarea
          id="prompt"
          placeholder={mode === 'sticker' ? "a boy turns into ice..." : "cinematic shot of a cybernetic city..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] resize-none text-sm"
          required
          minLength={3}
          disabled={isLoading}
        />
      </div>

      {/* Duration Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="duration" className="text-xs">Duration (seconds)</Label>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
            {duration}s
          </span>
        </div>
        <Slider
          id="duration"
          value={[duration]}
          onValueChange={([value]) => setDuration(value)}
          min={1}
          max={10}
          step={1}
          className="w-full"
          disabled={isLoading}
        />
      </div>

      {/* Aspect Ratio - Only for Video Mode */}
      {mode === 'video' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label className="text-xs">Aspect Ratio & Quality</Label>
          <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Select ratio" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {VIDEO_ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-secondary/50 border space-y-1.5">
        <p className="text-xs font-medium">How it works:</p>
        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside">
          {mode === 'sticker' ? (
            <>
              <li>Generate {duration}s video (Square)</li>
              <li>Download original MP4</li>
              <li>Download transparent WebP sticker</li>
            </>
          ) : (
            <>
              <li>Generate {duration}s video at selected ratio</li>
              <li>Download MP4 video</li>
              <li>Background is NOT removed</li>
            </>
          )}
        </ol>
      </div>

      {/* Generate Button */}
      <Button
        type="submit"
        variant="default"
        size="default"
        className="w-full h-10"
        disabled={isLoading || prompt.trim().length < 3}
      >
        <img src="/assets/app-logo.png" className="h-5 w-5 mr-1" style={{ filter: 'url(#remove-white)' }} alt="Logo" />
        Generate {mode === 'sticker' ? 'Sticker' : 'Video'}
      </Button>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          ⏳ This process typically takes 2-5 minutes.
        </p>
      )}
    </form>
  );
}
