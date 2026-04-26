"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  children?: React.ReactNode
}

const RadioGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

function useRadioGroup() {
  const context = React.useContext(RadioGroupContext)
  if (!context) {
    throw new Error("useRadioGroup must be used within a RadioGroup")
  }
  return context
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ value = "", onValueChange = () => {}, className, children }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn("grid gap-2", className)}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, id, className, children }, ref) => {
    const { value: selectedValue, onValueChange } = useRadioGroup()
    const isSelected = selectedValue === value

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="radio"
        aria-checked={isSelected}
        onClick={() => onValueChange(value)}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
        {children}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
