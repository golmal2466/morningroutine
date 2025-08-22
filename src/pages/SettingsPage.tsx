// src/pages/SettingsPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, CheckIcon } from '@/components/icons';
import ToggleSwitch from '@/components/ToggleSwitch';
import SettingRow from '@/components/SettingRow';
import { useSettings } from '@/contexts/SettingsContext';
import { AVAILABLE_THEMES } from '@/lib/themes';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  if (!settings) {
    return <div>設定を読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <header className="relative flex items-center justify-center mb-6">
        <Link to="/" className="absolute left-0 inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:underline">
          <ChevronLeftIcon className="w-5 h-5" />
          <span>戻る</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">設定</h1>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 text-slate-800 dark:text-slate-200">時刻設定</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-2 divide-y divide-slate-200 dark:divide-slate-700">
            <SettingRow
              label="毎日の出発時刻"
              description="ここで設定した時刻をもとに「出発まであと何分」を計算します。"
            >
              <input 
                type="time" 
                // 修正点 1/5
                value={settings.departure_time}
                onChange={(e) => updateSettings({ departure_time: e.target.value })}
                className="font-semibold bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </SettingRow>
            <SettingRow
              label="タスクの自動リセット時刻"
              description="毎日この時刻に、タスクのチェックが自動でリセットされます。"
            >
               <input 
                type="time" 
                // 修正点 2/5
                value={settings.auto_reset_time}
                onChange={(e) => updateSettings({ auto_reset_time: e.target.value })}
                className="font-semibold bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </SettingRow>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 text-slate-800 dark:text-slate-200">通知設定</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-2 divide-y divide-slate-200 dark:divide-slate-700">
            <SettingRow
              label="「間に合わない時」の通知"
              description="「やること合計時間」が出発時刻に間に合わなくなった時に通知します。"
            >
              {/* 修正点 3/5 */}
              <ToggleSwitch enabled={settings.notify_on_late} onChange={(value) => updateSettings({ notify_on_late: value })} />
            </SettingRow>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 text-slate-800 dark:text-slate-200">アプリのカスタマイズ</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-2 divide-y divide-slate-200 dark:divide-slate-700">
            <SettingRow
              label="「全クリア」ボタンの表示"
              description="メイン画面のフッターにある手動リセットボタンの表示を切り替えます。"
            >
              {/* 修正点 4/5 */}
              <ToggleSwitch enabled={settings.show_clear_button} onChange={(value) => updateSettings({ show_clear_button: value })} />
            </SettingRow>
            <SettingRow
              label="デザインテーマ"
              description="アプリ全体の見た目の色を変更できます。"
            >
              <div className="flex items-center gap-3">
                {AVAILABLE_THEMES.map((theme) => {
                  // 修正点 5/5
                  const isActive = settings.theme === theme.name;
                  return (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => updateSettings({ theme: theme.name })}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
                        isActive ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800' : 'hover:scale-110'
                      }`}
                      style={{ 
                        backgroundColor: theme.color,
                        borderColor: theme.color,
                        ...(isActive ? { ringColor: theme.color } : {})
                      }}
                      aria-label={`Select ${theme.name} theme`}
                      aria-pressed={isActive}
                    >
                      {isActive && <CheckIcon className="w-5 h-5 text-white mix-blend-difference" />}
                    </button>
                  );
                })}
              </div>
            </SettingRow>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
