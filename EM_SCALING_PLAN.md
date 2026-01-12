# Em-Based Scaling Implementation Plan

This document outlines the plan for converting the DatePicker's calendar component from fixed pixel sizes to em-based sizing, enabling automatic proportional scaling based on container size.

---

## CURRENT STATUS (Session 2026-01-12)

### What's Been Done

**Phase 1, 2 & 3 COMPLETE:**

1. Added container query context to CalendarGrid (two separate elements):
   ```jsx
   <div
     className="mx-auto max-w-[340px]"
     style={{ containerType: "inline-size" }}
   >
     <div
       ref={fontSizeContainerRef}
       className="flex flex-col"
       style={{ fontSize: "clamp(10px, 5cqw, 14px)" }}
     >
   ```

2. Converted text sizes to em in:
   - `CalendarGrid.tsx`: Weekday headers → `text-[0.85em]`
   - `DateCell.tsx`: Day number → `text-[1em]`, Month label → `text-[0.65em]`
   - `MonthOverlay.tsx`: Month name → `text-[1.7em]`

3. Added `[font-size:inherit]` to the DateCell button to fix inheritance chain

4. Converted layout sizes to em:
   - `DateCell.tsx`: Height → `h-[2.4em]`
   - `CalendarGrid.tsx`: Scroll container → `h-[18.2em]` (7 rows × 2.6em)

5. Updated virtualizer to use dynamic row height:
   - Added `ROW_HEIGHT_EM = 2.6` constant
   - Added `fontSizeContainerRef` and `rowHeightRef` refs
   - Added `useLayoutEffect` with ResizeObserver to recalculate row height on resize
   - Virtualizer uses `rowHeightRef.current` for `estimateSize` and `initialOffset`
   - `isWeekVisible` uses dynamic row height

### Key Insight: Container Query Gotcha

