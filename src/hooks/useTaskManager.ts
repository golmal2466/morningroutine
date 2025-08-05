import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { supabase } from '@/lib/supabaseClient'; // 我らが会話係！
import { User } from '@supabase/supabase-js';

// ユーザー情報を引数で受け取るように変更
export const useTaskManager = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ユーザー情報が確定したら、その人のタスクをSupabaseから取得する
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true }); // order列で並び替え！

        if (error) throw error;
        if (data) {
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // addTaskなどの関数も、すべてSupabaseと会話するように書き換える
  const addTask = useCallback(
    async (task: string, minutes: number, category: 'child' | 'adult') => {
      if (!user) return;
      try {
        // 新しいタスクをSupabaseにinsert
        const { data, error } = await supabase
          .from('todos')
          .insert({ task, minutes, category, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setTasks((prev) => [...prev, data]); // 画面上のリストにも追加
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },
    [user]
  );

  // ... updateTask, deleteTaskなども同様にSupabaseと会話するように！
  // (長くなるので、まずはaddTaskまで実装)

  // とりあえず、今の段階ではaddTaskまでを返す
  return { tasks, addTask, loading };
};