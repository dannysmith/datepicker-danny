import { levenshtein } from "./levenshtein";
import { differenceInDays, startOfDay } from "date-fns";

// Known terms for expansion
const TIME_UNITS = ["day", "days", "week", "weeks", "month", "months", "year", "years"];
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const KEYWORDS = ["today", "tomorrow", "yesterday"];

// Common units for when user types just a number
const COMMON_UNITS = ["days", "weeks", "months"];

/**
 * Expand partial input into candidate strings that chrono might parse.
 * Uses prefix matching and Levenshtein distance for typo tolerance.
 */
export function expandPartialInput(input: string): string[] {
  const candidates: string[] = [input]; // Always try original
  const lower = input.toLowerCase().trim();
  if (!lower) return candidates;

  // Pattern 1: Number + partial unit ("3 mont", "3 moths")
  const numUnitMatch = lower.match(/^(\d+)\s+(\w+)$/);
  if (numUnitMatch) {
    const [, num, partial] = numUnitMatch;
    addUnitCompletions(candidates, num, partial);
  }

  // Pattern 2: "in" + number + optional partial ("in 2", "in 2 we")
  const inNumMatch = lower.match(/^in\s+(\d+)\s*(\w*)$/);
  if (inNumMatch) {
    const [, num, partial] = inNumMatch;
    if (!partial) {
      // Just "in 2" - suggest common units
      for (const unit of COMMON_UNITS) {
        candidates.push(`in ${num} ${unit}`);
      }
    } else {
      addUnitCompletions(candidates, `in ${num}`, partial);
    }
  }

  // Pattern 3: "next/last" + partial ("next mo", "last fri")
  const nextLastMatch = lower.match(/^(next|last)\s+(\w*)$/);
  if (nextLastMatch) {
    const [, prefix, partial] = nextLastMatch;
    if (!partial) {
      // Just "next" or "last" - suggest common terms
      for (const day of WEEKDAYS) {
        candidates.push(`${prefix} ${day}`);
      }
      candidates.push(`${prefix} week`);
      candidates.push(`${prefix} month`);
    } else {
      // Match weekdays
      for (const day of WEEKDAYS) {
        if (day.startsWith(partial)) {
          candidates.push(`${prefix} ${day}`);
        } else if (levenshtein(partial, day) <= 1) {
          candidates.push(`${prefix} ${day}`);
        }
      }
      // Match week/month/year
      for (const term of ["week", "month", "year"]) {
        if (term.startsWith(partial)) {
          candidates.push(`${prefix} ${term}`);
        } else if (levenshtein(partial, term) <= 1) {
          candidates.push(`${prefix} ${term}`);
        }
      }
    }
  }

  // Pattern 4: Partial keywords ("tom" → "tomorrow")
  for (const keyword of KEYWORDS) {
    if (keyword.startsWith(lower) && keyword !== lower) {
      candidates.push(keyword);
    } else if (lower.length >= 3 && levenshtein(lower, keyword) <= 1) {
      candidates.push(keyword);
    }
  }

  // Pattern 5: Partial weekdays ("fri" → "friday")
  for (const day of WEEKDAYS) {
    if (day.startsWith(lower) && day !== lower) {
      candidates.push(day);
    } else if (lower.length >= 3 && levenshtein(lower, day) <= 1) {
      candidates.push(day);
    }
  }

  // Pattern 6: Number alone ("3" → "3 days", "3 weeks", "3 months")
  if (/^\d+$/.test(lower)) {
    for (const unit of COMMON_UNITS) {
      candidates.push(`${lower} ${unit}`);
    }
  }

  return [...new Set(candidates)]; // Dedupe
}

/**
 * Add unit completions for a number prefix, using prefix matching and Levenshtein.
 */
function addUnitCompletions(candidates: string[], prefix: string, partial: string): void {
  let foundPrefix = false;

  // Try prefix matching first
  for (const unit of TIME_UNITS) {
    if (unit.startsWith(partial)) {
      candidates.push(`${prefix} ${unit}`);
      foundPrefix = true;
    }
  }

  // If no prefix match, try Levenshtein for typo tolerance
  if (!foundPrefix && partial.length >= 3) {
    for (const unit of TIME_UNITS) {
      if (levenshtein(partial, unit) <= 1) {
        candidates.push(`${prefix} ${unit}`);
      }
    }
  }
}

