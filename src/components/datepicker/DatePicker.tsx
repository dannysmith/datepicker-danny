import { useState, useCallback, useRef } from "react";
import { CalendarGrid } from "./CalendarGrid";
import { FuzzySearch } from "./FuzzySearch";
import { normalizeDate, getToday } from "./utils";
import type { DatePickerProps } from "./types";

type Mode = "calendar" | "search";

export function DatePicker({
  value,
  onChange,
  placeholder = "When",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    normalizeDate(value || getToday())
  );
  const [mode, setMode] = useState<Mode>("calendar");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const normalized = normalizeDate(date);
      setSelectedDate(normalized);
      onChange(normalized);
      setMode("calendar");
    },
    [onChange]
  );

  const handleInputClick = useCallback(() => {
    setMode("search");
  }, []);

  const handleSearchClose = useCallback(() => {
    setMode("calendar");
  }, []);

  return (
    <div className="w-[280px] rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
      {mode === "search" ? (
        <FuzzySearch
          onDateSelect={handleDateSelect}
          onClose={handleSearchClose}
          inputRef={inputRef}
        />
      ) : (
        <>
          {/* Input field - click to enter search mode */}
          <div className="mb-3">
            <button
              type="button"
              onClick={handleInputClick}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-center text-sm text-zinc-500 hover:border-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              {placeholder}
            </button>
          </div>

          {/* Calendar grid */}
          <CalendarGrid
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </>
      )}
    </div>
  );
}
