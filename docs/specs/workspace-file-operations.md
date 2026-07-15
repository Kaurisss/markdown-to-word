# Spec: 工作区文件操作闭环

## Why
工作区文件树目前只能浏览、打开、在根目录新建，缺少重命名、删除、复制路径、上下文新建等日常文件操作，用户被迫切到系统资源管理器才能整理文档。底层 fs 适配器（`renameEntry` / `moveToRecycleBin` / `revealInExplorer`）与 Rust 命令已就绪但无 UI 入口。本次补齐这条闭环。

## Scope
- **做**：右键菜单驱动的文件操作 —— 行内重命名、回收站删除、在资源管理器显示、复制相对路径、复制 Markdown 引用、上下文新建（文档/文件夹）；F2 / Delete 快捷键；活动文档被重命名时无缝重指向、被删除时回到无文档态；目录重命名/删除时按前缀迁移 per-doc 配置键。
- **不做**：拖拽移动、多选批量操作、撤销（undo）；重命名/删除图片后**不**自动改写正文引用；不新增剪贴板插件依赖；不改 Rust 侧。

## Acceptance（可测）
- [ ] `validateWorkspaceFileName` 拒绝空名、Windows 非法字符、结尾点/空格、保留名（CON/LPT1 等）、非白名单扩展名、同名冲突（大小写不敏感，排除自身）。
- [ ] `renameDocumentConfigsUnderPrefix` / `removeDocumentConfigsUnderPrefix` 按 `/` 前缀边界迁移/清理 per-doc 配置，无匹配时返回原引用。
- [ ] store `renameEntry` 重命名文件后：fs 旧键消失新键出现、metadata 键迁移落盘；若是活动文档则 `absolutePath`/`relativePath` 更新且 content/dirty 保留。
- [ ] store `renameEntry` 重命名目录后：子树缓存被驱逐、前缀下所有 per-doc 键迁移、子树内活动文档重指向。
- [ ] store `renameEntry` 校验失败时抛 `WorkspaceError` 且不调用 `fs.renameEntry`。
- [ ] store `deleteEntry` 删除活动文档后 `activeDocument === null` 且清除 last-document 记录；删除目录时清理前缀 metadata 与缓存。
- [ ] store `createEntry` 在目标目录内冲突自由命名、设置 `pendingRenamePath`、文档创建后成为活动文档。

## Layers
- 前端 `src/`：`features/workspace`（store、纯校验/元数据辅助）、`components/workspace`（Tree/Toolbar/删除 Dialog）、`lib/clipboard`。
- 后端 `backend/`：N/A。
- 外壳 `src-tauri/`：N/A（`move_to_recycle_bin` / `reveal_in_explorer` 已注册）。

## Tasks
- [ ] 新增 `features/workspace/fileNameValidation.ts`（`validateWorkspaceFileName` + `getBaseNameSelectionRange`）→ `test/features/workspace/fileNameValidation.test.ts`
- [ ] `workspaceMetadataStorage.ts` 加 `renameDocumentConfigsUnderPrefix` / `removeDocumentConfigsUnderPrefix` → `test/features/workspace/workspaceMetadataStorage.test.ts`
- [ ] `store.ts` 加 `createEntry` / `renameEntry` / `deleteEntry` / `pendingRenamePath` / `clearPendingRename`，含活动文档重指向、缓存驱逐、last-document 清理 → 扩展 `test/features/workspace/store.test.ts`（fake fs 支持目录）
- [ ] `useWorkspaceDocument.ts` 守卫：重指向不重置光标、删除后清空编辑器
- [ ] 新增 `lib/clipboard.ts`（`copyTextToClipboard`）、`components/workspace/WorkspaceDeleteDialog.tsx`（脏文档确认）
- [ ] `WorkspaceTree.tsx` 集成 `renamingFeature`、Delete 快捷键、右键菜单、行内输入框、pending-rename 效果
- [ ] `WorkspaceToolbar.tsx` 收敛到 `store.createEntry`
- [ ] `CONTEXT.md` 术语表（已建）

## Verify
```powershell
pnpm run typecheck && pnpm run lint && pnpm test
# Tauri 手测：重命名活动脏文档、重命名展开目录、删除活动文档、外部改名与应用内改名并发（watcher 幂等）
```
