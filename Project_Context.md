# AuraCal 灵光画布 — Project Context

> 本文档记录项目的关键架构决策、技术背景和开发上下文，供新 agent 快速上手。
> 最后更新：2026-03-04

---

## 1. 项目定位

AuraCal 是一个 **呼吸式氛围展示屏** 应用，核心特色：

- **不是传统 Todo / 日历**，而是"有灵魂的桌面艺术品"
- 通过 AI Persona 生成弹幕和词云，定时"呼吸"刷新
- 适用场景：个人专注桌面、咖啡店/商店展示屏、品牌宣传
- 设计灵感：Apple 极简 + 赛博朋克氛围

---

## 2. 架构演进历史

### v1~v3（已废弃）
- 有 Auth（JWT）、Calendar、Redis、WebSocket
- 过度复杂，已全部删除

### v4（曾经的版本）— 前端 + 后端
- 前端 React + 后端 FastAPI + SQLite
- 后端只做 AI API 透传 + Persona CRUD
- API Key 存前端 localStorage

### v4.5（✅ 已完成）— Persona i18n
- 内置 Persona 数据迁移到 `builtin_personas.json`（双语）
- Persona 模型支持 `name_en`/`name_zh`/`description_en`/`description_zh`

### v5 代码已写但策略变更后放弃
- Google OAuth + JWT 后端代码已完成（`auth.py`）
- **但决定不部署**：纯前端不需要后端认证
- 代码保留在 `backend/` 目录作为参考

### 🆕 当前目标：纯前端化
- **砍掉后端**，所有逻辑搬到前端
- **部署到 GitHub Pages**，零运维
- 前端直接调 OpenAI-compatible API（DeepSeek、OpenAI 等）
- Persona 数据内置 + 自定义 Persona 存 localStorage

---

## 3. 当前技术栈

| 层 | 技术 | 备注 |
|---|---|---|
| 前端 | React 19 + Vite + TypeScript | 状态管理: Zustand |
| 动画 | Framer Motion + CSS translate3d | 弹幕 GPU 加速 |
| AI | 直接 fetch OpenAI-compatible API | DeepSeek / OpenAI / 自定义 |
| 部署 | GitHub Pages（静态 SPA） | 零运维、零成本 |

### 后端（将被删除/归档）
| 技术 | 说明 |
|---|---|
| FastAPI + SQLModel + SQLite | 之前的 AI 中转站，即将删除 |
| Google OAuth + JWT | v5 代码已写但不部署 |

---

## 4. 纯前端化需要迁移的模块

### 需要从后端搬到前端的代码

| 后端文件 | 功能 | 迁移到前端 |
|---|---|---|
| `backend/app/services/prompt_engine.py` | 时间感知 Prompt 组装 | → `frontend/src/services/promptEngine.ts` |
| `backend/app/services/ai_provider.py` | AI API 调用（OpenAI SDK） | → `frontend/src/services/aiProvider.ts`（用 fetch 替代 SDK） |
| `backend/app/routers/breath.py` | JSON 解析（strip markdown/think/find {}） | → `frontend/src/services/breathEngine.ts` |
| `backend/builtin_personas.json` | 内置 Persona 数据 | → `frontend/src/data/builtinPersonas.ts` |
| `backend/ai_providers.json` | AI Provider 预设配置 | → `frontend/src/data/aiProviders.ts` |

### 前端需要改动的文件

| 文件 | 改动 |
|---|---|
| `hooks/useBreathing.ts` | 不再 POST 后端，改调本地 breathEngine |
| `stores/ambientStore.ts` | 删除 Auth 状态；Persona 改为本地数据 + localStorage |
| `components/PersonaManager.tsx` | 不再 fetch API，用本地数据 |
| `components/SettingsPanel.tsx` | 删除 Google 登录 UI |
| `main.tsx` | 删除 GoogleOAuthProvider |
| `package.json` | 删除 `@react-oauth/google` 依赖 |

---

## 5. 前端数据流（纯前端版）

```
用户点击 💨 Breathe（或定时器触发）
  ↓
useBreathing → breathEngine.triggerBreath()
  ↓
promptEngine.buildBreathingPrompt(persona, context, locale)
  → 组装 OpenAI messages 格式（时间感知 + Persona system prompt）
  ↓
aiProvider.chatCompletion(messages, {apiKey, baseUrl, model})
  → 直接 fetch('https://api.deepseek.com/v1/chat/completions', ...)
  ↓
解析 AI 返回的 JSON（strip markdown/think tags/find first {}）
  ↓
{ danmaku: [...], word_cloud: [...] }
  ↓
setDanmakuPool() + setWordCloudWords() → 动画渲染
```

---

## 6. 前端状态管理（Zustand ambientStore）

所有状态集中在 `ambientStore.ts`，持久化策略如下：

| 状态 | 存储位置 | key |
|---|---|---|
| theme | localStorage | `auracal-theme` |
| clientUuid | localStorage | `auracal-uuid` |
| aiConfig (provider/apiKey/baseUrl/model) | localStorage | `auracal-ai-config` |
| activePersonaId | localStorage | `auracal-persona` |
| customContext | localStorage | `auracal-context` |
| customPersonas[] | localStorage | `auracal-custom-personas` |
| breathingInterval | localStorage | `auracal-interval` |
| locale (en/zh) | localStorage | `auracal-locale` |
| builtinPersonas[] | 代码内置 | 从 `builtinPersonas.ts` 导入 |
| danmakuPool, wordCloudWords, messages | 内存 | 每次呼吸刷新 |

