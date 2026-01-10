import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ImageGenerationFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    width: number;
    setWidth: (width: number) => void;
    height: number;
    setHeight: (height: number) => void;
    onGenerate: (prompt: string, width: number, height: number) => void;
    isLoading: boolean;
}

export function ImageGenerationForm({
    prompt,
    setPrompt,
    width,
    setWidth,
    height,
    setHeight,
    onGenerate,
    isLoading
}: ImageGenerationFormProps) {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim().length < 3) return;
        onGenerate(prompt, width, height);
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

            <div className="grid grid-cols-2 gap-4">
                {/* Width Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="width" className="text-xs">Width</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className="h-6 w-16 text-xs px-1.5 py-0.5 rounded-md bg-primary/10 border-primary/20 text-primary font-medium text-center focus-visible:ring-1 focus-visible:ring-primary/30"
                                disabled={isLoading}
                            />
                            <span className="text-[10px] text-muted-foreground font-medium">px</span>
                        </div>
                    </div>
                    <Slider
                        id="width"
                        value={[width]}
                        onValueChange={([value]) => setWidth(value)}
                        min={256}
                        max={1024}
                        step={64}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>

                {/* Height Slider */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="height" className="text-xs">Height</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className="h-6 w-16 text-xs px-1.5 py-0.5 rounded-md bg-primary/10 border-primary/20 text-primary font-medium text-center focus-visible:ring-1 focus-visible:ring-primary/30"
                                disabled={isLoading}
                            />
                            <span className="text-[10px] text-muted-foreground font-medium">px</span>
                        </div>
                    </div>
                    <Slider
                        id="height"
                        value={[height]}
                        onValueChange={([value]) => setHeight(value)}
                        min={256}
                        max={1024}
                        step={64}
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>
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
