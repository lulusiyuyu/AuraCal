/** PersonaManager — collapsible panel to browse, select, and create personas (pure frontend) */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';
import { t } from '../i18n';

export default function PersonaManager() {
    const { personas, activePersonaId, setActivePersonaId, addCustomPersona, removeCustomPersona, activePanel, setActivePanel, locale } = useAmbientStore();
    const isOpen = activePanel === 'persona';
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPrompt, setNewPrompt] = useState('');

    const selectPersona = (id: number) => {
        setActivePersonaId(id);
    };

    const handleCreate = () => {
        if (!newName.trim() || !newPrompt.trim()) return;
        addCustomPersona({
            name: newName.trim(),
            description: newDesc.trim() || null,
            system_prompt: newPrompt.trim(),
            visual_theme: 'dark',
            danmaku_config: { color: '#e2e8f0', speed: 'normal', fontSize: 'medium' },
        });
        setNewName('');
        setNewDesc('');
        setNewPrompt('');
        setShowCreate(false);
    };

    const inputStyle = {
        width: '100%',
        padding: 8,
        borderRadius: 8,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: 12,
        fontFamily: 'inherit',
        marginBottom: 8,
    } as const;

    return (
        <>
            <motion.button
                className={`toolbar-btn ${isOpen ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setActivePanel(isOpen ? 'none' : 'persona');
                }}
                whileTap={{ scale: 0.95 }}
            >
                {t(locale, 'persona')}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        style={{
                            position: 'fixed',
                            bottom: 80,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 320,
                            maxWidth: '90vw',
                            maxHeight: '60vh',
                            overflowY: 'auto',
                            padding: 16,
                            zIndex: 200,
                        }}
                        className="glass-panel"
                    >
                        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
                            {t(locale, 'personaTitle')}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {personas.map((p) => (
                                <motion.button
                                    key={p.id}
                                    onClick={() => selectPersona(p.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 4,
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: activePersonaId === p.id
                                            ? '2px solid var(--accent-glow)'
                                            : '1px solid var(--border-subtle)',
                                        background: activePersonaId === p.id
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'var(--btn-bg)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                    }}
                                >
                                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {p.name}
                                    </span>
                                    {p.description && (
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                            {p.description}
                                        </span>
                                    )}
                                    {p.is_builtin && (
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            {t(locale, 'builtIn')}
                                        </span>
                                    )}
                                    {!p.is_builtin && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCustomPersona(p.id);
                                            }}
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--text-muted)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                            }}
                                        >
                                            ✕ Remove
                                        </button>
                                    )}
                                </motion.button>
                            ))}

                            {/* Create Custom Persona */}
                            {!showCreate ? (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: '1px dashed var(--border-subtle)',
                                        background: 'transparent',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        width: '100%',
                                    }}
                                >
                                    {t(locale, 'createCustom')}
                                </button>
                            ) : (
                                <div style={{
                                    padding: 12,
                                    borderRadius: 10,
                                    border: '1px solid var(--accent-glow)',
                                    background: 'var(--btn-bg)',
                                }}>
                                    <h4 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                                        {t(locale, 'customPersonaTitle')}
                                    </h4>
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder={t(locale, 'personaNamePlaceholder')}
                                        style={inputStyle}
                                    />
                                    <input
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder={t(locale, 'personaDescPlaceholder')}
                                        style={inputStyle}
                                    />
                                    <textarea
                                        value={newPrompt}
                                        onChange={(e) => setNewPrompt(e.target.value)}
                                        placeholder={t(locale, 'personaPromptPlaceholder')}
                                        rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => setShowCreate(false)}
                                            style={{
                                                flex: 1,
                                                padding: 8,
                                                borderRadius: 8,
                                                border: '1px solid var(--border-subtle)',
                                                background: 'transparent',
                                                color: 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                fontSize: 12,
                                            }}
                                        >
                                            {t(locale, 'cancel')}
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            style={{
                                                flex: 1,
                                                padding: 8,
                                                borderRadius: 8,
                                                border: 'none',
                                                background: 'var(--accent-glow)',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {t(locale, 'create')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
