import { useState } from "react";
import { Sparkles, Wand2, Bot, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GeneratorCard } from "@/components/GeneratorCard";

export type AnimationGeneratorType = 'free' | 'replicate' | 'gemini';

interface AnimationFormProps {
  onGenerate: (type: AnimationGeneratorType, concept: string, frames: number, referenceImage?: File) => void;
  isLoading: boolean;
}

const generators = [
  { id: 'free' as const, title: 'Free Animation', description: 'Quick & free generation', icon: Sparkles, badge: 'FREE', maxFrames: 6 },
  { id: 'replicate' as const, title: 'Replicate Animation', description: 'High quality frames', icon: Wand2, maxFrames: 6 },
  { id: 'gemini' as const, title: 'Gemini Animation', description: 'With optional image reference', icon: Bot, maxFrames: 4 },
];

export function AnimationForm({ onGenerate, isLoading }: AnimationFormProps) {
  const [selectedType, setSelectedType] = useState<AnimationGeneratorType>('free');
  const [concept, setConcept] = useState('');
  const [frames, setFrames] = useState(2);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const currentGenerator = generators.find(g => g.id === selectedType)!;
  const maxFrames = currentGenerator.maxFrames;

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
    if (concept.trim().length < 3) return;
    onGenerate(selectedType, concept, frames, referenceImage || undefined);
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
                if (frames > gen.maxFrames) setFrames(gen.maxFrames);
              }}
              badge={gen.badge}
            />
          ))}
        </div>
      </div>

      {/* Concept Input */}
      <div className="space-y-2">
        <Label htmlFor="concept">Animation Concept</Label>
        <Input
          id="concept"
          placeholder="teacher beat the student"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          className="h-11"
          required
          minLength={3}
        />
        <p className="text-xs text-muted-foreground">Describe the action or transformation you want to animate</p>
      </div>

      {/* Frames Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="frames">Number of Frames</Label>
          <span className="text-sm font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
            {frames} frames
          </span>
        </div>
        <Slider
          id="frames"
          value={[frames]}
          onValueChange={([value]) => setFrames(value)}
          min={2}
          max={maxFrames}
          step={1}
          className="w-full"
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
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={isLoading || concept.trim().length < 3}
      >
        <Sparkles className="h-5 w-5" />
        Generate {currentGenerator.title}
      </Button>
    </form>
  );
}
