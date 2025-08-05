// src/pages/SettingsPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
// ... (icons, componentsのimportはそのまま)
import { useSettings } from '@/contexts/SettingsContext';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  // settingsがまだ読み込まれていない場合は、ローディング表示
  if (!settings) {
    return <div>設定を読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* ... Header (変更なし) ... */}

      <div className="space-y-8">
        <section>
          {/* ... 時刻設定 ... */}
          {/* value={settings.departureTime} -> value={settings.departure_time} のように、
              Supabaseの列名に合わせて、スネークケースに修正 */}
        </section>
        
        {/* ... 他のセクションも、同様にプロパティ名をスネークケースに修正 ... */}
        {/* notifyOnLate -> notify_on_late */}
        {/* showClearButton -> show_clear_button */}
      </div>
    </div>
  );
};

export default SettingsPage;