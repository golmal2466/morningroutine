import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import SettingsPage from '@/pages/SettingsPage';
import ThemeApplicator from '@/components/ThemeApplicator'; // ここで呼ぶのが、正解だったのです！

const AppRoutes = () => {
  return (
    <Router>
      {/* ThemeApplicatorを、ここに置く。これが、あなたの、完璧な設計です。 */}
      <ThemeApplicator />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
