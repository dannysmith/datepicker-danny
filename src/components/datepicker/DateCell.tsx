import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthAbbr } from "./utils";
import { format } from "date-fns";

interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFirstOfMonth: boolean;
  isDisabled: boolean;
  showSelectedMonthLabel: boolean;
  isDimmed: boolean;
  onClick: (date: Date) => void;
}

export function DateCell({
  date,
  isSelected,
  isToday,
  isFirstOfMonth,
  isDisabled,
  showSelectedMonthLabel,
  isDimmed,
  onClick,
}: DateCellProps) {
  // Month label is visible if: first of month, OR selected and delay has passed
  const monthLabelVisible =
    isFirstOfMonth || (isSelected && showSelectedMonthLabel);

  // Full date label for screen readers (e.g., "Monday, January 15, 2025")
  const ariaLabel = format(date, "EEEE, MMMM d, yyyy");
  // Stable ID for aria-activedescendant (e.g., "date-2025-01-15")
  const cellId = `date-${format(date, "yyyy-MM-dd")}`;

  return (
    <button
      type="button"
      id={cellId}
      role="gridcell"
      tabIndex={isSelected ? 0 : -1}
      disabled={isDisabled}
      aria-selected={isSelected}
      aria-current={isToday ? "date" : undefined}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      onClick={() => !isDisabled && onClick(date)}
      className={cn(
        "relative flex h-[34px] w-full flex-col items-center justify-center [font-size:inherit]",
        "rounded-md outline-none transition-opacity duration-200",
        isDisabled && "cursor-not-allowed text-dp-text-disabled",
        !isDisabled && isSelected && "bg-dp-primary text-dp-primary-fg",
        !isDisabled && !isSelected && isToday && "text-dp-accent font-medium",
        !isDisabled && !isSelected && !isToday && "text-dp-text-secondary hover:bg-dp-elevated/50",
        isDimmed && !isDisabled && "opacity-40"
      )}
    >
      {/* Month label - absolutely positioned at top so number stays centered */}
      <span
        className={cn(
          "absolute top-0.5 text-[0.65em] leading-none transition-opacity duration-200",
          isDisabled ? "text-dp-text-disabled" : isSelected ? "text-dp-primary-muted" : "text-dp-text-muted",
          monthLabelVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {formatMonthAbbr(date)}
      </span>
      <span className="text-[1em] leading-none">{formatDayNumber(date)}</span>
    </button>
  );
}
