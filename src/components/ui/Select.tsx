import * as React from "react"
import { CheckLine as CheckIcon, DownLine as ChevronDownIcon, UpLine as ChevronUpIcon } from "@mingcute/react"
import { Select as SelectPrimitive } from "radix-ui"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { cn } from "@/lib/utils"

function ShadcnSelect({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-1 rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element px-2 py-1 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:hover:bg-dark-element-hover [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-gray-200 shadow-xl data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm whitespace-nowrap outline-hidden select-none focus:bg-brand-50 dark:focus:bg-brand-900/30 focus:text-brand-600 dark:focus:text-brand-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-gray-400 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-gray-100 dark:bg-gray-700", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  ShadcnSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

export interface SelectOption {
  label: string;
  value: string | number;
  fontFamily?: string;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  optionClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
  showSearch?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  triggerClassName = '',
  optionClassName = '',
  placeholder = '请选择',
  disabled = false,
  variant = 'default',
  showSearch = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between gap-1 rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-element px-2 py-1 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 data-[state=open]:border-brand-500 data-[state=open]:ring-2 data-[state=open]:ring-brand-500/20 hover:bg-gray-50 dark:hover:bg-dark-element-hover disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-gray-400",
              'h-8 text-[13px]',
              variant === 'ghost' && 'border-transparent bg-transparent shadow-none hover:bg-gray-100 dark:hover:bg-dark-element-hover data-[state=open]:border-transparent data-[state=open]:ring-0 data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-dark-element-hover',
              triggerClassName,
            )}
          >
            <span style={selected?.fontFamily ? { fontFamily: `"${selected.fontFamily}"` } : undefined} className="truncate block text-left">
              {selected?.label ?? placeholder}
            </span>
            <ChevronDownIcon className="size-3.5 opacity-50 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0 shadow-xl min-w-[var(--radix-popover-trigger-width)]", showSearch ? "w-56" : "w-max")} align="start">
          <Command>
            {showSearch && <CommandInput placeholder="搜索..." className="h-9 text-[13px]" />}
            <CommandList className="max-h-60 custom-scrollbar">
              <CommandEmpty>未找到结果</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={`${option.label}-${option.value}`}
                    value={`${option.label}-${option.value}`}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn('w-full text-[13px] py-1.5 px-2 cursor-pointer whitespace-nowrap', optionClassName)}
                  >
                    <span style={option.fontFamily ? { fontFamily: `"${option.fontFamily}"` } : undefined} className="truncate">
                      {option.label}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto size-3.5 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
