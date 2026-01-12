import { useRef, useState, useEffect, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { WeekRow } from "./WeekRow";
import { MonthOverlay } from "./MonthOverlay";
import {
  TOTAL_WEEKS,
  getInitialWeekIndex,
  weekIndexToDate,
  dateToWeekIndex,
  formatMonthFull,
  getToday,
  isDateDisabled,
  WEEKDAY_HEADERS,
  WEEKDAY_FULL_NAMES,
} from "./utils";
import { addDays, addWeeks, format } from "date-fns";

const ROW_HEIGHT_EM = 2.6; // row height in em units
const DEFAULT_ROW_HEIGHT = 36; // fallback pixels (14px font * 2.6)
const MONTH_LABEL_DELAY = 150; // ms before showing month on selected date

interface CalendarGridProps {
  selectedDate: Date;
  minDate?: Date;
  maxDate?: Date;
  onDateChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

export interface CalendarGridHandle {
  navigate: (direction: 'up' | 'down' | 'left' | 'right' | 'pageUp' | 'pageDown' | 'home') => void;
}

export const CalendarGrid = forwardRef<CalendarGridHandle, CalendarGridProps>(function CalendarGrid({
  selectedDate,
  minDate,
  maxDate,
  onDateChange,
  onDateSelect,
}, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fontSizeContainerRef = useRef<HTMLDivElement>(null);
  const rowHeightRef = useRef(DEFAULT_ROW_HEIGHT);
  const today = getToday();
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState("");
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialScrollDone = useRef(false);
  const isKeyboardNavigatingRef = useRef(false);

  // Track selection timing with refs for synchronous updates during render
  const prevSelectedDateRef = useRef<number>(selectedDate.getTime());
  const selectionChangedAtRef = useRef<number>(Date.now() - MONTH_LABEL_DELAY); // Start as "stable"
  const [, forceUpdate] = useState(0);

  // Synchronously detect selection change during render
  const selectedDateTime = selectedDate.getTime();
  if (selectedDateTime !== prevSelectedDateRef.current) {
    prevSelectedDateRef.current = selectedDateTime;
    selectionChangedAtRef.current = Date.now();
  }

  // Derive showSelectedMonthLabel from timing (synchronous, no lag)
  const showSelectedMonthLabel = Date.now() - selectionChangedAtRef.current >= MONTH_LABEL_DELAY;

  const initialWeekIndex = getInitialWeekIndex(selectedDate);

  const rowVirtualizer = useVirtualizer({
    count: TOTAL_WEEKS,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeightRef.current,
    overscan: 10,
    initialOffset: initialWeekIndex * rowHeightRef.current,
  });

  // Calculate row height based on computed font-size and update on resize
  useLayoutEffect(() => {
    const updateRowHeight = () => {
      if (!fontSizeContainerRef.current) return;
      const fontSize = parseFloat(getComputedStyle(fontSizeContainerRef.current).fontSize);
      rowHeightRef.current = fontSize * ROW_HEIGHT_EM;
    };

    updateRowHeight();

    const container = fontSizeContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateRowHeight();
      rowVirtualizer.measure();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [rowVirtualizer]);

  // Trigger re-render after delay to show the month label
  useEffect(() => {
    const timeout = setTimeout(() => {
      forceUpdate((n) => n + 1);
    }, MONTH_LABEL_DELAY);

    return () => clearTimeout(timeout);
  }, [selectedDate]);

  // Update visible month based on scroll position
  const updateVisibleMonth = useCallback(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    // Get the week that's roughly in the middle of the visible area
    const middleIndex = Math.floor(virtualItems.length / 2);
    const middleWeek = virtualItems[middleIndex];
    if (middleWeek) {
      const date = weekIndexToDate(middleWeek.index);
      setVisibleMonth(formatMonthFull(date));
    }
  }, [rowVirtualizer]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Skip overlay for keyboard navigation or initial mount
      // Use initialScrollDone to ensure we don't show overlay during programmatic initial scroll
      if (isKeyboardNavigatingRef.current || !initialScrollDone.current) return;

      setIsScrolling(true);
      updateVisibleMonth();

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide overlay after scrolling stops (fast dismissal)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateVisibleMonth]);

  // Initial scroll to selected date and set month
  useEffect(() => {
    if (!initialScrollDone.current) {
      const weekIndex = dateToWeekIndex(selectedDate);
      rowVirtualizer.scrollToIndex(weekIndex, { align: "center" });
      setVisibleMonth(formatMonthFull(selectedDate));
      // Mark initial scroll as done after a delay to allow scroll events to settle
      // This is more robust than a fixed timeout from mount
      setTimeout(() => {
        initialScrollDone.current = true;
      }, 100);
    }
  }, [selectedDate, rowVirtualizer]);

  // Check if a week index is currently visible in the viewport
  const isWeekVisible = useCallback((weekIndex: number): boolean => {
    const container = containerRef.current;
    if (!container) return false;

    const rowHeight = rowHeightRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const weekTop = weekIndex * rowHeight;
    const weekBottom = weekTop + rowHeight;

    // Add a small margin so we scroll before it's right at the edge
    const margin = rowHeight * 0.5;
    return weekTop >= scrollTop + margin && weekBottom <= scrollTop + viewportHeight - margin;
  }, []);

  // Scroll to a week index only if needed (instant scroll for keyboard nav)
  const scrollToWeekIfNeeded = useCallback((weekIndex: number) => {
    if (!isWeekVisible(weekIndex)) {
      rowVirtualizer.scrollToIndex(weekIndex, { align: "auto" });
    }
  }, [isWeekVisible, rowVirtualizer]);

  // Navigate selection by direction
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right' | 'pageUp' | 'pageDown' | 'home') => {
    let newDate: Date;

    switch (direction) {
      case 'up':
        newDate = addDays(selectedDate, -7);
        break;
      case 'down':
        newDate = addDays(selectedDate, 7);
        break;
      case 'left':
        newDate = addDays(selectedDate, -1);
        break;
      case 'right':
        newDate = addDays(selectedDate, 1);
        break;
      case 'pageUp':
        newDate = addWeeks(selectedDate, -4);
        break;
      case 'pageDown':
        newDate = addWeeks(selectedDate, 4);
        break;
      case 'home':
        newDate = new Date();
        break;
    }

    // Don't navigate to disabled dates
    if (isDateDisabled(newDate, minDate, maxDate)) return;

    onDateChange(newDate);

    // Only scroll if the new date would be off-screen
    const weekIndex = dateToWeekIndex(newDate);

    // Flag keyboard navigation to suppress overlay/dimming
    isKeyboardNavigatingRef.current = true;
    scrollToWeekIfNeeded(weekIndex);

    // Clear flag after scroll completes
    setTimeout(() => {
      isKeyboardNavigatingRef.current = false;
    }, 300);
  }, [selectedDate, minDate, maxDate, onDateChange, scrollToWeekIfNeeded]);

  // Expose navigate method via ref
  useImperativeHandle(ref, () => ({
    navigate,
  }), [navigate]);

  // Format the month/year for screen reader announcement
  const announcedMonth = format(selectedDate, "MMMM yyyy");

  return (
    <div
      className="mx-auto max-w-[340px]"
      style={{ containerType: "inline-size" }}
    >
    <div
      ref={fontSizeContainerRef}
      className="flex flex-col"
      style={{ fontSize: "clamp(10px, 5cqw, 14px)" }}
    >
      {/* Screen reader announcement for current month */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcedMonth}
      </div>

      {/* Day of week headers */}
      <div role="row" className="grid grid-cols-7 gap-[0.14em] border-b border-dp-border pb-[0.57em]">
        {WEEKDAY_HEADERS.map((day, index) => (
          <div
            key={day}
            role="columnheader"
            aria-label={WEEKDAY_FULL_NAMES[index]}
            className="text-center text-[0.85em] font-medium text-dp-text-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable calendar area */}
      <div className="relative">
        <div
          ref={containerRef}
          id="datepicker-grid"
          role="grid"
          aria-label="Calendar"
          className="h-[18.2em] overflow-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualWeek) => (
              <div
                key={virtualWeek.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualWeek.size}px`,
                  transform: `translateY(${virtualWeek.start}px)`,
                }}
              >
                <WeekRow
                  weekIndex={virtualWeek.index}
                  selectedDate={selectedDate}
                  today={today}
                  minDate={minDate}
                  maxDate={maxDate}
                  showSelectedMonthLabel={showSelectedMonthLabel}
                  isScrolling={isScrolling}
                  onDateSelect={onDateSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Month overlay */}
        <MonthOverlay monthName={visibleMonth} isVisible={isScrolling} />
      </div>
    </div>
    </div>
  );
});
