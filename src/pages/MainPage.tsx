import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // あとで作る、新しい司令塔！
import { useTaskManager } from '@/hooks/useTaskManager';
import { useSettings } from '@/contexts/SettingsContext';
import TaskItem from '@/components/TaskItem';
import MainFooter from '@/components/MainFooter';
import TaskModal from '@/components/TaskModal';

// MainPageは、もうsessionを直接受け取る必要はありません
const MainPage: React.FC = () => {
  const { user } = useAuth(); // 新しい司令塔から、ユーザー情報を取得
  const { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading } = useTaskManager(user);
  const { settings } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departureTimeLeft, setDepartureTimeLeft] = useState(0);
  const [draggingInfo, setDraggingInfo] = useState<{ index: number; category: 'child' | 'adult' } | null>(null);

  // settingsが読み込まれるまで、タイマー計算を待つ
  useEffect(() => {
    if (!settings) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = settings.departure_time.split(':').map(Number);
      const departure = new Date();
      departure.setHours(hours, minutes, 0, 0);

      if (departure < now) {
        departure.setDate(departure.getDate() + 1);
      }
      
      const diffMs = departure.getTime() - now.getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / 60000));
      setDepartureTimeLeft(diffMins);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 30000);
    return () => clearInterval(interval);
  }, [settings]);

  // --- useMemo以下のあなたの素晴らしいロジックは、ほぼ変更なし！ ---
  const {
    childUncompleted,
    adultUncompleted,
    childCompleted,
    adultCompleted,
    totalTaskTime,
    childTotalTime,
    adultTotalTime
  } = useMemo(() => {
    const childUncompleted = tasks.filter((task) => !task.is_complete && task.category === 'child');
    const adultUncompleted = tasks.filter((task) => !task.is_complete && task.category === 'adult');
    const childCompleted = tasks.filter((task) => task.is_complete && task.category === 'child');
    const adultCompleted = tasks.filter((task) => task.is_complete && task.category === 'adult');
    
    const childTotalTime = childUncompleted.reduce((sum, task) => sum + task.minutes, 0);
    const adultTotalTime = adultUncompleted.reduce((sum, task) => sum + task.minutes, 0);
    
    return {
      childUncompleted,
      adultUncompleted,
      childCompleted,
      adultCompleted,
      childTotalTime,
      adultTotalTime,
      totalTaskTime: childTotalTime + adultTotalTime,
    };
  }, [tasks]);

  // settingsが読み込まれるまで、警告表示を待つ
  const showWarning = settings ? totalTaskTime > departureTimeLeft : false;

  const handleOpenModalForNew = () => {
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: { task: string; minutes: number; category: 'child' | 'adult' }) => {
    addTask(taskData.task, taskData.minutes, taskData.category);
  };

  // --- Drag and Drop Handlers (変更なし！) ---
  // (あなたのドラッグ＆ドロップのコードは完璧なので、そのまま残します)

  // settingsが読み込まれるまで、何も表示しない
  if (!settings || loading) {
    return <div>タスクと設定を読み込み中...</div>;
  }
  
  return (
    // --- あなたの美しいUI (JSX) は、ほぼ変更なし！ ---
    // (completed -> is_complete, duration -> minutes など、
    //  Supabaseの列名に合わせた、ごく一部の修正のみ)
    <div className="max-w-4xl mx-auto px-4 pb-24 relative">
      {/* ... Header ... */}
      {/* ... Main ... */}
      {/* ... TaskItem ... (propsを新しいTaskの型に合わせる) */}
      <MainFooter 
        onAddTask={handleOpenModalForNew}
        onClearAll={clearAllCompleted}
        showClearButton={settings.show_clear_button}
      />
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default MainPage;