# 技术设计：第三方 Markdown 编辑器

## 方案

使用 `@uiw/react-md-editor` 替换当前 `Editor.tsx` 的 `textarea + highlight overlay` 实现。左侧编辑器组件通过受控的 `preview` 属性在 `edit` 和 `preview` 两种模式之间切换，内容仍由父层的 `content` 字符串统一管理。

## 边界

- `src/components/editor/Editor.tsx`：改为第三方编辑器适配层，保留项目现有的 `EditorProps` 对外接口，新增左侧模式切换所需的受控属性或回调。
- `src/App.tsx`：持有左侧 Markdown 编辑/预览模式并传递给编辑器；删除选择浮动工具栏和链接对话框的装配。
- `src/components/editor/Editor.tsx`：在第三方编辑器工具栏末尾增加左侧编辑/Markdown 预览切换命令，使用图标、`aria-label`、`title` 和激活态表达当前模式。
- `src/components/editor/SelectionToolbar.tsx`、`src/features/editor/useSelectionToolbar.ts`、`src/components/editor/LinkDialog.tsx`：确认无其他调用后删除。
- `src/features/editor/useEditorState.ts`：继续持有应用级内容历史；适配第三方编辑器事件，不引入第二套 React 内容状态。
- `src/features/editor/useSearchReplace.ts`：继续对 Markdown 字符串执行搜索替换；编辑模式切换为预览时隐藏或停用依赖 textarea 选区的交互。
- `src/features/editor/useClipboard.ts`、`useGlobalShortcuts.ts`、`useScrollSync.ts`：改为适配第三方编辑器 DOM 或调整为仅支持现有右侧 DOCX 预览的职责，避免继续强制依赖 `HTMLTextAreaElement`。
- `src/components/preview/Preview.tsx`：保持现有 DOCX 导出级预览不变。
- `package.json` / `pnpm-lock.yaml`：增加第三方依赖，移除只服务旧选区定位的 `textarea-caret` 及其类型依赖。

## 数据流

```text
content (App/useEditorState)
  -> MDEditor.value
  <- MDEditor.onChange
  -> useSearchReplace / useAutoSave / export / DOCX Preview

leftEditorMode: edit | preview
  -> MDEditor.preview
```

顶部 `ViewModeDock` 继续决定左侧面板和右侧 DOCX 预览的显示比例；Markdown 编辑器工具栏按钮只改变第三方编辑器的 `edit` / `preview` 模式，不改变全局 `viewMode`。

## 兼容策略

- 通过 `@uiw/react-md-editor` 的受控 `preview` 属性切换模式；切换入口由项目状态栏提供，不在第三方工具栏中重复放置模式按钮。
- 使用项目现有主题状态向第三方编辑器传递 `data-color-mode` 或等价主题配置，并检查暗色模式下编辑区与预览区的可读性。
- 若第三方组件的内置快捷键与现有全局快捷键冲突，以编辑器原生行为为先，保留项目的搜索、替换和配置快捷键。
- 现有顶部撤销/重做先继续连接应用历史栈；若第三方编辑器的内部事务导致一次输入产生多个历史快照，在实现阶段增加适配或明确记录为风险。
- 搜索高亮 overlay 不再由项目维护。搜索/替换面板仍可工作，但编辑器内部的当前匹配高亮若第三方 API 不支持则不作为本次阻塞条件。

## 风险与回滚

- 第三方编辑器可能改变选区、快捷键或撤销粒度；以现有测试和手动验收覆盖核心路径。
- 包含自定义 `<u>` 下划线格式时，需要确认第三方 toolbar 的扩展能力；如果内置命令不支持，保留项目的纯字符串格式化 helper，并通过自定义 command 接入。
- 如果第三方组件无法稳定适配 Tauri WebView 或现有 Tailwind 样式，可回滚 `Editor.tsx` 适配层和依赖，保留原有编辑器文件。
