import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useSettings } from '@/contexts/SettingsContext';
import TaskItem from '@/components/TaskItem';
import MainFooter from '@/components/MainFooter';
import TaskModal from '@/components/TaskModal';
import type { Task } from '@/types'; // 型定義をインポート

const MainPage: React.FC = () => {
  const { user } = useAuth();
  // useTaskManagerから、Supabase対応の関数たちを受け取る
  const { tasks, addTask, updateTask, deleteTask, toggleTask, clearAllCompleted, reorderTasks, loading } = useTaskManager(user);
  const { settings, loading: settingsLoading } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departureTimeLeft, setDepartureTimeLeft] = useState(0);
  const [draggingInfo, setDraggingInfo] = useState<{ index: number; category: 'child' | 'adult' } | null>(null);

  useEffect(() => {
    if (!settings) return; // settingsが読み込まれるまで待つ

    const calculateTimeLeft = () => {
      const now = new Date();
      // Supabaseの列名 `departure_time` に合わせる
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


  const {
    childUncompleted,
    adultUncompleted,
    childCompleted,
    adultCompleted,
    totalTaskTime,
    childTotalTime,
    adultTotalTime
  } = useMemo(() => {
    // Supabaseの列名 `is_complete` と `minutes` に合わせる
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

  const showWarning = settings ? totalTaskTime > departureTimeLeft : false;

  const handleOpenModalForNew = () => {
    setIsModalOpen(true);
  };

  // onSaveに渡すデータの型を、Supabaseの列名に合わせる
  const handleSaveTask = (taskData: { task: string; minutes: number; category: 'child' | 'adult' }) => {
    addTask(taskData.task, taskData.minutes, taskData.category);
  };

  // --- Drag and Drop Handlers (変更なし！) ---
  const handleDragStart = (e: React.DragEvent, index: number, category: 'child' | 'adult') => {
    const dragInfo = { index, category };
    e.dataTransfer.setData('application/json', JSON.stringify(dragInfo));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingInfo(dragInfo);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number, dropCategory: 'child' | 'adult') => {
    e.preventDefault();
    try {
      const dragInfo = JSON.parse(e.dataTransfer.getData('application/json'));
      if (dragInfo && dragInfo.category === dropCategory) {
        if (dragInfo.index !== dropIndex) {
          reorderTasks(dragInfo.index, dropIndex, dropCategory);
        }
      }
    } catch (err) {
      console.error("Failed to parse drag data", err);
    }
    setDraggingInfo(null);
  };
  const handleDragEnd = () => {
    setDraggingInfo(null);
  };
  // --- End Drag and Drop Handlers ---

  // タスクと設定の両方の読み込みが終わるまで、待つ！
  if (settingsLoading || loading) {
    return <div>タスクと設定を読み込み中...</div>;
  }
  
  // settingsが万が一ない場合（通常は起こらない）
  if (!settings) {
    return <div>設定の読み込みに失敗しました。</div>;
  }

  // ↓↓↓↓↓↓ ここからが、復活した、あなたの「魂のUI」です！ ↓↓↓↓↓↓
  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 relative">
      <header className="py-4">
        <div className={`
          rounded-xl shadow-lg p-4 sm:p-6 transition-colors duration-300 ease-in-out
          ${showWarning ? 'bg-red-500 dark:bg-red-700' : 'bg-white dark:bg-slate-800'}
        `}>
          <div className="flex items-center justify-around text-center">
            <div className="flex-1">
              <p className={`text-base ${showWarning ? 'text-red-100 dark:text-red-200' : 'text-slate-500 dark:text-slate-400'}`}>出発まであと</p>
              <p className={`text-4xl sm:text-5xl font-bold ${showWarning ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>
                {departureTimeLeft} <span className="text-xl sm:text-2xl font-medium">分</span>
              </p>
            </div>
            
            <div className={`flex-shrink-0 self-stretch w-px mx-2 sm:mx-4 ${showWarning ? 'bg-red-400 dark:bg-red-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

            <div className="flex-1">
              <p className={`text-base ${showWarning ? 'text-red-100 dark:text-red-200' : 'text-slate-500 dark:text-slate-400'}`}>やること合計</p>
              <p className={`text-4xl sm:text-5xl font-semibold ${showWarning ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {totalTaskTime} <span className="text-xl sm:text-2xl font-medium">分</span>
              </p>
            </div>
          </div>
          {showWarning && (
            <div className="mt-4 pt-3 border-t border-red-400 dark:border-red-600" role="alert">
                <p className="font-bold text-lg text-center text-white">まにあわないよー！！</p>
            </div>
          )}
        </div>
      </header>
      
      <main className="grid grid-cols-2 gap-x-4">
        {/* Child's Column */}
        <div className="space-y-8">
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">子供用</h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <h3 className="text-lg sm:text-xl font-bold pt-4 px-2 sm:px-4 text-slate-800 dark:text-slate-200">未完了タスク ({childTotalTime}分)</h3>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700 px-2 sm:px-4">
                        {childUncompleted.length > 0 ? (
                            childUncompleted.map((task, index) => (
                                <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  onToggle={() => toggleTask(task.id, task.is_complete)} 
                                  updateTask={updateTask}
                                  onDelete={() => deleteTask(task.id)}
                                  isDraggable={true}
                                  isDragging={draggingInfo?.category === 'child' && draggingInfo?.index === index}
                                  onDragStart={(e) => handleDragStart(e, index, 'child')}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index, 'child')}
                                  onDragEnd={handleDragEnd}
                                  onMoveUp={() => reorderTasks(task.id, 'up')}
                                  onMoveDown={() => reorderTasks(task.id, 'down')}
                                  isFirst={index === 0}
                                  isLast={index === childUncompleted.length - 1}
                                />
                            ))
                        ) : (
                            <p className="py-6 text-center text-slate-500 text-sm">全てのタスクが完了しました！</p>
                        )}
                    </div>
                    <div className="h-4"></div>
                </div>
            </section>
            {childCompleted.length > 0 && (
                <section>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                        <h3 className="text-lg sm:text-xl font-bold pt-4 px-2 sm:px-4 text-slate-800 dark:text-slate-200">完了済みタスク</h3>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700 px-2 sm:px-4">
                            {childCompleted.map((task) => (
                                <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id, task.is_complete)} updateTask={updateTask} onDelete={() => deleteTask(task.id)} isDraggable={false}/>
                            ))}
                        </div>
                        <div className="h-4"></div>
                    </div>
                </section>
            )}
        </div>

        {/* Adult's Column */}
        <div className="space-y-8">
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">自分用</h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <h3 className="text-lg sm:text-xl font-bold pt-4 px-2 sm:px-4 text-slate-800 dark:text-slate-200">未完了タスク ({adultTotalTime}分)</h3>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700 px-2 sm:px-4">
                        {adultUncompleted.length > 0 ? (
                            adultUncompleted.map((task, index) => (
                                <TaskItem 
                                  key={task.id} 
                                  task={task} 
                                  onToggle={() => toggleTask(task.id, task.is_complete)} 
                                  updateTask={updateTask}
                                  onDelete={() => deleteTask(task.id)}
                                  isDraggable={true}
                                  isDragging={draggingInfo?.category === 'adult' && draggingInfo?.index === index}
                                  onDragStart={(e) => handleDragStart(e, index, 'adult')}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index, 'adult')}
                                  onDragEnd={handleDragEnd}
                                  onMoveUp={() => reorderTasks(task.id, 'up')}
                                  onMoveDown={() => reorderTasks(task.id, 'down')}
                                  isFirst={index === 0}
                                  isLast={index === adultUncompleted.length - 1}
                                />
                            ))
                        ) : (
                            <p className="py-6 text-center text-slate-500 text-sm">全てのタスクが完了しました！</p>
                        )}
                    </div>
                    <div className="h-4"></div>
                </div>
            </section>
            {adultCompleted.length > 0 && (
                <section>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                        <h3 className="text-lg sm:text-xl font-bold pt-4 px-2 sm:px-4 text-slate-800 dark:text-slate-200">完了済みタスク</h3>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700 px-2 sm:px-4">
                            {adultCompleted.map((task) => (
                                <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id, task.is_complete)} updateTask={updateTask} onDelete={() => deleteTask(task.id)} isDraggable={false}/>
                            ))}
                        </div>
                        <div className="h-4"></div>
                    </div>
                </section>
            )}
        </div>
      </main>
      
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
