import React, { createContext, useContext, ReactNode } from 'react';
import { useSettingsManager } from '@/hooks/useSettingsManager';
import { Settings } from '@/types';
import { User } from '@supabase/supabase-js';

// Contextが提供する情報の型を定義
interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (newSettings: Partial<Omit<Settings, 'id'>>) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// このProviderが、アプリ全体に設定情報を配る
export const SettingsProvider = ({ children, user }: { children: ReactNode, user: User | null }) => {
  const { settings, updateSettings, loading } = useSettingsManager(user);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 各コンポーネントは、このuseSettingsを使って設定情報にアクセスする
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};