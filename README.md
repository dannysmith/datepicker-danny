# @dannysmith/datepicker

A React date picker component with natural language input and infinite scroll. Designed primarily for use in datepicker popovers, but will work elsewhere too.

[Live Demo](https://dannysmith.github.io/datepicker-danny)

![datepickerdemo](https://github.com/user-attachments/assets/a50397cc-d9d3-4d62-9e55-aac3d6a415ee)


## Features

- **Keyboard navigation**: Full keyboard support with arrow keys, Page Up/Down, Home, and Enter
- **Infinite scroll**: Scroll through calendar months infinitely into the past or future.
- **Fuzzy natural language search**: Type natural language like "tomorrow", "next friday", "in 3 weeks", or "3 months" and get instant suggestions. Handles common typos and incomplete input like "3 mont" or "next we" as you type.
- **Min/max dates**: Optionally constrain selectable dates to a range
- **Customizable colors**: Theme via CSS variables to match your app's design

## Installation

```bash
npm install @dannysmith/datepicker
# or
pnpm add @dannysmith/datepicker
# or
bun add @dannysmith/datepicker
```

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import { DatePicker } from '@dannysmith/datepicker';
import '@dannysmith/datepicker/styles.css';

function App() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select date"
    />
  );
}
```

### Usage in a Popover

The `onCommit` callback fires only on explicit selection (click or Enter), making it ideal for closing popovers:

```tsx
import { useState } from 'react';
import { format } from 'date-fns';
import { DatePicker } from '@dannysmith/datepicker';
import '@dannysmith/datepicker/styles.css';
// Use your preferred popover component (Radix, Headless UI, etc.)
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

function DatePickerButton() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [open, setOpen] = useState(false);

  const handleCommit = (newDate: Date | null) => {
    setDate(newDate);
    setOpen(false); // Close popover on selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button>{date ? format(date, 'd MMM yyyy') : 'Select date'}</button>
      </PopoverTrigger>
      <PopoverContent>
        <DatePicker
          value={date}
          onCommit={handleCommit}
          showClearButton
        />
      </PopoverContent>
    </Popover>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | `new Date()` | The currently selected date. Pass `null` to indicate no selection. Defaults to today if not provided. |
| `onChange` | `(date: Date \| null) => void` | — | Called on any date change, including keyboard navigation. Use this to track the current selection as the user navigates. Receives `null` when cleared. |
| `onCommit` | `(date: Date \| null) => void` | — | Called only when the user explicitly selects a date (click or Enter). Use this to close popovers or trigger form submission. Receives `null` when cleared. |
| `minDate` | `Date` | — | Minimum selectable date. Earlier dates are visually disabled and cannot be selected. |
| `maxDate` | `Date` | — | Maximum selectable date. Later dates are visually disabled and cannot be selected. |
| `placeholder` | `string` | `"When"` | Placeholder text for the search input field. |
| `showClearButton` | `boolean` | `false` | When `true`, displays a "Clear" button below the calendar that resets the selection (calls both `onChange` and `onCommit` with `null`). |

### Understanding `onChange` vs `onCommit`

- **`onChange`**: Fires on every date change, including arrow key navigation. Use this when you want to preview the date as the user navigates, or when you don't need to distinguish between browsing and final selection.

- **`onCommit`**: Fires only on explicit selection—when the user clicks a date or presses Enter. This is the callback you typically want for popovers, where you want to close the popover only after the user has made a deliberate choice.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Up/Down/Left/Right` | Navigate days |
| `Page Up/Down` | Jump 4 weeks |
| `Home` | Go to today |
| `Enter` | Select highlighted date/result |
| `Escape` | Clear search query |

## Natural Language Examples

The fuzzy search understands a wide variety of inputs:

- `today`, `tomorrow`, `yesterday`
- `friday`, `next monday`, `last tuesday`
- `3 days`, `2 weeks`, `6 months`
- `in 3 days`, `in 2 weeks`
- Partial input: `tom` → tomorrow, `3 mo` → 3 months
- Typos: `tomorow`, `3 moths`, `firday`

## Theming

Colors are controlled via CSS variables. Override these in your CSS to customize:

```css
:root {
  --dp-bg: oklch(0.21 0.006 285.89);           /* container background */
  --dp-elevated: oklch(0.274 0.006 286.03);    /* input bg, hover states */
  --dp-text: oklch(0.967 0.001 286.38);        /* bright text */
  --dp-text-secondary: oklch(0.788 0.01 286.18); /* regular text */
  --dp-text-muted: oklch(0.553 0.016 285.94);  /* headers, placeholders */
  --dp-text-disabled: oklch(0.366 0.014 285.79); /* disabled states */
  --dp-border: oklch(0.274 0.006 286.03);      /* primary borders */
  --dp-border-muted: oklch(0.366 0.014 285.79); /* subtle borders */
  --dp-primary: oklch(0.546 0.245 262.88);     /* selection background */
  --dp-primary-fg: oklch(1 0 0);               /* text on selection */
  --dp-primary-muted: oklch(0.882 0.059 254.13); /* secondary text on selection */
  --dp-accent: oklch(0.623 0.214 259.82);      /* today marker */
  --dp-ring: oklch(0.442 0.017 285.79);        /* focus ring */
}
```

The default theme is dark. For light mode, override the variables with lighter values.

## Dependencies

- React 18+ or 19
- [chrono-node](https://github.com/wanasit/chrono) - Natural language date parsing
- [date-fns](https://date-fns.org/) - Date utilities
- [@tanstack/react-virtual](https://tanstack.com/virtual) - Virtualized scrolling

## License

MIT
