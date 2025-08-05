import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export const useTaskManager = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

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

  const updateTask = useCallback(async (id: number, newValues: Partial<Omit<Task, 'id'>>) => {
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

  const deleteTask = useCallback(async (id: number) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  const toggleTask = useCallback((id: number, is_complete: boolean) => {
    updateTask(id, { is_complete: !is_complete });
  }, [updateTask]);
  
  const clearAllCompleted = useCallback(async () => {
    if (!user) return;
    try {
        // 注意：Supabaseでは一括更新・削除は追加設定が必要な場合があるため、
        // まずは画面上だけでリセットする形にします。
        // 本格的には、完了済みタスクを一つずつ更新 or 削除するループを書きます。
        setTasks(prev =>
            prev.map(task => ({ ...task, is_complete: false }))
        );
        // ここで、Supabase上の完了済みタスクを更新する処理を追加するのが理想
    } catch(error) {
        console.error('Error clearing tasks:', error)
    }
  }, [user]);

  const reorderTasks = useCallback(async (dragIndex: number, dropIndex: number, category: 'child' | 'adult') => {
    // この機能は複雑なので、まずはローカルでの並び替えのみを実装します
    // 本格的には、並び替え後の全タスクの'order'列を更新する処理が必要です
    setTasks(prevTasks => {
        const uncompleted = prevTasks.filter(t => !t.is_complete && t.category === category);
        const otherTasks = prevTasks.filter(t => t.is_complete || t.category !== category);
        
        const [draggedItem] = uncompleted.splice(dragIndex, 1);
        uncompleted.splice(dropIndex, 0, draggedItem);
        
        return [...uncompleted, ...otherTasks];
    });
  }, []);


  return { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading };
};
