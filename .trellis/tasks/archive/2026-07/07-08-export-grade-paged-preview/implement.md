# Export Grade Paged Preview Implementation Plan

## Success Standard

在 Tauri dev 环境中，预览区能通过现有导出后端生成临时 DOCX，并用 `docx-renderer@0.2.0` 显示分页 HTML；失败时显示导出级预览错误状态（刷新失败保留上一版 DOCX 预览，如有），普通 DOCX 导出保持不变。

## Ordered Checklist

- [x] 读取相关规范：frontend preview、hooks/state、cross-layer export/preview、desktop permissions、storage/errors/generated assets。
- [x] 精确安装 `docx-renderer@0.2.0`。
- [x] 移除旧 Word/PDF 预览方案改动：不新增后端错误码、`--preview-pdf` 参数、PDF 模块或 sidecar 参数白名单。
- [x] 扩展 `src/features/export/pythonBackend.ts`：新增 `generateExportPreviewDocx`，复用 temp file 写入/sidecar/error 映射/清理逻辑，读取临时 DOCX bytes。
- [x] 新增/调整 `src/features/preview/useExportPreview.ts`：防抖生成 DOCX bytes、保留旧 bytes、错误回退。
- [x] 新增 `DocxRenderPreview`：动态导入 `docx-renderer`，渲染分页 HTML，cleanup 时 dispose。
- [x] 更新 `src/components/preview/Preview.tsx`：DOCX ready 时显示分页 HTML，loading/error/unavailable 时显示状态，不再渲染旧 Markdown DOM 预览。
- [x] 移除旧 Markdown DOM 预览相关代码：`react-markdown` 直连依赖、sanitize schema、slug 测试、preview CSS 映射和旧 AST 类型。
- [x] 前端测试：覆盖预览 DOCX 生成读取、hook 状态、renderer 错误/cleanup/link safety 和 Preview 状态。
- [ ] 手动验证 Tauri dev：内容变更后能生成分页预览；失败时能显示导出级预览错误状态或保留上一版 DOCX 预览。

## Validation Commands

```powershell
pnpm run typecheck
pnpm test test/features/export/pythonBackend.test.ts
pnpm test test/features/preview/useExportPreview.test.tsx
pnpm test test/components/preview/Preview.test.tsx
pnpm test test/components/preview/DocxRenderPreview.test.tsx
python -m pytest backend/tests
```

如触及依赖或 Tauri 集成，还需要运行：

```powershell
pnpm run dev:tauri
```

全量 `pnpm test` 目前可能仍受既有 `AdvancedPageSettingsDialog` placeholder 文案失败影响；本任务不把该既有问题作为阻塞修复项，除非改动触碰到相关文件。

全量 `pnpm run lint` 目前存在既有 `test/components/ui/Select.test.tsx` JSX scope 失败；本任务需确保改动相关文件 lint 通过。

## Files Expected To Change

- `package.json`
- `pnpm-lock.yaml`
- `src/features/export/pythonBackend.ts`
- `src/features/preview/useExportPreview.ts`
- `src/components/preview/Preview.tsx`
- `src/components/preview/DocxRenderPreview.tsx`
- `src/components/preview/previewStyle.ts`（删除）
- `src/components/preview/sanitizeSchema.ts`（删除）
- `src/types/editor.ts`
- `src/types/index.ts`
- `test/features/export/pythonBackend.test.ts`
- `test/features/preview/useExportPreview.test.tsx`
- `test/components/preview/Preview.test.tsx` 或新的 renderer 测试

## Review Gates

- 前端接入前先确认普通 `exportWithPython` 参数和错误映射不变。
- UI 完成后用一篇长 Markdown 手动确认出现分页 HTML。
- 最终提交前检查临时 DOCX 不会进入 git。
