/** BreathingText — pulsing ambient text with exhale/inhale rhythm */

import { motion } from 'framer-motion';

interface BreathingTextProps {
    text: string;
    className?: string;
}

/**
 * Renders text that gently pulses with a breathing rhythm.
 * Used for ambient overlay text like the app title.
 */
export default function BreathingText({ text, className }: BreathingTextProps) {
    return (
        <motion.div
            className={className}
            animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
                filter: [
                    'blur(0px)',
                    'blur(0.5px)',
                    'blur(0px)',
                ],
            }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            style={{
                pointerEvents: 'none',
                userSelect: 'none',
            }}
        >
            {text}
        </motion.div>
    );
}