/**
 * Score a parsed result for ranking.
 * Higher scores appear first in results.
 */
export function scoreResult(
  originalInput: string,
  expandedCandidate: string,
  parsedDate: Date,
  referenceDate: Date
): number {
  let score = 50; // Base score
  const inputLower = originalInput.toLowerCase().trim();
  const candidateLower = expandedCandidate.toLowerCase().trim();

  // Exact match: user typed something chrono understood directly
  if (inputLower === candidateLower) {
    score += 100;
  } else {
    // Calculate how much of the candidate was typed (prefix quality)
    const prefixRatio = calculatePrefixRatio(inputLower, candidateLower);
    score += prefixRatio * 40; // Up to +40 for good prefix match

    // Penalize fuzzy matches (detected by Levenshtein on the differing part)
    const fuzzyPenalty = detectFuzzyPenalty(inputLower, candidateLower);
    score -= fuzzyPenalty * 15;
  }

  // Number-unit heuristics: boost likely combinations
  score += getNumberUnitBonus(candidateLower);

  // Contextual awareness: boost dates that are sooner
  score += getContextualBonus(parsedDate, referenceDate);

  return score;
}

/**
 * Calculate what ratio of the candidate the user actually typed.
 * "mont" for "3 months" → looks at "mont" vs "months" → 4/6 ≈ 0.67
 */
function calculatePrefixRatio(input: string, candidate: string): number {
  // Find the part that differs
  const inputParts = input.split(/\s+/);
  const candidateParts = candidate.split(/\s+/);

  if (inputParts.length === 0 || candidateParts.length === 0) return 0;

  // Compare the last word (usually the one being completed)
  const inputLast = inputParts[inputParts.length - 1];
  const candidateLast = candidateParts[candidateParts.length - 1];

  if (candidateLast.startsWith(inputLast)) {
    return inputLast.length / candidateLast.length;
  }

  return 0;
}

/**
 * Detect if this was a fuzzy (typo) match and return penalty amount.
 */
function detectFuzzyPenalty(input: string, candidate: string): number {
  const inputParts = input.split(/\s+/);
  const candidateParts = candidate.split(/\s+/);

  if (inputParts.length === 0 || candidateParts.length === 0) return 0;

  const inputLast = inputParts[inputParts.length - 1];
  const candidateLast = candidateParts[candidateParts.length - 1];

  // If input is a prefix of candidate, no penalty
  if (candidateLast.startsWith(inputLast)) return 0;

  // Otherwise, calculate edit distance as penalty
  return levenshtein(inputLast, candidateLast);
}

/**
 * Bonus for number-unit combinations that are commonly used.
 */
function getNumberUnitBonus(candidate: string): number {
  const match = candidate.match(/(\d+)\s+(days?|weeks?|months?|years?)/i);
  if (!match) return 0;

  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  // Small numbers favor days
  if (num >= 1 && num <= 7 && unit.startsWith("day")) return 15;

  // 1-4 weeks is very common
  if (num >= 1 && num <= 4 && unit.startsWith("week")) return 12;

  // 1-12 months is natural
  if (num >= 1 && num <= 12 && unit.startsWith("month")) return 10;

  // 1-5 years is reasonable
  if (num >= 1 && num <= 5 && unit.startsWith("year")) return 8;

  return 0;
}

/**
 * Contextual bonus: boost dates that are sooner.
 * Makes "friday" on Thursday show prominently.
 */
function getContextualBonus(parsedDate: Date, referenceDate: Date): number {
  const refDay = startOfDay(referenceDate);
  const targetDay = startOfDay(parsedDate);
  const daysUntil = differenceInDays(targetDay, refDay);

  // Tomorrow gets biggest boost
  if (daysUntil === 1) return 20;

  // Within a week gets moderate boost
  if (daysUntil > 1 && daysUntil <= 7) return 10;

  // Today (edge case, maybe user wants reminder for today)
  if (daysUntil === 0) return 15;

  // Past dates or far future: no boost
  return 0;
}
