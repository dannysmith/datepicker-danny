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
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
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
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function App() {
  // State for various demos
  const [basicDate, setBasicDate] = useState<Date>(new Date());
  const [popoverDate1, setPopoverDate1] = useState<Date>(new Date());
  const [popoverDate2, setPopoverDate2] = useState<Date>(new Date());
  const [popoverDate3, setPopoverDate3] = useState<Date>(new Date());
  const [wideDate, setWideDate] = useState<Date>(new Date());
  const [narrowDate, setNarrowDate] = useState<Date>(new Date());
  const [tinyDate, setTinyDate] = useState<Date>(new Date());
  const [futureOnlyDate, setFutureOnlyDate] = useState<Date>(new Date());
  const [pastOnlyDate, setPastOnlyDate] = useState<Date>(new Date());
  const [weekWindowDate, setWeekWindowDate] = useState<Date>(new Date());
  const [formDate, setFormDate] = useState<Date>(new Date());

  // Popover open states
  const [popover1Open, setPopover1Open] = useState(false);
  const [popover2Open, setPopover2Open] = useState(false);
  const [popover3Open, setPopover3Open] = useState(false);

  // Date constraints
  const today = new Date();
  const weekFromNow = addDays(today, 7);

  return (
    <div className="min-h-screen bg-zinc-950 px-8 py-12">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100">
            DatePicker Demo
          </h1>
          <p className="text-zinc-400">
            A React date picker with natural language input and infinite scroll.
            Try typing things like "tomorrow", "next friday", or "in 3 weeks".
          </p>
        </header>

        {/* Section 1: Popover Triggers */}
        <Section
          title="Popover Triggers"
          description="The most common use case - a button that opens the picker in a popover."
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* shadcn Popover - Large */}
            <DemoCard
              label="Large Popover (380px)"
              description="Picker centered with space around"
            >
              <Popover open={popover1Open} onOpenChange={setPopover1Open}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarIcon className="size-4 text-zinc-400" />
                      <span>{format(popoverDate1, "PPP")}</span>
                    </Button>
                  }
                />
                <PopoverContent className="w-[380px]">
                  <DatePicker
                    value={popoverDate1}
                    onChange={setPopoverDate1}
                    onCommit={() => setPopover1Open(false)}
                    placeholder="Select date"
                  />
                </PopoverContent>
              </Popover>
            </DemoCard>

            {/* shadcn Popover - Medium */}
            <DemoCard
              label="Medium Popover (340px)"
              description="Picker fills container exactly"
            >
              <Popover open={popover2Open} onOpenChange={setPopover2Open}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarIcon className="size-4 text-zinc-400" />
                      <span>{format(popoverDate2, "PPP")}</span>
                    </Button>
                  }
                />
                <PopoverContent className="w-[340px]">
                  <DatePicker
                    value={popoverDate2}
                    onChange={setPopoverDate2}
                    onCommit={() => setPopover2Open(false)}
                    placeholder="Select date"
                  />
                </PopoverContent>
              </Popover>
            </DemoCard>

            {/* shadcn Popover - Small/Tight */}
            <DemoCard
              label="Small Popover (290px)"
              description="Picker fills narrow container"
            >
              <Popover open={popover3Open} onOpenChange={setPopover3Open}>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <CalendarIcon className="size-4 text-zinc-400" />
                      <span>{format(popoverDate3, "PPP")}</span>
                    </Button>
                  }
                />
                <PopoverContent className="w-[290px]">
                  <DatePicker
                    value={popoverDate3}
                    onChange={setPopoverDate3}
                    onCommit={() => setPopover3Open(false)}
                    placeholder="Select date"
                  />
                </PopoverContent>
              </Popover>
            </DemoCard>

          </div>
        </Section>

        {/* Section 2: Container Sizes */}
        <Section
          title="Container Size Variations"
          description="How the picker adapts to different container widths."
        >
          <div className="space-y-8">
            {/* Wide container */}
            <DemoCard
              label="Wide Container (500px)"
              description="Extra horizontal space"
            >
              <div className="w-[500px]">
                <DatePicker
                  value={wideDate}
                  onChange={setWideDate}
                  placeholder="Select date"
                />
              </div>
            </DemoCard>

            {/* Standard container */}
            <DemoCard
              label="Standard Container (340px)"
              description="Default recommended width"
            >
              <div className="w-[340px]">
                <DatePicker
                  value={basicDate}
                  onChange={setBasicDate}
                  placeholder="Select date"
                />
              </div>
            </DemoCard>

            {/* Narrow container */}
            <DemoCard
              label="Narrow Container (300px)"
              description="Tighter fit"
            >
              <div className="w-[300px]">
                <DatePicker
                  value={narrowDate}
                  onChange={setNarrowDate}
                  placeholder="Select date"
                />
              </div>
            </DemoCard>

            {/* Very narrow container */}
            <DemoCard
              label="Minimum Container (260px)"
              description="Testing the limits"
            >
              <div className="w-[260px]">
                <DatePicker
                  value={tinyDate}
                  onChange={setTinyDate}
                  placeholder="Select date"
                />
              </div>
            </DemoCard>
          </div>
        </Section>

        {/* Section 3: Date Constraints */}
        <Section
          title="Date Constraints"
          description="Using minDate and maxDate props to limit selectable dates."
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Future only */}
            <DemoCard
              label="Future Dates Only"
              description={`From ${format(today, "MMM d")} onwards`}
            >
              <DatePicker
                value={futureOnlyDate}
                onChange={setFutureOnlyDate}
                minDate={today}
                placeholder="Select future date"
              />
            </DemoCard>

            {/* Past only */}
            <DemoCard
              label="Past Dates Only"
              description={`Up to ${format(today, "MMM d")}`}
            >
              <DatePicker
                value={pastOnlyDate}
                onChange={setPastOnlyDate}
                maxDate={today}
                placeholder="Select past date"
              />
            </DemoCard>

            {/* Narrow window */}
            <DemoCard
              label="7-Day Window"
              description={`${format(today, "MMM d")} - ${format(weekFromNow, "MMM d")}`}
            >
              <DatePicker
                value={weekWindowDate}
                onChange={setWeekWindowDate}
                minDate={today}
                maxDate={weekFromNow}
                placeholder="Select within window"
              />
            </DemoCard>
          </div>
        </Section>

        {/* Section 4: Form Integration */}
        <Section
          title="Form Integration"
          description="How the picker looks in a typical form context."
        >
          <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6">
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
                    minDate={today}
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
        </Section>

        {/* Section 5: Placeholder Variations */}
        <Section
          title="Custom Placeholders"
          description="Different placeholder text for various use cases."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "When",
              "Due date",
              "Start date",
              "Departure",
            ].map((placeholder) => (
              <DatePicker
                key={placeholder}
                value={new Date()}
                onChange={() => {}}
                placeholder={placeholder}
              />
            ))}
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-500">
          <p>
            Built with React, Tailwind CSS, chrono-node, and @tanstack/react-virtual
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
