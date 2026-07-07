# Fill Project Trellis Specs

## Goal

把 `.trellis/spec/` 从初始化模板改成当前仓库真实可用的开发规范，让后续 Trellis / AI 开发会话能按本项目的实际边界、代码风格、数据流和测试方式工作，而不是依赖通用占位说明。

## Scope

Spec 目录：
- `.trellis/spec/`

需要覆盖的源码与工具层：
- 前端应用：`src/`、`test/`
- Python 转换后端：`backend/`、`backend/tests/`
- Tauri 桌面壳：`src-tauri/`
- CLI harness：`agent-harness/cli_anything/markdown_to_word/`
- 跨层配置与导出链路：`src/config/`、`src/features/export/`、`backend/config.py`、`backend/converter.py`

不在本任务范围内：
- 修改产品功能、测试行为或构建逻辑。
- 修复当前 Vitest 中已发现的单测文案不一致问题。
- 重写 `.trellis/spec/guides/` 的通用思考指南，除非发现内容明显与本项目冲突。
- 配置 GitNexus / ABCoder MCP；若本地没有这些工具，本任务使用直接源码分析和语言原生工具完成。

## Confirmed Facts

- 当前仓库是单仓库模式，`.trellis/spec/` 只会扫描根下的 spec layer 目录；现有 layer 只有 `frontend`，且多数文件仍是 “To be filled” 模板。
- 主应用入口在 `src/App.tsx`，普通窗口、设置窗口和 AI 配置窗口通过 URL 参数分流。
- `DocumentConfig` 是跨层核心契约：前端默认值在 `src/config/defaultConfig.ts`，类型在 `src/types/config.ts`，后端校验在 `backend/config.py`，导出调用在 `src/features/export/pythonBackend.ts`。
- 预览由 `src/components/preview/Preview.tsx` 使用 `react-markdown`、GFM 和受限 sanitize schema 渲染，目标是贴近 Word 输出而不是完整 HTML 浏览器渲染。
- DOCX 生成由 Python 后端负责，主入口是 `backend/backend.py`，核心转换循环是 `backend/converter.py`，具体 Word 样式、表格、目录、代码块和页面布局拆到 `backend/styling.py`、`backend/converters/`、`backend/document_layout.py`。
- Tauri Rust 层较薄，主要负责插件注册；sidecar 执行和权限在 `src-tauri/tauri.conf.json` 与 `src-tauri/capabilities/default.json`。
- CLI harness 位于 `agent-harness/`，通过 Click 命令、JSON project 文件和真实 `backend.converter.convert()` 复用后端能力。
- 当前健康检查结果：`pnpm run typecheck` 通过，`python -m pytest backend/tests` 通过，`python -m pytest agent-harness/cli_anything/markdown_to_word/tests` 通过，`pnpm test` 有 1 个前端测试失败，原因疑似测试仍查旧 placeholder 文案。

## Requirements

- R1：重写 `.trellis/spec/frontend/`，用真实前端结构说明组件、hook、状态、类型、样式、测试和 UI 约定。
- R2：新增后端 spec layer，记录 Python 转换后端的行扫描转换模型、配置校验、Word 样式写入、错误码和 pytest/hypothesis 测试方式。
- R3：新增桌面壳 spec layer，记录 Tauri 插件、sidecar、权限、窗口显示和构建脚本的边界。
- R4：新增 CLI harness spec layer，记录 Click 命令边界、Session/project JSON、真实后端复用、REPL 和测试约定。
- R5：新增跨层 spec layer，记录 `DocumentConfig`、预览与导出一致性、临时文件、错误映射、样式 token 和多窗口本地存储同步等跨层契约。
- R6：所有重要规则都要引用真实源码、测试或文档路径；删除模板空标题、泛泛建议和 “To be filled” 类占位内容。
- R7：更新每个 `index.md`，让 `python ./.trellis/scripts/get_context.py --mode packages` 能列出最终 spec layer，并让 future task 能快速选择相关规范。
- R8：不修改产品源码，不用本任务修复现有测试失败；只在规划或最终说明中记录已知失败。

## Acceptance Criteria

- [ ] `.trellis/spec/frontend/` 不再包含模板占位，且覆盖 `src/components/`、`src/features/`、`src/config/`、`src/types/`、`test/` 的实际模式。
- [ ] `.trellis/spec/backend/`、`.trellis/spec/desktop/`、`.trellis/spec/cli-harness/`、`.trellis/spec/cross-layer/` 存在并有对应 `index.md`。
- [ ] 每个 spec 文件至少包含真实文件路径引用，并说明适用场景、推荐模式、常见误区或验证方式。
- [ ] `rg "To be filled|TODO: fill|placeholder" .trellis/spec` 不再命中模板占位语境；若命中讨论 “placeholder” 作为真实 UI 文案，需人工确认不是模板残留。
- [ ] `python ./.trellis/scripts/get_context.py --mode packages` 能显示新的 spec layers。
- [ ] 最终说明记录本任务未改产品源码，并记录 `pnpm test` 当前已有的单测文案失败。

## Open Questions

无阻塞问题。用户已同意按“前端、后端、Tauri sidecar、CLI harness、跨层配置/导出链路”的范围创建并规划任务。
