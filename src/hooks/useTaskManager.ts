// useTaskManager: タスクの取得・更新を司るフック
import { useCallback, useEffect, useState } from 'react';
import type { Task } from '@/types';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export const useTaskManager = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期取得
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true })
          .order('created_at', { ascending: true });
        if (error) throw error;
        setTasks((data ?? []) as Task[]);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const addTask = useCallback(
    async (taskText: string, minutes: number, category: 'child' | 'adult') => {
      if (!user) return;
      try {
        const nextOrder = tasks.filter(t => !t.is_complete).length;
        const insert = {
          user_id: user.id,
          task: taskText,
          minutes,
          category,
          is_complete: false,
          order: nextOrder,
        };
        const { data, error } = await supabase
          .from('todos')
          .insert(insert)
          .select()
          .single();
        if (error) throw error;
        if (data) setTasks(prev => [...prev, data as Task]);
      } catch (err) {
        console.error('Error adding task:', err);
      }
    },
    [user, tasks]
  );

  const updateTask = useCallback(
    async (id: number, newValues: Partial<Omit<Task, 'id'>>) => {
      try {
        const { data, error } = await supabase
          .from('todos')
          .update(newValues)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setTasks(prev => prev.map(t => (t.id === id ? (data as Task) : t)));
        }
      } catch (err) {
        console.error('Error updating task:', err);
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: number) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }, []);

  const toggleTask = useCallback(async (id: number, is_complete: boolean) => {
    try {
      const next = !is_complete;
      const { data, error } = await supabase
        .from('todos')
        .update({ is_complete: next })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) setTasks(prev => prev.map(t => (t.id === id ? (data as Task) : t)));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  }, []);

  const clearAllCompleted = useCallback(async () => {
    try {
      const completedIds = tasks.filter(t => t.is_complete).map(t => t.id);
      if (completedIds.length) {
        const { error } = await supabase.from('todos').update({ is_complete: false }).in('id', completedIds);
        if (error) throw error;
        setTasks(prev => prev.map(t => t.is_complete ? { ...t, is_complete: false } : t));
      }
    } catch (err) {
      console.error('Error clearing completed:', err);
    }
  }, [tasks]);

  // オーバーロード対応: DnD or Up/Down
  const reorderTasks = useCallback(
    async (
      a: number,
      b: number | 'up' | 'down',
      c?: 'child' | 'adult'
    ) => {
      let reordered: Task[] = [];

      setTasks(prevTasks => {
        const childUncompleted = prevTasks.filter(t => !t.is_complete && t.category === 'child');
        const adultUncompleted = prevTasks.filter(t => !t.is_complete && t.category === 'adult');
        const completed = prevTasks.filter(t => t.is_complete);

        if (typeof b === 'string') {
          // Move up/down by id
          const id = a;
          const dir = b;
          const idxChild = childUncompleted.findIndex(t => t.id === id);
          const idxAdult = adultUncompleted.findIndex(t => t.id === id);
          if (idxChild !== -1) {
            const arr = childUncompleted;
            const newIndex = Math.max(0, Math.min(arr.length - 1, idxChild + (dir === 'up' ? -1 : 1)));
            const [item] = arr.splice(idxChild, 1);
            arr.splice(newIndex, 0, item);
            reordered = [...arr, ...adultUncompleted, ...completed];
          } else if (idxAdult !== -1) {
            const arr = adultUncompleted;
            const newIndex = Math.max(0, Math.min(arr.length - 1, idxAdult + (dir === 'up' ? -1 : 1)));
            const [item] = arr.splice(idxAdult, 1);
            arr.splice(newIndex, 0, item);
            reordered = [...childUncompleted, ...arr, ...completed];
          } else {
            reordered = prevTasks;
          }
        } else {
          // DnD by indices and category
          const dragIndex = a;
          const dropIndex = b as number;
          const category = c as 'child' | 'adult';
          const otherUncompleted = category === 'child' ? adultUncompleted : childUncompleted;
          const target = category === 'child' ? childUncompleted : adultUncompleted;
          const [dragged] = target.splice(dragIndex, 1);
          target.splice(dropIndex, 0, dragged);
          reordered =
            category === 'child'
              ? [...target, ...otherUncompleted, ...completed]
              : [...childUncompleted, ...target, ...completed];
        }

        return reordered;
      });

      try {
        const uncompleted = reordered.filter(t => !t.is_complete);
        const updates = uncompleted.map((task, index) => ({ id: task.id, order: index }));
        if (updates.length) {
          const { error } = await supabase.from('todos').upsert(updates);
          if (error) throw error;
        }
      } catch (err) {
        console.error('Error reordering tasks:', err);
      }
    },
    []
  );

  return { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading };
};