`cqw` units look for the **nearest ancestor** containment context, NOT the element itself. Must use two elements:
- Outer: `container-type: inline-size` (establishes containment)
- Inner: `font-size: clamp(...)` with `cqw` (references parent's containment)

### Files Modified

| File | Changes Made |
|------|--------------|
| `CalendarGrid.tsx` | Container setup, dynamic virtualizer, em heights |
| `DateCell.tsx` | `[font-size:inherit]` on button, em text + height |
| `MonthOverlay.tsx` | Em text size |
| `App.tsx` | Demo page with various container sizes |

### Next Steps

Phase 4: Polish and edge cases - test at various widths, adjust em values if proportions look off

---

## Goal

Make the calendar scale proportionally based on container width using:
- `container-type: inline-size` for container queries
- `font-size: clamp(10px, 4cqw, 14px)` as the scaling foundation
- All dimensions in `em` units, derived from the font-size

## Current State

| Element | Current Value | Purpose |
|---------|---------------|---------|
| `WEEK_HEIGHT` | `36px` | Virtualizer row height constant |
| Scroll container | `h-[252px]` | 7 rows visible (7 × 36px) |
| DateCell | `h-[34px]` | Cell height |
| Day number | `text-sm` (14px) | Day text |
| Month label | `text-[9px]` | Small month abbreviation |
| Weekday headers | `text-xs` (12px) | Mon, Tue, etc. |
| Month overlay | `text-2xl` (24px) | Overlay during scroll |

## Target State

| Element | Em Value | At 14px base | At 10px base |
|---------|----------|--------------|--------------|
| Row height | `2.6em` | 36.4px | 26px |
| Cell height | `2.4em` | 33.6px | 24px |
| Scroll container | `min(18em, 100%)` | 252px | 180px |
| Day number | `1em` | 14px | 10px |
| Month label | `0.65em` | 9.1px | 6.5px |
| Weekday headers | `0.85em` | 11.9px | 8.5px |
| Month overlay | `1.7em` | 23.8px | 17px |

---

## Phase 1: Container Setup (Low Risk)

**Goal**: Add the container query context without changing any visual appearance.

**Changes**:
1. Add `container-type: inline-size` to CalendarGrid wrapper
2. Add `font-size: clamp(10px, 4cqw, 14px)` to CalendarGrid wrapper

**Files**: `CalendarGrid.tsx`

**Test**: Component should look identical at current sizes. Verify container queries are working by inspecting computed font-size at different container widths.

**Rollback**: Remove the two style additions.

---

## Phase 2: Convert Text Sizes to Em (Low Risk)

**Goal**: Convert all calendar text to em-based sizing. This is purely visual and doesn't affect layout calculations.

**Changes**:

### DateCell.tsx
- Day number: `text-sm` → `text-[1em]`
- Month label: `text-[9px]` → `text-[0.65em]`

### CalendarGrid.tsx
- Weekday headers: `text-xs` → `text-[0.85em]`

### MonthOverlay.tsx
- Month name: `text-2xl` → `text-[1.7em]`

**Test**:
- Text should look identical at default size
- At narrower containers, text should shrink proportionally
- Fuzzy search text should remain unchanged (it's outside the scaling context)

**Rollback**: Revert text class changes.

---

## Phase 3: Convert Layout Sizes + Update Virtualizer (Higher Risk)

**Goal**: Convert heights and the virtualizer to em-based calculations. This is the most complex phase as changes are interdependent.

**Changes**:

### DateCell.tsx
- Height: `h-[34px]` → `h-[2.4em]`

### WeekRow.tsx
- Gap: `gap-0.5` → `gap-[0.1em]` (if needed for proportionality)

### CalendarGrid.tsx

1. **Remove fixed WEEK_HEIGHT constant**, replace with:
   ```js
   const ROW_HEIGHT_EM = 2.6;
   ```

2. **Add row height calculation**:
   ```js
   const rowHeightRef = useRef(36); // fallback

   useLayoutEffect(() => {
     const updateRowHeight = () => {
       if (!containerRef.current) return;
       const fontSize = parseFloat(getComputedStyle(containerRef.current).fontSize);
       rowHeightRef.current = fontSize * ROW_HEIGHT_EM;
     };

     updateRowHeight();

     const observer = new ResizeObserver(() => {
       updateRowHeight();
       rowVirtualizer.measure();
     });
     observer.observe(containerRef.current);
     return () => observer.disconnect();
   }, []);
   ```

3. **Update virtualizer config**:
   ```js
   const rowVirtualizer = useVirtualizer({
     count: TOTAL_WEEKS,
     getScrollElement: () => scrollContainerRef.current,
     estimateSize: () => rowHeightRef.current,
     overscan: 10,
     initialOffset: initialWeekIndex * rowHeightRef.current,
   });
   ```

4. **Update scroll container**:
   - `h-[252px]` → `h-[min(18em,100%)]`

5. **Update helper functions** that use WEEK_HEIGHT:
   - `isWeekVisible()` - use `rowHeightRef.current`
   - Any initial offset calculations

**Test**:
- Calendar should look identical at default size
- Scroll should work correctly
- At narrower containers:
  - Cells should shrink proportionally
  - Scroll should still work
  - Virtualizer should render correct rows
- At containers shorter than ~250px:
  - Should show fewer rows (scroll container respects 100% height)
  - Scrolling should still work

**Rollback**: This phase has many interconnected changes. If issues arise, may need to revert entire phase.

---

## Phase 4: Polish and Edge Cases (Low Risk)

**Goal**: Fine-tune and handle edge cases discovered during testing.

**Potential items**:
- Adjust em values if proportions look off
- Handle scroll position preservation on resize (if needed)
- Adjust clamp min/max values based on testing
- Add any missing em conversions for padding/margins

---

## Files Modified (Summary)

| File | Phase |
|------|-------|
| `CalendarGrid.tsx` | 1, 2, 3 |
| `DateCell.tsx` | 2, 3 |
| `WeekRow.tsx` | 3 |
| `MonthOverlay.tsx` | 2 |

---

## Risks and Mitigations

### Risk: Virtualizer scroll position jumps during resize
**Mitigation**: Accept minor jumps as resize is uncommon. If problematic, can add logic to preserve "centered date" across resize.

### Risk: Performance issues from ResizeObserver
**Mitigation**: The observer only recalculates when size actually changes. Could add debouncing if needed.

### Risk: Rounding errors in em calculations
**Mitigation**: Use consistent em values. Small pixel differences (±1px) are acceptable.

### Risk: Very small containers become unusable
**Mitigation**: The `min-w-[200px]` on outer container prevents extreme cases. Below ~200px, we accept degraded appearance.

---

## Testing Checklist

After each phase:

- [ ] Default appearance unchanged
- [ ] Keyboard navigation works
- [ ] Scroll works (mouse wheel, drag)
- [ ] Date selection works (click, Enter)
- [ ] Fuzzy search works and text size unchanged
- [ ] Month overlay appears during scroll

After Phase 3:

- [ ] Test at 340px container (max width)
- [ ] Test at 290px container (small)
- [ ] Test at 260px container (minimum recommended)
- [ ] Test at 200px container (absolute minimum)
- [ ] Test with constrained height container
- [ ] Test resize behavior (if applicable)

---

## Demo Page Updates

Add new demo examples for testing:

```jsx
{/* Very narrow */}
<div className="w-[220px]">
  <DatePicker ... />
</div>

{/* Height constrained */}
<div className="w-[300px] h-[250px]">
  <DatePicker ... />
</div>

{/* Very height constrained */}
<div className="w-[300px] h-[200px]">
  <DatePicker ... />
</div>
```

---

## Execution Order

1. **Phase 1** → Test → Commit
2. **Phase 2** → Test → Commit
3. **Phase 3** → Test → Commit (or iterate if issues)
4. **Phase 4** → Test → Commit
5. Update demo page with size variation examples
