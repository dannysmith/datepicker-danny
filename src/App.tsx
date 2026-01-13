import { useState } from "react";
import { addDays, format } from "date-fns";
import { DatePicker } from "@/components/datepicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Calendar icon component
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

// Gradient divider between sections
function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <div
        className="h-px w-32"
        style={{
          background: 'linear-gradient(90deg, transparent, oklch(0.546 0.245 262.88 / 0.5), transparent)'
        }}
      />
    </div>
  );
}

// Section wrapper component
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-8">
      <div className="space-y-3 text-center">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, oklch(0.623 0.214 259.82), oklch(0.546 0.245 262.88))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h2>
        {description && (
          <p className="mx-auto max-w-3xl text-sm text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// Demo card for individual examples
function DemoCard({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="space-y-4 rounded-xl p-5 transition-all duration-300 hover:bg-zinc-800/30"
      style={{
        background: 'linear-gradient(135deg, rgba(39, 39, 42, 0.3), rgba(24, 24, 27, 0.5))',
        border: '1px solid rgba(63, 63, 70, 0.4)',
      }}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Popover DatePicker Demo - isolated component with its own state
function PopoverDatePickerDemo() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const handleCommit = (newDate: Date) => {
    setDate(newDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="justify-start gap-2 text-base h-10 px-4">
            <CalendarIcon className="size-5 text-zinc-400" />
            <span>{format(date, "d MMM")}</span>
          </Button>
        }
      />
      <PopoverContent className="w-[200px]">
        <DatePicker
          value={date}
          onChange={() => {
            // Don't update the actual date during navigation - only on commit
          }}
          onCommit={handleCommit}
          placeholder="Select date"
        />
      </PopoverContent>
    </Popover>
  );
}

// Inline DatePicker Demo - isolated component for container-based examples
function InlineDatePickerDemo({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const [date, setDate] = useState<Date>(new Date());

  // Extract pixel width from label for actual container sizing
  const pixelWidth = label.match(/\((\d+)px\)/)?.[1] || "340";

  return (
    <DemoCard label={label} description={description}>
      <div className="flex justify-center">
        <div style={{ width: `${pixelWidth}px` }}>
          <DatePicker
            value={date}
            onChange={setDate}
            placeholder="Select date"
          />
        </div>
      </div>
    </DemoCard>
  );
}

// Constrained DatePicker Demo - isolated component for minDate/maxDate examples
function ConstrainedDatePickerDemo({
  label,
  description,
  minDate,
  maxDate,
  placeholder,
}: {
  label: string;
  description: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder: string;
}) {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <DemoCard label={label} description={description}>
      <DatePicker
        value={date}
        onChange={setDate}
        minDate={minDate}
        maxDate={maxDate}
        placeholder={placeholder}
      />
    </DemoCard>
  );
}

// Form DatePicker Demo - isolated component
function FormDatePickerDemo({ minDate }: { minDate: Date }) {
  const [formDate, setFormDate] = useState<Date>(new Date());

  return (
    <Card
      className="p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(39, 39, 42, 0.3), rgba(24, 24, 27, 0.5))',
        border: '1px solid rgba(63, 63, 70, 0.4)',
        boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          alert(`Form submitted with date: ${format(formDate, "PPP")}`);
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <input
              id="event-name"
              type="text"
              placeholder="Enter event name"
              className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Event Date</Label>
            <DatePicker
              value={formDate}
              onChange={setFormDate}
              minDate={minDate}
              placeholder="When is this event?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              placeholder="Any additional notes..."
              rows={3}
              className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/50"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Event
        </Button>
      </form>
    </Card>
  );
}

export function App() {
  // Date constraints (shared constants, not state)
  const today = new Date();
  const weekFromNow = addDays(today, 7);

  return (
    <div
      className="relative min-h-screen px-8 py-16"
      style={{
        background: 'linear-gradient(180deg, #09090b 0%, #0c0c0f 50%, #09090b 100%)',
      }}
    >
      {/* Background glow effects */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-left blue glow */}
        <div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'oklch(0.546 0.245 262.88)' }}
        />
        {/* Bottom-right subtle glow */}
        <div
          className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'oklch(0.623 0.214 259.82)' }}
        />
        {/* Center subtle accent */}
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 blur-3xl"
          style={{ background: 'oklch(0.546 0.245 262.88)' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-24">
        {/* Header */}
        <header className="space-y-6 text-center">
          <div className="space-y-4">
            <h1
              className="text-5xl font-bold tracking-tight sm:text-6xl"
              style={{
                background: 'linear-gradient(135deg, oklch(0.7 0.18 259.82), oklch(0.546 0.245 262.88), oklch(0.5 0.2 270))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              DatePicker
            </h1>
            <p className="text-lg font-medium text-zinc-300">
              Natural language input • Infinite scroll • Beautiful by default
            </p>
          </div>
          <p className="mx-auto max-w-xl text-base text-zinc-500 leading-relaxed">
            Try typing <span className="rounded-md px-2 py-0.5 font-mono text-sm" style={{ background: 'oklch(0.546 0.245 262.88 / 0.15)', color: 'oklch(0.7 0.18 259.82)' }}>"tomorrow"</span>, <span className="rounded-md px-2 py-0.5 font-mono text-sm" style={{ background: 'oklch(0.546 0.245 262.88 / 0.15)', color: 'oklch(0.7 0.18 259.82)' }}>"next friday"</span>, or <span className="rounded-md px-2 py-0.5 font-mono text-sm" style={{ background: 'oklch(0.546 0.245 262.88 / 0.15)', color: 'oklch(0.7 0.18 259.82)' }}>"in 3 weeks"</span>
          </p>
        </header>

        <SectionDivider />

        {/* Section 1: Popover Trigger */}
        <Section
          title="Popover Integration"
          description="The most common use case - a button that opens the picker in a popover. The date only updates when you explicitly commit your selection (click or press Enter)."
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="grid place-items-center">
              <PopoverDatePickerDemo />
            </div>
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-xl">
                <div
                  className="overflow-hidden rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(39, 39, 42, 0.4), rgba(24, 24, 27, 0.6))',
                    border: '1px solid rgba(63, 63, 70, 0.5)',
                    boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b px-4 py-2.5"
                    style={{ borderColor: 'rgba(63, 63, 70, 0.5)' }}
                  >
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                    </div>
                    <span className="text-xs text-zinc-500">example.tsx</span>
                  </div>
                  <pre className="p-5 text-sm leading-relaxed overflow-x-auto">
                    <code className="text-zinc-300">{`const [date, setDate] = useState(new Date());
const [open, setOpen] = useState(false);

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger render={<Button>...</Button>} />
  <PopoverContent className="w-[200px]">
    <DatePicker
      value={date}
      onChange={() => {}}
      onCommit={(newDate) => {
        setDate(newDate);
        setOpen(false);
      }}
    />
  </PopoverContent>
</Popover>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <SectionDivider />

        {/* Section 2: Container Sizes */}
        <Section
          title="Container Size Variations"
          description="The DatePicker automatically adapts to different container widths. Font sizes and spacing scale proportionally to maintain readability at any size."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <InlineDatePickerDemo
              label="Wide (500px)"
              description="Spacious layout with generous spacing"
            />

            <InlineDatePickerDemo
              label="Standard (340px)"
              description="Recommended default width for most use cases"
            />

            <InlineDatePickerDemo
              label="Compact (300px)"
              description="Fits well in sidebars and narrow columns"
            />

            <InlineDatePickerDemo
              label="Minimal (260px)"
              description="Practical minimum before noticeable constraints"
            />

            <InlineDatePickerDemo
              label="Tiny (200px)"
              description="Extreme minimum - font automatically scales down"
            />
          </div>
        </Section>

        <SectionDivider />

        {/* Section 3: Date Constraints */}
        <Section
          title="Date Constraints"
          description="Using minDate and maxDate props to limit selectable dates. Disabled dates are dimmed and cannot be selected."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ConstrainedDatePickerDemo
              label="Future Dates Only"
              description={`Only dates from ${format(today, "MMM d, yyyy")} onwards are selectable`}
              minDate={today}
              placeholder="Select future date"
            />

            <ConstrainedDatePickerDemo
              label="Past Dates Only"
              description={`Only dates up to ${format(today, "MMM d, yyyy")} are selectable`}
              maxDate={today}
              placeholder="Select past date"
            />

            <ConstrainedDatePickerDemo
              label="7-Day Window"
              description={`Only dates between ${format(today, "MMM d")} and ${format(weekFromNow, "MMM d, yyyy")} are selectable`}
              minDate={today}
              maxDate={weekFromNow}
              placeholder="Select within window"
            />
          </div>
        </Section>

        <SectionDivider />

        {/* Section 4: Form Integration */}
        <Section
          title="Form Integration"
          description="How the picker looks in a typical form context with other form fields."
        >
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <FormDatePickerDemo minDate={today} />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="pt-16 text-center">
          <div
            className="mx-auto mb-6 h-px w-48"
            style={{
              background: 'linear-gradient(90deg, transparent, oklch(0.546 0.245 262.88 / 0.3), transparent)'
            }}
          />
          <p className="text-sm text-zinc-600">
            Built with React, Tailwind CSS, chrono-node, and @tanstack/react-virtual
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
