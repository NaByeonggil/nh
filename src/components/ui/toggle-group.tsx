"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupProps {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
  children: React.ReactNode
}

interface ToggleGroupItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const ToggleGroupContext = React.createContext<{
  value: string | string[]
  onValueChange: (value: string) => void
  type: "single" | "multiple"
} | null>(null)

function useToggleGroup() {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("useToggleGroup must be used within a ToggleGroup")
  }
  return context
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ type = "single", value = type === "single" ? "" : [], onValueChange, className, children }, ref) => {
    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        if (type === "single") {
          onValueChange?.(itemValue)
        } else {
          const currentValue = value as string[]
          const newValue = currentValue.includes(itemValue)
            ? currentValue.filter((v) => v !== itemValue)
            : [...currentValue, itemValue]
          onValueChange?.(newValue)
        }
      },
      [type, value, onValueChange]
    )

    return (
      <ToggleGroupContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          type,
        }}
      >
        <div ref={ref} className={cn("flex items-center gap-1", className)}>
          {children}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, className, children }, ref) => {
    const { value: selectedValue, onValueChange, type } = useToggleGroup()
    
    const isSelected =
      type === "single"
        ? selectedValue === value
        : (selectedValue as string[]).includes(value)

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-muted hover:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "border border-input bg-background",
          isSelected && "bg-accent text-accent-foreground",
          className
        )}
      >
        {children}
      </button>
    )
  }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
