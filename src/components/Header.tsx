import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 overflow-hidden p-0.5">
            <img src="/assets/app-logo.png" alt="Logo" className="h-full w-full object-contain" style={{ filter: 'url(#remove-white)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Sticker Generator</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Create amazing stickers & animations</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
