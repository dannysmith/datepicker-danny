import { useState, useMemo, useEffect } from "react";
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
import { isDateDisabled } from "./utils";
import { expandPartialInput, scoreResult } from "./fuzzyDateParser";

interface FuzzySearchResultsProps {
  query: string;
  minDate?: Date;
  maxDate?: Date;
  onDateSelect: (date: Date) => void;
  onSelectionChange?: (index: number) => void;
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

function parseInput(text: string, referenceDate: Date = new Date()): ParsedResult[] {
  if (!text.trim()) return [];

  const candidates = expandPartialInput(text);
  const resultsMap = new Map<number, { result: ParsedResult; score: number }>();

  for (const candidate of candidates) {
    const parsed = chrono.parse(candidate, referenceDate, { forwardDate: true });

    for (const chronoResult of parsed) {
      const date = chronoResult.start.date();
      const dayKey = startOfDay(date).getTime();
      const score = scoreResult(text, candidate, date, referenceDate);

      const existing = resultsMap.get(dayKey);
      if (!existing || score > existing.score) {
        resultsMap.set(dayKey, {
          result: {
            label: getResultLabel(date, chronoResult.text),
            date,
            relativeText: getRelativeText(date),
          },
          score,
        });
      }
    }
  }

  return [...resultsMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ result }) => result);
}

export function FuzzySearchResults({
  query,
  minDate,
  maxDate,
  onDateSelect,
  onSelectionChange,
}: FuzzySearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const results = useMemo(() => parseInput(query), [query]);

  // Find next/prev enabled index for keyboard navigation
  const findNextEnabledIndex = (current: number, direction: 1 | -1): number => {
    let next = current + direction;
    while (next >= 0 && next < results.length) {
      if (!isDateDisabled(results[next].date, minDate, maxDate)) {
        return next;
      }
      next += direction;
    }
    return current; // Stay at current if no enabled found
  };

  // Reset selection to first enabled result when results change
  useEffect(() => {
    const firstEnabled = results.findIndex(
      (r) => !isDateDisabled(r.date, minDate, maxDate)
    );
    const newIndex = firstEnabled >= 0 ? firstEnabled : 0;
    setSelectedIndex(newIndex);
  }, [results, minDate, maxDate]);

  // Notify parent of selection changes (for aria-activedescendant)
  // Using a separate effect to avoid re-running the reset logic
  useEffect(() => {
    onSelectionChange?.(selectedIndex);
  }, [selectedIndex, onSelectionChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => findNextEnabledIndex(i, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => findNextEnabledIndex(i, -1));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex] && !isDateDisabled(results[selectedIndex].date, minDate, maxDate)) {
            onDateSelect(results[selectedIndex].date);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results, selectedIndex, minDate, maxDate, onDateSelect]);

  if (results.length === 0) {
    return (
      <div
        id="datepicker-search-results"
        role="listbox"
        aria-label="Search results"
        className="py-8 text-center text-sm text-dp-text-muted"
      >
        No dates found
      </div>
    );
  }

  return (
    <div
      id="datepicker-search-results"
      role="listbox"
      aria-label="Search results"
      className="flex flex-col"
    >
      {results.map((result, index) => {
        const disabled = isDateDisabled(result.date, minDate, maxDate);
        // Full date for screen reader announcement
        const fullDateLabel = format(result.date, "EEEE, MMMM d, yyyy");
        return (
          <button
            key={result.date.getTime()}
            type="button"
            role="option"
            id={`search-result-${index}`}
            aria-selected={index === selectedIndex}
            aria-disabled={disabled || undefined}
            aria-label={`${result.label}, ${fullDateLabel}`}
            disabled={disabled}
            onClick={() => !disabled && onDateSelect(result.date)}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-sm",
              "rounded-md transition-colors",
              disabled && "cursor-not-allowed text-dp-text-disabled",
              !disabled && index === selectedIndex && "bg-dp-primary text-dp-primary-fg",
              !disabled && index !== selectedIndex && "text-dp-text-secondary hover:bg-dp-elevated"
            )}
          >
            <span>{result.label}</span>
            <span
              className={cn(
                "text-xs",
                disabled ? "text-dp-text-disabled" : index === selectedIndex ? "text-dp-primary-muted" : "text-dp-text-muted"
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
        );
      })}
    </div>
  );
}
