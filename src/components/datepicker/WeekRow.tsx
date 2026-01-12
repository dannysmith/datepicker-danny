import { cn } from "@/lib/utils";
import { DateCell } from "./DateCell";
import { getWeekDays, areSameDay, isFirstOfMonth, isDateDisabled } from "./utils";

interface WeekRowProps {
  weekIndex: number;
  selectedDate: Date;
  today: Date;
  minDate?: Date;
  maxDate?: Date;
  showSelectedMonthLabel: boolean;
  isScrolling: boolean;
  onDateSelect: (date: Date) => void;
}

export function WeekRow({
  weekIndex,
  selectedDate,
  today,
  minDate,
  maxDate,
  showSelectedMonthLabel,
  isScrolling,
  onDateSelect,
}: WeekRowProps) {
  const days = getWeekDays(weekIndex);
  const hasMonthStart = days.some((d) => isFirstOfMonth(d));

  return (
    <div className={cn(
      "grid w-full grid-cols-7 gap-0.5",
      hasMonthStart && "border-t border-dp-border-muted/50"
    )}>
      {days.map((date, i) => (
        <DateCell
          key={i}
          date={date}
          isSelected={areSameDay(date, selectedDate)}
          isToday={areSameDay(date, today)}
          isFirstOfMonth={isFirstOfMonth(date)}
          isDisabled={isDateDisabled(date, minDate, maxDate)}
          showSelectedMonthLabel={showSelectedMonthLabel}
          isDimmed={isScrolling}
          onClick={onDateSelect}
        />
      ))}
    </div>
  );
}
