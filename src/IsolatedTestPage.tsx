/**
 * Isolated test page - NO Tailwind, NO external CSS
 *
 * Tests how the DatePicker behaves with only its own styles.
 */

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DatePicker } from "@/components/datepicker";

export function IsolatedTestPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCommit = (newDate: Date) => {
    setDate(newDate);
    setOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <p style={{ color: "#666", fontSize: "0.875rem" }}>
        No Tailwind. No external CSS. Just the component.
      </p>

      {/* Trigger button + popover container */}
      <div style={{ position: "relative" }}>
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
            border: "1px solid #ccc",
            borderRadius: "0.375rem",
            background: "#fff",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>{format(date, "d MMM")}</span>
        </button>

        {/* Popover */}
        {open && (
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "220px",
              zIndex: 10,
            }}
          >
            <DatePicker
              value={date}
              onChange={() => {}}
              onCommit={handleCommit}
              placeholder="Select date"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default IsolatedTestPage;
