import * as React from 'react';
import { cn } from '../../lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      {...props}
      className={cn(
        'inline-flex min-w-6 items-center justify-center rounded-ui-control border border-ui-border bg-ui-surface-subtle px-1.5 py-0.5 font-ui-sans text-[11px] font-medium leading-none text-ui-text-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}