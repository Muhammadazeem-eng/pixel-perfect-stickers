import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface PremiumVideoFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  onGenerate: (prompt: string, duration: number) => void;
  isLoading: boolean;
}

export function PremiumVideoForm({ prompt, setPrompt, duration, setDuration, onGenerate, isLoading }: PremiumVideoFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    onGenerate(prompt, duration);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Premium Badge */}
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-transparent overflow-hidden">
          <img src="/assets/premium-video-icon.png" alt="Premium" className="h-full w-full object-contain" style={{ filter: 'url(#remove-white)' }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Premium Video Generator</h3>
          <p className="text-xs text-muted-foreground">High-quality animated videos with transparency</p>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-xs">Video Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="a boy turns into ice..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none text-sm"
          required
          minLength={3}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Describe the transformation or action you want to create. Be descriptive for best results.
        </p>
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
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1s</span>
          <span>10s</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 rounded-lg bg-secondary/50 border space-y-1.5">
        <p className="text-xs font-medium">How it works:</p>
        <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside">
          <li>Generate premium video ({duration}s)</li>
          <li>Download the original MP4 video</li>
          <li>Download transparent WebP version</li>
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
        Generate Premium Video
      </Button>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          ⏳ This process takes 2-5 minutes. Please don't close this page.
        </p>
      )}
    </form>
  );
}
