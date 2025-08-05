import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export const useTaskManager = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // ユーザー情報が確定したら、その人のタスクをSupabaseから取得する
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true }); // order列で並び替え！

      if (error) throw error;
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // タスクを追加する関数
  const addTask = useCallback(
    async (task: string, minutes: number, category: 'child' | 'adult') => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('todos')
          .insert({ task, minutes, category, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        if (data) setTasks((prev) => [...prev, data]);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },
    [user]
  );

  // タスクを更新する関数
  const updateTask = useCallback(async (id: number, newValues: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update(newValues)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }, []);

  // タスクを削除する関数
  const deleteTask = useCallback(async (id: number) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  // タスクの完了状態を切り替える関数
  const toggleTask = useCallback((id: number, is_complete: boolean) => {
    updateTask(id, { is_complete: !is_complete });
  }, [updateTask]);
  
  // 全てのタスクを未完了に戻す関数
  const clearAllCompleted = useCallback(async () => {
    if (!user) return;
    try {
      // Supabase上の完了済みタスクをすべて未完了に更新
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: false })
        .eq('user_id', user.id)
        .eq('is_complete', true);
        
      if (error) throw error;
      // 画面上も更新
      setTasks(prev =>
          prev.map(task => ({ ...task, is_complete: false }))
      );
    } catch(error) {
        console.error('Error clearing tasks:', error)
    }
  }, [user]);

  // タスクの並び順を更新する関数
  const reorderTasks = useCallback(async (dragIndex: number, dropIndex: number, category: 'child' | 'adult') => {
    // この機能は非常に複雑なため、まずは画面上の表示だけを更新します。
    // データベースの永続化は、次のステップで挑戦しましょう！
    setTasks(prevTasks => {
        const targetUncompleted = prevTasks.filter(t => !t.is_complete && t.category === category);
        const otherTasks = prevTasks.filter(t => t.is_complete || t.category !== category);
        
        const [draggedItem] = targetUncompleted.splice(dragIndex, 1);
        targetUncompleted.splice(dropIndex, 0, draggedItem);
        
        if(category === 'child') {
            const adultUncompleted = prevTasks.filter(t => !t.is_complete && t.category === 'adult');
            return [...targetUncompleted, ...adultUncompleted, ...otherTasks];
        } else {
            const childUncompleted = prevTasks.filter(t => !t.is_complete && t.category === 'child');
            return [...childUncompleted, ...targetUncompleted, ...otherTasks];
        }
    });
  }, []);


  return { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading };
};
