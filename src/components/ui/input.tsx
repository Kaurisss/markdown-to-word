import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 transition-all outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-500 dark:aria-invalid:ring-red-500/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
