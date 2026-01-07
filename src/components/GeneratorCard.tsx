import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface GeneratorCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconImage?: string;
  isSelected: boolean;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

export function GeneratorCard({ title, description, icon: Icon, iconImage, isSelected, onClick, badge, disabled }: GeneratorCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-start gap-2 p-3 rounded-lg border transition-all duration-200 text-left w-full",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed grayscale-[0.5]"
      )}
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {badge}
        </span>
      )}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md transition-colors overflow-hidden",
        isSelected ? "bg-primary/20" : "bg-secondary"
      )}>
        {iconImage ? (
          <img
            src={iconImage}
            alt={title}
            className="h-full w-full object-cover"
            style={{ filter: 'url(#remove-white)' }}
          />
        ) : Icon ? (
          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
        ) : null}
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}
