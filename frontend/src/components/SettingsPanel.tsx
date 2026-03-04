/** SettingsPanel — AI provider config + breathing interval (pure frontend) */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';
import { t } from '../i18n';
import { aiProviders } from '../data/aiProviders';

export default function SettingsPanel() {
    const { aiConfig, setAiConfig, breathingInterval, setBreathingInterval, activePanel, setActivePanel, locale } = useAmbientStore();
    const isOpen = activePanel === 'settings';
    const [provider, setProvider] = useState(aiConfig.provider);
    const [apiKey, setApiKey] = useState(aiConfig.apiKey);
    const [interval, setInterval_] = useState(breathingInterval);

    const handleSave = () => {
        const preset = aiProviders.find((p) => p.key === provider);
        setAiConfig({
            provider,
            apiKey,
            baseUrl: preset?.baseUrl,
            model: preset?.model,
        });
        setBreathingInterval(interval);
        setActivePanel('none');
    };

    return (
        <>
            <motion.button
                className={`toolbar-btn ${isOpen ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setActivePanel(isOpen ? 'none' : 'settings');
                }}
                whileTap={{ scale: 0.95 }}
            >
                {t(locale, 'settings')}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed',
                            bottom: 80,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 340,
                            maxWidth: '90vw',
                            padding: 20,
                            zIndex: 200,
                        }}
                    >
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                            {t(locale, 'settingsTitle')}
                        </h3>

                        {/* AI Provider */}
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                            {t(locale, 'aiProvider')}
                        </label>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                            {aiProviders.map((p) => (
                                <button
                                    key={p.key}
                                    onClick={() => setProvider(p.key)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: provider === p.key ? 'var(--accent-glow)' : 'var(--btn-bg)',
                                        color: provider === p.key ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>

                        {/* API Key */}
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                            {t(locale, 'apiKeyLabel')}
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={t(locale, 'apiKeyPlaceholder')}
                            style={{
                                width: '100%',
                                padding: 8,
                                borderRadius: 8,
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontSize: 13,
                                marginBottom: 12,
                                fontFamily: 'monospace',
                            }}
                        />

                        {/* Breathing Interval */}
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                            {t(locale, 'breathingInterval')}: {interval} {t(locale, 'breathingIntervalUnit')}
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={60}
                            value={interval}
                            onChange={(e) => setInterval_(Number(e.target.value))}
                            style={{ width: '100%', marginBottom: 16 }}
                        />

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            style={{
                                width: '100%',
                                padding: 10,
                                borderRadius: 8,
                                border: 'none',
                                background: 'var(--accent-glow)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            {t(locale, 'save')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
