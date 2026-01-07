import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneratorCard } from "@/components/GeneratorCard";
import { AnimationType, ReplicateAnimationType } from "@/lib/api";

export type StickerGeneratorType = 'free' | 'replicate' | 'gemini';

interface StickerFormProps {
  selectedType: StickerGeneratorType;
  onTypeChange: (type: StickerGeneratorType) => void;
  state: { prompt: string; animation: string; referenceImage: File | null; imagePreview: string | null };
  setState: (state: Partial<{ prompt: string; animation: string; referenceImage: File | null; imagePreview: string | null }>) => void;
  onGenerate: (type: StickerGeneratorType, prompt: string, animation: string, referenceImage?: File) => void;
  isLoading: boolean;
}

const generators = [
  { id: 'free' as const, title: 'Free Sticker', description: 'Powered by Flux Model', iconImage: '/assets/free-icon.png', badge: 'FREE' },
  { id: 'replicate' as const, title: 'Replicate Sticker', description: 'High quality generation', iconImage: '/assets/replicate-icon.png' },
  { id: 'gemini' as const, title: 'Gemini Sticker', description: 'With optional image reference', iconImage: '/assets/gemini-icon.png' },
];

const freeAnimations: AnimationType[] = ['float', 'bounce', 'pulse', 'wiggle', 'static'];
const replicateAnimations: ReplicateAnimationType[] = ['bounce', 'shake', 'pulse', 'wiggle', 'static'];

export function StickerForm({ selectedType, onTypeChange, state, setState, onGenerate, isLoading }: StickerFormProps) {
  const { prompt, animation, referenceImage, imagePreview } = state;

  const animations = selectedType === 'replicate' ? replicateAnimations : freeAnimations;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setState({ referenceImage: file, imagePreview: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setState({ referenceImage: null, imagePreview: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    onGenerate(selectedType, prompt, animation, referenceImage || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Generator Selection */}
      <div className="space-y-2">
        <Label className="text-xs">Generator Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {generators.map((gen) => (
            <GeneratorCard
              key={gen.id}
              title={gen.title}
              description={gen.description}
              iconImage={gen.iconImage}
              isSelected={selectedType === gen.id}
              disabled={isLoading}
              onClick={() => {
                onTypeChange(gen.id);
                setState({ animation: gen.id === 'replicate' ? 'bounce' : 'float' });
              }}
              badge={gen.badge}
            />
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-xs">Prompt</Label>
        <Input
          id="prompt"
          placeholder="a person is going to school..."
          value={prompt}
          onChange={(e) => setState({ prompt: e.target.value })}
          className="h-9 text-sm"
          required
          minLength={3}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">Describe what you want your sticker to show</p>
      </div>

      {/* Animation Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="animation" className="text-xs">Animation Style</Label>
        <Select value={animation} onValueChange={(val) => setState({ animation: val })} disabled={isLoading}>
          <SelectTrigger id="animation" className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {animations.map((anim) => (
              <SelectItem key={anim} value={anim} className="capitalize text-sm">
                {anim}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reference Image (Gemini only) */}
      {selectedType === 'gemini' && (
        <div className="space-y-2">
          <Label>Reference Image (Optional)</Label>
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
              <img src={imagePreview} alt="Reference" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload reference image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Generate Button */}
      <Button
        type="submit"
        variant="default"
        size="default"
        className="w-full h-10"
        disabled={isLoading || prompt.trim().length < 3}
      >
        <img src="/assets/app-logo.png" className="h-5 w-5 mr-1" alt="Logo" />
        Generate {generators.find(g => g.id === selectedType)?.title}
      </Button>
    </form>
  );
}
