import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import AuthPage from '@/pages/AuthPage'
import AppRoutes from '@/routes/AppRoutes';
import { SettingsProvider } from '@/contexts/SettingsContext';

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    return () => subscription.unsubscribe();
  }, [])

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <SettingsProvider user={session?.user ?? null}>
      {/* ここから、ThemeApplicatorを削除しました！ */}
      {!session ? <AuthPage /> : <AppRoutes />}
    </SettingsProvider>
  )
}

export default App
