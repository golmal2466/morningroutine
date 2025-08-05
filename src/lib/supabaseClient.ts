import { createClient } from '@supabase/supabase-js'

// SupabaseのURLとanon keyを環境変数から取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabaseクライアント（会話係）を作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)