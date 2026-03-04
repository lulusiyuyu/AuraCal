# 📅 AuraCal 灵光画布 (v4.1)

**一个会呼吸的、人格驱动的极简氛围展示屏。**

AuraCal 是一件**有灵魂的桌面数字艺术品**。它通过呼吸引擎与 AI 人格角色，在你的空闲时间里推送带有情绪色彩的满屏弹幕与深不可测的悬浮词云。

> 🧽 *"我准备好了！今天的你，一定能搞定所有事！"* — 海绵宝宝人格

---

## ✨ 核心功能

- **🎭 AI 人格** — 5 个内置角色（海绵宝宝、暴躁导师、热血教练、禅意大师、阴阳大师），随时一键切换。
- **💨 呼吸引擎** — 全自动或手动触发“呼吸”。每次呼吸，AI 将基于当前时间上下文及角色设定，为你源源不断地生成长短不一的弹幕与词云。
- **☁️ 环境式词云与弹幕** — 基于 Framer Motion 设计的真·无尽水流物理动画，词云在背景平滑缓动，弹幕在前景循环漂浮。
- **📝 自备上下文** — 点击 Context，输入你今天的目标或心情（如：`"今天必须要看完数据结构第三章"`），AuraCal 将以此为基础“阴阳”或“鼓励”你。
- **🌗 极简无状态架构** — 致敬 Apple 的至简美学，去掉了所有繁杂的 Google/OAuth 认证和日历接入，仅需一个 API Key 即可全量运转！
- **🤖 多模型支持** — 完美支持 DeepSeek、Minimax 及其他任何兼容的 API 接口，配置直接保存在本地。

---

## 🚀 快速开始

### 环境要求

- Python 3.12+, Node.js 18+, [uv](https://docs.astral.sh/uv/)

### 1. 克隆项目

```bash
git clone https://github.com/lulusiyuyu/AuraCal.git && cd AuraCal
```

### 2. 后端部署

极简后端，仅处理 Prompt 织入和安全代理：

```bash
cd backend
uv sync                          # 安装依赖
cp .env.example .env             # 此步为可选，当前无需强依赖任何配置

uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
# → http://localhost:8000/docs
```

### 3. 前端部署

```bash
cd frontend
npm install                      # 安装依赖
npm run dev                      # 启动开发服务器
# → http://localhost:5174 或 5173
```

---

## ⚙️ 使用指南

1. **配置 AI Key**：进入前端页面，点击底部 `⚙️ Settings`，填入你的 Minimax / DeepSeek Key（存在浏览器本地）。
2. **选择人格**：点击 `🎭 Persona`，选一个最贴合你此刻心境的角色。
3. **补充语境（可选）**：通过 `📝 Context` 告诉它你当下正在烦恼什么。
4. **开始呼吸**：点击底栏中心的 **Breathe** 按钮，或点 **Auto** 开启自动呼吸循环，享受被 AI 言语包围的空间氛围。

---

## 🖥️ 生产环境部署方案（即将上线）

AuraCal 的前后端分离架构非常适合轻量级部署：
- **前端**：可通过 GitHub Pages 或 Vercel 进行纯静态免费托管。
- **后端**：使用 Nginx + Uvicorn 部署在基础配置的 VPS 上，只需暴露提供 API 服务的单个接口。

*部署详细教程将在下一阶段的开发中加入，敬请期待！*

---

## 📄 License

MIT — 详见 [LICENSE](LICENSE)
