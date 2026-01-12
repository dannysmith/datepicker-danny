export interface DatePickerProps {
  /** The currently selected date. Defaults to today if not provided */
  value?: Date;
  /** Callback fired when a date changes (including keyboard navigation) */
  onChange: (date: Date) => void;
  /** Optional: Callback fired only when user explicitly commits selection (click or Enter) */
  onCommit?: (date: Date) => void;
  /** Optional: Minimum selectable date */
  minDate?: Date;
  /** Optional: Maximum selectable date */
  maxDate?: Date;
  /** Optional: Placeholder text for the input */
  placeholder?: string;
}
