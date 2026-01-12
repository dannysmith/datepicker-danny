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

const WEEK_HEIGHT = 44; // pixels per week row
const MONTH_LABEL_DELAY = 350; // ms before showing month on selected date

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
  const [showSelectedMonthLabel, setShowSelectedMonthLabel] = useState(true);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monthLabelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialScrollDone = useRef(false);

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

  // Handle delayed month label on selected date
  useEffect(() => {
    // Hide month label immediately when selection changes
    setShowSelectedMonthLabel(false);

    // Clear any existing timeout
    if (monthLabelTimeoutRef.current) {
      clearTimeout(monthLabelTimeoutRef.current);
    }

    // Show month label after delay
    monthLabelTimeoutRef.current = setTimeout(() => {
      setShowSelectedMonthLabel(true);
    }, MONTH_LABEL_DELAY);

    return () => {
      if (monthLabelTimeoutRef.current) {
        clearTimeout(monthLabelTimeoutRef.current);
      }
    };
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

        // Scroll to make the new date visible
        const weekIndex = dateToWeekIndex(newDate);
        rowVirtualizer.scrollToIndex(weekIndex, { align: "center", behavior: "smooth" });
      }
    },
    [selectedDate, onDateSelect, rowVirtualizer]
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
          className="h-[308px] overflow-auto"
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
