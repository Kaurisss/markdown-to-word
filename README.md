# 简阅转档 | Markdown to Word

<div align="center">
  <img src="logo.png" width="128" height="128" alt="简阅转档 Logo" />
  
  **一个纯前端的 Markdown 转 Word 工具**
  
  [![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://typescriptlang.org/)
</div>

## ✨ 功能特性

- 🔄 **实时预览**：左侧编辑，右侧所见即所得
- 🔒 **纯离线**：数据不上传服务器，隐私安全
- 📄 **样式还原**：精准的 Word 样式映射
- 📊 **表格支持**：完整的 GFM 表格渲染与导出
- 🔗 **链接支持**：超链接在 Word 中可点击
- 💻 **跨平台**：Windows 桌面应用

## 🚀 快速开始

### 在线使用

```bash
npm install
npm run dev
```

访问 http://localhost:3000

### 桌面应用

#### 直接下载
前往 [Releases](../../releases) 下载最新版安装包。

#### 从源码构建

**前置要求**：
- Node.js 18+
- Rust 1.70+

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri:dev

# 构建安装包
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/nsis/`

## 📁 项目结构

```
├── App.tsx              # 主应用组件
├── components/          # React 组件
│   ├── Editor.tsx       # Markdown 编辑器
│   ├── Header.tsx       # 顶部导航栏
│   └── Preview.tsx      # Word 样式预览
├── services/
│   └── docxGenerator.ts # Word 文档生成器
├── src-tauri/           # Tauri 后端
│   ├── tauri.conf.json  # Tauri 配置
│   └── icons/           # 应用图标
├── index.html           # HTML 入口
└── vite.config.ts       # Vite 配置
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS |
| Markdown 解析 | unified + remark-gfm |
| Word 生成 | docx.js |
| 桌面封装 | Tauri 2 |

## 📝 License

MIT License
