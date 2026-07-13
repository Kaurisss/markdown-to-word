# 实施计划：主窗口内页面切换

## 1. 建立主窗口页面框架

- [x] 在 `App.tsx` 增加顶层页面状态，并移除 URL 参数窗口分流。
- [x] 新增共享内部页面顶部栏，复用 `WindowControls`，提供返回、标题、拖动和可选动作区。
- [x] 将编辑器、AI 配置、设置作为持续挂载的页面层，正确设置可见性、层级、焦点与指针事件。
- [x] 将单一 `Toaster` 和页面相关浮层放到正确层级。

## 2. 改造入口与页面组件

- [x] 修改 `Header` / `HeaderProps`，用页面切换回调替代两个 `WebviewWindow` 创建函数。
- [x] 将 `AIConfigWindow` 改为主窗口 AI 配置页，接入共享顶部栏和返回回调。
- [x] 将 `SettingsWindow` 改为主窗口设置页，删除独立窗口标题栏、显示 Hook 和重复主题副作用。
- [x] 保留 AI 平台与设置分区选择状态；为 AI 配置 Hook 增加离开页面时的即时临时状态清理。

## 3. 收敛主窗口行为

- [x] 将 `useTheme` 简化为单主窗口主题与首次显示逻辑。
- [x] 将编辑器快捷键、上下文菜单和文件拖放改为由编辑器页面活动状态启停。
- [x] 验证隐藏期间不会出现不可见焦点、拖放遮罩或快捷键误触发。

## 4. 删除多窗口基础设施

- [x] 删除 AI / 设置 Store 的 `BroadcastChannel` 和 `storage` 事件适配器，保留持久化与旧键兼容。
- [x] 删除无引用的 `WindowTitleBar`、`useShowWindowAfterFirstRender`。
- [x] 从 Tauri capability 删除辅助窗口标签和 Webview 创建权限。
- [x] 全仓搜索并确认无 `WebviewWindow`、`?window=config`、`?window=settings` 和旧窗口判断残留。

## 5. 测试与验证

- [x] 更新 AI 配置组件测试的组件名和页面行为。
- [x] 更新 AI / 设置 Store 测试，移除跨窗口同步断言，保留加载、迁移和持久化覆盖。
- [x] 新增主窗口导航回归测试：入口切换、返回、页面持续挂载、非活动页面不可交互。
- [x] 新增 AI 临时状态清理测试，并验证平台/设置分区选择保持。
- [x] 运行受影响的 Vitest 测试：5 个文件、25 个测试全部通过。
- [x] 运行 `pnpm run typecheck`：通过。
- [x] 运行任务范围 ESLint：通过；全量 `pnpm run lint` 仍被既有 `test/components/ui/Select.test.tsx` JSX React 导入错误阻塞。
- [x] 运行 `pnpm test`：170/172 通过；两个既有失败为远程模型加载文案和高级设置占位文案断言。
- [x] 运行 `pnpm run build`：通过。
- [x] 运行 `pnpm exec tauri build --no-bundle`：通过。
- [x] 启动开发服务器，用 1280×720 与 800×500 检查导航、布局、焦点和状态恢复；无根级溢出、控制台错误或页面异常。

## 风险与回滚点

- 页面层改造后先验证编辑器和 DOCX 预览在隐藏期间仍保持正确尺寸，再继续删除旧窗口代码。
- Store 跨窗口适配器仅在确认所有辅助窗口入口均已删除后清理。
- Tauri capability 最后修改，若桌面运行出现权限回归，可单独恢复 capability 变更而不回滚 React 页面架构。
