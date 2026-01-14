export interface DatePickerProps {
  /** The currently selected date. Defaults to today if not provided. Pass null to indicate no selection. */
  value?: Date | null;
  /** Callback fired when a date changes (including keyboard navigation). Receives null when cleared. */
  onChange?: (date: Date | null) => void;
  /** Callback fired only when user explicitly commits selection (click or Enter). Receives null when cleared. */
  onCommit?: (date: Date | null) => void;
  /** Optional: Minimum selectable date */
  minDate?: Date;
  /** Optional: Maximum selectable date */
  maxDate?: Date;
  /** Optional: Placeholder text for the input */
  placeholder?: string;
  /** Optional: Show a clear button below the calendar to reset the date selection */
  showClearButton?: boolean;
}
