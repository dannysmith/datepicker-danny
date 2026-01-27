import { useState, useRef, useEffect } from "react";
import { addDays, format } from "date-fns";
import { highlight } from "sugar-high";
import { DatePicker } from "../lib";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NpmIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// Hero section with popover demo
function HeroSection() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [open, setOpen] = useState(false);

  const handleCommit = (newDate: Date | null) => {
    setDate(newDate);
    setOpen(false);
  };

  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
          @dannysmith/datepicker
        </h1>
        <p className="text-zinc-400 max-w-lg">
          A React date picker with natural language input, infinite scroll, and keyboard navigation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.npmjs.com/package/@dannysmith/datepicker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <NpmIcon className="size-5" />
            <span>npm</span>
          </a>
          <span className="text-zinc-700">|</span>
          <a
            href="https://github.com/dannysmith/datepicker-danny"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <GitHubIcon className="size-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-sm text-zinc-500">Try it out</span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button className="gap-2 text-base h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white">
                <CalendarIcon className="size-5" />
                <span>{date ? format(date, "d MMM") : "Select date"}</span>
              </Button>
            }
          />
          <PopoverContent className="w-[240px]">
            <DatePicker
              value={date}
              onCommit={handleCommit}
              placeholder="Select date"
              showClearButton
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-zinc-600">
          Type "tomorrow", "next friday", or "in 2 weeks"
        </p>
      </div>
    </section>
  );
}

// Install section
function InstallSection() {
  const [copied, setCopied] = useState(false);
  const command = "npm install @dannysmith/datepicker";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-4">Install</h2>
      <button
        onClick={handleCopy}
        className="w-full group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 text-left transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <code className="text-sm font-mono text-zinc-300">{command}</code>
          <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors shrink-0">
            {copied ? "Copied!" : "Click to copy"}
          </span>
        </div>
      </button>
      <p className="mt-3 text-xs text-zinc-600">
        Or use <code className="text-zinc-500">pnpm add</code> / <code className="text-zinc-500">bun add</code>
      </p>
    </section>
  );
}

// Code example section
function CodeSection() {
  const code = `import { DatePicker } from '@dannysmith/datepicker';
import '@dannysmith/datepicker/styles.css';

function MyComponent() {
  const [date, setDate] = useState(new Date());

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="When"
    />
  );
}`;

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-4">Usage</h2>
      <pre
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 text-sm overflow-x-auto"
        style={{
          '--sh-keyword': '#f472b6',
          '--sh-string': '#4ade80',
          '--sh-identifier': '#e4e4e7',
          '--sh-property': '#60a5fa',
          '--sh-entity': '#facc15',
          '--sh-jsxliterals': '#d4d4d8',
          '--sh-sign': '#71717a',
          '--sh-class': '#facc15',
        } as React.CSSProperties}
      >
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </section>
  );
}

// Resizable container demo
function ResizableSection() {
  const [date, setDate] = useState<Date>(new Date());
  const [width, setWidth] = useState(320);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) setDate(newDate);
  };

  // Min: datepicker 200px + container padding (p-4 = 16px × 2 = 32px) = 232px
  const minWidth = 232;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const parentWidth = containerRef.current.parentElement?.clientWidth || 700;
      const newWidth = Math.max(minWidth, Math.min(parentWidth, e.clientX - rect.left));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-2">Responsive sizing</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Drag the right edge to resize. The component scales smoothly at any width.
      </p>

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
          style={{ width }}
        >
          <DatePicker
            value={date}
            onChange={handleDateChange}
            placeholder="Select date"
            autoFocus={false}
          />

          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 w-3 h-full cursor-ew-resize flex items-center justify-center group"
          >
            <div className="w-1 h-8 bg-zinc-700 rounded-full group-hover:bg-zinc-500 transition-colors" />
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-600 mt-3">{width}px</p>
    </section>
  );
}

// Date constraints demo
function ConstraintsSection() {
  const today = new Date();
  const weekFromNow = addDays(today, 7);

  const [futureDate, setFutureDate] = useState<Date>(today);
  const [pastDate, setPastDate] = useState<Date>(today);
  const [windowDate, setWindowDate] = useState<Date>(today);

  const handleFutureDateChange = (d: Date | null) => { if (d) setFutureDate(d); };
  const handlePastDateChange = (d: Date | null) => { if (d) setPastDate(d); };
  const handleWindowDateChange = (d: Date | null) => { if (d) setWindowDate(d); };

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-2">Date constraints</h2>
      <p className="text-sm text-zinc-500 mb-6">
        Use minDate and maxDate props to limit selectable dates.
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-300">Future only</p>
            <p className="text-xs text-zinc-500">minDate = today</p>
          </div>
          <DatePicker
            value={futureDate}
            onChange={handleFutureDateChange}
            minDate={today}
            placeholder="Select future date"
            autoFocus={false}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-300">Past only</p>
            <p className="text-xs text-zinc-500">maxDate = today</p>
          </div>
          <DatePicker
            value={pastDate}
            onChange={handlePastDateChange}
            maxDate={today}
            placeholder="Select past date"
            autoFocus={false}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-300">7-day window</p>
            <p className="text-xs text-zinc-500">minDate + maxDate</p>
          </div>
          <DatePicker
            value={windowDate}
            onChange={handleWindowDateChange}
            minDate={today}
            maxDate={weekFromNow}
            placeholder="Select within window"
            autoFocus={false}
          />
        </div>
      </div>
    </section>
  );
}

