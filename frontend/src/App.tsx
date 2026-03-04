/** AuraCal — Root App Component (v4 Stateless + i18n) */

import { useEffect, useRef, useCallback } from 'react';
import { useAmbientStore } from './stores/ambientStore';
import { t } from './i18n';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import ClockWidget from './components/ClockWidget';
import BreathingText from './components/BreathingText';
import DanmakuLayer from './components/DanmakuLayer';
import WordCloudLayer from './components/WordCloudLayer';
import ContextEditor from './components/ContextEditor';
import PersonaManager from './components/PersonaManager';
import SettingsPanel from './components/SettingsPanel';
import { useBreathing } from './hooks/useBreathing';
import './index.css';

const IDLE_TIMEOUT = 3000;

export default function App() {
  const { theme, isBreathing, aiConfig, setActivePanel, isToolbarVisible, setToolbarVisible, activePanel, locale } = useAmbientStore();
  const { triggerBreath, startBreathing, stopBreathing } = useBreathing();
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Mouse idle detection
  const resetIdleTimer = useCallback(() => {
    setToolbarVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (activePanel !== 'none') return;
    idleTimerRef.current = setTimeout(() => setToolbarVisible(false), IDLE_TIMEOUT);
  }, [setToolbarVisible, activePanel]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    idleTimerRef.current = setTimeout(() => setToolbarVisible(false), IDLE_TIMEOUT);
    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer, setToolbarVisible]);

  const needsSetup = !aiConfig.apiKey;

  const handleReset = () => {
    // Stop breathing, clear pools, close panels
    useAmbientStore.getState().setIsBreathing(false);
    useAmbientStore.getState().setDanmakuPool([]);
    useAmbientStore.getState().setWordCloudWords([]);
    useAmbientStore.getState().setActivePanel('none');
    // Clear all active floating messages
    useAmbientStore.setState({ messages: [] });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.toolbar') || (e.target as HTMLElement).closest('.glass-panel')) return;
    setActivePanel('none');
  };

  return (
    <div className="ambient-canvas" onClick={handleCanvasClick}>
      {/* Top-left controls: theme + language + reset — auto-hide */}
      <div className={`top-left-controls auto-hide-element ${isToolbarVisible ? 'visible' : 'hidden-up'}`}>
        <ThemeToggle />
        <LanguageToggle />
        <button
          className="toolbar-btn"
          onClick={handleReset}
          title={t(locale, 'resetTitle')}
          style={{ fontSize: 16, padding: '4px 8px' }}
        >
          🔄
        </button>
      </div>

      {/* Visual layers */}
      <WordCloudLayer />
      <DanmakuLayer />

      {/* Center content — clock is always visible */}
      <div className="center-content">
        <ClockWidget />
      </div>

      {/* Bottom toolbar — auto-hides with AuraCal text */}
      <div className={`toolbar-wrapper auto-hide-bottom ${isToolbarVisible ? 'visible' : 'hidden-down'}`}>
        <BreathingText text="AuraCal" className="breathing-watermark" />
        <div className="toolbar glass-panel">
          <ContextEditor />
          <PersonaManager />
          <SettingsPanel />

          {needsSetup ? (
            <span className="toolbar-hint">
              {t(locale, 'configureApiKey')}
            </span>
          ) : (
            <>
              <button className="toolbar-btn" onClick={triggerBreath} title={t(locale, 'triggerBreath')}>
                {t(locale, 'breathe')}
              </button>
              <button
                className={`toolbar-btn ${isBreathing ? 'active' : ''}`}
                onClick={isBreathing ? stopBreathing : startBreathing}
                title={isBreathing ? t(locale, 'stopAutoTitle') : t(locale, 'startAutoTitle')}
              >
                {isBreathing ? t(locale, 'stopAuto') : t(locale, 'startAuto')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
