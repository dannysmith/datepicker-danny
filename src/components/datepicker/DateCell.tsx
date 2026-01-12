import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthAbbr } from "./utils";

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

  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick(date)}
      className={cn(
        "relative flex h-[34px] w-full flex-col items-center justify-center",
        "rounded-md outline-none transition-opacity duration-200",
        isDisabled && "cursor-not-allowed text-zinc-700",
        !isDisabled && isSelected && "bg-blue-600 text-white",
        !isDisabled && !isSelected && isToday && "text-blue-500 font-medium",
        !isDisabled && !isSelected && !isToday && "text-zinc-400 hover:bg-zinc-800/50",
        isDimmed && !isDisabled && "opacity-40"
      )}
    >
      {/* Month label - absolutely positioned at top so number stays centered */}
      <span
        className={cn(
          "absolute top-0.5 text-[9px] leading-none transition-opacity duration-200",
          isDisabled ? "text-zinc-700" : isSelected ? "text-blue-200" : "text-zinc-500",
          monthLabelVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {formatMonthAbbr(date)}
      </span>
      <span className="text-sm leading-none">{formatDayNumber(date)}</span>
    </button>
  );
}
