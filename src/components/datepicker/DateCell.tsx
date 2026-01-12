import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthAbbr } from "./utils";

interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFirstOfMonth: boolean;
  onClick: (date: Date) => void;
}

export function DateCell({
  date,
  isSelected,
  isToday,
  isFirstOfMonth,
  onClick,
}: DateCellProps) {
  const showMonthLabel = isSelected || isFirstOfMonth;

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        "rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
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
