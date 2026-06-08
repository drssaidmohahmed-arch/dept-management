"use client"

// Form component stubs — not used in current application.
// If react-hook-form integration is needed, install react-hook-form and @hookform/resolvers.

import * as React from "react"
import { cn } from "@/lib/utils"

// Stub exports to prevent import errors
export function Form({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>
}

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn(className)} {...props} />
}

export function FormControl(props: React.ComponentProps<"div">) {
  return <div {...props} />
}

export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />
}

export function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-destructive text-sm", className)} {...props} />
}

export function FormField(props: React.ComponentProps<"div">) {
  return <div {...props} />
}

export function useFormField() {
  return { id: "", name: "", error: undefined }
}
