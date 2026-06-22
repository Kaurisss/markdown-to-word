import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { PageMargin } from '../../../../types/config';


interface CustomMarginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMargins: PageMargin;
  onSave: (margins: PageMargin) => void;
}

export const CustomMarginDialog = ({
  open,
  onOpenChange,
  initialMargins,
  onSave
}: CustomMarginDialogProps) => {
  const [m, setM] = useState(initialMargins);

  useEffect(() => {
    if (open) setM(initialMargins);
  }, [open, initialMargins]);

  const handleSave = () => {
    onSave(m);
    onOpenChange(false);
  };

  const inputClass = "h-8 w-full px-2 text-[13px] border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-element text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-dark-element-hover focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0 outline-none transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white dark:bg-dark-element border-ui-border-subtle shadow-xl">

        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">自定义页边距</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">上 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.top} onChange={e => setM({ ...m, top: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">下 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.bottom} onChange={e => setM({ ...m, bottom: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">左 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.left} onChange={e => setM({ ...m, left: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">右 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.right} onChange={e => setM({ ...m, right: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-ui-border-subtle hover:bg-gray-50 dark:hover:bg-dark-element-hover">取消</Button>
          <Button size="sm" onClick={handleSave} className="bg-brand-500 hover:bg-brand-600 text-white">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
