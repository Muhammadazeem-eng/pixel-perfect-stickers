import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface GeneratorCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
  badge?: string;
}

export function GeneratorCard({ title, description, icon: Icon, isSelected, onClick, badge }: GeneratorCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left w-full",
        isSelected
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      )}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
          {badge}
        </span>
      )}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
        isSelected ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}
