import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverPortal = PopoverPrimitive.Portal

const PopoverPositioner = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Positioner
    ref={ref}
    className={cn("outline-none", className)}
    {...props}
  />
))
PopoverPositioner.displayName = "PopoverPositioner"

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup> & {
    sideOffset?: number
  }
>(({ className, sideOffset = 8, ...props }, ref) => (
  <PopoverPortal>
    <PopoverPositioner sideOffset={sideOffset}>
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          "z-50 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </PopoverPositioner>
  </PopoverPortal>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal, PopoverPositioner }
