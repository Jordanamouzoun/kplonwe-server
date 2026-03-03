import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AccessibilitySettings, TextSize, ContrastMode, AnimationMode } from '@/types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setTextSize: (size: TextSize) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setAnimationMode: (mode: AnimationMode) => void;
  toggleReducedMotion: () => void;
}

const defaultSettings: AccessibilitySettings = {
  textSize: 'medium',
  contrastMode: 'normal',
  animationMode: 'normal',
  reducedMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Charger depuis localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    
    // Détecter prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      ...defaultSettings,
      reducedMotion: prefersReducedMotion,
      animationMode: prefersReducedMotion ? 'reduced' : 'normal',
    };
  });

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Appliquer les classes au document
  useEffect(() => {
    const root = document.documentElement;
    
    // Taille texte
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (settings.textSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'medium':
        root.classList.add('text-base');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'xlarge':
        root.classList.add('text-xl');
        break;
    }

    // Contraste
    root.classList.remove('contrast-normal', 'contrast-high');
    root.classList.add(`contrast-${settings.contrastMode}`);

    // Animations
    if (settings.reducedMotion || settings.animationMode === 'reduced') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const setTextSize = (size: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize: size }));
  };

  const setContrastMode = (mode: ContrastMode) => {
    setSettings((prev) => ({ ...prev, contrastMode: mode }));
  };

  const setAnimationMode = (mode: AnimationMode) => {
    setSettings((prev) => ({ 
      ...prev, 
      animationMode: mode,
      reducedMotion: mode === 'reduced',
    }));
  };

  const toggleReducedMotion = () => {
    setSettings((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
      animationMode: !prev.reducedMotion ? 'reduced' : 'normal',
    }));
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setTextSize,
        setContrastMode,
        setAnimationMode,
        toggleReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
