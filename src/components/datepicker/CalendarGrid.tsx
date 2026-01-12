import { useRef, useState, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { WeekRow } from "./WeekRow";
import { MonthOverlay } from "./MonthOverlay";
import {
  TOTAL_WEEKS,
  getInitialWeekIndex,
  weekIndexToDate,
  dateToWeekIndex,
  formatMonthFull,
  WEEKDAY_HEADERS,
} from "./utils";
import { addDays, addWeeks } from "date-fns";

const WEEK_HEIGHT = 36; // pixels per week row
const MONTH_LABEL_DELAY = 150; // ms before showing month on selected date

interface CalendarGridProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarGrid({
  selectedDate,
  onDateSelect,
}: CalendarGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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
    estimateSize: () => WEEK_HEIGHT,
    overscan: 10,
    initialOffset: initialWeekIndex * WEEK_HEIGHT,
  });

  // Auto-focus the grid on mount
  useEffect(() => {
    gridRef.current?.focus();
  }, []);

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
      // Skip overlay/dimming for keyboard navigation
      if (isKeyboardNavigatingRef.current) return;

      setIsScrolling(true);
      updateVisibleMonth();

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide overlay after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
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
      initialScrollDone.current = true;
    }
  }, [selectedDate, rowVirtualizer]);

  // Check if a week index is currently visible in the viewport
  const isWeekVisible = useCallback((weekIndex: number): boolean => {
    const container = containerRef.current;
    if (!container) return false;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const weekTop = weekIndex * WEEK_HEIGHT;
    const weekBottom = weekTop + WEEK_HEIGHT;

    // Add a small margin so we scroll before it's right at the edge
    const margin = WEEK_HEIGHT * 0.5;
    return weekTop >= scrollTop + margin && weekBottom <= scrollTop + viewportHeight - margin;
  }, []);

  // Scroll to a week index only if needed (instant scroll for keyboard nav)
  const scrollToWeekIfNeeded = useCallback((weekIndex: number) => {
    if (!isWeekVisible(weekIndex)) {
      rowVirtualizer.scrollToIndex(weekIndex, { align: "auto" });
    }
  }, [isWeekVisible, rowVirtualizer]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newDate: Date | null = null;

      switch (e.key) {
        case "ArrowUp":
          newDate = addDays(selectedDate, -7);
          break;
        case "ArrowDown":
          newDate = addDays(selectedDate, 7);
          break;
        case "ArrowLeft":
          newDate = addDays(selectedDate, -1);
          break;
        case "ArrowRight":
          newDate = addDays(selectedDate, 1);
          break;
        case "PageUp":
          newDate = addWeeks(selectedDate, -4);
          break;
        case "PageDown":
          newDate = addWeeks(selectedDate, 4);
          break;
        case "Home":
          newDate = new Date();
          break;
        default:
          return;
      }

      if (newDate) {
        e.preventDefault();
        onDateSelect(newDate);

        // Only scroll if the new date would be off-screen
        const weekIndex = dateToWeekIndex(newDate);

        // Flag keyboard navigation to suppress overlay/dimming
        isKeyboardNavigatingRef.current = true;
        scrollToWeekIfNeeded(weekIndex);

        // Clear flag after scroll completes
        setTimeout(() => {
          isKeyboardNavigatingRef.current = false;
        }, 300);
      }
    },
    [selectedDate, onDateSelect, scrollToWeekIfNeeded]
  );

  return (
    <div
      ref={gridRef}
      className="flex flex-col outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-0.5 border-b border-zinc-800 pb-2">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable calendar area */}
      <div className="relative">
        <div
          ref={containerRef}
          className="h-[252px] overflow-auto"
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
  );
}
