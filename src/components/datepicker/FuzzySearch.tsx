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

interface FuzzySearchResultsProps {
  query: string;
  onDateSelect: (date: Date) => void;
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

export function FuzzySearchResults({
  query,
  onDateSelect,
}: FuzzySearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const results = useMemo(() => parseInput(query), [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [results, selectedIndex, onDateSelect]);

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-zinc-500">
        No dates found
      </div>
    );
  }

  return (
    <div className="flex flex-col">
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
  );
}
