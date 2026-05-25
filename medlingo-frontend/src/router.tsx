import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SymptomCheckerPage } from './pages/SymptomCheckerPage';
import { DrugCheckerPage } from './pages/DrugCheckerPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Chat is public — guests can use it without logging in */}
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/app" element={<ChatPage />} />

      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/symptoms" element={<SymptomCheckerPage />} />
      <Route path="/drugs" element={<DrugCheckerPage />} />
      <Route path="/admin" element={<AdminPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
