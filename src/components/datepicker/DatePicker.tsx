import { useState, useCallback } from "react";
import { CalendarGrid } from "./CalendarGrid";
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

  const handleDateSelect = useCallback(
    (date: Date) => {
      const normalized = normalizeDate(date);
      setSelectedDate(normalized);
      onChange(normalized);
    },
    [onChange]
  );

  return (
    <div className="w-[280px] rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
      {/* Input field (placeholder for now, fuzzy search in Phase 2) */}
      <div className="mb-3">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-center text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          readOnly
        />
      </div>

      {/* Calendar grid */}
      <CalendarGrid
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}
