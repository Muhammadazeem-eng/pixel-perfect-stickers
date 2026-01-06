import { useState } from "react";
import { Sparkles, Wand2, Bot, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneratorCard } from "@/components/GeneratorCard";
import { AnimationType, ReplicateAnimationType } from "@/lib/api";

export type StickerGeneratorType = 'free' | 'replicate' | 'gemini';

interface StickerFormProps {
  onGenerate: (type: StickerGeneratorType, prompt: string, animation: string, referenceImage?: File) => void;
  isLoading: boolean;
}

const generators = [
  { id: 'free' as const, title: 'Free Sticker', description: 'Powered by Flux Model', icon: Sparkles, badge: 'FREE' },
  { id: 'replicate' as const, title: 'Replicate Sticker', description: 'High quality generation', icon: Wand2 },
  { id: 'gemini' as const, title: 'Gemini Sticker', description: 'With optional image reference', icon: Bot },
];

const freeAnimations: AnimationType[] = ['float', 'bounce', 'pulse', 'wiggle', 'static'];
const replicateAnimations: ReplicateAnimationType[] = ['bounce', 'shake', 'pulse', 'wiggle', 'static'];

export function StickerForm({ onGenerate, isLoading }: StickerFormProps) {
  const [selectedType, setSelectedType] = useState<StickerGeneratorType>('free');
  const [prompt, setPrompt] = useState('');
  const [animation, setAnimation] = useState('float');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const animations = selectedType === 'replicate' ? replicateAnimations : freeAnimations;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setReferenceImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 3) return;
    onGenerate(selectedType, prompt, animation, referenceImage || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Generator Selection */}
      <div className="space-y-3">
        <Label>Generator Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {generators.map((gen) => (
            <GeneratorCard
              key={gen.id}
              title={gen.title}
              description={gen.description}
              icon={gen.icon}
              isSelected={selectedType === gen.id}
              onClick={() => {
                setSelectedType(gen.id);
                setAnimation(gen.id === 'replicate' ? 'bounce' : 'float');
              }}
              badge={gen.badge}
            />
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Input
          id="prompt"
          placeholder="a person is going to school"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-11"
          required
          minLength={3}
        />
        <p className="text-xs text-muted-foreground">Describe what you want your sticker to show</p>
      </div>

      {/* Animation Selection */}
      <div className="space-y-2">
        <Label htmlFor="animation">Animation Style</Label>
        <Select value={animation} onValueChange={setAnimation}>
          <SelectTrigger id="animation" className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {animations.map((anim) => (
              <SelectItem key={anim} value={anim} className="capitalize">
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
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={isLoading || prompt.trim().length < 3}
      >
        <Sparkles className="h-5 w-5" />
        Generate {generators.find(g => g.id === selectedType)?.title}
      </Button>
    </form>
  );
}
