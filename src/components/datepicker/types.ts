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
}
