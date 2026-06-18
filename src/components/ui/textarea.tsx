import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element px-3 py-2 text-sm text-gray-900 dark:text-gray-100 transition-all outline-none",
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

export { Textarea }
