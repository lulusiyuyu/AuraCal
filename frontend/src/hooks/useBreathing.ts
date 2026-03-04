/** useBreathing — frontend-driven breathing via setInterval + local breathEngine */

import { useEffect, useRef, useCallback } from 'react';
import { useAmbientStore } from '../stores/ambientStore';
import { triggerBreath as callBreath } from '../services/breathEngine';

export function useBreathing() {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const {
        isBreathing,
        setIsBreathing,
        breathingInterval,
        activePersonaId,
        personas,
        customContext,
        aiConfig,
        locale,
    } = useAmbientStore();

    const triggerBreath = useCallback(async () => {
        const { setIsFetching } = useAmbientStore.getState();
        setIsFetching(true);
        try {
            // Find the active persona
            const persona = personas.find((p) => p.id === activePersonaId) ?? personas[0];
            if (!persona) {
                console.warn('No persona available');
                return;
            }

            // Call the local breath engine
            const result = await callBreath(
                persona.system_prompt,
                customContext,
                locale,
                aiConfig,
            );

            // Set word cloud words
            if (result.word_cloud.length > 0) {
                useAmbientStore.getState().setWordCloudWords(result.word_cloud);
            }

            // Set danmaku pool with persona styling
            if (result.danmaku.length > 0) {
                const config = persona.danmaku_config;
                const styledDanmakus = result.danmaku.map((text: string, index: number) => ({
                    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
                    text,
                    persona_name: persona.name,
                    color: config?.color || '#e2e8f0',
                    speed: config?.speed || 'normal',
                    fontSize: config?.fontSize || ('medium' as const),
                    timestamp: Date.now(),
                }));
                useAmbientStore.getState().setDanmakuPool(styledDanmakus);
            }
        } catch (e) {
            console.warn('Breath error:', e);
        } finally {
            useAmbientStore.getState().setIsFetching(false);
        }
    }, [activePersonaId, personas, customContext, aiConfig, locale]);

    // Auto-breathing timer
    useEffect(() => {
        if (isBreathing) {
            triggerBreath();
            timerRef.current = setInterval(
                triggerBreath,
                breathingInterval * 60 * 1000,
            );
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isBreathing, breathingInterval, triggerBreath]);

    const startBreathing = useCallback(() => setIsBreathing(true), [setIsBreathing]);
    const stopBreathing = useCallback(() => setIsBreathing(false), [setIsBreathing]);

    return { triggerBreath, startBreathing, stopBreathing };
}
