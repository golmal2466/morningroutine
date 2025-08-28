// useTaskManager: タスクの取得・更新を司るフック
import { useCallback, useEffect, useState, useRef } from 'react';
import type { Task } from '@/types';
import type { Settings } from '@/types';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export const useTaskManager = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastResetDateRef = useRef<string>('');

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

  // 自動リセット機能
  const setupAutoReset = useCallback((settings: Settings) => {
    if (!settings.auto_reset_time) return;

    const now = new Date();
    const today = now.toDateString();
    
    // 日付が変わった場合、リセット日をクリア
    if (lastResetDateRef.current !== today) {
      lastResetDateRef.current = '';
    }

    const [resetHours, resetMinutes] = settings.auto_reset_time.split(':').map(Number);
    const resetTime = new Date();
    resetTime.setHours(resetHours, resetMinutes, 0, 0);

    // リセット時刻が過ぎている場合、即座にリセット
    if (resetTime <= now) {
      // 今日まだリセットしていない場合のみ実行
      if (lastResetDateRef.current !== today) {
        performAutoReset();
        lastResetDateRef.current = today;
        console.log(`即座リセット実行: ${now.toLocaleString()} - 設定時刻: ${settings.auto_reset_time}`);
      }
      return;
    }

    // 次のリセット時刻までの待機時間を計算
    const timeUntilReset = resetTime.getTime() - now.getTime();

    // 既存のタイマーをクリア
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    // 新しいタイマーを設定
    resetTimerRef.current = setTimeout(() => {
      performAutoReset();
      lastResetDateRef.current = today;
      console.log(`タイマーリセット実行: ${new Date().toLocaleString()} - 設定時刻: ${settings.auto_reset_time}`);
    }, timeUntilReset);

    console.log(`自動リセット設定: ${now.toLocaleString()} - 次回リセット: ${resetTime.toLocaleString()} (${Math.round(timeUntilReset / 1000 / 60)}分後)`);
  }, []);

  // 自動リセット実行
  const performAutoReset = useCallback(async () => {
    if (!user) return;

    try {
      const completedIds = tasks.filter(t => t.is_complete).map(t => t.id);
      if (completedIds.length > 0) {
        const { error } = await supabase
          .from('todos')
          .update({ is_complete: false })
          .in('id', completedIds);
        
        if (error) throw error;
        
        // ローカル状態も更新
        setTasks(prev => prev.map(t => 
          t.is_complete ? { ...t, is_complete: false } : t
        ));
        
        console.log(`自動リセット完了: ${completedIds.length}個のタスクをリセットしました`);
      }
    } catch (err) {
      console.error('自動リセットエラー:', err);
    }
  }, [user, tasks]);

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

  // 設定が変更されたときに自動リセットを再設定
  useEffect(() => {
    if (!user || !tasks.length) return;
    
    // 設定を取得して自動リセットを設定
    const fetchSettingsAndSetupReset = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('auto_reset_time')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setupAutoReset(data as Settings);
        }
      } catch (err) {
        console.error('設定取得エラー:', err);
      }
    };

    fetchSettingsAndSetupReset();

    // 日付変更を検出するための定期的なチェック（1分ごと）
    const dateCheckInterval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toDateString();
      
      // 日付が変わった場合、リセット日をクリアして再設定
      if (lastResetDateRef.current && lastResetDateRef.current !== currentDate) {
        console.log('日付変更を検出、自動リセットを再設定します');
        lastResetDateRef.current = '';
        fetchSettingsAndSetupReset();
      }
    }, 60000); // 1分ごと

    return () => {
      clearInterval(dateCheckInterval);
    };
  }, [user, tasks, setupAutoReset]);

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

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading, setupAutoReset };
};