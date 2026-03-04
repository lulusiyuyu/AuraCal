/** AuraCal i18n — EN (default) + ZH translations */

export type Locale = 'en' | 'zh';

const translations = {
    en: {
        // App
        configureApiKey: '⚙️ Configure API Key in Settings to start',
        breathe: '💨 Breathe',
        triggerBreath: 'Trigger one breath now',
        stopAuto: '⏸ Stop',
        startAuto: '▶ Auto',
        stopAutoTitle: 'Stop auto-breathing',
        startAutoTitle: 'Start auto-breathing',

        // Settings
        settings: '⚙️ Settings',
        settingsTitle: 'Settings',
        aiProvider: 'AI Provider',
        apiKeyLabel: 'API Key (stored locally, never sent to our server)',
        apiKeyPlaceholder: 'sk-...',
        breathingInterval: 'Breathing Interval',
        breathingIntervalUnit: 'min',
        save: 'Save',

        // Context
        context: '📝 Context',
        contextTitle: 'Custom Context',
        contextDescription: 'Tell the AI about your day, goals, or business. This becomes the context for breathing messages.',
        contextPlaceholder: 'e.g. Today\'s special: Ethiopian Yirgacheffe pour-over ☕\nor: Need to finish Linear Algebra Ch.3 + Data Structures homework',
        defaultContext: 'I\'ve been vibe coding since last night and my heart feels awful right now',

        // Persona
        persona: '🎭 Persona',
        personaTitle: 'Choose Persona',
        builtIn: 'Built-in',
        createCustom: '+ Create Custom',
        customPersonaTitle: 'New Custom Persona',
        personaName: 'Name',
        personaNamePlaceholder: 'My Persona',
        personaDescription: 'Description',
        personaDescPlaceholder: 'A short description...',
        personaPrompt: 'System Prompt',
        personaPromptPlaceholder: 'You are a...',
        cancel: 'Cancel',
        create: 'Create',

        // Theme
        switchToLight: 'Switch to light mode',
        switchToDark: 'Switch to dark mode',

        // Reset
        resetTitle: 'Reset to initial state',

        // Auth
        accountSection: 'Account',
        signInGoogle: 'Sign in with Google',
        signOut: 'Sign out',
        syncEnabled: 'Cross-device sync enabled',

        // Clock
        locale: 'en-US',
    },
    zh: {
        // App
        configureApiKey: '⚙️ 请在设置中配置 API Key',
        breathe: '💨 呼吸',
        triggerBreath: '立即触发一次呼吸',
        stopAuto: '⏸ 停止',
        startAuto: '▶ 自动',
        stopAutoTitle: '停止自动呼吸',
        startAutoTitle: '开始自动呼吸',

        // Settings
        settings: '⚙️ 设置',
        settingsTitle: '设置',
        aiProvider: 'AI 提供商',
        apiKeyLabel: 'API Key（仅本地存储，不会发送到我们的服务器）',
        apiKeyPlaceholder: 'sk-...',
        breathingInterval: '呼吸间隔',
        breathingIntervalUnit: '分钟',
        save: '保存',

        // Context
        context: '📝 上下文',
        contextTitle: '自定义上下文',
        contextDescription: '告诉 AI 你今天的安排、目标或商业信息。这将成为呼吸消息的上下文。',
        contextPlaceholder: '例如：今日特调：埃塞俄比亚耶加雪菲手冲 ☕\n或者：今天要完成线性代数第三章 + 数据结构作业',
        defaultContext: '我从昨天晚上一直vibe coding到现在，我现在心脏好难受',

        // Persona
        persona: '🎭 角色',
        personaTitle: '选择角色',
        builtIn: '内置',
        createCustom: '+ 创建自定义',
        customPersonaTitle: '新建自定义角色',
        personaName: '名称',
        personaNamePlaceholder: '我的角色',
        personaDescription: '描述',
        personaDescPlaceholder: '简短描述...',
        personaPrompt: '系统提示词',
        personaPromptPlaceholder: '你是一个...',
        cancel: '取消',
        create: '创建',

        // Theme
        switchToLight: '切换浅色模式',
        switchToDark: '切换深色模式',

        // Reset
        resetTitle: '重置为初始状态',

        // Auth
        accountSection: '账户',
        signInGoogle: '使用 Google 登录',
        signOut: '退出',
        syncEnabled: '跨设备同步已启用',

        // Clock
        locale: 'zh-CN',
    },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
    return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
