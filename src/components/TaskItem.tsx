// src/components/TaskItem.tsx

import React, { useState } from 'react';
import type { Task } from '@/types'; // 型定義はtypes/index.tsから読み込まれる
import { CheckIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@/components/icons';

interface TaskItemProps {
  task: Task;
  // 修正点 1/8: idの型をstringからnumberに変更
  onToggle: (id: number, is_complete: boolean) => void; 
  updateTask: (id: number, newValues: Partial<Omit<Task, 'id'>>) => void;
  onDelete: (id: number) => void;
  isDraggable: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, updateTask, onDelete, isDraggable, isDragging, onMoveUp, onMoveDown, isFirst, isLast, ...dndProps }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.task); // 修正点 2/8: text -> task
  const [editMinutes, setEditMinutes] = useState(String(task.minutes)); // 修正点 3/8: duration -> minutes

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 修正点 4/8: is_completeを渡す
    onToggle(task.id, task.is_complete); 
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleSave = () => {
    const minutesNum = parseInt(editMinutes, 10);
    if (editText.trim() && !isNaN(minutesNum) && minutesNum > 0) {
      // 修正点 5/8: text -> task, duration -> minutes
      updateTask(task.id, { task: editText.trim(), minutes: minutesNum });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditText(task.task);
    setEditMinutes(String(task.minutes));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 修正点 6/8: completed -> is_complete
    if (!task.is_complete) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className={`w-full transition-opacity ${isDraggable ? 'cursor-grab' : ''} ${isDragging ? 'opacity-30' : ''}`}
      draggable={isDraggable}
      {...dndProps}
    >
      <div className="flex items-start py-4 group">
        <div className="flex-shrink-0 mr-4 pt-1">
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isEditing}
            className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors duration-200 ${
              // 修正点 7/8: completed -> is_complete
              task.is_complete
                ? 'bg-primary-600 border-primary-600'
                : 'bg-transparent border-slate-400 group-hover:border-primary-500'
            } ${isEditing ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700' : ''}`}
            aria-label={task.is_complete ? 'Mark task as incomplete' : 'Mark task as complete'}
          >
            {task.is_complete && !isEditing && <CheckIcon className="w-5 h-5 text-white" />}
          </button>
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="block w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        onKeyDown={handleKeyDown}
                        min="1"
                        className="block w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:text-sm text-right"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">分</span>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleSave();}} className="px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">保存</button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancel();}} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
              </div>
            </>
          ) : (
            <div onClick={handleEditClick} className="cursor-pointer">
              <div className={`transition-colors ${task.is_complete ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                <p className="font-medium break-words">{task.task}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className={`transition-colors ${task.is_complete ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                  {/* 修正点 8/8: duration -> minutes */}
                  <span className="font-semibold text-base sm:text-lg">{task.minutes}</span>
                  <span className="text-sm"> 分</span>
                </div>
                <div className="flex items-center gap-1">
                  {isDraggable && (
                    <div className="flex">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
                        disabled={isFirst}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Move task up"
                      >
                        <ChevronUpIcon className="w-5 h-5"/>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                        disabled={isLast}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Move task down"
                      >
                        <ChevronDownIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="p-1 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label={`Delete task: ${task.task}`}
                  >
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
