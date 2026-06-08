"use client"

// Chart component stubs — not used in current application.
// If recharts integration is needed, install recharts and restore the full component.

import * as React from "react"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

// Stub exports to prevent import errors
export const ChartContainer = ({ children, ...props }: React.ComponentProps<"div"> & { config: ChartConfig }) => (
  <div {...props}>{children}</div>
)

export const ChartTooltip = () => null
export const ChartTooltipContent = () => null
export const ChartLegend = () => null
export const ChartLegendContent = () => null
export const ChartStyle = () => null
