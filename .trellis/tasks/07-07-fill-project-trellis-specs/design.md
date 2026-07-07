# Fill Project Trellis Specs Design

## Architecture Boundaries

本仓库是单仓库模式，但运行时有多个清晰 layer。Trellis 会扫描 `.trellis/spec/` 根目录下除 `guides` 外的子目录作为 spec layer，因此本任务按真实边界新增或重写以下 layer：

- `frontend`：React + TypeScript + Vite UI，覆盖应用入口、组件、hooks、Zustand store、preview、settings、AI 配置和 Vitest。
- `backend`：Python Markdown 到 DOCX 转换引擎，覆盖配置校验、行扫描转换、Word OOXML 样式、表格/目录/代码块 converter 和 pytest/hypothesis。
- `desktop`：Tauri 桌面壳，覆盖 Rust 插件注册、权限、sidecar、构建脚本和窗口显示约定。
- `cli-harness`：`agent-harness` 自动化命令层，覆盖 Click 命令、project JSON、Session、导出复用真实后端、REPL 和子进程测试。
- `cross-layer`：跨前后端和工具链共享的契约，覆盖 `DocumentConfig`、预览/导出一致性、错误映射、临时文件、token 生成、本地存储同步。

`guides` 目录保留为通用思考指南，不纳入本次重写主线。

## Target Spec Tree

计划最终形成：

- `.trellis/spec/frontend/index.md`
- `.trellis/spec/frontend/directory-structure.md`
- `.trellis/spec/frontend/components-and-ui.md`
- `.trellis/spec/frontend/hooks-and-state.md`
- `.trellis/spec/frontend/types-and-config.md`
- `.trellis/spec/frontend/testing-and-quality.md`
- `.trellis/spec/backend/index.md`
- `.trellis/spec/backend/conversion-flow.md`
- `.trellis/spec/backend/config-and-errors.md`
- `.trellis/spec/backend/docx-styling.md`
- `.trellis/spec/backend/testing.md`
- `.trellis/spec/desktop/index.md`
- `.trellis/spec/desktop/tauri-shell.md`
- `.trellis/spec/desktop/build-and-permissions.md`
- `.trellis/spec/cli-harness/index.md`
- `.trellis/spec/cli-harness/commands-and-session.md`
- `.trellis/spec/cli-harness/testing.md`
- `.trellis/spec/cross-layer/index.md`
- `.trellis/spec/cross-layer/document-config-contract.md`
- `.trellis/spec/cross-layer/export-and-preview-consistency.md`
- `.trellis/spec/cross-layer/storage-errors-and-generated-assets.md`

如果写作时发现某些文件重复度高，可以合并，但最终 `index.md` 必须与实际文件集一致。

## Evidence Sources

前端证据：
- `src/App.tsx`
- `src/components/header/Header.tsx`
- `src/components/preview/Preview.tsx`
- `src/features/editor/useEditorState.ts`
- `src/features/export/pythonBackend.ts`
- `src/features/ai/store.ts`
- `src/features/settings/store.ts`
- `test/**/*.test.ts(x)`

后端证据：
- `backend/backend.py`
- `backend/converter.py`
- `backend/config.py`
- `backend/errors.py`
- `backend/elements.py`
- `backend/document_layout.py`
- `backend/converters/*.py`
- `backend/tests/*.py`

桌面与构建证据：
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `scripts/build-python.js`
- `scripts/generate-css-tokens.js`
- `src/design/tokens.json`

CLI harness 证据：
- `agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py`
- `agent-harness/cli_anything/markdown_to_word/core/*.py`
- `agent-harness/cli_anything/markdown_to_word/utils/markdown_to_word_backend.py`
- `agent-harness/cli_anything/markdown_to_word/tests/*.py`

## Writing Rules

- 写当前事实，不写理想架构。
- 规则必须能指导未来改代码：说明何时适用、应该沿用哪个本地模式、相关文件在哪里、如何验证。
- 不复制大段源码；只引用路径、符号和行为。
- 不把当前已知 bug 写成规范；例如 Vitest 的 placeholder 文案失败只记录为健康状态，不用 spec 合理化。
- 当跨层字段或行为存在重复实现时，明确源头和同步检查点，而不是鼓励局部随意改。

## Compatibility

新增 spec layer 不需要修改 `.trellis/config.yaml`；单仓库模式下 `get_context.py --mode packages` 会扫描 `.trellis/spec/` 根目录下的子目录。

现有 `.trellis/spec/frontend/*.md` 可以被重写、合并或删除。删除时必须同步更新 `frontend/index.md`，避免死链接。

## Risks

- spec 写得过细可能把偶然实现当成规则。缓解：只把重复模式、核心契约或测试证明过的行为写成规范。
- spec 文件过多会让未来任务难选。缓解：按 layer 的 `index.md` 写清“何时阅读”。
- 前后端配置字段可能有局部不一致。缓解：跨层 spec 明确 `DocumentConfig` 改动必须同时检查 TypeScript 类型、默认值、预览映射、后端校验和导出测试。

## Rollback

本任务只改 `.trellis/spec/` 和本任务规划文件。如果结果不合适，可以回滚对应 spec 文件，不影响产品源码和构建产物。
