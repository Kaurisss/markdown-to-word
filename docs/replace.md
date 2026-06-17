已复查：`npm run typecheck` 通过，前端单测 `npm test` 也通过；刚才的 WindowControls 编译问题已经修掉了。

我看完整体目录后，最值得“用包替代自写代码”的优先级是：

1. `src/components/ui/Select.tsx`、`src/components/ui/ContextMenu.tsx`
   用 [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select) / [Context Menu](https://www.radix-ui.com/primitives/docs/components/context-menu)。这些交互的键盘导航、焦点管理、ARIA、定位边界都不该长期自写。

2. `src/hooks/useEditorState.ts`、`src/hooks/useSearchReplace.ts`、`src/components/Editor.tsx`
   考虑换成 [CodeMirror](https://codemirror.net/) / `@uiw/react-codemirror`。它能覆盖编辑器、撤销重做、搜索替换、选择区、Markdown 高亮；现在这些都是自己维护，后续容易漏边界。

3. `src/services/settingsStore.ts`、`src/services/aiConfigStore.ts`
   现在自写了 `useSyncExternalStore + localStorage + BroadcastChannel`。可以用 [Zustand](https://zustand.docs.pmnd.rs/) 的 store/persist 模式替掉大部分样板，保留少量跨窗口同步适配即可。

4. `backend/parser.py`、`backend/converter.py`、`backend/elements.py`
   Markdown 解析不要继续扩大正则实现。轻量路线用 `markdown-it-py`/`mistune` 做 AST，再保留 `python-docx` 输出；激进路线用 [Pandoc](https://pandoc.org/MANUAL.html) 或 `pypandoc_binary` 直接做 Markdown 到 DOCX。Pandoc 官方支持 Markdown 和 Word docx 转换，但会影响打包体积和样式可控性，需要单独评估。

5. `src/components/Preview.tsx`
   已经用了 `react-markdown`/`remark-gfm`，这块方向对。可继续用 `rehype-slug` 替代手写 heading id 生成，用 `rehype-sanitize`/链接策略库收敛安全逻辑。

不建议替换的是 Tauri 窗口控制、Tauri 文件拖入路径读取、以及 Word 样式映射的业务规则本身；这些和桌面壳/导出语义绑定较深，第三方包只能做底层，不该吞掉业务决策。