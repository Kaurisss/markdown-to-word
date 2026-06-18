import type React from 'react';
import type { DocumentConfig } from './config';

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
  onSelectionChange?: () => void;
  onEditorBlur?: () => void;
  searchQuery?: string;
  showSearch?: boolean;
  currentMatchIndex?: number;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
}

export interface PreviewProps {
  markdown: string;
  cfg: DocumentConfig;
  searchQuery?: string;
}

// 定义视图模式：仅编辑 | 分栏 | 仅预览
export type ViewMode = 'editor' | 'split' | 'preview';

export interface HeaderProps {
  isExporting: boolean;
  onExport: () => void;
  onImport: (content: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  cfg: DocumentConfig;
  onCfgChange: (next: DocumentConfig) => void;
  onSearchClick?: () => void;
  onReplaceClick?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}
