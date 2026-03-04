/** AuraCal Ambient Store — pure frontend, no backend needed */

import { create } from 'zustand';
import { type Locale } from '../i18n';
import { builtinPersonas, type BuiltinPersona } from '../data/builtinPersonas';

// ── Types ───────────────────────────────────────────────────

export interface Persona {
    id: number;
    name: string;
    name_en?: string;
    name_zh?: string;
    description: string | null;
    description_en?: string;
    description_zh?: string;
    system_prompt: string;
    visual_theme: string;
    danmaku_config: {
        color: string;
        speed: 'slow' | 'normal' | 'fast';
        fontSize: 'small' | 'medium' | 'large';
    };
    is_builtin: boolean;
}

export interface DanmakuMessage {
    id: string;
    text: string;
    persona_name: string;
    color: string;
    speed: 'slow' | 'normal' | 'fast';
    fontSize: 'small' | 'medium' | 'large';
    timestamp: number;
}

export interface AIConfig {
    provider: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
}

// ── Helpers ─────────────────────────────────────────────────

function getClientUuid(): string {
    let uuid = localStorage.getItem('auracal-uuid');
    if (!uuid) {
        uuid = crypto.randomUUID();
        localStorage.setItem('auracal-uuid', uuid);
    }
    return uuid;
}

