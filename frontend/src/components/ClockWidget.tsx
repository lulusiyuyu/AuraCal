/** Clock Widget — large breathing time display */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';
import { t } from '../i18n';

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const { locale } = useAmbientStore();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    const dateStr = time.toLocaleDateString(t(locale, 'locale'), {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="clock-widget">
            <motion.h1
                className="clock-time"
                animate={{
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {hours}:{minutes}
            </motion.h1>
            <motion.div
                className="clock-date"
                animate={{
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                }}
            >
                {dateStr}
            </motion.div>
        </div>
    );
}
