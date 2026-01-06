import { useState } from "react";
import { Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PremiumVideoFormProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export function PremiumVideoForm({ onGenerate, isLoading }: PremiumVideoFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    onGenerate(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Premium Badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl gradient-primary">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
          <Star className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-primary-foreground">
          <h3 className="font-semibold">Premium Video Generator</h3>
          <p className="text-sm opacity-90">Create high-quality animated videos with transparency support</p>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Video Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="a boy turns into ice"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] resize-none"
          required
          minLength={3}
        />
        <p className="text-xs text-muted-foreground">
          Describe the transformation or action you want to create. Be descriptive for best results.
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
        <p className="text-sm font-medium">How it works:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Generate your premium video (takes 2-5 minutes)</li>
          <li>Download the original MP4 video</li>
          <li>Optionally download the transparent WebP version</li>
        </ol>
      </div>

      {/* Generate Button */}
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={isLoading || prompt.trim().length < 3}
      >
        <Video className="h-5 w-5" />
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
