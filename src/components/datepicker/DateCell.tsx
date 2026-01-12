import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthAbbr } from "./utils";

interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFirstOfMonth: boolean;
  showSelectedMonthLabel: boolean;
  onClick: (date: Date) => void;
}

export function DateCell({
  date,
  isSelected,
  isToday,
  isFirstOfMonth,
  showSelectedMonthLabel,
  onClick,
}: DateCellProps) {
  // Month label is visible if: first of month, OR selected and delay has passed
  const monthLabelVisible =
    isFirstOfMonth || (isSelected && showSelectedMonthLabel);

  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => onClick(date)}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        "rounded-md outline-none",
        isSelected && "bg-blue-600 text-white",
        !isSelected && isToday && "text-blue-500 font-medium",
        !isSelected && !isToday && "text-zinc-400 hover:bg-zinc-800/50"
      )}
    >
      {/* Always render month label span - use opacity to show/hide */}
      <span
        className={cn(
          "h-3 text-[10px] leading-none transition-opacity duration-200",
          isSelected ? "text-blue-200" : "text-zinc-500",
          monthLabelVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {formatMonthAbbr(date)}
      </span>
      <span className="text-sm leading-none">{formatDayNumber(date)}</span>
    </button>
  );
}
