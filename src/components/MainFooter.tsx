
import React from 'react';
import { Link } from 'react-router-dom';
import { CogIcon, PlusIcon, ArrowUturnLeftIcon } from './icons';

interface MainFooterProps {
  onAddTask: () => void;
  onClearAll: () => void;
  showClearButton: boolean;
}

const MainFooter: React.FC<MainFooterProps> = ({ onAddTask, onClearAll, showClearButton }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 z-20">
      <div className="max-w-2xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/settings" className="flex items-center gap-2 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <CogIcon className="w-6 h-6"/>
          <span className="font-medium">設定</span>
        </Link>

        <div className="flex items-center gap-3">
          {showClearButton && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
              aria-label="全クリア"
            >
              <ArrowUturnLeftIcon className="w-5 h-5" />
              <span className="hidden sm:inline">全クリア</span>
            </button>
          )}
          <button
            onClick={onAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
            aria-label="タスク追加"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">タスク追加</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default MainFooter;