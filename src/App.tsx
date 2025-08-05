import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import AuthPage from '@/pages/AuthPage'
import AppRoutes from '@/routes/AppRoutes'; // 新しい交通整理係！
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
    return <div>読み込み中...</div>; // 最初のセッション確認中にローディング表示
  }

  return (
    // SettingsProviderでアプリ全体を包む！
    // これで、どこからでも、ログインユーザーの設定にアクセスできる
    <SettingsProvider user={session?.user ?? null}>
      {/* sessionがなければ玄関へ、あれば家の中（AppRoutes）へ */}
      {!session ? <AuthPage /> : <AppRoutes />}
    </SettingsProvider>
  )
}

export default App