import { cx } from "./utils";

interface MonthOverlayProps {
  monthName: string;
  isVisible: boolean;
}

export function MonthOverlay({ monthName, isVisible }: MonthOverlayProps) {
  return (
    <div
      className={cx(
        "dp-month-overlay",
        isVisible && "dp-month-overlay--visible"
      )}
    >
      <span className="dp-month-overlay-text">
        {monthName}
      </span>
    </div>
  );
}
