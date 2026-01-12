# DatePicker Component Requirements

A reusable, self-contained React datepicker component designed for use in popups/modals for setting dates on tasks, cards, or similar UI elements.

## Overview

The datepicker consists of two main interaction modes:
1. **Calendar View** - A scrollable calendar grid for visual date selection
2. **Fuzzy Search** - Natural language input for quick date selection (Phase 2)

---

## Component Architecture

### External Interface (Props)

```typescript
interface DatePickerProps {
  /** The currently selected date. Defaults to today if not provided */
  value?: Date;
  /** Callback fired when a date is selected */
  onChange: (date: Date) => void;
  /** Optional: Minimum selectable date */
  minDate?: Date;
  /** Optional: Maximum selectable date */
  maxDate?: Date;
  /** Optional: Placeholder text for the input */
  placeholder?: string;
  /** Optional: Whether the picker is disabled */
  disabled?: boolean;
}
```

### Output
- Returns a `Date` object (date only, no time component)

---

## Calendar View Specifications

### Layout Structure

```
┌─────────────────────────────────┐
│         [Input Field]           │  ← Fixed header
├─────────────────────────────────┤
│  Mon  Tue  Wed  Thu  Fri Sat Sun│  ← Fixed day-of-week header
├─────────────────────────────────┤
│                                 │
│     [Scrollable Calendar]       │  ← Infinite/long scroll area
│                                 │
│   ┌─────────────────────────┐   │
│   │      Month Overlay      │   │  ← Appears while scrolling
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Grid Layout

1. **Week Start**: Monday (ISO week standard)
2. **Columns**: 7 columns (Mon-Sun)
3. **Row Height**: Consistent height for all date cells
4. **Grid Flow**: Continuous - months flow seamlessly into each other without breaks

### Date Cell Display

#### Standard Dates
- Display: Number only (e.g., "5", "13", "28")
- Style: Muted/dimmed text color

#### First Day of Month
- Display: Month abbreviation above the number
  ```
  Feb
   1
  ```
- Style: Month label in smaller text above the date number

#### Selected Date
- Display: Month abbreviation above the number (like first-of-month)
  ```
  Feb
   8
  ```
- Style: Blue/primary colored background box, white text
- The selected date always shows its month label for context

#### Today (if not selected)
- Display: Number only with subtle indicator
- Style: Optional subtle highlight or dot to indicate "today"

### Scrolling Behavior

1. **Direction**: Vertical scroll only
2. **Range**: Either infinite scroll OR bounded to reasonable range (e.g., 10 years past/future)
3. **Calendar Position**: Scrolls underneath the fixed input field and day-of-week header
4. **Performance**: Virtualized rendering for performance (only render visible rows)

### Month Overlay (While Scrolling)

When the user is actively scrolling:

1. **Display**: Large month name appears as a centered overlay
2. **Content**: Full month name (e.g., "March", "April")
3. **Position**: Centered in the visible calendar area
4. **Behavior**:
   - Shows the month(s) currently visible in the viewport
   - Can show multiple months if scroll position spans month boundary
   - Fades out shortly after scrolling stops
5. **Style**: Semi-transparent background, large readable text

### Keyboard Navigation

When the calendar has focus:

| Key | Action |
|-----|--------|
| `↑` | Move selection up one week (7 days earlier) |
| `↓` | Move selection down one week (7 days later) |
| `←` | Move selection left one day (1 day earlier) |
| `→` | Move selection right one day (1 day later) |
| `Enter` | Confirm selection and close picker |
| `Escape` | Cancel and close picker |
| `Home` | Jump to today |
| `Page Up` | Jump back one month |
| `Page Down` | Jump forward one month |

- Calendar should auto-scroll to keep the selected date visible when navigating

---

## Fuzzy Search / Natural Language Input (Phase 2)

### Input Field Behavior

1. **Location**: Fixed at top of component
2. **Placeholder**: "When" or custom placeholder from props
3. **Clear Button**: X button appears when text is entered
4. **Focus**: Clicking input switches to fuzzy search mode

### Fuzzy Matching (using chrono-node)

When user types in the input field:

1. **Parser**: Use chrono-node for natural language date parsing
2. **Results Display**: Show list of matched dates below input
3. **Result Format**:
   ```
   [Label]                    [Date]
   Today                      12 Jan
   Tomorrow                   13 Jan
   Thu 15 Jan                 in 3 days
   ```
4. **Result Info**:
   - Left side: Interpreted date description
   - Right side: Actual date OR relative description (e.g., "in 3 days")

### Fuzzy Search Result Selection

1. **Highlight**: First/best match highlighted by default
2. **Navigation**: Arrow keys to navigate results
3. **Selection**: Enter to select highlighted result
4. **Return to Calendar**: Escape or clearing input returns to calendar view

### Example Inputs to Support

- "today", "tomorrow", "yesterday"
- "next monday", "this friday"
- "in 3 days", "in 2 weeks"
- "jan 15", "january 15"
- "15th", "the 20th"
- "next week", "next month"

---

## Visual Design

### Color Scheme
- Designed to work with both light and dark themes
- Uses shadcn/ui design tokens for consistency
- Primary color for selection highlight

### Typography
- Day-of-week headers: Small, muted, uppercase or title case
- Date numbers: Clear, readable size
- Month labels: Smaller than date numbers, positioned above
- Month overlay: Large, bold, semi-transparent

### Spacing
- Consistent cell padding
- Adequate touch targets (min 44px for mobile)
- Comfortable spacing between elements

### Borders & Shadows
- Subtle borders or none (clean look)
- Card shadow for the overall component container

---

## Accessibility

1. **ARIA Labels**: Proper labeling for screen readers
2. **Keyboard Support**: Full keyboard navigation (see above)
3. **Focus Management**: Clear focus indicators
4. **Announcements**: Date changes announced to screen readers

---

## Component Files Structure

```
src/components/datepicker/
├── DatePicker.tsx        # Main component
├── CalendarGrid.tsx      # Scrollable calendar grid
├── DateCell.tsx          # Individual date cell
├── MonthOverlay.tsx      # Scrolling month indicator
├── FuzzySearch.tsx       # Natural language search (Phase 2)
├── types.ts              # TypeScript types
├── utils.ts              # Date utilities
└── index.ts              # Exports
```

---

## Implementation Phases

### Phase 1: Calendar Component
- [ ] Basic calendar grid with continuous month flow
- [ ] Infinite/long scroll with virtualization
- [ ] Month overlay while scrolling
- [ ] Selected date highlighting with month label
- [ ] First-of-month date labeling
- [ ] Keyboard navigation
- [ ] Basic styling with shadcn/Tailwind

### Phase 2: Fuzzy Search
- [ ] Input field integration
- [ ] chrono-node integration for parsing
- [ ] Results display
- [ ] Result navigation and selection
- [ ] Mode switching (calendar ↔ search)

---

## Dependencies

- React 18+
- date-fns (date manipulation)
- chrono-node (natural language parsing - Phase 2)
- Tailwind CSS
- shadcn/ui components (optional, for styling consistency)
- @tanstack/react-virtual or similar (for scroll virtualization)
