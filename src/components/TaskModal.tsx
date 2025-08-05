// src/components/TaskModal.tsx

import React, { useState, useEffect, useRef } from 'react';
// Task型はここでは不要なので削除

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 修正点 1/3: onSaveが受け取るデータの型を修正
  onSave: (taskData: { task: string, minutes: number, category: 'child' | 'adult' }) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [task, setTask] = useState(''); // 修正点 2/3: text -> task
  const [minutes, setMinutes] = useState(''); // 修正点 2/3: duration -> minutes
  const [category, setCategory] = useState<'child' | 'adult'>('child');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTask('');
      setMinutes('');
      setCategory('child');
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    const minutesNum = parseInt(minutes, 10);
    if (task.trim() && !isNaN(minutesNum) && minutesNum > 0) {
      // 修正点 3/3: 渡すオブジェクトのプロパティ名を修正
      onSave({ task: task.trim(), minutes: minutesNum, category });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
      <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md p-6 m-4" role="dialog" aria-modal="true">
        <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">
          新しいタスクを追加
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">カテゴリ</label>
            <div className="grid grid-cols-2 gap-2">
                <button
                type="button"
                onClick={() => setCategory('child')}
                className={`w-full text-center px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    category === 'child' 
                    ? 'bg-primary-500 border-primary-500 text-white shadow' 
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                >
                子供用
                </button>
                <button
                type="button"
                onClick={() => setCategory('adult')}
                className={`w-full text-center px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                    category === 'adult' 
                    ? 'bg-primary-500 border-primary-500 text-white shadow' 
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                >
                自分用
                </button>
            </div>
          </div>
          <div>
            <label htmlFor="task-text" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">タスク名</label>
            <input
              type="text"
              id="task-text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
              placeholder="例: 朝食を食べる"
            />
          </div>
          <div>
            <label htmlFor="task-duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">所要時間（分）</label>
            <input
              type="number"
              id="task-duration"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
              placeholder="例: 15"
              min="1"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end items-center">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                保存
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
