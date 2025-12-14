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
}

export interface PreviewProps {
  markdown: string;
}

// 定义视图模式：仅编辑 | 分栏 | 仅预览
export type ViewMode = 'editor' | 'split' | 'preview';

export interface HeaderProps {
  isExporting: boolean;
  onExport: () => void;
  onImport: (content: string) => void; // 新增导入回调
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}