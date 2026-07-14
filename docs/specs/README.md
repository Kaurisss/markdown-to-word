# AI Spec 开发工作流（轻量版）

面向本项目（React+TS 前端 / Python 后端 / Tauri 外壳）的规范驱动开发流程。
目标：**用最少的仪式换取最大的确定性**，不拖慢开发速度。

> 只对"非平凡"的改动走完整流程。改文案、调样式、修小 bug 直接做，跳过 Spec。

---

## 一张图看懂

```
① Spec (10 分钟)  →  ② Plan (5 分钟)  →  ③ Implement  →  ④ Verify  →  ⑤ Ship
   写一页规范           拆成任务清单        测试先行         跑全套检查     提交/PR
   (可选 grill-me)      (implement 技能)                   (caveman-review)
```

只有一份产物需要维护：`docs/specs/<feature>.md`。写完即用，合并后归档。

---

## ① Spec —— 一页纸规范

新功能先建 `docs/specs/<feature>.md`，用 `_template.md` 复制。规范只需回答四件事：

1. **Why** —— 要解决什么问题（1-3 句）。
2. **Scope** —— 做什么 / 明确不做什么。
3. **Acceptance** —— 可测的验收标准（每条能对应一个测试）。
4. **Layers** —— 涉及 `src/` / `backend/` / `src-tauri/` 哪些层。

> 复杂或有歧义的规范，用全局技能 `grill-me`（或 `/loop-me`）自我拷问一轮再定稿。
> 需要澄清领域术语时用 `domain-modeling`。**简单功能跳过这步拷问。**

## ② Plan —— 薄任务清单

在规范底部列 3-8 条任务，每条写明：改哪个文件、用哪个测试证明它成立。
可调用 `implement` 技能把规范转成任务。不写长篇设计文档。

## ③ Implement —— 测试先行

- 遵循仓库规范：TS/React 2 空格、`PascalCase` 组件、`useX` hooks；Python 4 空格、`snake_case`、纯函数优先。
- 前端测试放 `test/` 镜像 `src/` 结构，导入用 `@/` 别名；需要 DOM 的文件顶部加 `// @vitest-environment jsdom`。
- 后端测试放 `backend/tests/`。
- 能测的验收标准先写测试，再写实现。

## ④ Verify —— 一条命令跑完检查

见下方 PowerShell 脚本。若动了 `backend/`，必须 `pnpm run build:backend` 重建二进制。

## ⑤ Ship —— 提交与 PR

- Conventional Commits：`feat(ai-tab): ...` / `fix:` / `refactor:` / `docs:`。
- PR 写清 what/why、how to test；UI 改动附截图/GIF。
- 改了 `backend/` 需提交 `src-tauri/binaries/` 里更新后的二进制并在 PR 注明。
- 合并后把该 spec 移到 `docs/specs/archive/`。

---

## PowerShell 命令速查

```powershell
# 开发
pnpm run dev            # Vite 开发服务器
pnpm run dev:tauri      # 桌面应用

# 提交前一次性验证（前端）
pnpm run typecheck; pnpm run lint; pnpm test

# 后端验证（改了 backend/ 时）
python -m pytest backend/tests
pnpm run build:backend  # 重建 src-tauri/binaries/ 二进制

# 从 spec 新建功能分支
git switch -c feat/<feature>
```

一行串联的提交前门禁（任一步失败即停）：

```powershell
pnpm run typecheck && pnpm run lint && pnpm test
```

---

## 用到的全局技能（按需，不强制）

| 阶段 | 技能 | 何时用 |
| --- | --- | --- |
| Spec | `grill-me` / `loop-me` | 规范有歧义或风险高时拷问一轮 |
| Spec | `domain-modeling` | 需要统一术语 / 记录架构决策 |
| Implement | `implement` | 把规范拆成任务并落地 |
| Implement | `codebase-design` | 设计某个模块接口时 |
| Verify | `caveman-review` | review 本次 diff |
| Verify | `diagnosing-bugs` | 卡在难 bug / 性能回归时 |

> 原则：技能是工具箱，不是必经关卡。绝大多数改动只需 Spec→Verify→Ship。