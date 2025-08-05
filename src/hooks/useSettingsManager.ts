import { useState, useEffect, useCallback } from 'react';
import { Settings } from '@/types';
import { supabase } from '@/lib/supabaseClient'; // 我らが会話係！
import { User } from '@supabase/supabase-js';

// ユーザー情報を引数で受け取るように変更
export const useSettingsManager = (user: User | null) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // ユーザー情報が確定したら、その人の設定をSupabaseから取得する
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(); // 1件だけ取得

        if (error) throw error;
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]); // userが変わるたびに実行

  // 設定を更新したら、Supabaseのデータも更新する
  const updateSettings = useCallback(
    async (newSettings: Partial<Omit<Settings, 'id'>>) => {
      if (!user || !settings) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(newSettings)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data); // 画面上の設定も更新
        }
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    },
    [user, settings]
  );

  return { settings, updateSettings, loading };
};