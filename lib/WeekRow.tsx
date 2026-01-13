import { DateCell } from "./DateCell";
import { getWeekDays, areSameDay, isFirstOfMonth, isDateDisabled, cx } from "./utils";

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
    <div
      role="row"
      className={cx(
        "dp-week-row",
        hasMonthStart && "dp-week-row--month-start"
      )}
    >
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
