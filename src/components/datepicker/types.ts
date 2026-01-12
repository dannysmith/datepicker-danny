export interface DatePickerProps {
  /** The currently selected date. Defaults to today if not provided */
  value?: Date;
  /** Callback fired when a date is selected */
  onChange: (date: Date) => void;
  /** Optional: Minimum selectable date */
  minDate?: Date;
  /** Optional: Maximum selectable date */
  maxDate?: Date;
  /** Optional: Placeholder text for the input */
  placeholder?: string;
  /** Optional: Whether the picker is disabled */
  disabled?: boolean;
}

export interface WeekData {
  /** The start date of this week (Monday) */
  startDate: Date;
  /** Array of 7 dates for this week */
  days: Date[];
  /** Week index from reference point */
  weekIndex: number;
}

export interface DateCellProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isFirstOfMonth: boolean;
  onClick: (date: Date) => void;
}