// Props documentation
function PropsSection() {
  const props = [
    { name: "value", type: "Date | null", required: false, description: "The currently selected date. Defaults to today. Pass null for no selection." },
    { name: "onChange", type: "(date: Date | null) => void", required: false, description: "Callback fired on any date change, including keyboard navigation. Receives null when cleared." },
    { name: "onCommit", type: "(date: Date | null) => void", required: false, description: "Callback fired only on explicit selection (click or Enter). Useful for popovers. Receives null when cleared." },
    { name: "minDate", type: "Date", required: false, description: "Minimum selectable date. Earlier dates are disabled." },
    { name: "maxDate", type: "Date", required: false, description: "Maximum selectable date. Later dates are disabled." },
    { name: "placeholder", type: "string", required: false, description: "Placeholder text for the search input. Defaults to \"When\"." },
    { name: "showClearButton", type: "boolean", required: false, description: "Show a clear button below the calendar to reset the date selection." },
    { name: "autoFocus", type: "boolean", required: false, description: "Automatically focus the input on mount. Defaults to true. Set to false when rendering multiple pickers on a page." },
  ];

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-4">Props</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="py-3 pr-4 font-medium text-zinc-400">Prop</th>
              <th className="py-3 pr-4 font-medium text-zinc-400">Type</th>
              <th className="py-3 pr-4 font-medium text-zinc-400">Required</th>
              <th className="py-3 font-medium text-zinc-400">Description</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {props.map((prop) => (
              <tr key={prop.name} className="border-b border-zinc-800/50">
                <td className="py-3 pr-4 font-mono text-zinc-100">{prop.name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{prop.type}</td>
                <td className="py-3 pr-4">{prop.required ? "Yes" : "No"}</td>
                <td className="py-3 text-zinc-400">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// CSS variables documentation
function CSSVariablesSection() {
  const variables = [
    { name: "--dp-font", default: "inherit", description: "Font family" },
    { name: "--dp-bg", default: "oklch(0.21 ...)", description: "Container background" },
    { name: "--dp-elevated", default: "oklch(0.27 ...)", description: "Input and hover backgrounds" },
    { name: "--dp-text", default: "oklch(0.97 ...)", description: "Primary text color" },
    { name: "--dp-text-secondary", default: "oklch(0.79 ...)", description: "Secondary text color" },
    { name: "--dp-text-muted", default: "oklch(0.55 ...)", description: "Muted text and placeholders" },
    { name: "--dp-text-disabled", default: "oklch(0.37 ...)", description: "Disabled state text" },
    { name: "--dp-border", default: "oklch(0.27 ...)", description: "Primary borders" },
    { name: "--dp-border-muted", default: "oklch(0.37 ...)", description: "Subtle borders" },
    { name: "--dp-primary", default: "oklch(0.55 ...)", description: "Selection background" },
    { name: "--dp-primary-fg", default: "oklch(1 0 0)", description: "Text on selection" },
    { name: "--dp-primary-muted", default: "oklch(0.88 ...)", description: "Secondary text on selection" },
    { name: "--dp-accent", default: "oklch(0.62 ...)", description: "Today marker color" },
    { name: "--dp-ring", default: "oklch(0.44 ...)", description: "Focus ring color" },
  ];

  return (
    <section className="py-12">
      <h2 className="text-lg font-medium text-zinc-300 mb-2">CSS Variables</h2>
      <p className="text-sm text-zinc-500 mb-4">
        All variables are optional. Override them in your CSS to customize the theme.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="py-3 pr-4 font-medium text-zinc-400">Variable</th>
              <th className="py-3 pr-4 font-medium text-zinc-400">Default</th>
              <th className="py-3 font-medium text-zinc-400">Description</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {variables.map((v) => (
              <tr key={v.name} className="border-b border-zinc-800/50">
                <td className="py-3 pr-4 font-mono text-xs text-zinc-100">{v.name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{v.default}</td>
                <td className="py-3 text-zinc-400">{v.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function App() {
  // Scroll to top on mount (prevents auto-focus from scrolling page down)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6">
        <HeroSection />
        <hr className="border-zinc-800" />
        <InstallSection />
        <hr className="border-zinc-800" />
        <CodeSection />
        <hr className="border-zinc-800" />
        <ResizableSection />
        <hr className="border-zinc-800" />
        <ConstraintsSection />
        <hr className="border-zinc-800" />
        <PropsSection />
        <hr className="border-zinc-800" />
        <CSSVariablesSection />

        <footer className="py-8 text-center text-xs text-zinc-600">
          Built by{" "}
          <a href="https://danny.is" className="text-zinc-500 hover:text-zinc-400 transition-colors">
            Danny Smith
          </a>
          {" "}with React, date-fns, chrono-node, and @tanstack/react-virtual
        </footer>
      </div>
    </div>
  );
}

export default App;
