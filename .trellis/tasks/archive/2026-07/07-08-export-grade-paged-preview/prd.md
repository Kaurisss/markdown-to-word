# Export Grade Paged Preview

## Goal

把当前预览区从“一张无限长纸”的 Markdown 近似预览，升级为导出级分页预览：用户在编辑 Markdown 和文档样式时，能看到接近最终 Word 输出的分页效果。

## User Decision

用户已在可视化方案中选择 C：导出级预览。第一版复用现有 Markdown -> DOCX 导出链路生成临时 DOCX，再使用 `docx-renderer@0.2.0` 在前端渲染分页 HTML。用户已用 demo 验证现有文档效果“够用”，目标是显著强于当前一张长纸的 Markdown 预览，而不是和 Word 像素级一致。最新决策：导出级 DOCX 预览直接替代旧 Markdown DOM 预览；生成或渲染失败时显示导出级预览错误状态，不再回退旧预览。

## Requirements

- R1：预览区应能展示真实分页结果，不再只把所有内容放在一张无限高纸上。
- R2：分页预览必须复用现有 Markdown -> DOCX 导出链路，避免前端单独猜测 Word 排版。
- R3：生成预览不得弹出保存对话框，不得污染用户选择的导出路径；所有临时文件放在 Tauri AppCache。
- R4：编辑内容或样式配置变更后，预览应自动刷新，但需要防抖，避免每次按键都启动导出链路。
- R5：生成期间应保留上一版可用预览，并显示“正在生成/刷新”状态。
- R6：当 sidecar 失败、DOCX 读取失败或 `docx-renderer` 渲染失败时，应给出清晰状态；刷新失败时保留上一版可用 DOCX 预览（如有），不回退旧 Markdown DOM 预览。
- R7：普通 DOCX 导出行为必须保持不变。
- R8：Tauri 能力配置只扩展当前 sidecar 所需参数，不放宽到任意命令执行。

## Non-Goals

- 第一版不实现 Microsoft Word COM、LibreOffice 或 PDF fallback。
- 第一版不实现缩略图、页码导航或虚拟滚动；可以先展示 `docx-renderer` 输出的分页 HTML。
- 第一版不追求毫秒级实时预览；导出级预览允许在输入暂停后刷新。
- 第一版不修改 `DocumentConfig` 字段结构。

## Acceptance Criteria

- [ ] 在 Tauri dev 环境中，预览区能从当前 Markdown 和 `DocumentConfig` 自动生成临时 DOCX，并显示 `docx-renderer` 分页 HTML。
- [ ] 修改内容或样式后，预览会防抖刷新，刷新期间旧预览不闪空。
- [ ] 如果预览生成失败，界面显示原因；若已有上一版 DOCX 预览则继续显示，否则显示导出级预览不可用状态。
- [ ] 导出按钮仍按原逻辑保存 `.docx`，不额外暴露预览临时文件。
- [ ] 后端 CLI 在未传预览参数时行为与当前一致。
- [ ] 新增/更新前端测试覆盖预览 DOCX 生成、hook 状态、renderer 错误和 Preview 状态；后端普通导出路径保持现有测试覆盖。
- [ ] `pnpm run typecheck` 通过；相关前端测试和后端测试通过。若全量 `pnpm test` 仍受既有测试问题影响，最终说明需注明。

## Known Constraints

- 旧预览是 `react-markdown` DOM 预览，不走导出链路；本任务移除该旧路径，由 DOCX 渲染预览直接接管。
- `docx-renderer` 是 0.x 包，API 可能变化，必须精确锁版本并通过本项目样例验证。
- Tauri sidecar 目前允许 `--input --output --config-file` 参数，生成临时 DOCX 预览可以复用该参数形态。
