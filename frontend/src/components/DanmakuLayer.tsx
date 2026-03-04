/** DanmakuLayer — GPU-accelerated floating messages using CSS animations */

import { useEffect, useRef, useCallback } from 'react';
import { useAmbientStore } from '../stores/ambientStore';

const SPEED_DURATIONS = { slow: 18, normal: 12, fast: 7 };
const FONT_SIZES = { small: 16, medium: 22, large: 30 };
const MAX_ACTIVE = 20; // cap concurrent messages to prevent DOM bloat

export default function DanmakuLayer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { danmakuPool, theme } = useAmbientStore();
    const poolRef = useRef(danmakuPool);
    const themeRef = useRef(theme);
    const poolIndexRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const activeCountRef = useRef(0);

    useEffect(() => { themeRef.current = theme; }, [theme]);

    useEffect(() => {
        poolRef.current = danmakuPool;
    }, [danmakuPool]);

    const spawnDanmaku = useCallback(() => {
        const pool = poolRef.current;
        const container = containerRef.current;
        if (!pool.length || !container) return;
        if (activeCountRef.current >= MAX_ACTIVE) return;

        const msg = pool[poolIndexRef.current % pool.length];
        poolIndexRef.current++;

        // Randomize properties
        const isLight = themeRef.current === 'light';
        const speeds: Array<'slow' | 'normal' | 'fast'> = ['slow', 'normal', 'fast'];
        const speed = speeds[Math.floor(Math.random() * speeds.length)];
        const duration = SPEED_DURATIONS[speed];
        const baseSize = FONT_SIZES[msg.fontSize] || 22;
        const fontSize = baseSize + (Math.random() - 0.5) * 8;
        const top = 8 + Math.random() * 76; // 8% to 84%
        // Light mode: always bold; dark mode: random weight
        const fontWeight = isLight ? 700 : (Math.random() > 0.5 ? 600 : 400);
        // Light mode: use dark ink color instead of whitish persona color
        const color = isLight ? 'rgba(15, 23, 42, 0.92)' : msg.color;
        const opacity = isLight ? 0.82 : 0.78;

        // Create DOM element directly for zero-overhead animation
        const el = document.createElement('div');
        el.textContent = msg.text;
        el.style.cssText = `
            position: fixed;
            top: ${top}%;
            left: 0;
            white-space: nowrap;
            font-size: ${fontSize}px;
            font-weight: ${fontWeight};
            color: ${color};
            pointer-events: none;
            user-select: none;
            z-index: 30;
            will-change: transform;
            opacity: ${opacity};
            animation: danmaku-scroll ${duration}s linear forwards;
        `;

        container.appendChild(el);
        activeCountRef.current++;

        // Remove after animation ends
        const cleanup = () => {
            el.remove();
            activeCountRef.current--;
        };
        el.addEventListener('animationend', cleanup, { once: true });
        // Safety fallback
        setTimeout(cleanup, (duration + 1) * 1000);
    }, []);

    // Spawn loop
    useEffect(() => {
        if (danmakuPool.length === 0) return;

        function loop() {
            spawnDanmaku();
            const delay = 2500 + Math.random() * 3500; // 2.5s - 6s
            timerRef.current = setTimeout(loop, delay);
        }

        timerRef.current = setTimeout(loop, 500);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [danmakuPool, spawnDanmaku]);

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
                zIndex: 30,
            }}
        />
    );
}
