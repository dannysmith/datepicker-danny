# Fuzzy Matching Improvements Plan

## Problem Statement

The fuzzy date search requires complete expressions. For example:
- "3 months" works
- "3 mont" does not

Users shouldn't need to type complete words when the intent is clear. We want intelligent prefix matching and typo tolerance.

## Current State

`FuzzySearchResults` (`src/components/datepicker/FuzzySearch.tsx`) uses chrono-node for parsing. There's a basic fallback for "today" and "tomorrow" prefix matching (lines 74-95), but:
- It only triggers when chrono finds nothing
- It misses "yesterday"
- It doesn't handle partial units like "mont" or "we"

chrono-node is a **parser**, not a completion engine — it expects complete expressions.

---

## Architecture Overview

### File Structure

```
src/components/datepicker/
├── FuzzySearch.tsx        # React component (unchanged interface)
├── fuzzyDateParser.ts     # NEW: expansion, parsing, scoring logic
├── levenshtein.ts         # NEW: string distance utility (pure function)
├── utils.ts               # Existing calendar utilities
└── types.ts               # Existing types
```

### Data Flow

```
User Input ("3 mo")
       │
       ▼
expandPartialInput() → ["3 mo", "3 months", "3 monday"]
       │
       ▼
Parse each through chrono.parse()
       │
       ▼
Score each successful result
       │
       ▼
Dedupe by date (keep highest-scored)
       │
       ▼
Sort by score, return top 5
```

### Key Design Decisions

1. **Pure functions where possible** — `expandPartialInput`, `levenshtein`, scoring functions all take explicit inputs (including reference date) for testability

2. **Expansion returns strings only** — Scoring happens after parsing, not during expansion, because we need the parsed date to score contextually

3. **Smart deduplication** — When multiple candidates produce the same date, keep the one with the highest score

4. **Replace existing fallback entirely** — The current today/tomorrow prefix matching becomes part of the expansion logic

---

## Phase 1: Candidate Expansion

**Goal**: "3 mont" suggests "3 months"

### Patterns to Support

| Input | Expansions |
|-------|------------|
| `3 mont` | 3 months |
| `in 2 we` | in 2 weeks |
| `next mo` | next monday, next month |
| `last fri` | last friday |
| `tom`, `yes`, `tod` | tomorrow, yesterday, today |
| `fri`, `wed` | friday, wednesday |
| `3` (number alone) | 3 days, 3 weeks, 3 months |

### Implementation

**File: `fuzzyDateParser.ts`**

```typescript
const TIME_UNITS = ['day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years'];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const KEYWORDS = ['today', 'tomorrow', 'yesterday'];

export function expandPartialInput(input: string): string[] {
  const candidates: string[] = [input]; // Always try original
  const lower = input.toLowerCase().trim();
  if (!lower) return candidates;

  // Pattern: number + partial unit ("3 mont")
  // Pattern: "in" + number + partial ("in 2 we")
  // Pattern: "next/last" + partial ("next mo")
  // Pattern: partial keywords ("tom" → "tomorrow")
  // Pattern: partial weekdays ("fri" → "friday")
  // Pattern: number alone ("3" → "3 days", "3 weeks", ...)

  return [...new Set(candidates)]; // Dedupe
}
```

**Modified `parseInput` in FuzzySearch.tsx:**

```typescript
import { expandPartialInput, scoreResult } from './fuzzyDateParser';

function parseInput(text: string, referenceDate: Date): ParsedResult[] {
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
```

---

## Phase 2: Typo Tolerance

**Goal**: "3 moths" suggests "3 months"

### Implementation

**File: `levenshtein.ts`**

```typescript
/**
 * Calculate Levenshtein distance between two strings.
 * Standard DP implementation, O(n*m) time and space.
 */
export function levenshtein(a: string, b: string): number {
  // ~15 lines, well-known algorithm
}
```

**Integration in `expandPartialInput`:**

When a partial word doesn't prefix-match any known term, check Levenshtein distance:

```typescript
// If no prefix match, try fuzzy match
if (!prefixMatched) {
  for (const unit of TIME_UNITS) {
    if (levenshtein(partial, unit) <= 1) {
      candidates.push(`${num} ${unit}`);
    }
  }
}
```

**Threshold**: Use distance ≤ 1 (conservative). This catches:
- "moths" → "months" (distance 1)
- "mnths" → "months" (distance 1)
- "dayz" → "days" (distance 1)

