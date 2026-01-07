import { Sticker, Film, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = 'stickers' | 'animations' | 'premium';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isLoading?: boolean;
}

const tabs = [
  { id: 'stickers' as const, label: 'Stickers', iconImage: '/assets/tab-stickers.png' },
  { id: 'animations' as const, label: 'Animations', iconImage: '/assets/tab-animations.png' },
  { id: 'premium' as const, label: 'Premium Video', iconImage: '/assets/tab-premium.png', premium: true },
];

export function TabNavigation({ activeTab, onTabChange, isLoading }: TabNavigationProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 p-1 bg-secondary/50 rounded-lg w-fit transition-opacity",
      isLoading && "opacity-50 pointer-events-none cursor-not-allowed"
    )}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            type="button"
            key={tab.id}
            disabled={isLoading}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium text-xs transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              tab.premium && isActive && "bg-primary"
            )}
          >
            <div className="h-5 w-5 flex items-center justify-center overflow-hidden">
              <img
                src={tab.iconImage}
                alt={tab.label}
                className={cn(
                  "h-full w-full object-contain transition-all duration-200",
                  isActive ? "brightness-110" : "grayscale-[0.5] opacity-70"
                )}
                style={{ filter: 'url(#remove-white)' }}
              />
            </div>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.premium && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                isActive ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
              )}>
                PRO
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
