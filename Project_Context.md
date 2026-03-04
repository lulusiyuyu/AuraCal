# AuraCal 灵光画布 — Project Context

> 本文档记录项目的关键架构决策、技术背景和开发上下文，供新 agent 快速上手。
> 最后更新：2026-03-04

---

## 1. 项目定位

AuraCal 是一个 **呼吸式氛围展示屏** 应用：

- **不是传统 Todo / 日历**，而是"有灵魂的桌面艺术品"
- 通过 AI Persona 生成弹幕和词云，定时"呼吸"刷新
- 适用场景：个人专注桌面、咖啡店/商店展示屏、品牌宣传
- 设计灵感：Apple 极简 + 赛博朋克氛围

---

## 2. 架构概述

**纯前端 SPA** — 无后端、无数据库、无认证。

| 层 | 技术 | 备注 |
|---|---|---|
| 前端 | React 19 + Vite + TypeScript | 状态管理: Zustand |
| 动画 | Framer Motion + CSS translate3d | 弹幕 GPU 加速 |
| AI | 直接 fetch OpenAI-compatible API | DeepSeek / OpenAI / 自定义 |
| 部署 | GitHub Pages（静态 SPA） | 零运维、零成本 |

---

## 3. 数据流

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

## 4. 状态管理（Zustand ambientStore）

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

## 5. 内置 Persona 列表

| # | Name (EN) | Name (ZH) | 风格 | 弹幕颜色 | 速度 |
|---|---|---|---|---|---|
| 1 | Sarcasm King | 阴阳大师 | 阴阳怪气（默认角色） | #a78bfa (紫) | normal |
| 2 | Study Buddy | 自习监督员 | StudyWithMe 陪伴学习 | #3b82f6 (蓝) | normal |
| 3 | Promoter | 宣传员 | 广告文案 | #f59e0b (琥珀) | normal |
| 4 | SpongeBob | 海绵宝宝 | 搞笑乐观 | #fbbf24 (金黄) | fast |
| 5 | Strict Coach | 暴躁导师 | 严厉痛骂 | #ef4444 (红) | fast |
| 6 | Hot-blooded Trainer | 热血教练 | 激情励志 | #f97316 (橙) | normal |
| 7 | Zen Master | 禅意大师 | 禅意诗意 | #06b6d4 (青) | slow |

数据来源：`frontend/src/data/builtinPersonas.ts`

---

## 6. 关键架构决策

### API Key 存前端
- 用户的 Key 只在浏览器中保存，前端直接调 AI API
- 不经过任何中间服务器，隐私优先

### 纯前端化，砍掉后端
- **原因**：后端只是 AI API 的透传代理，前端完全可以自己做
- **好处**：零运维、零成本、秒部署（GitHub Pages）
- **代价**：不能做 Persona 广场等社区功能（需要后端数据库）

### CORS 注意事项
- 前端直调 AI API 可能有 CORS 限制
- DeepSeek、OpenAI 一般允许浏览器 CORS
- 如果某个 Provider 不支持，前端 Settings 里提示用户即可

---

## 7. 部署信息

| 项 | 值 |
|---|---|
| GitHub Repo | `lulusiyuyu/AuraCal` |
| 前端托管 | GitHub Pages — `https://lulusiyuyu.github.io/AuraCal/` |
| CI/CD | GitHub Actions — push to main 自动部署 |

---

## 8. 本地开发

```bash
cd frontend
npm install
npm run dev   # → http://localhost:5173
```

不需要启动后端。

---

## 9. 文件结构速查

```
AuraCal/
├── Project_Context.md              # 本文件（新 agent 必读 ①）
├── todolist.md                     # 开发任务清单（新 agent 必读 ②）
├── README.md / README_CN.md        # 用户文档
├── frontend/                       # 【唯一需要关注的目录】
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx                 # 根组件（auto-hide UI + reset 按钮）
│       ├── main.tsx                # Vite 入口
│       ├── i18n.ts                 # 中英文翻译（UI 文案）
│       ├── index.css               # 主题系统（dark/light）
│       ├── stores/
│       │   └── ambientStore.ts     # Zustand 状态管理（localStorage 持久化）
│       ├── hooks/
│       │   └── useBreathing.ts     # 呼吸定时器 + 本地 breathEngine 调用
│       ├── services/
│       │   ├── aiProvider.ts       # 前端直调 AI API（fetch）
│       │   ├── promptEngine.ts     # 时间感知 Prompt 组装
│       │   └── breathEngine.ts     # 整合 AI 调用 + JSON 解析
│       ├── data/
│       │   ├── builtinPersonas.ts  # 内置 Persona 数据（7 个，双语）
│       │   └── aiProviders.ts      # Provider 预设配置
│       └── components/
│           ├── DanmakuLayer.tsx     # GPU 弹幕层
│           ├── WordCloudLayer.tsx   # 词云层
│           ├── ClockWidget.tsx      # 居中时钟
│           ├── BreathingText.tsx    # 呼吸动画文字
│           ├── ContextEditor.tsx    # 自定义 Context
│           ├── PersonaManager.tsx   # Persona 选择 + 自定义 CRUD
│           ├── SettingsPanel.tsx    # AI 配置面板
│           ├── ThemeToggle.tsx      # 明暗切换
│           └── LanguageToggle.tsx   # 语言切换
├── docs/screenshots/               # 展示截图
├── .github/workflows/deploy.yml    # GitHub Pages CI/CD
└── LICENSE
```
