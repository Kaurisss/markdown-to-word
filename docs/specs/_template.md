# Spec: <功能名>

> 复制此文件为 `docs/specs/<feature>.md`。保持一页以内。

## Why
<要解决什么问题，1-3 句。>

## Scope
- **做**：<范围内>
- **不做**：<明确排除，防止蔓延>

## Acceptance（可测）
- [ ] <验收标准 1 —— 对应一个测试>
- [ ] <验收标准 2>
- [ ] <验收标准 3>

## Layers
- 前端 `src/`：<涉及的 feature/组件，或 N/A>
- 后端 `backend/`：<涉及的模块，或 N/A>
- 外壳 `src-tauri/`：<是否涉及，或 N/A>

## Tasks
- [ ] <任务 —— 改哪个文件 → 用哪个测试证明>
- [ ] ...

## Verify
```powershell
pnpm run typecheck && pnpm run lint && pnpm test
# 若改了 backend/：
python -m pytest backend/tests
```