import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-md p-[3px] text-ui-text-muted group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-ui-surface-subtle",
        line: "gap-1 bg-transparent p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-[14px] font-medium whitespace-nowrap text-ui-text-muted transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-ui-text focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/30 focus-visible:outline-1 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:hover:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bottom-[1px] group-data-[variant=line]/tabs-list:after:left-1/2 group-data-[variant=line]/tabs-list:after:-translate-x-1/2 group-data-[variant=line]/tabs-list:after:h-[3px] group-data-[variant=line]/tabs-list:after:w-5 group-data-[variant=line]/tabs-list:after:rounded-full group-data-[variant=line]/tabs-list:after:content-[''] group-data-[variant=line]/tabs-list:after:transition-all group-data-[variant=line]/tabs-list:after:duration-250",
        "group-data-[variant=line]/tabs-list:after:scale-x-0 group-data-[variant=line]/tabs-list:after:bg-gray-300 dark:group-data-[variant=line]/tabs-list:after:bg-gray-600",
        "group-data-[variant=line]/tabs-list:hover:after:scale-x-100",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-x-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-brand-500 dark:group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-brand-400",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-ui-surface-raised group-data-[variant=default]/tabs-list:data-[state=active]:text-ui-text group-data-[variant=default]/tabs-list:data-[state=active]:border-ui-border",
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-brand-600 dark:group-data-[variant=line]/tabs-list:data-[state=active]:text-brand-400",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
