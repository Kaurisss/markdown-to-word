import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
}

const DEFAULT_LINK_URL = 'https://';

export const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [url, setUrl] = useState(DEFAULT_LINK_URL);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setUrl(DEFAULT_LINK_URL);
      setError('');
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextUrl = url.trim();
    if (!nextUrl) {
      setError('请输入链接地址');
      return;
    }

    onConfirm(nextUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 gap-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>添加超链接</DialogTitle>
            <DialogDescription>
              为当前选中的内容设置跳转地址。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="selection-link-url">链接地址</Label>
            <Input
              id="selection-link-url"
              autoFocus
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'selection-link-url-error' : undefined}
            />
            {error && (
              <p id="selection-link-url-error" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" size="sm">确定</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
