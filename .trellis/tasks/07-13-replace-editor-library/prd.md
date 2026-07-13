# 替换编辑器为第三方 Markdown 编辑器

## Goal

将当前自研的 `textarea` 编辑器替换为成熟的第三方 React Markdown 编辑器，降低选区定位、格式化工具栏和编辑器交互的维护成本，同时保留 Markdown 字符串作为应用核心内容格式。

## Requirements

- 使用 `@uiw/react-md-editor` 作为第三方编辑器。
- 将第三方编辑器直接接入当前左侧编辑器面板，保留现有 `content` / `updateContent` Markdown 字符串数据流。
- 在 Markdown 编辑器工具栏提供一个明确的切换按钮，使左侧在“Markdown 源码编辑”和“Markdown 渲染预览”之间切换。
- 保留顶部全局视图切换能力：编辑器、双栏和右侧 DOCX 预览视图仍可切换。
- 取消当前自研的选区浮动工具栏及其配套选区坐标计算；第三方编辑器自身工具栏负责选中文本格式化。
- 右侧现有 DOCX 导出级预览和 DOCX 导出链路继续保留，不与左侧 Markdown 预览混淆。
- 保留现有搜索、替换、撤销、重做、剪贴板、文件拖入、快捷键和主题行为；若第三方编辑器提供等价能力，应接入现有状态和回调，而不是形成第二套内容状态。
- 在设置窗口的“编辑器”页提供同步滚动开关，默认开启；关闭后双栏视图中的左侧编辑器与右侧 DOCX 预览不再互相驱动滚动，并持久化、跨窗口同步该偏好。
- 删除不再需要的 `textarea-caret` 依赖和仅服务于旧编辑器选区浮动菜单的代码。

## Acceptance Criteria

- [ ] Markdown 编辑器工具栏显示左侧模式切换按钮，用户可通过它切换 Markdown 源码编辑和 Markdown 预览。
- [ ] 用户仍可以通过顶部按钮在编辑器、双栏和右侧 DOCX 预览视图之间切换。
- [ ] 编辑器修改内容后，自动保存、搜索替换、DOCX 导出和现有 DOCX 预览仍使用最新 Markdown 内容。
- [ ] 第三方编辑器能够对选中文本执行至少加粗、斜体、删除线、行内代码和链接操作，并将结果写回 Markdown 字符串。
- [ ] 现有撤销、重做、剪切、复制、粘贴和配置的快捷键不出现明显回归。
- [ ] 用户可在设置中开启或关闭双栏同步滚动；旧配置默认开启，关闭后双向滚动均不联动。
- [ ] 旧 `SelectionToolbar`、`useSelectionToolbar`、`LinkDialog` 及 `textarea-caret` 依赖在确认不再使用后被移除，或有明确理由保留。
- [ ] `pnpm run typecheck`、`pnpm run lint` 和相关 Vitest 测试通过。

## Confirmed Facts

- 当前 `Editor.tsx` 是受控 `textarea` 加搜索高亮 overlay。
- `useSelectionToolbar.ts` 直接依赖 `HTMLTextAreaElement.selectionStart/selectionEnd`、滚动位置和 `textarea-caret`。
- 当前 `Preview.tsx` 是右侧 DOCX 导出级预览，不是普通 Markdown HTML 预览。
- 当前顶部 `ViewModeDock` 已支持 `editor`、`split`、`preview` 三种视图。
- 当前工作区在修改前是干净的；本任务尚未进入实现阶段。
