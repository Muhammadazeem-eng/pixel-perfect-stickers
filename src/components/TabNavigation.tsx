import { Sticker, Film, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = 'stickers' | 'animations' | 'premium';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'stickers' as const, label: 'Stickers', icon: Sticker },
  { id: 'animations' as const, label: 'Animations', icon: Film },
  { id: 'premium' as const, label: 'Premium Video', icon: Star, premium: true },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
              isActive
                ? "bg-card text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50",
              tab.premium && isActive && "gradient-primary text-primary-foreground shadow-glow"
            )}
          >
            <Icon className="h-4 w-4" />
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
