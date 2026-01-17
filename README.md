# 简阅转档 | Markdown to Word

<div align="center">
  <img src="logo.png" width="128" height="128" alt="简阅转档 Logo" />
  
  **一款优雅的 Markdown 转 Word 桌面工具**
  
  [![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
  [![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python)](https://python.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🔄 **实时预览** | 左侧编辑 Markdown，右侧所见即所得预览 |
| 📝 **样式定制** | 灵活的字体、字号、颜色、行距等样式配置 |
| 📄 **精准导出** | 基于 python-docx，Word 样式精准映射 |
| 📊 **表格支持** | 完整支持 GFM 表格语法，含对齐与表头样式 |
| 🔗 **链接支持** | 超链接在 Word 中保持可点击 |
| 🎨 **代码高亮** | 代码块语法高亮与等宽字体保留 |
| ✏️ **行内格式** | 支持 `**粗体**`、`*斜体*`、`` `行内代码` `` |
| 🔒 **纯离线** | 数据本地处理，无需联网，隐私安全 |
| 💻 **跨平台** | 支持 Windows 桌面应用 |

## 🏗️ 技术架构

```
┌──────────────────────────────────────────────────────────┐
│                     Tauri 2.0 桌面应用                     │
├──────────────────────────────────────────────────────────┤
│  前端 (React 19 + TypeScript)                              │
│  ┌─────────────┬─────────────┬─────────────────────────┐ │
│  │   Editor    │   Preview   │      StyleEditor        │ │
│  │ (Markdown)  │  (实时预览)  │      (样式配置)          │ │
│  └─────────────┴─────────────┴─────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  后端接口层 (pythonBackend.ts)                             │
│  └── 通过 Tauri Shell 调用 Python 脚本                     │
├──────────────────────────────────────────────────────────┤
│  Python 后端 (backend/backend.py)                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  • Markdown 解析 (正则表达式)                         │ │
│  │  • Word 文档生成 (python-docx)                        │ │
│  │  • 样式配置解析 (JSON)                                │ │
│  │  • GFM 表格支持                                       │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 方式一：下载安装包

前往 [Releases](../../releases) 下载最新版 Windows 安装包（`.msi` 或 `.exe`）。

### 方式二：本地开发

**环境要求**：
- Node.js 18+
- Python 3.10+
- Rust 1.70+（仅构建桌面应用时需要）

```bash
# 克隆项目
git clone https://github.com/Kaurisss/markdown-to-word.git
cd markdown-to-word

# 安装前端依赖
npm install

# 安装 Python 依赖
pip install python-docx

# 启动开发服务器（Web 版）
npm run dev
```

访问 http://localhost:5173 即可使用 Web 版本。

### 方式三：构建桌面应用

```bash
# 开发模式（热重载）
npm run tauri:dev

# 构建安装包
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`

## 📁 项目结构

```
markdown-to-word/
├── App.tsx                 # 主应用组件
├── index.tsx               # 应用入口
├── index.css               # 全局样式
├── components/             # React 组件
│   ├── Editor.tsx          # Markdown 编辑器
│   ├── Header.tsx          # 顶部导航栏
│   ├── Preview.tsx         # Word 样式预览
│   └── StyleEditor.tsx     # 样式编辑面板
├── services/               # 核心服务
│   ├── docxGenerator.ts    # 前端 Word 生成（备用）
│   ├── pythonBackend.ts    # Python 后端调用接口
│   └── pythonBackend.test.ts
├── config/                 # 配置文件
├── interfaces/             # TypeScript 接口定义
├── backend/                # Python 后端
│   ├── backend.py          # 核心转换逻辑 (python-docx)
│   └── tests/              # Python 测试
├── src-tauri/              # Tauri 桌面端
│   ├── src/                # Rust 源码
│   ├── tauri.conf.json     # Tauri 配置
│   └── icons/              # 应用图标
├── test/                   # 前端测试
├── vite.config.ts          # Vite 构建配置
└── package.json            # 项目配置
```

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript 5.8 |
| **构建工具** | Vite 6 |
| **样式方案** | Tailwind CSS 4 |
| **Markdown 预览** | react-markdown + remark-gfm |
| **Word 生成** | **python-docx** (Python 后端) |
| **桌面封装** | Tauri 2 |
| **测试框架** | Vitest + pytest |

## 🔧 Python 后端说明

Python 后端 (`backend/backend.py`) 是本项目的核心，负责将 Markdown 转换为 Word 文档。

### 支持的 Markdown 语法

| 语法 | 示例 |
|------|------|
| 标题 | `# H1` ~ `###### H6` |
| 段落 | 普通文本 |
| 粗体 | `**粗体文本**` |
| 斜体 | `*斜体文本*` |
| 行内代码 | `` `code` `` |
| 代码块 | ` ```python ... ``` ` |
| 引用 | `> 引用文本` |
| 有序列表 | `1. 列表项` |
| 无序列表 | `- 列表项` |
| 链接 | `[文本](url)` |
| 表格 | GFM 表格语法 |
| 分隔线 | `---` 或 `***` |

### 命令行使用

```bash
# 基本用法
python backend/backend.py input.md output.docx

# 使用配置文件
python backend/backend.py input.md output.docx --config-file config.json

# 使用 JSON 配置字符串
python backend/backend.py input.md output.docx --config '{"global": {...}, "styles": {...}}'
```

### 退出码

| 代码 | 含义 |
|------|------|
| 0 | 成功 |
| 1 | 文件未找到 |
| 2 | 权限错误 |
| 3 | 配置错误 |
| 4 | Markdown 解析错误 |
| 5 | Word 生成错误 |

## 📜 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run tauri:dev` | 启动 Tauri 开发模式 |
| `npm run tauri:build` | 构建 Tauri 安装包 |
| `npm run test` | 运行前端测试 |
| `npm run build:python` | 打包 Python 后端 |
| `npm run clean` | 清理构建缓存 |
| `npm run rebuild` | 完整重新构建 |

## 🧪 测试

```bash
# 前端测试
npm run test

# Python 后端测试
cd backend
pytest tests/
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📝 更新日志

### v1.0.0
- 🎉 首次发布
- ✨ 基于 python-docx 的 Word 导出
- 🎨 可自定义样式配置
- 📊 完整的 GFM 表格支持
- 🔗 超链接支持
- ✏️ 行内格式（粗体、斜体、代码）

## 📄 License

[MIT License](LICENSE) © 2024-2025

---

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/Kaurisss">Kaurisss</a></sub>
</div>
