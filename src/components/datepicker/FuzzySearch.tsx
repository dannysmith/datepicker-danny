import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import * as chrono from "chrono-node";
import { cn } from "@/lib/utils";
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  startOfDay,
} from "date-fns";

interface FuzzySearchProps {
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

interface ParsedResult {
  label: string;
  date: Date;
  relativeText: string;
}

function getRelativeText(date: Date): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diff = differenceInDays(target, today);

  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff > 0) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

function getResultLabel(date: Date, text: string): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";

  // Try to use the parsed text intelligently
  const lowerText = text.toLowerCase();
  if (lowerText.includes("next")) {
    return format(date, "EEEE"); // "Monday", "Tuesday", etc.
  }

  return format(date, "EEE d MMM"); // "Thu 15 Jan"
}

function parseInput(text: string): ParsedResult[] {
  if (!text.trim()) return [];

  const results = chrono.parse(text, new Date(), { forwardDate: true });
  const seen = new Set<number>();
  const parsed: ParsedResult[] = [];

  for (const result of results) {
    const date = result.start.date();
    const dayKey = startOfDay(date).getTime();

    if (seen.has(dayKey)) continue;
    seen.add(dayKey);

    parsed.push({
      label: getResultLabel(date, result.text),
      date,
      relativeText: getRelativeText(date),
    });
  }

  // If chrono didn't find anything, try some common shortcuts
  if (parsed.length === 0) {
    const lower = text.toLowerCase();
    const today = new Date();

    if ("today".startsWith(lower)) {
      parsed.push({
        label: "Today",
        date: today,
        relativeText: "today",
      });
    }
    if ("tomorrow".startsWith(lower)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      parsed.push({
        label: "Tomorrow",
        date: tomorrow,
        relativeText: "tomorrow",
      });
    }
  }

  return parsed.slice(0, 5); // Limit to 5 results
}

export function FuzzySearch({
  onDateSelect,
  onClose,
  inputRef: externalInputRef,
}: FuzzySearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = externalInputRef || internalInputRef;

  const results = useMemo(() => parseInput(query), [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            onDateSelect(results[selectedIndex].date);
          }
          break;
        case "Escape":
          e.preventDefault();
          if (query) {
            setQuery("");
          } else {
            onClose();
          }
          break;
      }
    },
    [results, selectedIndex, onDateSelect, onClose, query]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="flex flex-col">
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="When"
          className={cn(
            "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100",
            "placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          )}
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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

      {/* Results list */}
      {results.length > 0 && (
        <div className="mt-1 flex flex-col">
          {results.map((result, index) => (
            <button
              key={result.date.getTime()}
              type="button"
              onClick={() => onDateSelect(result.date)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm",
                "rounded-md transition-colors",
                index === selectedIndex
                  ? "bg-blue-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <span>{result.label}</span>
              <span
                className={cn(
                  "text-xs",
                  index === selectedIndex ? "text-blue-200" : "text-zinc-500"
                )}
              >
                {isToday(result.date)
                  ? format(result.date, "d MMM")
                  : result.relativeText === "today" ||
                      result.relativeText === "tomorrow" ||
                      result.relativeText === "yesterday"
                    ? format(result.date, "d MMM")
                    : result.relativeText}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
