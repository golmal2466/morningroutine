// Taskの型定義。Supabaseのtodosテーブルと一致させる
export interface Task {
  id: number; // Supabaseのidはnumber型
  user_id: string;
  task: string;
  minutes: number; // durationからminutesに変更
  category: 'child' | 'adult';
  is_complete: boolean; // completedからis_completeに変更
  order: number; // 並び順を追加
  created_at: string;
}

// Settingsの型定義。Supabaseのprofilesテーブルと一致させる
export interface Settings {
  id: string; // user_idと同じ
  departure_time: string;
  auto_reset_time: string;
  show_clear_button: boolean;
  theme: string;
}