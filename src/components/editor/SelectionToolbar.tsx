import React from 'react';
import {
  BoldFill,
  ItalicLine,
  UnderlineLine,
  StrikethroughLine,
  CodeLine,
  LinkLine,
} from '@mingcute/react';
import { useMemo } from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActiveInlineFormats, InlineFormatKind } from '../../utils/inlineFormat';
import { fadeSlideY, motionTransition } from '@/components/ui/motion';

interface SelectionToolbarProps {
  visible: boolean;
  x: number;
  y: number;
  activeFormats: ActiveInlineFormats;
  onFormat: (kind: InlineFormatKind) => void;
}

const actions: Array<{
  kind: InlineFormatKind;
  label: string;
  icon: React.ReactNode;
}> = [
  { kind: 'bold', label: '加粗', icon: <BoldFill className="size-4" /> },
  { kind: 'italic', label: '斜体', icon: <ItalicLine className="size-4" /> },
  { kind: 'underline', label: '下划线', icon: <UnderlineLine className="size-4" /> },
  { kind: 'strike', label: '删除线', icon: <StrikethroughLine className="size-4" /> },
  { kind: 'code', label: '行内代码', icon: <CodeLine className="size-4" /> },
  { kind: 'link', label: '链接', icon: <LinkLine className="size-4" /> },
];

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  visible,
  x,
  y,
  activeFormats,
  onFormat,
}) => {
  const virtualRef = useMemo(() => ({
    getBoundingClientRect: () => ({
      x,
      y,
      left: x,
      top: y,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
      toJSON: () => {},
    }),
  }), [x, y]);

  const { refs, floatingStyles } = useFloating({
    open: visible,
    placement: 'top',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 8 })],
  });

  React.useLayoutEffect(() => {
    refs.setReference(virtualRef);
  }, [refs, virtualRef]);

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-[80]"
          onMouseDown={(event) => event.preventDefault()}
        >
          <motion.div
            variants={fadeSlideY}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={motionTransition}
            className="flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-dark-border dark:bg-dark-surface"
          >
            {actions.map((action) => {
              const isActive = activeFormats[action.kind];
              const buttonClassName = isActive
                ? 'grid size-7 place-items-center rounded bg-brand-100 text-brand-700 transition-colors hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60'
                : 'grid size-7 place-items-center rounded text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-element dark:hover:text-gray-100';

              return (
                <button
                  key={action.kind}
                  type="button"
                  aria-label={action.label}
                  aria-pressed={isActive}
                  title={action.label}
                  className={buttonClassName}
                  onClick={() => onFormat(action.kind)}
                >
                  {action.icon}
                </button>
              );
            })}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
