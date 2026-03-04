/** ContextEditor — simplified, no auth, saves to localStorage */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';
import { t } from '../i18n';

export default function ContextEditor() {
    const { customContext, setCustomContext, activePanel, setActivePanel, locale } = useAmbientStore();
    const isOpen = activePanel === 'context';
    const [text, setText] = useState(customContext);

    const handleSave = () => {
        setCustomContext(text);
        setActivePanel('none');
    };

    return (
        <>
            <motion.button
                className={`toolbar-btn ${isOpen ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setText(customContext);
                    setActivePanel(isOpen ? 'none' : 'context');
                }}
                whileTap={{ scale: 0.95 }}
            >
                {t(locale, 'context')}
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
                            width: 420,
                            maxWidth: '90vw',
                            padding: 20,
                            zIndex: 200,
                        }}
                    >
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                            {t(locale, 'contextTitle')}
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                            {t(locale, 'contextDescription')}
                        </p>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t(locale, 'contextPlaceholder')}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: 10,
                                borderRadius: 8,
                                border: '1px solid var(--border-subtle)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                resize: 'vertical',
                                fontSize: 13,
                                fontFamily: 'inherit',
                                marginBottom: 12,
                                lineHeight: 1.6,
                            }}
                        />

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
