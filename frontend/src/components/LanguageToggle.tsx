/** LanguageToggle — EN/ZH switch button */

import { motion } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';

export default function LanguageToggle() {
    const { locale, setLocale } = useAmbientStore();

    return (
        <motion.button
            className="lang-toggle"
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
            whileTap={{ scale: 0.92 }}
            title={locale === 'en' ? '切换到中文' : 'Switch to English'}
        >
            <motion.span
                key={locale}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ fontSize: 13, fontWeight: 500 }}
            >
                {locale === 'en' ? '中文' : 'EN'}
            </motion.span>
        </motion.button>
    );
}
