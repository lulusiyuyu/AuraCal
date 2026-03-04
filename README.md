# 📅 AuraCal 灵光画布

**A Breathing, Persona-Driven Ambient Display.**

AuraCal is not a traditional to-do list — it's a **living desktop art piece** with a soul. Through AI personas, it breathes poetic danmaku messages and floating word clouds across your screen, perfect for focus sessions, café displays, or brand promotions.

> 🧽 *"I'm ready! Today you're gonna crush everything!"* — SpongeBob Persona

---

## ✨ Features

- **🎭 AI Personas** — 6 built-in characters + custom persona creation
  - SpongeBob, Strict Coach, Hot-blooded Trainer, Zen Master, Sarcasm King, **Promoter** (ad copywriter)
- **💨 Breathing Engine** — AI generates danmaku messages every N minutes with time-aware context
- **📝 Custom Context** — Tell the AI about your goals, schedule, or product info
- **☁️ Word Cloud** — Floating background keywords with organic spring animations
- **🎬 GPU-Accelerated Danmaku** — Pure CSS `translate3d` animations, transparent overlay, clock always on top
- **🌐 i18n** — Full English + Chinese support (UI, AI output, date formats)
- **🌗 Dark/Light Theme** — Apple-inspired minimalist design with smooth 0.5s transitions
- **🤖 Multi-AI Provider** — Minimax, DeepSeek, OpenAI, or any OpenAI-compatible API
- **🔒 Privacy** — API keys stored in browser localStorage, never sent to our server
- **📱 Auto-hide UI** — Toolbar and controls hide after 3s of inactivity for a clean display

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Framer Motion + Zustand |
| Backend | FastAPI + SQLModel + SQLite (async) |
| AI | OpenAI SDK (multi-provider via JSON config) |
| Architecture | Stateless — no auth, no cookies, UUID-based anonymous identity |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- Node.js 18+

### 1. Clone & Setup Backend

```bash
git clone https://github.com/lulusiyuyu/AuraCal.git
cd AuraCal/backend

uv sync                    # Install Python deps
cp .env.example .env       # Edit with your settings

uv run uvicorn app.main:app --port 8000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, configure your AI API key in ⚙️ Settings, and click 💨 Breathe!

---

## ⚙️ Configuration

### `.env` (backend/)

```env
DEFAULT_AI_PROVIDER=minimax
MINIMAX_API_KEY=            # Optional system fallback
DEEPSEEK_API_KEY=           # Optional system fallback
DATABASE_URL=sqlite+aiosqlite:///./auracal.db
SECRET_KEY=change-me
```

### AI Providers (`ai_providers.json`)

```json
{
  "providers": {
    "minimax": { "name": "MiniMax M2.5", "base_url": "https://api.minimaxi.com/v1", "model": "MiniMax-M2.5" },
    "deepseek": { "name": "DeepSeek", "base_url": "https://api.deepseek.com", "model": "deepseek-chat" },
    "openai": { "name": "OpenAI", "base_url": "https://api.openai.com/v1", "model": "gpt-4o-mini" }
  },
  "default_provider": "minimax"
}
```

---

## 🎭 Built-in Personas

| # | Name | Style | Use Case |
|---|------|-------|----------|
| 1 | 海绵宝宝 (SpongeBob) | Energetic, funny | Motivation |
| 2 | 暴躁导师 (Strict Coach) | Harsh, no-nonsense | Productivity |
| 3 | 热血教练 (Trainer) | Passionate, inspiring | Sports/fitness |
| 4 | 禅意大师 (Zen Master) | Calm, poetic | Focus/meditation |
| 5 | 阴阳大师 (Sarcasm King) | Sarcastic, witty | Fun motivation |
| 6 | Promoter | Creative ad copywriter | Café/shop displays |

💡 **Promoter tip**: Set your custom context to your product info (e.g., "Ethiopian Yirgacheffe single origin, light roast, notes of blueberry and jasmine ☕") and watch the AI generate catchy ad copy on your display!

---

## 📁 Project Structure

```
AuraCal/
├── backend/
│   ├── pyproject.toml           # Python deps (uv)
│   ├── ai_providers.json        # AI provider presets
│   ├── .env                     # Secrets (git-ignored)
│   └── app/
│       ├── main.py              # FastAPI entry + persona seeds
│       ├── config.py            # Pydantic Settings
│       ├── database.py          # Async SQLite
│       ├── models/              # User, Persona, ChatHistory
│       ├── routers/             # breath, context, personas
│       └── services/            # ai_provider, prompt_engine
├── frontend/
│   └── src/
│       ├── App.tsx              # Root component (auto-hide UI)
│       ├── i18n.ts              # EN/ZH translations
│       ├── index.css            # Dark/light theme system
│       ├── stores/              # Zustand store
│       ├── hooks/               # useBreathing (timer + HTTP)
│       └── components/          # DanmakuLayer, WordCloud, Panels, etc.
└── deploy/
    ├── nginx.conf               # Reverse proxy config
    ├── auracal.service          # systemd service
    └── setup_server.sh          # VPS setup script
```

---

## 🖥️ Deployment

See [todolist.md](todolist.md) for detailed deployment steps:
- **VPS**: Nginx + systemd (backend API)
- **GitHub Pages**: Static frontend hosting

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
