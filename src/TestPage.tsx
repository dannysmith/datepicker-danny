import { useState } from "react";
import { DatePicker } from "@/components/datepicker";

export function TestPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="w-[340px]">
        <DatePicker
          value={date}
          onChange={setDate}
          placeholder="Select date"
        />
      </div>
    </div>
  );
}

export default TestPage;
