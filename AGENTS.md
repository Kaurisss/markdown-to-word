技能与工具策略：任务启动前先检测根目录 AGENTS.md。若存在，必须检查技能列表，匹配任务时必须执行 openskills read <skill_name> 加载指令并严格遵循。涉及 UI 设计时，若检测到相关技能，强制调用以确保审美在线，严禁仅凭模型生成默认风格。
语言强制（绝对核心）：所有输出内容必须使用简体中文。特别强调：生成的 "Implementation Plan" 和 "Task List" 面板内容（包括标题如 Goal Description, Planning Phase 等）必须强制完全翻译为中文书写，严禁使用系统默认的英文模板。
核心环境：用户环境为 Windows，提供终端命令时优先使用 PowerShell 兼容命令。路径处理必须适配 Windows 反斜杠。