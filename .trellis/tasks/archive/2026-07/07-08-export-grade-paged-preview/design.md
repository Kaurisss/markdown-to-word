# Export Grade Paged Preview Design

## Architecture

第一版采用“临时 DOCX -> 前端分页 HTML 渲染”的导出级预览链路。

数据流：

1. `Preview.tsx` 收到当前 Markdown 和 `DocumentConfig`。
2. 前端预览 hook 防抖后调用预览专用导出函数。
3. `pythonBackend.ts` 写入临时 Markdown 和 config JSON 到 `BaseDirectory.AppCache`，指定临时 DOCX 输出路径。
4. Tauri shell sidecar 执行现有 `binaries/md2word --input --output --config-file`。
5. Python 后端复用普通 `convert(input, docx, conf)` 生成 DOCX；不新增预览参数。
6. 前端读取临时 DOCX 字节，清理临时 Markdown/config/DOCX 文件。
7. `DocxRenderPreview` 使用 `docx-renderer@0.2.0` 的 `render(docxBytes, body, style, { breakPages: true })` 渲染分页 HTML。
8. 生成或渲染失败时，预览区显示导出级预览状态；刷新失败时保留上一版可用 DOCX 预览（如有），不回退旧 Markdown DOM 预览。

## Backend Contract

后端 CLI 不新增预览专用参数：

- 保留现有 `--input --output --config-file` 行为。
- 临时 DOCX 预览和普通导出走同一 sidecar 参数形态。
- 普通导出错误码和前端错误映射保持不变。

## Frontend Contract

预览专用导出函数：

- `generateExportPreviewDocx({ markdown, config })`
- 不打开保存对话框。
- 输出 `{ success, docxBytes?, error?, details? }`。
- 内部使用 AppCache 临时路径，并在 `finally` 清理临时输入、配置和 DOCX。

预览状态 hook：

- 输入：`markdown`, `cfg`, `enabled`
- 行为：内容为空时不生成；内容或配置变化后防抖刷新。
- 状态：`idle | loading | ready | error | unavailable`。
- 保留上一版成功的 `docxBytes`，loading 或刷新失败时不闪空。

DOCX renderer 组件：

- 动态导入 `docx-renderer`，避免非预览路径提前加载。
- 传入 `Uint8Array` DOCX 字节。
- 每次新文档先渲染到临时 DOM 和样式容器；只有渲染成功后才替换当前可见 DOCX DOM。
- effect cleanup 调用 `RenderResult.dispose()`，并移除当前或临时容器。
- 渲染异常通过回调返回给 `Preview.tsx`，由 `Preview.tsx` 显示导出级预览错误状态；若已有上一版成功 DOCX 预览，继续显示上一版。
- 捕获渲染后 DOM 中的外部链接点击，确认后通过 Tauri shell 打开。

## Tauri Permissions

预览复用现有 sidecar 参数形态：

- `--input <path> --output <docx-path> --config-file <path>`

文件读写仍限定在 AppCache 和现有导出路径范围内。预览 DOCX 使用 AppCache，前端通过 fs 插件读取后立即清理。

## UI Shape

- 预览区背景保持现有灰色画布。
- 成功时展示 `docx-renderer` 输出的分页 HTML。
- loading 时显示“正在生成导出级预览”，不遮挡上一版可用预览。
- generation/render error 时显示短状态；有上一版可用 DOCX 时继续显示上一版，否则显示不可用占位。
- 旧 Markdown DOM 预览、sanitize schema、slug 生成和 CSS 映射不再保留。

## Tradeoffs

选择 `docx-renderer` 的原因：

- 用户已验证 demo 对当前文档“够用”。
- 它复用真实 DOCX 产物，比前端 Markdown DOM 近似更接近最终导出。
- 它不依赖本机 Word、PowerShell COM 或 PDF 嵌入，跨环境更稳定。

代价：

- `docx-renderer` 是 0.x，API 可能变化，因此精确锁定 `0.2.0`。
- 渲染不是 Word 官方引擎，不能承诺像素级一致。
- 预览刷新仍需要跑导出链路，因此保留防抖和上一版预览。

## Rollback

若 `docx-renderer` 实际效果不稳定，可以在后续任务中重新设计预览策略；本任务不保留旧 Markdown DOM 预览作为运行时回退。普通 DOCX 导出不受影响。