> **注意**：`customContext` 有按语言区分的默认值。切换 locale 时，如果 context 是另一个语言的默认值（或空），会自动切换到新语言的默认值。

---

## 7. 内置 Persona 列表

| # | Name (EN) | Name (ZH) | 风格 | 弹幕颜色 | 速度 |
|---|---|---|---|---|---|
| 1 | Sarcasm King | 阴阳大师 | 阴阳怪气（默认角色） | #a78bfa (紫) | normal |
| 2 | Study Buddy | 自习监督员 | StudyWithMe 院伴学习 | #3b82f6 (蓝) | normal |
| 3 | Promoter | 宣传员 | 广告文案 | #f59e0b (琥珀) | normal |
| 4 | SpongeBob | 海绵宝宝 | 搞笑乐观 | #fbbf24 (金黄) | fast |
| 5 | Strict Coach | 暴躁导师 | 严厉痛骂 | #ef4444 (红) | fast |
| 6 | Hot-blooded Trainer | 热血教练 | 激情励志 | #f97316 (橙) | normal |
| 7 | Zen Master | 禅意大师 | 禅意诗意 | #06b6d4 (青) | slow |

数据来源：`frontend/src/data/builtinPersonas.ts`（已迁移完成）。

---

## 8. 关键架构决策记录

### 决策 1：API Key 存前端
- 用户的 Key 只在浏览器中保存，前端直接调 AI API
- 不经过任何中间服务器
- 隐私优先

### 决策 2：纯前端化，砍掉后端
- **原因**：后端只是 AI API 的透传代理，前端完全可以自己做
- **好处**：零运维、零成本、秒部署（GitHub Pages）
- **代价**：不能做 Persona 广场等社区功能（需要后端数据库）
- **结论**：对于简历项目，纯前端是最优选择

### 决策 3：MVP 优先
- 先上线核心功能，后续根据使用反馈再决定是否扩展
- Google OAuth / Persona 广场等功能暂不实现

### 决策 4：CORS 注意事项
- 前端直调 AI API 可能有 CORS 限制
- DeepSeek、OpenAI 一般允许浏览器 CORS
- 如果某个 Provider 不支持，前端 Settings 里提示用户即可

---

## 9. 部署信息

| 项 | 值 |
|---|---|
| GitHub Repo | `lulusiyuyu/AuraCal` |
| 前端托管 | GitHub Pages — `https://lulusiyuyu.github.io/AuraCal/` |
| 后端 | 无（纯前端） |
| VPS | 不再需要 |

---

## 10. 开发环境

```bash
# 前端（唯一需要的）
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

不需要启动后端。

---

## 11. 文件结构速查

```
AuraCal/
├── Project_Context.md          # 本文件（新 agent 必读 ①）
├── todolist.md                 # 开发任务清单（新 agent 必读 ②）
├── README.md / README_CN.md    # 用户文档（部署后更新）
├── frontend/                   # 【唯一需要关注的目录】
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx             # 根组件（auto-hide UI）
│       ├── main.tsx            # Vite 入口（需删除 GoogleOAuthProvider）
│       ├── i18n.ts             # 中英文翻译（UI 文案）
│       ├── index.css           # 主题系统（dark/light）
│       ├── stores/
│       │   └── ambientStore.ts # Zustand 状态管理（需删 Auth，加 localStorage Persona）
│       ├── hooks/
│       │   └── useBreathing.ts # 呼吸定时器（需改：不调后端，调本地 breathEngine）
│       ├── services/           # 【新建目录】
│       │   ├── aiProvider.ts   # 【新建】前端直调 AI API
│       │   ├── promptEngine.ts # 【新建】从后端 prompt_engine.py 翻译
│       │   └── breathEngine.ts # 【新建】整合 AI 调用 + JSON 解析
│       ├── data/               # 【新建目录】
│       │   ├── builtinPersonas.ts  # 【新建】内置 Persona 数据
│       │   └── aiProviders.ts     # 【新建】Provider 预设配置
│       └── components/
│           ├── DanmakuLayer.tsx    # GPU 弹幕层（不用改）
│           ├── WordCloudLayer.tsx  # 词云层（不用改）
│           ├── ClockWidget.tsx     # 居中时钟（不用改）
│           ├── BreathingText.tsx   # 呼吸动画文字（不用改）
│           ├── ThemeToggle.tsx     # 明暗切换（不用改）
│           ├── LanguageToggle.tsx  # 语言切换（不用改）
│           ├── ContextEditor.tsx   # 自定义 Context
│           ├── PersonaManager.tsx  # ✅ 已改为本地数据
│           └── SettingsPanel.tsx   # ✅ 已删 Google 登录 UI
├── backend/                    # 【待删除/归档 — 不再使用】
└── deploy/                     # 【待删除】
```

---

## 12. 新 Agent 快速上手指南

> **第一阶段（前端化改造）已完成**，下一步是第二阶段（部署到 GitHub Pages）。

下一个 agent 要快速了解项目上下文并开始部署，**按顺序阅读以下文件**：

| 序号 | 文件 | 目的 |
|---|---|---|
| 1 | `Project_Context.md` | 本文件 — 项目全貌 |
| 2 | `todolist.md` | 具体任务清单（从第二阶段开始执行） |
| 3 | `frontend/src/` | 唯一需要关注的目录 |

**一句话给下一个 agent**：
> "先读 `Project_Context.md` 和 `todolist.md`，第一阶段已完成（纯前端化）。从第二阶段开始执行：配置 Vite base path、GitHub Actions 自动部署到 GitHub Pages。"
