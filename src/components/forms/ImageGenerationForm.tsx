import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ImageGenerationFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    onGenerate: (prompt: string, aspectRatio: string) => void;
    isLoading: boolean;
}

const ASPECT_RATIOS = [
    "1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "2:3", "3:2"
];

export function ImageGenerationForm({
    prompt,
    setPrompt,
    aspectRatio,
    setAspectRatio,
    onGenerate,
    isLoading
}: ImageGenerationFormProps) {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim().length < 3) return;
        onGenerate(prompt, aspectRatio);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Badge */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-transparent overflow-hidden">
                    {/* Fallback icon or reuse one */}
                    <span className="text-2xl">🖼️</span>
                </div>
                <div>
                    <h3 className="font-semibold text-sm">Image Generator</h3>
                    <p className="text-xs text-muted-foreground">Generate images using Flux Model</p>
                </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
                <Label htmlFor="prompt" className="text-xs">Image Prompt</Label>
                <Input
                    id="prompt"
                    placeholder="A futuristic city with neon lights..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-9 text-sm"
                    required
                    minLength={3}
                    disabled={isLoading}
                />
            </div>

            {/* Aspect Ratio Select */}
            <div className="space-y-2">
                <Label className="text-xs">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isLoading}>
                    <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                            <SelectItem key={ratio} value={ratio}>
                                {ratio}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                Generate Image
            </Button>
        </form>
    );
}
