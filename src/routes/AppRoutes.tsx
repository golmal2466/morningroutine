import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import SettingsPage from '@/pages/SettingsPage';
import ThemeApplicator from '@/components/ThemeApplicator';

const AppRoutes = () => {
  return (
    <Router>
      {/* ThemeApplicatorをここに置くことで、常にテーマが適用される */}
      <ThemeApplicator />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;