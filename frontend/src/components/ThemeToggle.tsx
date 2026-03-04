/** Theme Toggle — Apple-style, clean, no glow */

import { motion } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';
import { t } from '../i18n';

export default function ThemeToggle() {
    const { theme, toggleTheme, locale } = useAmbientStore();

    return (
        <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileTap={{ scale: 0.92 }}
            title={theme === 'dark' ? t(locale, 'switchToLight') : t(locale, 'switchToDark')}
        >
            <motion.span
                key={theme}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ fontSize: 16 }}
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </motion.span>
        </motion.button>
    );
}
