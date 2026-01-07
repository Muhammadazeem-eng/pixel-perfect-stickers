import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GeneratorCard } from "@/components/GeneratorCard";

export type AnimationGeneratorType = 'free' | 'replicate' | 'gemini';

interface AnimationFormProps {
  selectedType: AnimationGeneratorType;
  onTypeChange: (type: AnimationGeneratorType) => void;
  state: { concept: string; frames: number; referenceImage: File | null; imagePreview: string | null };
  setState: (state: Partial<{ concept: string; frames: number; referenceImage: File | null; imagePreview: string | null }>) => void;
  onGenerate: (type: AnimationGeneratorType, concept: string, frames: number, referenceImage?: File) => void;
  isLoading: boolean;
}

const generators = [
  { id: 'free' as const, title: 'Free Animation', description: 'Quick & free generation', iconImage: '/assets/free-anim-icon.png', badge: 'FREE', maxFrames: 6 },
  { id: 'replicate' as const, title: 'Replicate Animation', description: 'High quality frames', iconImage: '/assets/replicate-anim-icon.png', maxFrames: 6 },
  { id: 'gemini' as const, title: 'Gemini Animation', description: 'With optional image reference', iconImage: '/assets/gemini-anim-icon.png', maxFrames: 4 },
];

export function AnimationForm({ selectedType, onTypeChange, state, setState, onGenerate, isLoading }: AnimationFormProps) {
  const { concept, frames, referenceImage, imagePreview } = state;

  const currentGenerator = generators.find(g => g.id === selectedType)!;
  const maxFrames = currentGenerator.maxFrames;

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
    if (concept.trim().length < 3) return;
    onGenerate(selectedType, concept, frames, referenceImage || undefined);
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
                if (frames > gen.maxFrames) setState({ frames: gen.maxFrames });
              }}
              badge={gen.badge}
            />
          ))}
        </div>
      </div>

      {/* Concept Input */}
      <div className="space-y-2">
        <Label htmlFor="concept" className="text-xs">Animation Concept</Label>
        <Input
          id="concept"
          placeholder="teacher beat the student..."
          value={concept}
          onChange={(e) => setState({ concept: e.target.value })}
          className="h-9 text-sm"
          required
          minLength={3}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">Describe the action or transformation you want to animate</p>
      </div>

      {/* Frames Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="frames" className="text-xs">Number of Frames</Label>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
            {frames} frames
          </span>
        </div>
        <Slider
          id="frames"
          value={[frames]}
          onValueChange={([value]) => setState({ frames: value })}
          min={2}
          max={maxFrames}
          step={1}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>2 frames</span>
          <span>{maxFrames} frames</span>
        </div>
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
        disabled={isLoading || concept.trim().length < 3}
      >
        <img src="/assets/app-logo.png" className="h-5 w-5 mr-1" style={{ filter: 'url(#remove-white)' }} alt="Logo" />
        Generate {currentGenerator.title}
      </Button>
    </form>
  );
}
