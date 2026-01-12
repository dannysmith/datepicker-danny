import { cn } from "@/lib/utils";

interface MonthOverlayProps {
  monthName: string;
  isVisible: boolean;
}

export function MonthOverlay({ monthName, isVisible }: MonthOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1/3 flex items-center justify-center",
        "transition-opacity duration-100",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="text-[1.7em] font-semibold text-dp-text-secondary/80">
        {monthName}
      </span>
    </div>
  );
}
