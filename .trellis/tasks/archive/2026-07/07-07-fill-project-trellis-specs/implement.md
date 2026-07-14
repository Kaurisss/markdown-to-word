# Fill Project Trellis Specs Implementation Plan

## Success Standard

完成后，未来开发任务能根据 `.trellis/spec/` 快速找到本项目真实约定；spec 中没有模板占位、空泛规则或与代码相矛盾的描述。

## Ordered Checklist

- [x] 读取当前 `.trellis/spec/` 树，列出要保留、重写、删除、新增的文件。
- [x] 重新抽样前端核心文件与测试，提炼目录、组件、hook、状态、配置、预览、AI 和质量规则。
- [x] 抽样 Python 后端核心文件与测试，提炼转换流、配置校验、错误码、Word 样式和测试规则。
- [x] 抽样 Tauri 与构建脚本，提炼 shell/sidecar/权限/打包边界。
- [x] 抽样 CLI harness，提炼 Click 命令、Session/project JSON、真实后端复用和测试规则。
- [x] 写入或重写 spec layer 文件，先完成 `index.md`，再补主题文件。
- [x] 做跨层一致性 pass：检查 `DocumentConfig`、预览与导出、错误处理、本地存储和 token 生成的规范是否互相引用且不重复。
- [x] 清理模板残留、空标题、死链接和不再适用的旧 spec 文件。
- [x] 运行验证命令并记录结果。

## Validation Commands

```powershell
python ./.trellis/scripts/get_context.py --mode packages
rg "To be filled|TODO: fill|\\(To be filled|placeholder" .trellis/spec
rg "\\.\\.\\/|\\.\\/|\\]\\(" .trellis/spec
pnpm run typecheck
python -m pytest backend/tests
python -m pytest agent-harness\cli_anything\markdown_to_word\tests
pnpm test
```

`pnpm test` 当前已知有 1 个失败，疑似 `AdvancedPageSettingsDialog` 测试仍查旧 placeholder 文案。若本任务不修产品/测试源码，最终报告应说明该失败是既有状态。

## Validation Results

- `python ./.trellis/scripts/get_context.py --mode packages`：通过，显示 `backend, cli-harness, cross-layer, desktop, frontend`。
- `rg "To be filled|TODO: fill|\\(To be filled" .trellis/spec`：通过，无模板占位命中。
- Markdown 链接检查：通过，所有相对链接可解析。
- `pnpm run typecheck`：通过。
- `python -m pytest backend/tests`：通过，53 passed。
- `python -m pytest agent-harness\cli_anything\markdown_to_word\tests`：通过，16 passed。
- `pnpm test`：失败，既有前端测试问题；`AdvancedPageSettingsDialog.test.tsx` 查找旧 placeholder `留空则不显示文字`。
- `pnpm run lint`：失败，既有源码/测试问题；`Preview.tsx` 有 hooks 依赖警告，`test/components/ui/Select.test.tsx` 缺少 JSX 所需 React import。

## Review Gates

- 写 spec 前：确认目标 spec tree 与真实源码层一致。
- 写完每个 layer：检查该 layer 的 `index.md` 能指导未来任务选择文件。
- 最终验证前：检查所有重要规则都有源码、测试或 README 证据。
- 结束前：确认未修改 `src/`、`backend/`、`src-tauri/`、`agent-harness/` 的产品逻辑。

## Files Expected To Change

- `.trellis/spec/frontend/*`
- `.trellis/spec/backend/*`
- `.trellis/spec/desktop/*`
- `.trellis/spec/cli-harness/*`
- `.trellis/spec/cross-layer/*`
- `.trellis/tasks/07-07-fill-project-trellis-specs/prd.md`
- `.trellis/tasks/07-07-fill-project-trellis-specs/design.md`
- `.trellis/tasks/07-07-fill-project-trellis-specs/implement.md`

## Out Of Scope During Implementation

- 修复 Vitest 失败。
- 调整产品源码、构建脚本或测试。
- 改 `.trellis/spec/guides/`，除非发现其内容会误导本项目任务。
