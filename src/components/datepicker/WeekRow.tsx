import { DateCell } from "./DateCell";
import { getWeekDays, areSameDay, isFirstOfMonth, getToday } from "./utils";

interface WeekRowProps {
  weekIndex: number;
  selectedDate: Date;
  showSelectedMonthLabel: boolean;
  onDateSelect: (date: Date) => void;
}

const today = getToday();

export function WeekRow({
  weekIndex,
  selectedDate,
  showSelectedMonthLabel,
  onDateSelect,
}: WeekRowProps) {
  const days = getWeekDays(weekIndex);

  return (
    <div className="grid h-full w-full grid-cols-7 gap-0.5">
      {days.map((date, i) => (
        <DateCell
          key={i}
          date={date}
          isSelected={areSameDay(date, selectedDate)}
          isToday={areSameDay(date, today)}
          isFirstOfMonth={isFirstOfMonth(date)}
          showSelectedMonthLabel={showSelectedMonthLabel}
          onClick={onDateSelect}
        />
      ))}
    </div>
  );
}
