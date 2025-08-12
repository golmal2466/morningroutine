import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { THEMES } from '@/lib/themes';
import type { ThemeName } from '@/lib/themes';

const ThemeApplicator: React.FC = () => {
  const { settings } = useSettings();
  
  useEffect(() => {
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    // これが、私たちの冒険を終わらせる、最後の「一行」です
    if (!settings) return; 
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    const themeName = settings.theme as ThemeName;
    const theme = THEMES[themeName] || THEMES.blue;

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--primary-${key}`, value);
    });
    
    // useEffectの依存配列も、settings全体を監視するようにしましょう
  }, [settings]); 

  return null;
};

export default ThemeApplicator;