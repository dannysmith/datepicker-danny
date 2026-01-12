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
  // Show month label on first of month, OR on selected if enough time has passed
  const showMonthLabel = isFirstOfMonth || (isSelected && showSelectedMonthLabel);

  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => onClick(date)}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        "rounded-md transition-colors outline-none",
        isSelected && "bg-blue-600 text-white",
        !isSelected && isToday && "text-blue-500 font-medium",
        !isSelected && !isToday && "text-zinc-400 hover:bg-zinc-800/50"
      )}
    >
      {showMonthLabel && (
        <span
          className={cn(
            "text-[10px] leading-none",
            isSelected ? "text-blue-200" : "text-zinc-500"
          )}
        >
          {formatMonthAbbr(date)}
        </span>
      )}
      <span
        className={cn(
          "text-sm leading-none",
          showMonthLabel ? "mt-0.5" : ""
        )}
      >
        {formatDayNumber(date)}
      </span>
    </button>
  );
}
