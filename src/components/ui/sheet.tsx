import * as React from 'react';
import { motion } from 'framer-motion';
import { CloseLine as XIcon } from '@mingcute/react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          className="fixed inset-0 z-[99990] bg-black/25 backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild aria-describedby={undefined} {...props}>
        <motion.div
          className={cn(
            'fixed inset-y-0 left-0 z-[99991] flex w-[360px] max-w-[88vw] flex-col border-r border-ui-border bg-ui-surface shadow-2xl outline-none',
            className,
          )}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-ui-text-muted transition-colors hover:bg-ui-control-hover hover:text-ui-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500">
            <XIcon className="size-4" />
            <span className="sr-only">关闭工作区</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const SheetTitle = DialogPrimitive.Title;

export { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger };