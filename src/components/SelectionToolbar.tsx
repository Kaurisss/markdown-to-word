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
import { InlineFormatKind } from '../utils/inlineFormat';

interface SelectionToolbarProps {
  visible: boolean;
  x: number;
  y: number;
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

  if (!visible) return null;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-[80] flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-dark-border dark:bg-dark-surface"
      onMouseDown={(event) => event.preventDefault()}
    >
      {actions.map((action) => (
        <button
          key={action.kind}
          type="button"
          aria-label={action.label}
          title={action.label}
          className="grid size-7 place-items-center rounded text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-dark-element dark:hover:text-gray-100"
          onClick={() => onFormat(action.kind)}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};
