# AuraCal 纯前端化 & 部署 TodoList

> **核心策略**：砍掉后端，做成纯前端 SPA，部署到 GitHub Pages，速战速决。
> 最后更新：2026-03-04

---

## ✅ 已完成（之前的工作）

- [x] v4 无状态架构（React 19 + FastAPI + SQLite）
- [x] GPU 加速弹幕层 + 词云层 + Framer Motion 动画
- [x] 6 个内置 Persona + 自定义 Persona + i18n 双语切换
- [x] 中英文国际化 (i18n) — UI 文案 + Persona 名称/描述双语
- [x] 工具栏自动隐藏 + 时钟呼吸动画
- [x] 弹幕淡色透明 + 时钟最高图层
- [x] 内置 Persona 数据外置到 `builtin_personas.json`
- [x] Google OAuth 后端代码（auth.py, User 模型, JWT 中间件）— 代码已写，但策略变更后将被删除
- [x] 第一阶段前端化改造完成（纯前端 SPA，无需后端）
- [x] 新增 Study Buddy（自习监督员）角色，Persona 重新排序（7 个）
- [x] 默认上下文双语适配，切换 locale 自动切换默认上下文

---

## 📋 第一阶段：前端化改造（砍掉后端）

> **目标**：把后端做的三件事全部搬到前端，让项目变成纯静态 SPA。

### 后端目前做的事 vs 前端替代方案

| 后端职责 | 前端替代 |
|---|---|
| `POST /api/breath` — AI API 透传 | 前端直接 `fetch` 调 AI API（OpenAI-compatible） |
| Prompt 组装（`prompt_engine.py`） | 搬到前端 TS 模块（`services/promptEngine.ts`） |
| AI 响应 JSON 解析 | 搬到前端（和之前 breath.py 一样的逻辑） |
| Persona 种子 & CRUD（SQLite） | 内置 Persona 从 JSON 导入，自定义 Persona 存 localStorage |
| Context 存储 | 已经在 localStorage 了（不用改） |
| `ai_providers.json` 配置 | 搬到前端 `src/data/` 目录 |

### 1. 迁移 AI 调用到前端
- [x] 新建 `frontend/src/services/aiProvider.ts`
  - 实现 `chatCompletion(messages, config)` 函数
  - 直接用 `fetch` 调 OpenAI-compatible API（不用 SDK，减少包体积）
  - 处理 CORS：大部分 AI Provider（DeepSeek、OpenAI）允许浏览器直接调用
  - **注意**：MiniMax 可能不支持浏览器直接调用（CORS 限制），如果不行就在支持的 Provider 列表里去掉
- [x] 新建 `frontend/src/services/promptEngine.ts`
  - 从后端 `prompt_engine.py` 翻译为 TypeScript
  - 包含时间感知上下文、Prompt 模板、双语支持
  - 组装 OpenAI messages 格式
- [x] 新建 `frontend/src/services/breathEngine.ts`
  - 整合 AI 调用 + Prompt 组装 + JSON 解析
  - 替代原来的 `POST /api/breath`
  - JSON 解析逻辑从 `breath.py` 搬过来（strip markdown/think tags/find first {}）

### 2. 迁移 Persona 到前端纯 localStorage
- [x] 新建 `frontend/src/data/builtinPersonas.ts`
  - 从 `builtin_personas.json` 导入数据（或直接内联 TypeScript 对象）
  - 包含双语字段（name_en/name_zh/description_en/description_zh）
- [x] 新建 `frontend/src/data/aiProviders.ts`
  - 从 `ai_providers.json` 搬过来
- [x] 修改 `ambientStore.ts`
  - 内置 Persona 从代码导入而非 API
  - 自定义 Persona 存 localStorage（key: `auracal-custom-personas`）
  - 删除 Auth 相关状态（jwt, user, setAuth, clearAuth）
- [x] 修改 `PersonaManager.tsx`
  - 不再 fetch 后端 API
  - 内置 Persona 来自本地数据，根据 locale 显示对应语言
  - 自定义 Persona CRUD 走 localStorage，支持删除

### 3. 修改 useBreathing hook
- [x] 修改 `frontend/src/hooks/useBreathing.ts`
  - 不再 `POST /api/breath`
  - 改为调本地的 `breathEngine.ts`

### 4. 清理前端
- [x] 删除 `@react-oauth/google` 依赖（`npm uninstall @react-oauth/google`）
- [x] 简化 `main.tsx`（去掉 GoogleOAuthProvider 包裹）
- [x] 清理 `SettingsPanel.tsx`（去掉 Google 登录 UI，改用 aiProviders 数据）
- [x] `ContextEditor.tsx` 无后端调用，无需改动
- [x] 删除 `VITE_BACKEND_URL` 相关引用（不再需要）

### 5. 第一阶段验证
- [x] `npm run build` 成功，无报错
- [x] TypeScript 编译 0 错误
- [ ] `npm run dev` 启动，不启动后端
- [ ] 配置 DeepSeek API Key → 点击 Breathe → 弹幕 + 词云正常出现
- [ ] 切换中英文 → Persona 列表正确切换语言
- [ ] 创建自定义 Persona → 刷新页面 → 数据保留
- [ ] 测试 Promoter + 自定义上下文 → 广告词正常生成
- [ ] `npm run build` 成功，无报错

---

## 📋 第二阶段：部署到 GitHub Pages

> **目标**：一键部署，有个可访问的 Demo 链接写简历。

### 6. 配置 Vite 构建
- [x] 修改 `vite.config.ts`，设置 `base: '/AuraCal/'`（GitHub Pages 子路径）
- [x] 确保 `npm run build` 输出到 `dist/`，所有资源路径正确

### 7. GitHub Actions 自动部署
我本地的WSL已经部署好了gh cli
- [x] 推送代码到 GitHub：`lulusiyuyu/AuraCal`
- [x] 创建 `.github/workflows/deploy.yml`
  - 触发条件：push to main
  - 步骤：checkout → setup node → npm install → npm run build → deploy to gh-pages
- [x] 在 GitHub repo Settings → Pages 选择 GitHub Actions 部署方式
- [x] 验证：`https://lulusiyuyu.github.io/AuraCal/` 部署成功

### 8. 最终验证
- [ ] 用手机访问 GitHub Pages 链接
- [ ] 配置 API Key → Breathe → 弹幕 + 词云正常
- [ ] 中英文切换一切正常
- [ ] 分享链接给朋友测试

---

## 📋 第三阶段：代码整理 & 文档更新

### 9. 清理后端代码（删除或归档）
- [ ] 删除 `backend/` 目录（或移到 `archive/backend/` 保留参考）
- [ ] 删除 `deploy/` 目录（不再需要 VPS 部署）
- [ ] 更新 `.gitignore`
- [ ] 清理 `package.json` 中不需要的依赖

### 10. 更新文档
- [ ] 更新 `README.md` — 纯前端架构说明、一行启动命令、Demo 链接
- [ ] 更新 `README_CN.md` 同步
- [ ] 简化 `Project_Context.md`

---

## ❌ 不再执行（策略变更后砍掉）

以下任务因策略变更为"纯前端 + 速战速决"而取消：

- ~~Google OAuth + 跨设备持久化（v5）~~ — 代码已写但不部署，纯前端不需要后端认证
- ~~VPS 后端部署~~ — 没有后端了
- ~~Persona 广场~~ — 需要后端数据库，与纯前端策略不兼容
- ~~Nginx / systemd / HTTPS 配置~~ — 不需要了
- ~~后端代码清理（CORS 限制等）~~ — 直接删除后端


