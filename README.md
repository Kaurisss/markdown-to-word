# Markdown to Word / 简阅转档

<div align="center">
  <img src="src/logo.png" width="96" height="96" alt="Markdown to Word / 简阅转档 Logo" />
  <p>一款面向 Windows 的本地 Markdown 转 Word 桌面应用，支持实时预览与样式配置，数据本地处理。</p>
  <p>
    <a href="https://tauri.app/"><img alt="Tauri" src="https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri" /></a>
    <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-19-61dafb?logo=react" /></a>
    <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" /></a>
    <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" /></a>
    <a href="https://tailwindcss.com/"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white" /></a>
    <a href="https://python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.10+-3776ab?logo=python&logoColor=white" /></a>
  </p>
</div>

## 主要功能
- 左侧编辑 Markdown，右侧实时预览 Word 排版效果
- 字体、字号、行距、缩进、页边距等样式可配置
- 支持 GFM 表格、代码块、行内代码、加粗/斜体、链接
- 本地生成 `.docx`，不依赖云端

## 安装与使用（Windows）
1. 进入 [Releases](../../releases) 页面下载最新安装包并安装。
2. 打开应用后在左侧编辑 Markdown，右侧查看预览。
3. 点击顶部「文件 → 导出」生成 Word（`.docx`）。

## 本地开发
环境要求：Node.js 18+、Python 3.10+、Rust 1.70+（仅桌面构建需要）

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev
```

## 打包
```bash
# 构建桌面应用（生成 app）
npm run tauri:build

# 生成 Inno Setup 安装包
npm run inno:build
```

构建产物位于：`src-tauri/target/release/bundle/`

## 项目结构
- `App.tsx`, `index.tsx`, `index.css`：应用入口与全局样式
- `components/`：UI 组件（Editor/Preview/Header 等）
- `services/`：应用逻辑与后端桥接（`pythonBackend.ts`）
- `backend/`：Python 转换引擎与测试
- `src-tauri/`：Tauri 桌面端配置与构建

## License
MIT
