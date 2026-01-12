import {
  startOfWeek,
  addDays,
  addWeeks,
  isSameDay,
  isSameMonth,
  getDate,
  format,
  startOfDay,
} from "date-fns";

/**
 * Reference date for calculating week indices.
 * We use a fixed date far in the past to allow scrolling both ways.
 */
const REFERENCE_DATE = new Date(2000, 0, 3); // Jan 3, 2000 (a Monday)

/**
 * Total number of weeks to render (roughly 100 years worth)
 */
export const TOTAL_WEEKS = 5200; // ~100 years

/**
 * Get the start of week for a date (Monday-based)
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

/**
 * Convert a week index to the start date of that week
 */
export function weekIndexToDate(weekIndex: number): Date {
  return addWeeks(REFERENCE_DATE, weekIndex);
}

/**
 * Convert a date to its corresponding week index
 */
export function dateToWeekIndex(date: Date): number {
  const weekStart = getWeekStart(date);
  const refStart = getWeekStart(REFERENCE_DATE);
  const diffTime = weekStart.getTime() - refStart.getTime();
  const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks;
}

/**
 * Get the initial week index to center on (today or selected date)
 */
export function getInitialWeekIndex(selectedDate?: Date): number {
  const targetDate = selectedDate || new Date();
  return dateToWeekIndex(targetDate);
}

/**
 * Generate array of 7 dates for a week starting from weekIndex
 */
export function getWeekDays(weekIndex: number): Date[] {
  const weekStart = weekIndexToDate(weekIndex);
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Check if a date is the first day of its month
 */
export function isFirstOfMonth(date: Date): boolean {
  return getDate(date) === 1;
}

/**
 * Format date for display in cell (just the day number)
 */
export function formatDayNumber(date: Date): string {
  return getDate(date).toString();
}

/**
 * Format month abbreviation (e.g., "Jan", "Feb")
 */
export function formatMonthAbbr(date: Date): string {
  return format(date, "MMM");
}

/**
 * Format full month name (e.g., "January", "February")
 */
export function formatMonthFull(date: Date): string {
  return format(date, "MMMM");
}

/**
 * Format month and year (e.g., "January 2024")
 */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Check if two dates are in the same month
 */
export function areSameMonth(date1: Date, date2: Date): boolean {
  return isSameMonth(date1, date2);
}

/**
 * Normalize date to start of day (for comparisons)
 */
export function normalizeDate(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get today's date (normalized to start of day)
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Days of week headers (Monday first)
 */
export const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
