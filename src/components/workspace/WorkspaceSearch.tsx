import React from 'react';
import { Search2Line } from '@mingcute/react';
import { Input } from '@/components/ui/input';

interface WorkspaceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function WorkspaceSearch({ value, onChange }: WorkspaceSearchProps) {
  return (
    <label className="relative block px-3 pb-2">
      <Search2Line className="pointer-events-none absolute left-5 top-2.5 size-4 text-ui-text-muted" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索已加载的文件"
        aria-label="搜索工作区"
        className="h-9 bg-ui-surface-subtle pl-8 text-xs"
      />
    </label>
  );
}