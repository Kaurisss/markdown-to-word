# 实施计划：第三方 Markdown 编辑器

## 1. 依赖与组件适配

- [x] 安装 `@uiw/react-md-editor`，确认实际 API 与当前 React/TypeScript 版本兼容。
- [x] 改造 `Editor.tsx` 为第三方编辑器适配层，保持 `value` 和 `onChange` 受控数据流。
- [x] 增加左侧 `edit` / `preview` 模式状态，并在 Markdown 编辑器工具栏增加切换按钮，确保模式切换不丢失内容。
- [x] 配置编辑器工具栏，覆盖加粗、斜体、下划线、删除线、行内代码和链接；必要时接入现有 `inlineFormat` helper。

## 2. 清理旧编辑器耦合

- [x] 移除 `SelectionToolbar`、`useSelectionToolbar`、`LinkDialog` 的 App 装配和无调用文件。
- [x] 移除 `textarea-caret` 及其类型依赖。
- [x] 调整 `useGlobalShortcuts`、`useClipboard`、`useScrollSync`、搜索替换相关类型和 DOM 依赖。
- [x] 保留现有右侧 DOCX 导出级预览和顶部全局视图切换。

## 3. 测试与验证

- [x] 更新或新增状态栏模式切换、编辑器内容回写和工具栏行为测试。
- [x] 运行受影响的编辑器与格式化测试。
- [x] 运行 `pnpm run typecheck`。
- [x] 运行 `pnpm run lint`（目标文件通过；全量 lint 被既有 `test/components/ui/Select.test.tsx` JSX 规则错误阻塞）。
- [x] 运行 `pnpm test`，区分本任务回归与项目已有失败（29 个测试文件中 27 个通过；2 个既有测试失败）。
- [x] 用 `pnpm run build` 验证 Vite/Tauri 浏览器侧生产构建。
- [x] 检查明暗主题、编辑/预览切换、双栏布局和 DOCX 预览的视觉结果。

## 风险检查点

- 第三方 Markdown 预览样式是否覆盖项目布局或主题变量。
- 左侧预览模式下全局快捷键是否错误地操作不可编辑区域。
- 第三方内部撤销历史与项目顶部撤销/重做按钮是否出现状态不一致。
- 删除旧文件前确认无残留 import、测试引用或文档引用。

## Bug Fix: 首次启动滚动同步

- [x] 复现首次双栏启动时编辑器内部 ref 尚未就绪，导致监听未绑定。
- [x] 复现 DOCX 预览从占位节点替换为真实滚动节点后监听仍留在旧节点。
- [x] 在 `useScrollSync` 中自动检测节点就绪和节点身份替换，并重新绑定监听。
- [x] 新增两个回归测试覆盖延迟挂载和预览节点替换。
- [x] 修复 Markdown 预览模式下工具栏切换按钮被第三方编辑器误禁用的问题，并增加编辑/预览往返测试。

## 设置：同步滚动开关

- [ ] 在设置类型、默认值和 Zod 存储迁移中增加默认开启的同步滚动偏好。
- [ ] 在“编辑器 > 写作行为”中增加同步滚动 Switch。
- [ ] 让 `useScrollSync` 根据设置启停并在关闭时移除监听。
- [ ] 增加设置持久化、旧配置默认值和禁用同步的回归测试。
