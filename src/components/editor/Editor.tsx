import React, { forwardRef, useMemo } from 'react';
import MDEditor, {
  MarkdownUtil,
  commands,
  type ICommand,
  type RefMDEditor,
} from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProps } from '../../types';

// Font Awesome Free v7.3.0, licensed under the Font Awesome Free License.
const UnderlineIcon = () => (
  <svg role="img" viewBox="0 0 640 640" className="size-3.5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M128 96C128 78.3 142.3 64 160 64L224 64C241.7 64 256 78.3 256 96C256 113.7 241.7 128 224 128L224 288C224 341 267 384 320 384C373 384 416 341 416 288L416 128C398.3 128 384 113.7 384 96C384 78.3 398.3 64 416 64L480 64C497.7 64 512 78.3 512 96C512 113.7 497.7 128 480 128L480 288C480 376.4 408.4 448 320 448C231.6 448 160 376.4 160 288L160 128C142.3 128 128 113.7 128 96zM128 544C128 526.3 142.3 512 160 512L480 512C497.7 512 512 526.3 512 544C512 561.7 497.7 576 480 576L160 576C142.3 576 128 561.7 128 544z"
    />
  </svg>
);

const MarkdownModeIcon = () => (
  <svg role="img" viewBox="0 0 640 640" className="size-3.5" aria-hidden="true">
    <path
      fill="currentColor"
      d="M593.8 123.1L46.2 123.1C20.7 123.1 0 143.8 0 169.2L0 470.7C0 496.2 20.7 516.9 46.2 516.9L593.9 516.9C619.4 516.9 640.1 496.2 640 470.8L640 169.2C640 143.8 619.3 123.1 593.8 123.1zM338.5 424.6L277 424.6L277 304.6L215.5 381.5L154 304.6L154 424.6L92.3 424.6L92.3 215.4L153.8 215.4L215.3 292.3L276.8 215.4L338.3 215.4L338.3 424.6L338.5 424.6zM473.8 427.7L381.5 320L443 320L443 215.4L504.5 215.4L504.5 320L566 320L473.8 427.7z"
    />
  </svg>
);

const underlineCommand: ICommand = {
  name: 'underline',
  keyCommand: 'underline',
  shortcuts: 'ctrlcmd+u',
  buttonProps: {
    'aria-label': '添加下划线',
    title: '添加下划线 (Ctrl+U)',
  },
  icon: <UnderlineIcon />,
  execute: (state, api) => {
    const selectedRange = MarkdownUtil.selectWord({
      text: state.text,
      selection: state.selection,
      prefix: '<u>',
      suffix: '</u>',
    });
    const nextState = api.setSelectionRange(selectedRange);

    MarkdownUtil.executeCommand({
      api,
      selectedText: nextState.selectedText,
      selection: state.selection,
      prefix: '<u>',
      suffix: '</u>',
    });
  },
};

const editorCommands: ICommand[] = [
  { ...commands.bold, buttonProps: { 'aria-label': '加粗', title: '加粗 (Ctrl+B)' } },
  { ...commands.italic, buttonProps: { 'aria-label': '斜体', title: '斜体 (Ctrl+I)' } },
  underlineCommand,
  { ...commands.strikethrough, buttonProps: { 'aria-label': '删除线', title: '删除线 (Ctrl+Shift+X)' } },
  { ...commands.code, buttonProps: { 'aria-label': '代码', title: '代码 (Ctrl+J)' } },
  { ...commands.link, buttonProps: { 'aria-label': '链接', title: '链接 (Ctrl+L)' } },
  commands.divider,
  { ...commands.quote, buttonProps: { 'aria-label': '引用', title: '引用 (Ctrl+Q)' } },
  { ...commands.unorderedListCommand, buttonProps: { 'aria-label': '无序列表', title: '无序列表 (Ctrl+Shift+U)' } },
  { ...commands.orderedListCommand, buttonProps: { 'aria-label': '有序列表', title: '有序列表 (Ctrl+Shift+O)' } },
  { ...commands.table, buttonProps: { 'aria-label': '表格', title: '表格' } },
];

const Editor = React.memo(forwardRef<RefMDEditor, EditorProps>(
  ({
    value,
    onChange,
    onKeyDown,
    mode,
    onModeChange,
    theme,
    fontSize = 15,
    lineHeight = 32,
    wordWrap = true,
  }, ref) => {
    const textareaStyle = useMemo<React.CSSProperties>(() => ({
      fontSize,
      lineHeight: `${lineHeight}px`,
      overflowWrap: wordWrap ? 'break-word' : 'normal',
      wordBreak: wordWrap ? 'break-word' : 'normal',
      whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
      fontFamily: 'var(--font-ui-editor)',
      color: 'var(--color-ui-editor-text)',
      backgroundColor: 'transparent',
    }), [fontSize, lineHeight, wordWrap]);

    const toolbarCommands = useMemo<ICommand[]>(() => {
      const nextMode = mode === 'edit' ? 'preview' : 'edit';
      const label = nextMode === 'preview'
        ? '切换 Markdown 预览'
        : '切换 Markdown 编辑';

      return [
        ...editorCommands,
        commands.divider,
        {
          name: 'toggle-markdown-mode',
          keyCommand: 'preview',
          buttonProps: {
            'aria-label': label,
            'aria-pressed': mode === 'preview',
            title: label,
          },
          icon: <MarkdownModeIcon />,
          execute: () => onModeChange(nextMode),
        },
      ];
    }, [mode, onModeChange]);

    return (
      <div
        className="h-full w-full overflow-hidden bg-ui-editor"
        data-color-mode={theme}
      >
        <MDEditor
          ref={ref}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          preview={mode}
          height="100%"
          visibleDragbar={false}
          enableScroll
          highlightEnable
          commands={toolbarCommands}
          extraCommands={[]}
          textareaProps={{
            'aria-label': 'Markdown 编辑器',
            placeholder: '# 开始您的写作..',
            onKeyDown,
            style: textareaStyle,
          }}
          className="h-full !rounded-none !shadow-none"
          previewOptions={{
            className: 'bg-ui-editor px-ui-editor-padding py-6 text-ui-editor-text',
          }}
        />
      </div>
    );
  },
));

Editor.displayName = 'Editor';

export default Editor;
