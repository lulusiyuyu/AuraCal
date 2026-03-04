/** WordCloudLayer — ambient floating words from AI wordCloudWords pool */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useAmbientStore } from '../stores/ambientStore';

interface WordItem {
    id: string;
    text: string;
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
}

function FloatingWord({ word, index }: { word: WordItem; index: number }) {
    const theme = useAmbientStore((s) => s.theme);
    const x = useMotionValue(word.x);
    const y = useMotionValue(word.y);

    // Spring damping for organic movement
    const springX = useSpring(x, { stiffness: 8, damping: 20 });
    const springY = useSpring(y, { stiffness: 8, damping: 20 });

    useEffect(() => {
        // Slow drift animation
        const interval = setInterval(() => {
            x.set(word.x + (Math.random() - 0.5) * 80);
            y.set(word.y + (Math.random() - 0.5) * 60);
        }, 4000 + (index % 5) * 500);
        return () => clearInterval(interval);
    }, [word.x, word.y, x, y, index]);

    const isLight = theme === 'light';
    // In light mode show higher opacity and bold weight
    const displayOpacity = isLight ? Math.min(word.opacity * 2.2, 0.72) : word.opacity;
    const fontWeight = isLight ? 600 : 300;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: displayOpacity, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                x: springX,
                y: springY,
                fontSize: word.size,
                fontWeight,
                color: 'var(--text-primary)',
                opacity: displayOpacity,
                rotate: word.rotation, // Use Framer Motion's rotate instead of CSS transform
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
                zIndex: 10,
            }}
        >
            {word.text}
        </motion.div>
    );
}

export default function WordCloudLayer() {
    const { wordCloudWords } = useAmbientStore();
    const [words, setWords] = useState<WordItem[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wordCloudWords.length === 0) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const newWords: WordItem[] = wordCloudWords.map((text, i) => ({
            id: `wc-${text}-${i}`,
            text,
            x: vw * 0.1 + Math.random() * vw * 0.8,
            y: vh * 0.1 + Math.random() * vh * 0.8,
            size: 16 + Math.random() * 28,
            // Base opacity used for dark mode; FloatingWord multiplies for light mode
            opacity: 0.22 + Math.random() * 0.22, // 0.22–0.44 in dark
            rotation: (Math.random() - 0.5) * 30,
        }));

        setWords(newWords);
    }, [wordCloudWords]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: 10,
            }}
        >
            <AnimatePresence>
                {words.map((word, index) => (
                    <FloatingWord key={word.id} word={word} index={index} />
                ))}
            </AnimatePresence>
        </div>
    );
}
