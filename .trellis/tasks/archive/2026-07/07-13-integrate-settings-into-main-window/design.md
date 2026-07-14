# 技术设计：主窗口内页面切换

## 方案概述

由 `App.tsx` 持有主窗口顶层页面状态：

```ts
type AppPage = 'editor' | 'ai-config' | 'settings';
```

编辑器、AI 配置和设置作为同一主窗口内的三个兄弟页面层持续挂载。当前页面可见并可交互，其他页面通过 `visibility`、层级和指针事件隐藏，而不是从 React 树中卸载。

这样可以保留编辑器 DOM、光标、滚动位置、Ribbon 本地状态，以及 AI 平台和设置分区的本地选择状态。

## 组件边界

### App 与导航

- `src/App.tsx`
  - 删除 URL 参数窗口分流。
  - 持有 `activePage`。
  - 将打开 AI 配置和设置的回调传给 `Header`。
  - 同时挂载三个页面层，并为非活动页面设置 `aria-hidden`、不可聚焦和不可交互状态。
  - 将全局 `Toaster` 放在页面层之外，避免多个隐藏 Toaster 实例。

- `src/components/header/Header.tsx`
  - 删除 `WebviewWindow` 创建与聚焦逻辑。
  - 接收 `onOpenAIConfig`、`onOpenSettings` 回调。
  - 现有 AI 配置入口和设置按钮只触发 App 页面切换。

### 内部页面顶部栏

新增共享的主窗口内部页面顶部栏，职责包括：

- 返回编辑器按钮；
- 页面标题；
- 可拖动区域和双击最大化；
- 复用 `WindowControls` 提供最小化、最大化、关闭；
- 可选右侧动作区，供 AI 配置页放置 API 指南按钮。

顶部栏属于主窗口，不调用辅助窗口关闭 API。

### AI 配置页与设置页

- 将 `AIConfigWindow`、`SettingsWindow` 改为页面语义的组件和文件。
- 根布局由 `h-screen w-screen` 改为 `h-full w-full`。
- 删除 `WindowTitleBar`、`useShowWindowAfterFirstRender` 及设置页独立窗口主题同步。
- 页面内容继续使用现有 Provider、模型、设置分区和表单组件，不改变数据结构。
- AI 页面接收 `isActive`。从活动变为隐藏时，立即关闭弹窗和 Popover、隐藏 API Key，并重置未提交表单；`selectedProviderId` 保持不变。
- 设置页保持挂载，因此 `activeSection` 自动保留。

## 活动状态与事件

编辑器页面隐藏时仍保持布局尺寸，避免 DOCX 预览在宽度为零的容器中重新渲染。非活动页面使用不可见、无指针事件、不可聚焦的层状态。

现有编辑器级全局行为改为显式 `enabled`：

- `useGlobalShortcuts`
- `useFileDrop`
- `useContextMenu`

只有 `activePage === 'editor'` 时注册或响应编辑器快捷键、文件拖放和编辑器上下文菜单。搜索面板等已打开的编辑器状态保留，但隐藏期间不响应快捷键。

## 主题与持久化

- `useTheme` 只服务主窗口，不再接收 `isConfigWindow` / `isSettingsWindow`。
- 设置 Store 的主题变化通过同一个 Zustand 实例立即驱动主窗口主题。
- AI 和设置 Store 保留现有持久化格式及旧键兼容写入。
- 删除 `BroadcastChannel` 和 `storage` 事件跨窗口适配器，以及只验证跨窗口重载的测试。
- 不迁移或清除用户已有 `localStorage` 数据。

## Tauri 清理

- `src-tauri/capabilities/default.json` 的窗口范围只保留 `main`。
- 删除 `core:webview:allow-create-webview-window`，前提是全仓确认没有其他 Webview 创建调用。
- `tauri.conf.json` 的主窗口配置、主窗口显示时机、文件拖放和窗口控制权限保持不变。
- 删除无引用的辅助窗口标题栏与首次渲染显示 Hook。

## 兼容与风险

- 页面保持挂载会继续占用编辑器和 DOCX 预览资源，但能满足完整工作位置恢复要求；配置页操作期间编辑器内容不会变化，因此额外运行成本可控。
- 隐藏层必须同时处理可见性、焦点和指针事件，防止键盘焦点落入不可见表单。
- AI 远程模型请求若已经发出，不在本任务中引入取消协议；离开页面时关闭其弹窗并忽略隐藏状态的展示，返回后不会自动重开。
- 若常驻隐藏导致第三方编辑器或 DOCX 预览布局异常，回滚点是改为保存必要 DOM 状态后条件渲染，但这不是首选方案。

## 验证重点

- 主窗口内打开与返回导航。
- 编辑器光标、滚动、Ribbon 标签和视图模式保持。
- AI 平台/设置分区保持，弹窗与未提交表单被清理。
- 设置主题即时影响整个主窗口。
- 无 `WebviewWindow`、辅助窗口 URL 路由和跨窗口适配器残留。

