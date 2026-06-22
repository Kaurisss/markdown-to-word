import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm shadow-xl">

        <DialogHeader>
          <DialogTitle className="text-base font-semibold">自定义页边距</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label>上 (英寸)</Label>
            <Input type="number" min={0} step="0.1" value={m.top} onChange={e => setM({ ...m, top: Number(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>下 (英寸)</Label>
            <Input type="number" min={0} step="0.1" value={m.bottom} onChange={e => setM({ ...m, bottom: Number(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>左 (英寸)</Label>
            <Input type="number" min={0} step="0.1" value={m.left} onChange={e => setM({ ...m, left: Number(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>右 (英寸)</Label>
            <Input type="number" min={0} step="0.1" value={m.right} onChange={e => setM({ ...m, right: Number(e.target.value) })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>取消</Button>
          <Button size="sm" onClick={handleSave}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
