# @dannysmith/datepicker

A React date picker component with natural language input and infinite scroll.

[Demo](https://dannysmith.github.io/datepicker-danny)

## Features

- **Fuzzy search**: Type natural language like "tomorrow", "next friday", "in 3 weeks", or "3 months" and get instant suggestions
- **Partial matching**: Incomplete input like "3 mont" or "next we" expands to valid dates
- **Typo tolerance**: Minor typos like "tomorow" or "3 moths" are handled gracefully
- **Infinite scroll**: Scroll through dates with virtualized rendering for smooth performance
- **Keyboard navigation**: Full keyboard support with arrow keys, Page Up/Down, Home, and Enter
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

```tsx
import { DatePicker } from '@dannysmith/datepicker';
import '@dannysmith/datepicker/styles.css';

function App() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="When"
      minDate={new Date()}  // optional
      maxDate={someDate}    // optional
    />
  );
}
```

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
