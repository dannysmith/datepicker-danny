import { useState, useCallback, useRef, useEffect } from "react";
import { CalendarGrid, type CalendarGridHandle } from "./CalendarGrid";
import { FuzzySearchResults } from "./FuzzySearch";
import { normalizeDate, getToday } from "./utils";
import type { DatePickerProps } from "./types";

export function DatePicker({
  value,
  onChange,
  placeholder = "When",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    normalizeDate(value || getToday())
  );
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<CalendarGridHandle>(null);

  // Keep input focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const normalized = normalizeDate(date);
      setSelectedDate(normalized);
      onChange(normalized);
      setQuery(""); // Clear search after selection
      inputRef.current?.focus();
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // If no query, handle navigation keys
      if (!query) {
        const keyToDirection: Record<string, 'up' | 'down' | 'left' | 'right' | 'pageUp' | 'pageDown' | 'home'> = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
          PageUp: 'pageUp',
          PageDown: 'pageDown',
          Home: 'home',
        };

        const direction = keyToDirection[e.key];
        if (direction) {
          e.preventDefault();
          calendarRef.current?.navigate(direction);
          return;
        }
      }

      // Escape clears query or does nothing
      if (e.key === "Escape" && query) {
        e.preventDefault();
        setQuery("");
      }
    },
    [query]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const isSearchMode = query.length > 0;

  return (
    <div className="w-[280px] rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
      {/* Input field - always visible */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-center text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Show search results OR calendar */}
      {isSearchMode ? (
        <FuzzySearchResults
          query={query}
          onDateSelect={handleDateSelect}
        />
      ) : (
        <CalendarGrid
          ref={calendarRef}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      )}
    </div>
  );
}
