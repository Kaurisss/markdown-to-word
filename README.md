# Markdown to Word / 简阅转档

<div align="center">
  <img src="src/logo.png" width="96" height="96" alt="Markdown to Word / 简阅转档 Logo" />
  <p>一个本地优先的 Markdown 转 Word 桌面应用，支持实时预览、样式配置和 AI 样式生成。</p>
  <p>
    <a href="https://tauri.app/"><img alt="Tauri" src="https://img.shields.io/badge/Tauri-2-24c8db?logo=tauri&logoColor=white" /></a>
    <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" /></a>
    <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" /></a>
    <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" /></a>
    <a href="https://python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.10+-3776ab?logo=python&logoColor=white" /></a>
  </p>
</div>

## 功能概览
- 左侧 Markdown 编辑，右侧实时 Word 排版预览。
- 支持标题、正文、代码、引用等样式配置（字体、字号、颜色、行距、段落等）。
- 支持导入 `.md/.txt/.markdown`，导出 `.docx`。
- 支持 AI 样式生成与模型配置（API Key、本地持久化配置）。
- 转换在本地执行（Python 后端 sidecar），不依赖云端文档处理。

## 环境要求
- Node.js 18+
- Rust 1.77.2+（Tauri 构建）
- Python 3.10+（后端转换和打包）
- Windows 打包安装程序时额外需要 Inno Setup（`iscc` 在 PATH 中）
- 构建 Python sidecar 时额外需要 PyInstaller（`pyinstaller` 在 PATH 中）

## 快速开始
```bash
npm install
npm run tauri:dev
```

说明：
- `npm run tauri:dev` 会自动启动 Vite 开发服务器（端口 `3000`）并运行桌面窗口。
- 如仅调试前端页面，可使用 `npm run dev`。

## 常用命令
```bash
# 前端开发
npm run dev

# 桌面端开发（推荐）
npm run tauri:dev

# 前端构建
npm run build

# 桌面构建
npm run tauri:build

# 构建 Python 后端 sidecar 到 src-tauri/binaries/
npm run build:python

# 生成 Windows 安装包（Inno Setup）
npm run build:installer

# 质量检查
npm run lint
npm run typecheck
npm test
```

## Windows 发布流程
```bash
# 1) 先构建 Python sidecar
npm run build:python

# 2) 再构建桌面程序
npm run tauri:build

# 3) 最后产出 Inno 安装包
npm run build:installer
```

安装包输出目录：
- `src-tauri/target/release/bundle/inno/`

## Python 后端测试
```bash
python -m pytest backend/tests
```

## 项目结构
- `src/`：React + TypeScript 前端（组件、hooks、服务、类型）。
- `backend/`：Python 转换引擎与属性测试（pytest + hypothesis）。
- `src-tauri/`：Tauri 桌面壳、能力配置、Rust 入口、sidecar 二进制。
- `scripts/`：打包脚本（Python sidecar 构建、Inno Setup 配置）。
- `test/`：手工测试样例与文档素材。

## 许可
MIT
