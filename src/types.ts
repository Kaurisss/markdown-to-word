import type React from 'react';

// Simplified AST Node types based on unist/mdast
export interface MdNode {
  type: string;
  children?: MdNode[];
  value?: string;
  depth?: number; // For headings
  ordered?: boolean; // For lists
  lang?: string; // For code blocks
  url?: string; // For links
  [key: string]: any;
}

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  searchQuery?: string;
  showSearch?: boolean;
  currentMatchIndex?: number;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
}

export interface PreviewProps {
  markdown: string;
  cfg: import('./interfaces/Config').DocumentConfig;
  searchQuery?: string;
}

// 定义视图模式：仅编辑 | 分栏 | 仅预览
export type ViewMode = 'editor' | 'split' | 'preview';

export interface HeaderProps {
  isExporting: boolean;
  onExport: () => void;
  onImport: (content: string) => void; // 新增导入回调
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  cfg: import('./interfaces/Config').DocumentConfig;
  onCfgChange: (next: import('./interfaces/Config').DocumentConfig) => void;
  onSearchClick?: () => void; // 新增搜索回调
  onReplaceClick?: () => void; // 新增替换回调
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}
