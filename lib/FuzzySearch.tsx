import { useState, useMemo, useEffect, useCallback } from "react";
import * as chrono from "chrono-node";
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  startOfDay,
} from "date-fns";
import { isDateDisabled, cx } from "./utils";
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
  const [prevQuery, setPrevQuery] = useState(query);
  const results = useMemo(() => parseInput(query), [query]);

  // Find next/prev enabled index for keyboard navigation
  const findNextEnabledIndex = useCallback((current: number, direction: 1 | -1): number => {
    let next = current + direction;
    while (next >= 0 && next < results.length) {
      if (!isDateDisabled(results[next].date, minDate, maxDate)) {
        return next;
      }
      next += direction;
    }
    return current; // Stay at current if no enabled found
  }, [results, minDate, maxDate]);

  // Reset selection to first enabled result when query changes (in render, not effect)
  if (query !== prevQuery) {
    setPrevQuery(query);
    const firstEnabled = results.findIndex(
      (r) => !isDateDisabled(r.date, minDate, maxDate)
    );
    setSelectedIndex(firstEnabled >= 0 ? firstEnabled : 0);
  }

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
  }, [results, selectedIndex, minDate, maxDate, onDateSelect, findNextEnabledIndex]);

  if (results.length === 0) {
    return (
      <div
        id="datepicker-search-results"
        role="listbox"
        aria-label="Search results"
        className="dp-search-empty"
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
      className="dp-search-results"
    >
      {results.map((result, index) => {
        const disabled = isDateDisabled(result.date, minDate, maxDate);
        const isSelected = index === selectedIndex;
        // Full date for screen reader announcement
        const fullDateLabel = format(result.date, "EEEE, MMMM d, yyyy");

        // Determine item state class
        const stateClass = disabled
          ? "dp-search-item--disabled"
          : isSelected
            ? "dp-search-item--selected"
            : "dp-search-item--default";

        // Determine secondary text class
        const secondaryClass = disabled
          ? "dp-search-item-secondary--disabled"
          : isSelected
            ? "dp-search-item-secondary--selected"
            : "dp-search-item-secondary--default";

        return (
          <button
            key={result.date.getTime()}
            type="button"
            role="option"
            id={`search-result-${index}`}
            aria-selected={isSelected}
            aria-disabled={disabled || undefined}
            aria-label={`${result.label}, ${fullDateLabel}`}
            disabled={disabled}
            onClick={() => !disabled && onDateSelect(result.date)}
            className={cx("dp-search-item", stateClass)}
          >
            <span>{result.label}</span>
            <span className={cx("dp-search-item-secondary", secondaryClass)}>
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