But not:
- "mo" → "months" (distance 4, but this is handled by prefix matching)

---

## Phase 3: Weighted Ranking

**Goal**: Show most likely completions first

### Scoring Factors

| Factor | Weight | Reasoning |
|--------|--------|-----------|
| Exact match (chrono parsed original input) | +100 | User typed something valid |
| Prefix match quality (% of word typed) | +50 × ratio | "mont" for "months" = 80% |
| Fuzzy match penalty | -20 per edit | Typos reduce confidence |
| Number-unit heuristic | +10 to +30 | Small numbers favor days |

### Number-Unit Heuristics

| Number Range | Favored Unit | Reasoning |
|--------------|--------------|-----------|
| 1-7 | days | "3 days" more common than "3 months" |
| 1-4 | weeks | "2 weeks" is very common |
| 1-12 | months | "6 months" natural for month counts |
| 1-5 | years | "2 years" reasonable for years |

### Implementation

**File: `fuzzyDateParser.ts`**

```typescript
export function scoreResult(
  originalInput: string,
  expandedCandidate: string,
  parsedDate: Date,
  referenceDate: Date
): number {
  let score = 0;

  // Exact match bonus
  if (originalInput.toLowerCase() === expandedCandidate.toLowerCase()) {
    score += 100;
  }

  // Prefix match quality
  // ... calculate how much of the unit word was typed

  // Number-unit heuristics
  // ... boost likely combinations

  return score;
}
```

---

## Phase 4: Contextual Awareness

**Goal**: Boost contextually relevant suggestions

### Context Signals

| Signal | Effect |
|--------|--------|
| User types "fri" on Thursday | Boost "friday" (it's tomorrow) |
| Day name matches tomorrow | Extra +20 |
| Day name is within 7 days | +10 |
| Day name is > 7 days away | No boost |

### Implementation

Add to `scoreResult`:

```typescript
// Contextual day boosting
const dayOfWeek = parsedDate.getDay();
const referenceDayOfWeek = referenceDate.getDay();
const daysUntil = /* calculate */;

if (daysUntil === 1) score += 20; // Tomorrow
else if (daysUntil <= 7) score += 10; // This week
```

---

## Implementation Plan

### Bundle: Phases 1-4 Together

All phases are tightly coupled and individually small:
- Phase 1 (expansion) creates candidates
- Phase 2 (typo tolerance) extends expansion
- Phase 3 (scoring) determines result order
- Phase 4 (contextual awareness) is ~5-10 lines inside scoring

### Estimated Scope

| Component | Lines of Code |
|-----------|---------------|
| `levenshtein.ts` | ~20 |
| `expandPartialInput` | ~60 |
| `scoreResult` (includes Phase 4) | ~50 |
| Modified `parseInput` | ~30 (mostly rewrite) |
| **Total new code** | ~160 lines |

---

## Testing Considerations

Key test cases for `expandPartialInput`:

```typescript
// Prefix matching
"3 mo" → includes "3 months", "3 monday"
"next we" → includes "next week", "next wednesday"
"tom" → includes "tomorrow"

// Typo tolerance
"3 moths" → includes "3 months"
"yesturday" → includes "yesterday"

// Number alone
"3" → includes "3 days", "3 weeks", "3 months"

// Already complete (should still work)
"tomorrow" → includes "tomorrow"
"3 months" → includes "3 months"
```

Key test cases for scoring:

```typescript
// Exact match scores highest
score("tomorrow", "tomorrow", ...) > score("tomorrow", "tom", ...)

// Prefix match quality matters
score("mont", "months", ...) > score("mo", "months", ...)

// Number heuristics
// For input "3", "3 days" should score higher than "3 years"
```

---

## Resolved Questions

1. **Levenshtein threshold**: Distance ≤ 1 (conservative)

2. **Number-only input**: Yes, suggest common units. "3" → "3 days", "3 weeks", "3 months"

3. **Ambiguous partials**: Show both, let ranking determine order. "mo" shows both "month" and "monday"

4. **Label display**: Already handled correctly by existing `getResultLabel` function — it uses chrono's `result.text` to determine format

---

## What We're NOT Doing

- Quick suggestion chips/buttons
- Learning from user behavior
- Debouncing (useMemo provides caching)
- Async/Web Worker processing