function loadAiConfig(): AIConfig {
    try {
        const raw = localStorage.getItem('auracal-ai-config');
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { provider: 'deepseek', apiKey: '' };
}

/** All default context strings for quick matching during locale switch */
const DEFAULT_CONTEXTS: Record<Locale, string> = {
    en: "I've been vibe coding since last night and my heart feels awful right now",
    zh: '我从昨天晚上一直vibe coding到现在，我现在心脏好难受',
};

/** Load user-created custom personas from localStorage */
function loadCustomPersonas(): Persona[] {
    try {
        const raw = localStorage.getItem('auracal-custom-personas');
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
}

/** Convert a BuiltinPersona to the unified Persona shape for a given locale */
function resolveBuiltin(bp: BuiltinPersona, locale: Locale): Persona {
    return {
        id: bp.id,
        name: locale === 'zh' ? bp.name_zh : bp.name_en,
        name_en: bp.name_en,
        name_zh: bp.name_zh,
        description: locale === 'zh' ? bp.description_zh : bp.description_en,
        description_en: bp.description_en,
        description_zh: bp.description_zh,
        system_prompt: bp.system_prompt,
        visual_theme: bp.visual_theme,
        danmaku_config: bp.danmaku_config,
        is_builtin: true,
    };
}

/** Build the full persona list: builtins (locale-resolved) + custom */
function buildPersonaList(locale: Locale): Persona[] {
    const resolved = builtinPersonas.map((bp) => resolveBuiltin(bp, locale));
    return [...resolved, ...loadCustomPersonas()];
}

// ── Store ───────────────────────────────────────────────────

interface AmbientState {
    // Theme
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // Client UUID
    clientUuid: string;

    // AI Config
    aiConfig: AIConfig;
    setAiConfig: (config: AIConfig) => void;

    // Personas (builtins + custom)
    personas: Persona[];
    activePersonaId: number;
    refreshPersonas: () => void;
    setActivePersonaId: (id: number) => void;
    addCustomPersona: (p: Omit<Persona, 'id' | 'is_builtin'>) => void;
    removeCustomPersona: (id: number) => void;

    // Custom context
    customContext: string;
    setCustomContext: (text: string) => void;

    // Breathing
    breathingInterval: number;
    setBreathingInterval: (min: number) => void;
    isBreathing: boolean;
    setIsBreathing: (v: boolean) => void;

    // UI panels
    activePanel: 'none' | 'persona' | 'context' | 'settings';
    setActivePanel: (panel: 'none' | 'persona' | 'context' | 'settings') => void;

    // Toolbar auto-hide
    isToolbarVisible: boolean;
    setToolbarVisible: (v: boolean) => void;

    // Locale
    locale: Locale;
    setLocale: (l: Locale) => void;

    // AI Generation Pools
    danmakuPool: DanmakuMessage[];
    setDanmakuPool: (msgs: DanmakuMessage[]) => void;
    wordCloudWords: string[];
    setWordCloudWords: (words: string[]) => void;

    // Active floating messages
    messages: DanmakuMessage[];
    addMessage: (msg: DanmakuMessage) => void;
    removeMessage: (id: string) => void;
}

const initialLocale = (localStorage.getItem('auracal-locale') as Locale) || 'en';

export const useAmbientStore = create<AmbientState>((set, get) => ({
    // Theme
    theme: (localStorage.getItem('auracal-theme') as 'dark' | 'light') || 'dark',
    toggleTheme: () =>
        set((state) => {
            const next = state.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('auracal-theme', next);
            document.documentElement.setAttribute('data-theme', next);
            return { theme: next };
        }),

    // Client UUID
    clientUuid: getClientUuid(),

    // AI Config
    aiConfig: loadAiConfig(),
    setAiConfig: (config) => {
        localStorage.setItem('auracal-ai-config', JSON.stringify(config));
        set({ aiConfig: config });
    },

    // Personas — built from builtins + localStorage custom
    personas: buildPersonaList(initialLocale),
    activePersonaId: Number(localStorage.getItem('auracal-persona') || '1'),

    refreshPersonas: () => {
        const { locale } = get();
        set({ personas: buildPersonaList(locale) });
    },

    setActivePersonaId: (id) => {
        localStorage.setItem('auracal-persona', String(id));
        set({ activePersonaId: id });
    },

    addCustomPersona: (p) => {
        const customs = loadCustomPersonas();
        // Generate a unique id (start at 1000 to avoid collision with builtins)
        const maxId = customs.reduce((max, c) => Math.max(max, c.id), 999);
        const newPersona: Persona = {
            ...p,
            id: maxId + 1,
            is_builtin: false,
            danmaku_config: p.danmaku_config ?? { color: '#e2e8f0', speed: 'normal', fontSize: 'medium' },
        };
        const updated = [...customs, newPersona];
        localStorage.setItem('auracal-custom-personas', JSON.stringify(updated));
        const { locale } = get();
        set({ personas: buildPersonaList(locale) });
    },

    removeCustomPersona: (id) => {
        const customs = loadCustomPersonas().filter((c) => c.id !== id);
        localStorage.setItem('auracal-custom-personas', JSON.stringify(customs));
        const { locale } = get();
        set({ personas: buildPersonaList(locale) });
    },

    // Custom context — default is locale-aware
    customContext: localStorage.getItem('auracal-context') ?? DEFAULT_CONTEXTS[initialLocale],
    setCustomContext: (text) => {
        localStorage.setItem('auracal-context', text);
        set({ customContext: text });
    },

    // Breathing
    breathingInterval: Number(localStorage.getItem('auracal-interval') || '15'),
    setBreathingInterval: (min) => {
        localStorage.setItem('auracal-interval', String(min));
        set({ breathingInterval: min });
    },
    isBreathing: false,
    setIsBreathing: (v) => set({ isBreathing: v }),

    // UI State
    activePanel: 'none',
    setActivePanel: (panel) => set({ activePanel: panel }),

    // Toolbar auto-hide
    isToolbarVisible: true,
    setToolbarVisible: (v) => set({ isToolbarVisible: v }),

    // Locale — also refresh persona list and default context when locale changes
    locale: initialLocale,
    setLocale: (l) => {
        localStorage.setItem('auracal-locale', l);
        const { customContext } = get();
        const updates: Partial<AmbientState> = { locale: l, personas: buildPersonaList(l) };
        // If context is the other locale's default (or empty), auto-switch to new locale's default
        const otherLocale: Locale = l === 'en' ? 'zh' : 'en';
        if (!customContext || customContext === DEFAULT_CONTEXTS[otherLocale]) {
            updates.customContext = DEFAULT_CONTEXTS[l];
            localStorage.setItem('auracal-context', DEFAULT_CONTEXTS[l]);
        }
        set(updates);
    },

    // AI Generation Pools
    danmakuPool: [],
    setDanmakuPool: (texts) => set({ danmakuPool: texts }),
    wordCloudWords: [],
    setWordCloudWords: (words) => set({ wordCloudWords: words }),

    // Active floating messages
    messages: [],
    addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),
    removeMessage: (id) =>
        set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
}));
