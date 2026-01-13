import { formatDayNumber, formatMonthAbbr, cx } from "./utils";
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

  // Determine cell state class
  const stateClass = isDisabled
    ? "dp-cell--disabled"
    : isSelected
      ? "dp-cell--selected"
      : isToday
        ? "dp-cell--today"
        : "dp-cell--default";

  // Determine month label color class
  const monthColorClass = isDisabled
    ? "dp-cell-month--disabled"
    : isSelected
      ? "dp-cell-month--selected"
      : "dp-cell-month--default";

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
      className={cx(
        "dp-cell",
        stateClass,
        isDimmed && !isDisabled && "dp-cell--dimmed"
      )}
    >
      {/* Month label - absolutely positioned at top so number stays centered */}
      <span
        className={cx(
          "dp-cell-month",
          monthColorClass,
          monthLabelVisible ? "dp-cell-month--visible" : "dp-cell-month--hidden"
        )}
      >
        {formatMonthAbbr(date)}
      </span>
      <span className="dp-cell-day">{formatDayNumber(date)}</span>
    </button>
  );
}
