import type React from 'react';
import type { DocumentConfig } from './config';

export type EditorMode = 'edit' | 'preview';

export interface EditorHandle {
  textarea?: HTMLTextAreaElement;
  textareaWarp?: HTMLDivElement;
  container?: HTMLDivElement | null;
}

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  theme: 'light' | 'dark';
  fontSize?: number;
  lineHeight?: number;
  wordWrap?: boolean;
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
  onOpenAIConfig: () => void;
  onOpenSettings: () => void;
}
