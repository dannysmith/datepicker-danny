# DatePicker Accessibility Plan

This document outlines accessibility improvements for the DatePicker component based on WAI-ARIA APG patterns.

## Context

This component is a self-contained date picker widget with infinite scroll and dual mode (calendar vs fuzzy search). It differs from standard modal datepicker patterns in that:

- **It doesn't manage its own popover** - In typical usage, parent code will render this component inside a popover/dialog, handle opening/closing, and manage focus return to the trigger element.
- **The component is a widget, not a dialog** - It doesn't need `role="dialog"`, `aria-modal`, or focus trapping. The parent popover handles that.
- **It should work in any context** - Whether rendered inline or inside a popover, the internal accessibility patterns are the same.

When used in a popover, the parent is responsible for:
- Setting `role="dialog"` and `aria-modal="true"` on the popover container
- Returning focus to the trigger element after the popover closes
- Focus trapping within the dialog

This component is responsible for:
- Being accessible as a self-contained widget
- Handling focus when it receives it (focus lands on the input)
- Proper ARIA for its internal grid and search modes

---

## Current State Summary

| Aspect | Current State | Impact |
|--------|--------------|--------|
| **Input field** | No ARIA attributes | Screen readers don't understand its purpose |
| **Calendar grid** | No `role="grid"` or ARIA | Screen readers see disconnected buttons |
| **Date cells** | `tabindex={-1}`, no `aria-selected` | No Tab access, selected date not announced |
| **Weekday headers** | Plain `<div>` elements | No semantic meaning for screen readers |
| **Month changes** | No announcements | Users don't know what month they're in |
| **Search results** | No listbox pattern | Screen readers can't navigate results properly |

---

## Prioritized Recommendations

### Tier 1: Essential (Required for Basic Screen Reader Access)

#### 1. Add ARIA to the input field

**File:** `DatePicker.tsx`

Note: We do NOT use `role="combobox"` or `aria-expanded` since this component doesn't manage its own popover. The input is simply a search field within the widget.

```tsx
<input
  ref={inputRef}
  type="text"
  aria-label="Search for a date, or use arrow keys to navigate calendar"
  aria-controls={isSearchMode ? "datepicker-search-results" : "datepicker-grid"}
  aria-autocomplete="list"
  // ... rest
/>
```

#### 2. Add `role="grid"` and labels to the calendar

**File:** `CalendarGrid.tsx`

```tsx
<div
  role="grid"
  aria-label="Calendar"
  aria-describedby="datepicker-instructions"
>
```

#### 3. Add `aria-selected` and `aria-current` to date cells

**File:** `DateCell.tsx`

```tsx
<button
  role="gridcell"
  aria-selected={isSelected}
  aria-current={isToday ? "date" : undefined}
  aria-label={format(date, "EEEE, MMMM d, yyyy")} // "Monday, January 15, 2025"
  tabIndex={isSelected ? 0 : -1} // Roving tabindex
  // ...
>
```

#### 4. Add semantic weekday headers

**File:** `CalendarGrid.tsx`

```tsx
<div role="row" className="grid grid-cols-7...">
  {WEEKDAY_HEADERS.map((day, i) => (
    <div key={day} role="columnheader" aria-label={FULL_DAY_NAMES[i]}>
      {day}
    </div>
  ))}
</div>
```

#### 5. Add aria-live region for month announcements

**File:** `CalendarGrid.tsx`

Add a visually-hidden live region that announces the current month when it changes:

```tsx
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only" // visually hidden but announced
>
  {currentMonth} {/* e.g., "January 2025" */}
</div>
```

#### 6. Add listbox pattern to search results

**File:** `FuzzySearch.tsx`

```tsx
<div role="listbox" id="datepicker-search-results" aria-label="Search results">
  {results.map((result, index) => (
    <button
      role="option"
      id={`search-result-${index}`}
      aria-selected={index === selectedIndex}
      aria-disabled={disabled}
      // ...
    >
```

---

### Tier 2: Important (Significantly Improves Experience)

#### 7. Implement proper roving tabindex

**Files:** `DateCell.tsx`, `CalendarGrid.tsx`

Currently all cells have `tabindex={-1}`. Change to:
- Selected date gets `tabindex={0}`
- All other dates get `tabindex={-1}`

This lets Tab move focus to the selected date, then Tab again exits the component.

#### 8. Add `aria-activedescendant` for virtual focus

**File:** `DatePicker.tsx`

Since keyboard nav keeps focus on the input while visually highlighting dates, use `aria-activedescendant` to tell screen readers which cell is "focused":

```tsx
<input
  aria-activedescendant={isSearchMode
    ? `search-result-${selectedIndex}`
    : `date-${selectedDate.toISOString()}`}
/>
```

This requires giving each date cell a stable `id`.

#### 9. Add keyboard instructions (hidden but announce-able)

**File:** `DatePicker.tsx` or `CalendarGrid.tsx`

```tsx
<div id="datepicker-instructions" className="sr-only">
  Use arrow keys to navigate dates, Enter to select, or type to search
</div>
```

#### 10. Make clear button accessible

**File:** `DatePicker.tsx`

```tsx
<button
  type="button"
  aria-label="Clear search"
  onClick={handleClear}
>
```

---

### Tier 3: Polish (Nice to Have)

#### 11. Announce date selection

Add a status region that announces when a date is selected:

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {/* Populated when selection changes: "Selected January 15, 2025" */}
</div>
```

#### 12. Add row roles to week rows

**File:** `WeekRow.tsx`

```tsx
<div role="row" className="grid w-full grid-cols-7...">
```

#### 13. Consider focus visible styling

Ensure the selected/focused date has a visible focus ring for keyboard users (currently using primary background, which is good).

---

## What NOT to Change

These behaviors should stay as-is:

- **Arrow key navigation** - Already excellent, matches APG patterns
- **Scrolling behavior** - Unique to the infinite-scroll design
- **Page Up/Down for 4-week jumps** - Valid alternative to month jumps
- **Home goes to today** - Clear, useful behavior
- **Escape clears search** - Makes sense for this inline component
- **Mouse/click interaction** - Works well

---

## Implementation Complexity Assessment

| Change | Complexity | Files Affected |
|--------|------------|----------------|
| ARIA on input | Low | DatePicker.tsx |
| `aria-selected`/`aria-current` on cells | Low | DateCell.tsx |
| Weekday header roles | Low | CalendarGrid.tsx |
| Listbox pattern for search | Low | FuzzySearch.tsx |
| Clear button label | Trivial | DatePicker.tsx |
| Live region for months | Medium | CalendarGrid.tsx |
| Roving tabindex | Medium | DateCell.tsx, CalendarGrid.tsx |
| `aria-activedescendant` | Medium | DatePicker.tsx, needs stable IDs |

---

## Implementation Order

1. Start with Tier 1 items - foundational accessibility
2. Add Tier 2 items for improved screen reader experience
3. Polish with Tier 3 if time permits

The most impactful single change is adding `aria-label` to date cells with the full date ("Monday, January 15, 2025") and adding `aria-selected`/`aria-current` attributes.

For Tab behavior, keep focus on the input and use `aria-activedescendant` to communicate the "virtual focus" position to screen readers. This matches the current UX (arrow keys move selection while keeping input focused) and is a recognized pattern for grid navigation.

---

## References

- [Date Picker Dialog Example | APG | WAI | W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- [Date Picker Combobox Example | APG | WAI | W3C](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/)
- [Dialog (Modal) Pattern | APG | WAI | W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Date and Time Pickers - Accessibility - MUI X](https://mui.com/x/react-date-pickers/accessibility/)
